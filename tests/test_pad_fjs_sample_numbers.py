"""Use synthetic records to protect identifier meaning and other CSV fields."""
import csv
import hashlib
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pad_fjs_sample_numbers import pad_csv


class PadSampleNumbersTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.path = Path(self.temporary.name) / "synthetic survey.csv"

    def write(self, numbers):
        rows = [{"SAMPLE.NUMBER": number, "count": "0", "note": 'Synthetic, "α"\nsecond line'}
                for number in numbers]
        with self.path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=["SAMPLE.NUMBER", "count", "note"])
            writer.writeheader()
            writer.writerows(rows)
        return rows

    def test_only_short_ids_change_and_backup_is_exact(self):
        original = self.write(["1", "4", "47", "999", "9999", "740001", "0002", "", "NA"])
        before = self.path.read_bytes()
        result = pad_csv(self.path)
        self.assertEqual(result["updated"], 4)
        self.assertEqual(result["longer_ids_preserved"], 1)
        self.assertEqual(Path(result["backup"]).read_bytes(), before)
        with self.path.open(encoding="utf-8", newline="") as handle:
            updated = list(csv.DictReader(handle))
        self.assertEqual([row["SAMPLE.NUMBER"] for row in updated],
                         ["0001", "0004", "0047", "0999", "9999", "740001", "0002", "", "NA"])
        for old, new in zip(original, updated):
            self.assertEqual((old["count"], old["note"]), (new["count"], new["note"]))
        current = self.path.read_bytes()
        again = pad_csv(self.path)
        self.assertEqual(again["updated"], 0)
        self.assertIsNone(again["backup"])
        self.assertEqual(self.path.read_bytes(), current)

    def test_invalid_id_does_not_replace_source(self):
        self.write(["4", "not-a-sample"])
        before = self.path.read_bytes()
        with self.assertRaisesRegex(ValueError, "non-integer"):
            pad_csv(self.path)
        self.assertEqual(self.path.read_bytes(), before)
        self.assertFalse(list(self.path.parent.glob("*.bak")))

    def test_separate_output_keeps_original_and_does_not_overwrite(self):
        self.write(["4", "740001"])
        before = self.path.read_bytes()
        output = self.path.parent / "padded.csv"
        result = pad_csv(self.path, output_path=output)
        self.assertEqual(self.path.read_bytes(), before)
        self.assertIsNone(result["backup"])
        with output.open(encoding="utf-8", newline="") as handle:
            self.assertEqual([row["SAMPLE.NUMBER"] for row in csv.DictReader(handle)], ["0004", "740001"])
        with self.assertRaisesRegex(ValueError, "already exists"):
            pad_csv(self.path, output_path=output)

    def test_git_repository_input_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "outside the Git repository"):
            pad_csv(ROOT / "never_create_real_data.csv")


if __name__ == "__main__":
    unittest.main()
