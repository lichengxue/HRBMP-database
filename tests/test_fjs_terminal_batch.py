"""ZIP merge, metadata matching, and durable upload-source regression checks."""

import csv
import hashlib
import io
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from prepare_fjs_terminal_batch import SampleMerger, asset_destination, select_metadata


SAMPLE = "98_20180703_0066"
OTHER = "98_20180703_0067"


class TerminalBatchTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="fjs test ")
        self.root = Path(self.temporary.name).resolve()
        self.assertEqual(self.root.parent, Path(tempfile.gettempdir()).resolve())
        self.addCleanup(self.temporary.cleanup)

    def make_zip(self, name, entries):
        path = self.root / name
        with zipfile.ZipFile(path, "w") as bundle:
            for member, data in entries.items():
                bundle.writestr(member, data)
        return path

    def test_source_can_be_one_sample_folder(self):
        sample = self.root / SAMPLE
        sample.mkdir()
        image = sample / f"{SAMPLE}_01.jpg"
        image.write_bytes(b"synthetic photo")
        merger = SampleMerger(self.root / "single sample output")
        merger.from_folder(sample)
        self.assertEqual(len(merger.files), 1)
        self.assertEqual((merger.raw_root / SAMPLE / image.name).read_bytes(), image.read_bytes())

    def metadata(self):
        path = self.root / "survey counts.csv"
        with path.open("w", newline="", encoding="utf-8-sig") as handle:
            writer = csv.DictWriter(handle, fieldnames=[
                "TASK.CODE", "DATE", "SAMPLE.NUMBER", "TAXON.CODE", "NUMBER.OF.YOUNG.OF.YEAR"
            ])
            writer.writeheader()
            for number, taxon in [(66, 19), (66, 20), (67, 19)]:
                writer.writerow({"TASK.CODE": 98, "DATE": "07/03/2018",
                                 "SAMPLE.NUMBER": number, "TAXON.CODE": taxon,
                                 "NUMBER.OF.YOUNG.OF.YEAR": 2})
        return path

    def test_split_downloads_merge_wrappers_subfolders_and_identical_duplicates(self):
        image = f"{SAMPLE}_01.jpg"
        pdf = f"{SAMPLE}_SC1.pdf"
        self.make_zip("part1.zip", {f"Drive export/{SAMPLE}/images/{image}": b"image"})
        self.make_zip("part2.zip", {f"{SAMPLE}/{image.upper()}": b"image",
                                    f"{SAMPLE}/{pdf}": b"pdf", "readme.txt": b"ignore"})
        merger = SampleMerger(self.root / "merged")
        merger.from_zips(self.root, "part*.zip")
        self.assertEqual(len(merger.files), 2)
        self.assertEqual([row["status"] for row in merger.log].count("duplicate_identical"), 1)
        self.assertEqual((merger.raw_root / SAMPLE / image).read_bytes(), b"image")
        self.assertEqual((merger.raw_root / SAMPLE / pdf).read_bytes(), b"pdf")

    def test_conflicting_duplicates_stop_without_overwriting_first_file(self):
        member = f"{SAMPLE}/{SAMPLE}_01.jpg"
        merger = SampleMerger(self.root / "merged")
        merger.add("first.zip", member, io.BytesIO(b"first"))
        with self.assertRaisesRegex(ValueError, "Conflicting files"):
            merger.add("second.zip", member, io.BytesIO(b"different"))
        self.assertEqual((merger.raw_root / member).read_bytes(), b"first")

    def test_unsafe_zip_paths_and_links_are_rejected(self):
        for member in [f"../{SAMPLE}/x.jpg", f"/{SAMPLE}/x.jpg",
                       f"C:\\{SAMPLE}\\x.jpg", f"{SAMPLE}/x.jpg:stream",
                       f"{SAMPLE}/CON.jpg"]:
            with self.subTest(member=member), self.assertRaises(ValueError):
                asset_destination(member)
        archive = self.root / "link.zip"
        with zipfile.ZipFile(archive, "w") as bundle:
            entry = zipfile.ZipInfo(f"{SAMPLE}/link.jpg")
            entry.create_system = 3
            entry.external_attr = 0o120777 << 16
            bundle.writestr(entry, "../../outside")
        with self.assertRaisesRegex(ValueError, "symbolic link"):
            SampleMerger(self.root / "merged").from_zips(self.root, "link.zip")

    def test_metadata_keeps_all_taxa_for_selected_samples_and_rejects_missing_samples(self):
        metadata = self.metadata()
        subset = self.root / "subset.csv"
        self.assertEqual(select_metadata(metadata, subset, {SAMPLE}), (2, 1))
        with subset.open(newline="", encoding="utf-8") as handle:
            self.assertEqual([row["TAXON.CODE"] for row in csv.DictReader(handle)], ["19", "20"])
        with self.assertRaisesRegex(ValueError, "no metadata rows"):
            select_metadata(metadata, subset, {"98_20180703_9999"})

    def test_no_matching_zip_fails(self):
        with self.assertRaisesRegex(ValueError, "No ZIPs match"):
            SampleMerger(self.root / "merged").from_zips(self.root, "missing*.zip")

    def test_direct_drive_download_preserves_sample_ids(self):
        source = self.root / "drive download"
        sample_folder = source / "batch folder" / OTHER
        sample_folder.mkdir(parents=True)
        (sample_folder / f"{OTHER}_LW1.pdf").write_bytes(b"lab sheet")
        merger = SampleMerger(self.root / "merged")
        merger.from_folder(source)
        self.assertEqual(len(merger.files), 1)
        self.assertEqual((merger.raw_root / OTHER / f"{OTHER}_LW1.pdf").read_bytes(), b"lab sheet")

    def test_merge_only_cli_needs_no_metadata_or_r_and_retains_other_sample_files(self):
        self.make_zip("part1.zip", {
            f"98_2018/{SAMPLE}/{SAMPLE}_01.jpg": b"image",
            f"98_2018/{SAMPLE}/notes/review.txt": b"keep sample notes",
            f"98_2018/{OTHER}/scan.tif": b"keep tiff",
            "README.txt": b"outside sample folders",
        })
        self.make_zip("part2.zip", {f"{SAMPLE}/{SAMPLE}_01.jpg": b"image"})
        scratch = self.root / "temporary extraction"
        scratch.mkdir()
        output = self.root / "merged sample folders"
        command = [sys.executable, str(ROOT / "scripts" / "prepare_fjs_terminal_batch.py"),
                   "--zip-dir", str(self.root), "--zip-pattern", "part*.zip",
                   "--output-root", str(output), "--merge-only"]
        environment = dict(os.environ, TMP=str(scratch), TEMP=str(scratch), PYTHONUTF8="1")
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", env=environment)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual((output / SAMPLE / "review.txt").read_bytes(), b"keep sample notes")
        self.assertEqual((output / OTHER / "scan.tif").read_bytes(), b"keep tiff")
        self.assertEqual(len(list(output.glob("*/*"))), 3)
        self.assertIn("Identical duplicate files skipped: 1", result.stdout)
        self.assertEqual(list(scratch.iterdir()), [])
        self.assertTrue((self.root / "part1.zip").is_file())
        repeated = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", env=environment)
        self.assertNotEqual(repeated.returncode, 0)
        self.assertIn("already exists", repeated.stderr)

        self.make_zip("part3.zip", {f"{SAMPLE}/{SAMPLE}_01.jpg": b"conflicting version"})
        failed_command = command.copy()
        failed_output = self.root / "conflicted batch"
        failed_command[failed_command.index("--output-root") + 1] = str(failed_output)
        failed = subprocess.run(failed_command, capture_output=True, text=True, encoding="utf-8", env=environment)
        self.assertNotEqual(failed.returncode, 0)
        self.assertIn("Conflicting files", failed.stderr)
        self.assertFalse(failed_output.exists())
        self.assertEqual(list(scratch.iterdir()), [])

    @unittest.skipUnless(os.environ.get("FJS_TEST_RSCRIPT") or shutil.which("Rscript"),
                         "Set FJS_TEST_RSCRIPT to run the R integration check.")
    def test_preparation_and_publish_dry_run_after_temporary_sources_are_removed(self):
        import pandas as pd

        rscript = os.environ.get("FJS_TEST_RSCRIPT") or shutil.which("Rscript")
        dictionary = self.root / "data dictionary.xlsx"
        pd.DataFrame([{"var_names": "TASK.CODE", "FULL NAME": "Task code",
                       "LEVEL": "sample", "UNIT": "code", "description": "Synthetic test"}]).to_excel(
                           dictionary, index=False)
        self.make_zip("part1.zip", {f"export/{SAMPLE}/{SAMPLE}_01.jpg": b"synthetic image"})
        output = self.root / "prepared batch"
        scratch = self.root / "temporary files"
        scratch.mkdir()
        environment = dict(os.environ, TMP=str(scratch), TEMP=str(scratch), PYTHONUTF8="1")
        command = [sys.executable, str(ROOT / "scripts" / "prepare_fjs_terminal_batch.py"),
                   "--zip-dir", str(self.root), "--zip-pattern", "part*.zip",
                   "--metadata-csv", str(self.metadata()), "--data-dictionary", str(dictionary),
                   "--output-root", str(output), "--batch-name", "synthetic batch",
                   "--rscript", rscript]
        result = subprocess.run(command, cwd=self.root, env=environment,
                                capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(list(scratch.iterdir()), [])
        manifest = output / "supabase_import" / "fjs_assets.csv"
        with manifest.open(newline="", encoding="utf-8") as handle:
            assets = list(csv.DictReader(handle))
        self.assertEqual(len(assets), 1)
        for asset in assets:
            path = Path(asset["local_source_path"])
            self.assertTrue(path.is_relative_to(output / "storage_upload_ready"))
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), asset["sha256"])
        with (output / "supabase_import" / "fjs_samples.csv").open(encoding="utf-8") as handle:
            self.assertEqual([row["sample_id"] for row in csv.DictReader(handle)], [SAMPLE])
        dry_run = subprocess.run([
            rscript, str(ROOT / "scripts" / "publish_fjs_supabase_archive_workflow.R"),
            "--output-root", str(output), "--supabase-url", "https://example.invalid",
            "--python", sys.executable,
        ], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", env=environment)
        self.assertEqual(dry_run.returncode, 0, dry_run.stdout + dry_run.stderr)
        self.assertIn("DRY RUN", dry_run.stdout)
        self.assertNotIn("MISSING", dry_run.stdout)

        # A merge failure must also remove staging and leave no publish package.
        self.make_zip("part2.zip", {f"{SAMPLE}/{SAMPLE}_01.jpg": b"conflicting image"})
        failed_command = command.copy()
        failed_output = self.root / "failed batch"
        failed_command[failed_command.index("--output-root") + 1] = str(failed_output)
        failed = subprocess.run(failed_command, capture_output=True, text=True,
                                encoding="utf-8", env=environment)
        self.assertNotEqual(failed.returncode, 0)
        self.assertIn("Conflicting files", failed.stderr)
        self.assertFalse(failed_output.exists())
        self.assertEqual(list(scratch.iterdir()), [])

        repeated = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", env=environment)
        self.assertNotEqual(repeated.returncode, 0)
        self.assertIn("already exists", repeated.stderr)


if __name__ == "__main__":
    unittest.main()
