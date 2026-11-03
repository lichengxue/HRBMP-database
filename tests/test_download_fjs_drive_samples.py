"""Check sample selection and rclone invocation without accessing Google Drive."""

import contextlib
import io
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import mock_open, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from download_fjs_drive_samples import download, read_selection


SAMPLES = [
    {"sample_id": "98_20181105_1881", "drive_folder_id": "synthetic-folder-one"},
    {"sample_id": "98_20181010_1627", "drive_folder_id": "synthetic-folder-two"},
]


class DownloadTests(unittest.TestCase):
    def test_preview_targets_only_selected_ids_and_preserves_sample_folders(self):
        destination = Path("batch with spaces").resolve()

        def successful_run(command, **kwargs):
            return subprocess.CompletedProcess(command, 0, stdout="gdrive:\n")

        with patch("download_fjs_drive_samples.subprocess.run", side_effect=successful_run) as run:
            with contextlib.redirect_stdout(io.StringIO()):
                download(SAMPLES, destination, "rclone.exe", "gdrive:", True)
        commands = [call.args[0] for call in run.call_args_list]
        self.assertEqual(len(commands), 3)  # One connection check and two transfers.
        for sample, command in zip(SAMPLES, commands[1:]):
            self.assertEqual(command[1:4], ["copy", "gdrive:", str(destination / sample["sample_id"])])
            self.assertEqual(command[command.index("--drive-root-folder-id") + 1], sample["drive_folder_id"])
            self.assertIn("--dry-run", command)

    def test_missing_connection_stops_before_transfers(self):
        with patch("download_fjs_drive_samples.subprocess.run") as run:
            run.return_value.stdout = "another-remote:\n"
            with self.assertRaisesRegex(ValueError, "not configured"):
                download(SAMPLES, Path("batch"), "rclone.exe", "gdrive:", False)
            self.assertEqual(run.call_count, 1)

    def test_failed_transfer_stops_before_the_next_sample(self):
        def failed_run(command, **kwargs):
            if command[1] == "listremotes":
                return subprocess.CompletedProcess(command, 0, stdout="gdrive:\n")
            raise subprocess.CalledProcessError(9, command)

        with patch("download_fjs_drive_samples.subprocess.run", side_effect=failed_run) as run:
            with contextlib.redirect_stdout(io.StringIO()), self.assertRaisesRegex(ValueError, "exit 9"):
                download(SAMPLES, Path("batch"), "rclone.exe", "gdrive:", False)
            self.assertEqual(run.call_count, 2)
            self.assertNotIn("--dry-run", run.call_args.args[0])

    def test_invalid_or_duplicate_selection_is_rejected(self):
        for contents in [
            "sample_id,drive_folder_id\n",
            "sample_id,drive_folder_id\n../outside,folder-one\n",
            "sample_id,drive_folder_id\n98_20181105_1881,\n",
            "sample_id,drive_folder_id\n98_20181105_1881,one\n98_20181105_1881,two\n",
            "sample_id,drive_folder_id\n98_20181105_1881,one\n98_20181010_1627,one\n",
        ]:
            with self.subTest(contents=contents):
                with patch.object(Path, "open", mock_open(read_data=contents)), self.assertRaises(ValueError):
                    read_selection(Path("selection.csv"))


if __name__ == "__main__":
    unittest.main()
