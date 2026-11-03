"""Use synthetic observations to preserve missing values during publishing."""

import contextlib
import csv
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_fjs_archive_manifest as manifest
import upload_fjs_supabase_tables as uploader


class MissingObservationTests(unittest.TestCase):
    def test_missing_numeric_values_become_null_and_zero_stays_zero(self):
        for value in ("", " ", "NA", " NA ", "nan", "None", "null"):
            with self.subTest(value=value):
                self.assertIsNone(uploader.parse_int(value))
                self.assertIsNone(uploader.parse_number(value))
                self.assertEqual(manifest.parse_number(value), "")
        self.assertEqual(uploader.parse_int("0"), 0)
        self.assertEqual(uploader.parse_number("0.0"), 0)
        self.assertEqual(uploader.parse_number("1.25"), 1.25)

    def test_typed_conversion_preserves_codes_and_raw_source(self):
        raw = {"SAMPLE.NUMBER": "0004", "WAVE.HEIGHT": "NA"}
        rows = uploader.convert_rows("fjs_samples", [{
            "sample_number": "0004", "year": "2018", "river_mile": "0",
            "wave_height": "NA", "raw_event": json.dumps(raw), "site_code": "NA",
        }])
        self.assertEqual(rows, [{
            "sample_number": "0004", "year": 2018, "river_mile": 0,
            "wave_height": None, "raw_event": raw, "site_code": "NA",
        }])
        json.dumps(rows, allow_nan=False)

    def test_invalid_observations_are_not_silently_replaced(self):
        for value in ("not a number", "Inf", "-Inf"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                uploader.parse_number(value)

    def test_dry_run_accepts_r_missing_values_without_network_requests(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary)
            for filename, record in (
                ("fjs_samples.csv", {"sample_id": "synthetic", "year": "2018",
                                     "wave_height": "NA", "river_depth": "0"}),
                ("fjs_sample_taxa.csv", {"sample_taxon_id": "synthetic-taxon",
                                         "eggs_count": "NA", "young_of_year_count": "0"}),
            ):
                with (path / filename).open("w", encoding="utf-8", newline="") as handle:
                    writer = csv.DictWriter(handle, fieldnames=list(record))
                    writer.writeheader()
                    writer.writerow(record)
            with patch.object(uploader.urllib.request, "urlopen", side_effect=AssertionError("Unexpected network request")), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(uploader.main([
                    "--supabase-url", "https://example.invalid", "--import-dir", str(path),
                ]), 0)


if __name__ == "__main__":
    unittest.main()
