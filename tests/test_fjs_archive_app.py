"""Test the app worker and a publish/read-back round trip on a local mock API."""

import contextlib
import csv
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
RSCRIPT = os.environ.get("FJS_TEST_RSCRIPT") or shutil.which("Rscript")
READY = RSCRIPT and (ROOT / "tools/shiny-library/jsonlite/DESCRIPTION").is_file()
FAKE_KEY = "sb_secret_synthetic_test_value"


@contextlib.contextmanager
def mock_supabase(missing_storage=False):
    tables, objects = {}, {}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def respond(self, value, status=200):
            body = json.dumps(value).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def authorized(self):
            if self.headers.get("apikey") != FAKE_KEY:
                self.respond({"error": "unauthorized"}, 403)
                return False
            return True

        def do_POST(self):
            if not self.authorized():
                return
            parsed = urlparse(self.path)
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            if parsed.path.startswith("/rest/v1/"):
                tables[parsed.path.rsplit("/", 1)[-1]] = json.loads(body)
            elif parsed.path.startswith("/storage/v1/object/"):
                objects[unquote(parsed.path[len("/storage/v1/object/"):])] = body
            else:
                return self.respond({}, 404)
            self.respond({})

        def do_GET(self):
            if not self.authorized():
                return
            parsed = urlparse(self.path)
            if parsed.path.startswith("/rest/v1/"):
                table = parsed.path.rsplit("/", 1)[-1]
                query = parse_qs(parsed.query)
                field = "sample_id" if table == "fjs_samples" else "asset_id"
                selected = query[field][0][4:-1].split(",")
                rows = [row for row in tables.get(table, []) if row[field] in selected]
                columns = query["select"][0].split(",")
                return self.respond([{column: row.get(column) for column in columns} for row in rows])
            prefix = "/storage/v1/object/info/authenticated/"
            if parsed.path.startswith(prefix):
                key = unquote(parsed.path[len(prefix):])
                if missing_storage or key not in objects:
                    return self.respond({"error": "not found"}, 404)
                return self.respond({"metadata": {"size": len(objects[key])}})
            self.respond({}, 404)

    server = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", tables, objects
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


