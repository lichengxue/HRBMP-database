import contextlib
import csv
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import upload_fjs_storage_assets as upload


class UploadProgressTests(unittest.TestCase):
    def test_counts_successes_and_failures_separately(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            photo = root / "synthetic.jpg"
            photo.write_bytes(b"synthetic image")
            manifest = root / "assets.csv"
            fields = ["storage_bucket", "local_source_path", "storage_object_path", "mime_type"]
            with manifest.open("w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fields)
                writer.writeheader()
                for name in ("one.jpg", "two.jpg"):
                    writer.writerow(dict(zip(fields, ["fjs-archive", str(photo), name, "image/jpeg"])))
            output = io.StringIO()
            with patch.dict(os.environ, SUPABASE_SERVICE_ROLE_KEY="sb_secret_synthetic_test_value"), \
                    patch.object(upload, "upload_file", side_effect=[(201, ""), (403, "denied")]), \
                    contextlib.redirect_stdout(output):
                result = upload.main(["--supabase-url", "https://example.invalid", "--manifest", str(manifest), "--apply"])
            events = [json.loads(line.removeprefix("FJS_UPLOAD_PROGRESS "))
                      for line in output.getvalue().splitlines() if line.startswith("FJS_UPLOAD_PROGRESS ")]
            self.assertEqual(result, 1)
            self.assertEqual(events, [dict(uploaded=0, failed=0, total=2),
                                      dict(uploaded=1, failed=0, total=2),
                                      dict(uploaded=1, failed=1, total=2)])
            output = io.StringIO()
            with patch.object(upload, "upload_file", side_effect=AssertionError("Dry run attempted upload")), \
                    contextlib.redirect_stdout(output):
                self.assertEqual(upload.main(["--supabase-url", "https://example.invalid", "--manifest", str(manifest)]), 0)
            self.assertNotIn("FJS_UPLOAD_PROGRESS", output.getvalue())
