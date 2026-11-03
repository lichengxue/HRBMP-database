import csv
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from exclude_unmatched_fjs_photos import exclude_unmatched, read, write


class ExclusionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        for name in ("supabase_import", "storage_upload_ready", "source_metadata"):
            (self.root / name).mkdir()
        self.photo = self.root / "unmatched.jpg"
        self.photo.write_bytes(b"synthetic photo")
        self.assets = [dict(asset_id="keep", sample_id="98_20180101_0001", asset_kind="jar_label_image",
                            notes="", original_file_name="98_20180101_0001_01.jpg",
                            local_source_path=str(self.photo), sha256="synthetic", representative_id=""),
                       dict(asset_id="exclude", sample_id="98_20180101_0001", asset_kind="other",
                            notes="Possible representative image for taxon 1, but no matching processed sample-taxon row was found.",
                            original_file_name="unmatched.jpg", local_source_path=str(self.photo),
                            sha256="synthetic", representative_id="")]
        self.manifest = self.root / "supabase_import/fjs_assets.csv"
        self.ready = self.root / "storage_upload_ready/upload_ready_manifest.csv"
        for path in (self.manifest, self.ready):
            write(path, list(self.assets[0]), self.assets)
        metadata = {"TASK.CODE": "98", "DATE": "2018-01-01", "SAMPLE.NUMBER": "0001", "TAXON.CODE": "1"}
        write(self.root / "source_metadata/processed_counts_by_sample_taxon.csv", list(metadata), [metadata])

    def test_excludes_from_both_manifests_keeps_photo_and_records_reason(self):
        self.assertEqual(exclude_unmatched(self.root), 1)
        for path in (self.manifest, self.ready):
            self.assertEqual([r["asset_id"] for r in read(path)[1]], ["keep"])
        self.assertEqual(self.photo.read_bytes(), b"synthetic photo")
        self.assertEqual(read(self.root / "excluded_local_photos.csv")[1][0]["asset_id"], "exclude")
        self.assertIn("informational", (self.root / "supabase_import/asset_manifest_qc.txt").read_text())
        self.assertEqual(exclude_unmatched(self.root), 0)

    def test_inconsistent_manifests_leave_selection_unchanged(self):
        write(self.ready, list(self.assets[0]), self.assets[:1])
        before = self.manifest.read_bytes()
        with self.assertRaisesRegex(ValueError, "disagree"):
            exclude_unmatched(self.root)
        self.assertEqual(self.manifest.read_bytes(), before)
        self.assertFalse((self.root / "excluded_local_photos.csv").exists())


if __name__ == "__main__":
    unittest.main()