@unittest.skipUnless(READY, "Install the local Shiny dependencies and set FJS_TEST_RSCRIPT.")
class ArchiveAppTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix="archive app test ")
        cls.root = Path(cls.temporary.name).resolve()
        assert cls.root.parent == Path(tempfile.gettempdir()).resolve()
        cls.counter = 0
        cls.environment = dict(os.environ, LANG="C", LC_ALL="C", PYTHONUTF8="1")
        example_root = cls.root / "example data"
        result = cls.run_job("demo", {"python": sys.executable, "output_root": str(example_root)})
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
        info = json.loads((example_root / "demo_info.json").read_text())
        cls.full_dataset = Path(info["metadata_csv"])
        cls.source_hash = hashlib.sha256(cls.full_dataset.read_bytes()).hexdigest()
        cls.package = cls.root / "example package"
        config = dict(info, python=sys.executable, source_mode="zip",
                      metadata_mode="confidential", confidential_csv=str(cls.full_dataset),
                      output_root=str(cls.package), batch_name="synthetic", access_level="private", demo=True)
        result = cls.run_job("prepare", config)
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
        cls.config = config

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    @classmethod
    def run_job(cls, operation, settings):
        cls.counter += 1
        settings = dict(settings, work_root=str(cls.root / "local work"))
        request = cls.root / f"job-{cls.counter}.json"
        request.write_text(json.dumps({"operation": operation, "settings": settings,
            "result_file": str(cls.root / f"result-{cls.counter}.rds")}), encoding="utf-8")
        return subprocess.run([RSCRIPT, "--vanilla", str(ROOT / "archive_app/worker.R"),
                               str(ROOT), str(request)], capture_output=True, text=True,
                              encoding="utf-8", env=dict(cls.environment, SUPABASE_SERVICE_ROLE_KEY=FAKE_KEY))

    def real_mode_copy(self, name):
        destination = self.root / name
        shutil.copytree(self.package, destination)
        expression = "saveRDS(list(demo=FALSE), " + json.dumps(
            (destination / "archive_app_receipt.rds").as_posix()) + ")"
        subprocess.run([RSCRIPT, "--vanilla", "-e", expression], check=True,
                       capture_output=True, env=self.environment)
        return destination

    def test_prepared_package_and_dry_run(self):
        self.assertEqual(hashlib.sha256(self.full_dataset.read_bytes()).hexdigest(), self.source_hash)
        with (self.package / "supabase_import/fjs_samples.csv").open(encoding="utf-8") as handle:
            samples = list(csv.DictReader(handle))
        self.assertEqual([row["sample_id"] for row in samples], ["98_20180101_0001"])
        with (self.package / "supabase_import/fjs_assets.csv").open(encoding="utf-8") as handle:
            assets = list(csv.DictReader(handle))
        self.assertEqual(len(assets), 4)
        self.assertTrue(all(Path(row["local_source_path"]).is_file() for row in assets))
        result = self.run_job("dry_run", {"package_root": str(self.package),
                             "supabase_url": "https://example.invalid", "python": sys.executable})
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("DRY RUN", result.stdout)
        self.assertNotIn(FAKE_KEY, result.stdout + result.stderr)

    def test_browse_dialogs_refresh_without_navigation(self):
        result = subprocess.run([
            RSCRIPT, "--vanilla", str(ROOT / "tests/test_fjs_browse_refresh.R"), str(ROOT),
        ], capture_output=True, text=True, encoding="utf-8", env=self.environment)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Browse refresh verified", result.stdout)

    def test_shiny_wizard_advances_only_after_success_and_finishes_upload(self):
        inputs = self.root / "wizard inputs"
        inputs.mkdir()
        for archive in (self.full_dataset.parent / "zip_parts").glob("*.zip"):
            shutil.copyfile(archive, inputs / archive.name)
        dataset = inputs / "synthetic survey.csv"
        dictionary = inputs / "synthetic dictionary.xlsx"
        shutil.copyfile(self.full_dataset, dataset)
        shutil.copyfile(self.config["dictionary"], dictionary)
        work = self.root / "wizard work"
        with mock_supabase() as (url, tables, objects):
            result = subprocess.run([RSCRIPT, "--vanilla", str(ROOT / "tests/test_fjs_upload_wizard.R"),
                str(ROOT), str(work), str(inputs), str(dataset),
                str(dictionary), url, sys.executable],
                capture_output=True, text=True, encoding="utf-8",
                env=dict(self.environment, FJS_PYTHON=sys.executable, FJS_WIZARD_TEST_KEY=FAKE_KEY))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("done passed", result.stdout)
        self.assertEqual(len(tables["fjs_samples"]), 1)
        self.assertEqual(len(objects), 4)
        self.assertNotIn(FAKE_KEY, result.stdout + result.stderr)

    def test_local_subset_preview_reuse_and_refresh_after_source_change(self):
        result = self.run_job("extract", self.config)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Survey rows read: 2; selected rows: 1", result.stdout)
        # Read the worker's RDS into JSON without exposing any confidential rows.
        result_path = self.root / f"result-{self.counter}.rds"
        expression = (
            f'.libPaths(c({json.dumps((ROOT / "tools/shiny-library").as_posix())}, .libPaths()));'
            f'cat(jsonlite::toJSON(readRDS({json.dumps(result_path.as_posix())})$subset_info, auto_unbox=TRUE))'
        )
        readback = subprocess.run([RSCRIPT, "--vanilla", "-e", expression], capture_output=True,
                                  text=True, encoding="utf-8", env=self.environment, check=True)
        info = json.loads(readback.stdout)
        self.assertEqual(info["selected_rows"], 1)
        self.assertEqual(info["source_rows"], 2)
        config = dict(self.config, subset_csv=info["output_csv"], subset_report=info["report_path"])
        cached = self.run_job("extract", config)
        self.assertEqual(cached.returncode, 0, cached.stdout + cached.stderr)
        self.assertNotIn("Survey rows read:", cached.stdout)
        # A changed preview is never silently reused as an upload source.
        Path(info["output_csv"]).write_text("synthetic replacement", encoding="utf-8")
        refreshed = self.run_job("extract", config)
        self.assertEqual(refreshed.returncode, 0, refreshed.stdout + refreshed.stderr)
        self.assertIn("Survey rows read: 2; selected rows: 1", refreshed.stdout)
        # A changed source also invalidates the extraction cache.
        source_copy = self.root / "changed synthetic survey.csv"
        shutil.copyfile(self.full_dataset, source_copy)
        changed = self.run_job("extract", dict(config, confidential_csv=str(source_copy)))
        self.assertEqual(changed.returncode, 0, changed.stdout + changed.stderr)
        self.assertIn("Survey rows read: 2; selected rows: 1", changed.stdout)

    def test_missing_dataset_samples_block_preparation_and_private_output_guard(self):
        raw = self.root / "samples needing metadata"
        (raw / "98_20180101_9999").mkdir(parents=True)
        output = self.root / "must not prepare"
        result = self.run_job("prepare", dict(self.config, source_mode="raw",
                              source_dir=str(raw), output_root=str(output)))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("matched 0/1 samples", result.stdout + result.stderr)
        self.assertFalse(output.exists())
        blocked = ROOT / "private_package_must_not_exist"
        result = self.run_job("prepare", dict(self.config, output_root=str(blocked)))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("outside the Git repository", result.stdout + result.stderr)
        self.assertFalse(blocked.exists())
        for path in (ROOT / "data/processed/blocked_app_package", ROOT / "data/raw/blocked_app_package"):
            result = self.run_job("prepare", dict(self.config, output_root=str(path)))
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("outside the Git repository", result.stdout + result.stderr)
            self.assertFalse(path.exists())

    def test_work_files_stay_outside_git_and_another_repository_is_rejected(self):
        other_repo = self.root / "other repository"
        (other_repo / ".git").mkdir(parents=True)
        output = other_repo / "ignored data" / "example"
        result = self.run_job("demo", {"output_root": str(output), "python": sys.executable})
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("outside Git repositories", result.stdout + result.stderr)
        self.assertFalse(output.exists())
        subsets = list((self.root / "local work/subsets").glob("*.csv"))
        self.assertTrue(subsets)
        self.assertTrue(all(not file.is_relative_to(ROOT) for file in subsets))

    def test_publish_and_verify_against_local_mock(self):
        package = self.real_mode_copy("mock publish package")
        with mock_supabase() as (url, tables, objects):
            result = self.run_job("publish", {"package_root": str(package), "supabase_url": url,
                                             "python": sys.executable, "upsert": False})
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(tables["fjs_samples"]), 1)
        self.assertEqual(len(objects), 4)
        report = json.loads((package / "supabase_verification.json").read_text())
        self.assertTrue(report["ok"])
        self.assertEqual(report["storage_objects"], 4)
        self.assertNotIn(FAKE_KEY, (package / "supabase_verification.json").read_text())
        reports = list((package / "reports").glob("upload_*.json"))
        self.assertEqual(len(reports), 1)
        completion = json.loads(reports[0].read_text())
        self.assertEqual(completion["verified_file_count"], 4)
        self.assertEqual(completion["sample_count"], 1)
        self.assertEqual(completion["status"], "verification_succeeded")
        self.assertFalse(completion["legacy_verification"])
        self.assertEqual(len(completion["files"]), 4)
        self.assertEqual(len(list((package / "reports").glob("upload_*.txt"))), 1)
        for path in (package / "reports").iterdir():
            self.assertNotIn(FAKE_KEY, path.read_text())
        sys.path.insert(0, str(ROOT / "scripts"))
        from write_fjs_upload_report import write_report
        write_report(package, url, "1.1.0", "verify_existing_package")
        self.assertEqual(len(list((package / "reports").glob("*.json"))), 2)
        self.assertTrue(reports[0].exists())
        with self.assertRaisesRegex(ValueError, "without credentials"):
            write_report(package, url + "?apikey=synthetic", "1.1.0")
        with (package / "supabase_import/fjs_samples.csv").open("a", encoding="utf-8") as handle:
            handle.write("\n")
        with self.assertRaisesRegex(ValueError, "changed after verification"):
            write_report(package, url, "1.1.0")
        for request in self.root.glob("job-*.json"):
            self.assertNotIn(FAKE_KEY, request.read_text())

    def test_missing_storage_file_fails_verification(self):
        package = self.real_mode_copy("mock missing storage")
        with mock_supabase(missing_storage=True) as (url, _, __):
            result = self.run_job("publish", {"package_root": str(package), "supabase_url": url,
                                             "python": sys.executable, "upsert": False})
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("HTTP 404", result.stdout + result.stderr)
        report = json.loads((package / "supabase_verification.json").read_text())
        self.assertFalse(report["ok"])
        self.assertFalse((package / "reports").exists())

    def test_demo_publish_is_blocked(self):
        result = self.run_job("publish", {"package_root": str(self.package),
                             "supabase_url": "https://example.invalid", "python": sys.executable})
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Example packages cannot be published", result.stdout + result.stderr)

    def test_incomplete_package_is_rejected(self):
        package = self.root / "incomplete package"
        shutil.copytree(self.package, package)
        (package / "supabase_import/fjs_taxa.csv").unlink()
        result = self.run_job("dry_run", {"package_root": str(package),
                             "supabase_url": "https://example.invalid", "python": sys.executable})
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Package is incomplete", result.stdout + result.stderr)

    def test_publish_gate_checks_review_fingerprint_destination_and_redaction(self):
        expression = (
            f"source({json.dumps((ROOT / 'archive_app/workflow.R').as_posix())});"
            'pkg <- list(demo=FALSE, fingerprint="current");'
            'must_fail <- function(expr) stopifnot(inherits(try(expr, silent=TRUE), "try-error"));'
            'must_fail(fjs_app_publish_ready(pkg, NULL, NULL, "url", TRUE));'
            'must_fail(fjs_app_publish_ready(pkg, "old", "url", "url", TRUE));'
            'must_fail(fjs_app_publish_ready(pkg, "current", "one", "two", TRUE));'
            'must_fail(fjs_app_publish_ready(pkg, "current", "url", "url", FALSE));'
            'fjs_app_publish_ready(pkg, "current", "url", "url", TRUE);'
            'stopifnot(fjs_app_redact("credential: example-value", "example-value") == "credential: [redacted]");'
            'part <- fjs_app_log_chunk("", "credential: example-", "example-value");'
            'stopifnot(part$clean == "");'
            'part <- fjs_app_log_chunk(part$pending, "value\\n", "example-value");'
            'stopifnot(part$clean == "credential: [redacted]\\n", part$pending == "")'
        )
        result = subprocess.run([RSCRIPT, "--vanilla", "-e", expression], capture_output=True,
                                text=True, encoding="utf-8", env=self.environment)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
