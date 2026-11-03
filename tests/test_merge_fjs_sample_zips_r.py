"""Exercise the native R merger using synthetic ZIP parts, without real data."""

import json
import os
import shutil
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RSCRIPT = os.environ.get("FJS_TEST_RSCRIPT") or shutil.which("Rscript")
SAMPLE = "98_20180717_0193"
OTHER = "98_20180718_0333"


@unittest.skipUnless(RSCRIPT, "Set FJS_TEST_RSCRIPT to test the native R ZIP merger.")
class RZipMergeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="R merge test ")
        self.root = Path(self.temporary.name).resolve()
        self.assertEqual(self.root.parent, Path(tempfile.gettempdir()).resolve())
        self.addCleanup(self.temporary.cleanup)
        self.scratch = self.root / "R temporary files"
        self.scratch.mkdir()
        self.environment = dict(os.environ, TMPDIR=str(self.scratch), TMP=str(self.scratch),
                                TEMP=str(self.scratch))
        self.output = self.root / "merged samples"

    def make_part(self, number, files):
        archive = self.root / f"Batch5_Named_Photos-TEST-1-{number:03d}.zip"
        with zipfile.ZipFile(archive, "w") as bundle:
            for member, content in files.items():
                bundle.writestr(member, content)

    def run_cli(self, expected=3):
        return subprocess.run([
            RSCRIPT, str(ROOT / "scripts" / "merge_fjs_sample_zips.R"),
            "--zip-dir", str(self.root), "--output-root", str(self.output),
            "--zip-pattern", r"^Batch5_.*\.zip$", "--expected-parts", str(expected),
        ], capture_output=True, text=True, encoding="utf-8", env=self.environment)

    def test_three_parts_merge_and_source_from_r_code(self):
        self.make_part(1, {f"Batch5/98/98_2018/{SAMPLE}/{SAMPLE}_01.jpg": b"image",
                           f"Batch5/98/98_2018/{SAMPLE}/notes/review.txt": b"sample notes"})
        self.make_part(2, {f"{SAMPLE}/{SAMPLE}_01.JPG": b"image",
                           f"{SAMPLE}/{SAMPLE}_SC1.pdf": b"field sheet"})
        self.make_part(3, {f"{OTHER}/scan.tif": b"tiff", "README.txt": b"outside samples"})
        # Source it and invoke the function as an RStudio/R-script user would.
        quote = lambda value: json.dumps(str(value).replace("\\", "/"))
        expression = (
            f"source({quote(ROOT / 'scripts' / 'merge_fjs_sample_zips.R')});"
            f"merged <- merge_fjs_sample_zips({quote(self.root)}, {quote(self.output)},"
            'zip_pattern = "^Batch5_.*\\\\.zip$", expected_parts = 3);'
            "stopifnot(dir.exists(merged));"
            'stopifnot(!any(startsWith(basename(list.dirs(tempdir(), recursive=FALSE)), "fjs-merge-")))'
        )
        result = subprocess.run([RSCRIPT, "-e", expression], capture_output=True, text=True,
                                encoding="utf-8", env=self.environment)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual((self.output / SAMPLE / f"{SAMPLE}_01.jpg").read_bytes(), b"image")
        self.assertEqual((self.output / SAMPLE / "review.txt").read_bytes(), b"sample notes")
        self.assertEqual((self.output / OTHER / "scan.tif").read_bytes(), b"tiff")
        self.assertIn("Merged files: 4", result.stdout)
        self.assertIn("Identical duplicate files skipped: 1", result.stdout)
        self.assertIn("Saved file checksums verified: 4", result.stdout)
        self.assertEqual(len(list(self.root.glob("*.zip"))), 3)
        repeated = self.run_cli()
        self.assertNotEqual(repeated.returncode, 0)
        self.assertIn("Output already exists", repeated.stderr)

    def test_missing_part_stops_before_output_creation(self):
        for number in (1, 3):
            self.make_part(number, {f"{SAMPLE}/image{number}.jpg": b"image"})
        result = self.run_cli()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Expected 3 ZIP parts, found 2", result.stderr)
        self.assertFalse(self.output.exists())

    def test_conflicting_contents_stop_before_output_creation(self):
        for number, data in ((1, b"first"), (2, b"second"), (3, b"third")):
            self.make_part(number, {f"{SAMPLE}/same.jpg": data})
        result = self.run_cli()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Conflicting contents", result.stderr)
        self.assertFalse(self.output.exists())
        self.assertEqual(list(self.scratch.iterdir()), [])

    def test_unsafe_archive_path_is_rejected(self):
        self.make_part(1, {f"../{SAMPLE}/image.jpg": b"image"})
        result = self.run_cli(expected=1)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("unsafe path", result.stderr)
        self.assertFalse(self.output.exists())


if __name__ == "__main__":
    unittest.main()
