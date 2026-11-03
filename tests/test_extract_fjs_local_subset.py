"""Use synthetic survey rows only; never load a researcher's confidential CSV."""

import csv
import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/extract_fjs_local_subset.py"
spec = importlib.util.spec_from_file_location("extract_fjs_local_subset", SCRIPT)
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)


class LocalSubsetTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="local subset test ")
        self.root = Path(self.temporary.name)
        self.source = self.root / "private source.csv"
        self.output = self.root / "local subset.csv"
        self.sample = "98_20181105_1881"
        self.samples = {self.sample: (98, "20181105", 1881)}

    def tearDown(self):
        self.temporary.cleanup()

    def write_source(self, fields, rows):
        with self.source.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
        return hashlib.sha256(self.source.read_bytes()).hexdigest()

    def test_all_matching_taxon_rows_and_columns_retained_source_unchanged(self):
        fields = ["YEAR.OF.DATA.COLLECTION", "SAMPLE.NUMBER", "TASK.CODE", "DATE",
                  "TAXON.CODE", "private note"]
        wanted = [
            dict(zip(fields, ["2018.0", "1881.0", "98.0", "11/05/2018", "19", "Synthetic, α"])),
            dict(zip(fields, ["2018", "1881", "98", "2018-11-05", "20", "Two\nlines"])),
        ]
        rows = wanted + [
            dict(zip(fields, ["2017", "1881", "98", "11/05/2017", "19", "other year"])),
            dict(zip(fields, ["2018", "1881", "99", "11/05/2018", "19", "other task"])),
            dict(zip(fields, ["2018", "1881", "98", "11/06/2018", "19", "other date"])),
            dict(zip(fields, ["2018", "1882", "98", "11/05/2018", "19", "other sample"])),
            dict(zip(fields, ["2018", "1881", "", "11/05/2018", "19", "missing task"])),
        ]
        original = self.write_source(fields, rows)
        report = extractor.extract_subset(self.source, self.samples, self.output)
        self.assertEqual((report["source_rows"], report["selected_rows"], report["matched_samples"]), (7, 2, 1))
        self.assertEqual(report["invalid_key_rows"], 1)
        self.assertEqual(report["missing_samples"], [])
        self.assertFalse(report["full_source_copied"])
        with self.output.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            self.assertEqual(reader.fieldnames, fields)
            self.assertEqual(list(reader), wanted)
        self.assertEqual(hashlib.sha256(self.source.read_bytes()).hexdigest(), original)

    def test_original_year_sample_rule_and_ambiguous_selection(self):
        fields = ["YEAR.OF.DATA.COLLECTION", "SAMPLE.NUMBER", "TAXON.CODE"]
        self.write_source(fields, [dict(zip(fields, ["2018", "1881", "19"]))])
        report = extractor.extract_subset(self.source, self.samples, self.output)
        self.assertEqual(report["selected_rows"], 1)
        self.output.unlink()
        ambiguous = dict(self.samples, **{"99_20181105_1881": (99, "20181105", 1881)})
        with self.assertRaisesRegex(ValueError, "ambiguous"):
            extractor.extract_subset(self.source, ambiguous, self.output)
        self.assertFalse(self.output.exists())

    def test_date_column_can_supply_year_and_missing_samples_are_reported(self):
        fields = ["SAMPLE.NUMBER", "TASK.CODE", "SAMPLE.DATE"]
        self.write_source(fields, [dict(zip(fields, ["1881", "98", "11/05/18"]))])
        samples = dict(self.samples, **{"98_20181105_1882": (98, "20181105", 1882)})
        report = extractor.extract_subset(self.source, samples, self.output)
        self.assertEqual(report["matched_samples"], 1)
        self.assertEqual(report["missing_samples"], ["98_20181105_1882"])

    def test_source_overwrite_and_nonignored_repo_locations_are_rejected(self):
        self.write_source(["YEAR.OF.DATA.COLLECTION", "SAMPLE.NUMBER"], [{"YEAR.OF.DATA.COLLECTION": "2018", "SAMPLE.NUMBER": "1881"}])
        original = self.source.read_bytes()
        with self.assertRaisesRegex(ValueError, "different"):
            extractor.extract_subset(self.source, self.samples, self.source)
        with self.assertRaisesRegex(ValueError, "outside the Git repository"):
            extractor.extract_subset(self.source, self.samples, ROOT / "confidential_subset.csv")
        self.assertEqual(self.source.read_bytes(), original)
        self.assertFalse((ROOT / "confidential_subset.csv").exists())
        for path in (ROOT / "data/processed/new.csv", ROOT / "data/raw/new.csv"):
            with self.assertRaisesRegex(ValueError, "outside the Git repository"):
                extractor.protect_local_path(path)
        other_repo = self.root / "another checkout"
        (other_repo / ".git").mkdir(parents=True)
        with self.assertRaisesRegex(ValueError, "outside Git repositories"):
            extractor.protect_local_path(other_repo / "ignored/subset.csv")

    def test_malformed_csv_removes_partial_output(self):
        self.source.write_text("YEAR.OF.DATA.COLLECTION,SAMPLE.NUMBER\n2018,1881,extra\n")
        with self.assertRaisesRegex(ValueError, "Malformed column count"):
            extractor.extract_subset(self.source, self.samples, self.output)
        self.assertFalse(self.output.exists())

    def test_raw_discovery_and_zip_cli_without_extracting_photo_files(self):
        raw = self.root / "photos"
        (raw / "wrapper" / self.sample).mkdir(parents=True)
        self.assertEqual(extractor.discover_samples(raw_root=raw), self.samples)
        zips = self.root / "downloads"
        zips.mkdir()
        for index in (1, 2):
            with zipfile.ZipFile(zips / f"Example-{index:03d}.zip", "w") as bundle:
                bundle.writestr(f"wrapper/{self.sample}/photo{index}.jpg", b"synthetic")
                bundle.writestr("__MACOSX/99_20180101_0001/ignore.jpg", b"ignored")
        self.assertEqual(extractor.discover_samples(zip_dir=zips, zip_pattern="Example-*.zip"), self.samples)
        self.write_source(["YEAR.OF.DATA.COLLECTION", "SAMPLE.NUMBER"], [{"YEAR.OF.DATA.COLLECTION": "2018", "SAMPLE.NUMBER": "1881"}])
        report_path = self.root / "summary.json"
        result = subprocess.run([sys.executable, str(SCRIPT), "--dataset-csv", str(self.source),
                                 "--zip-dir", str(zips), "--zip-pattern", "Example-*.zip",
                                 "--output-csv", str(self.output), "--report", str(report_path)],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(json.loads(report_path.read_text())["selected_rows"], 1)
        self.assertEqual(len(list(zips.iterdir())), 2)


if __name__ == "__main__":
    unittest.main()
