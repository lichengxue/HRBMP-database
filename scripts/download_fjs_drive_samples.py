#!/usr/bin/env python3
"""Download selected Google Drive sample folders without running a PowerShell script."""

from __future__ import annotations

import argparse
import csv
import re
import shutil
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def read_selection(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not {"sample_id", "drive_folder_id"}.issubset(reader.fieldnames or []):
            raise ValueError("Selection CSV needs sample_id and drive_folder_id columns.")
        samples = list(reader)
    if not samples:
        raise ValueError("The selection CSV is empty.")
    for sample in samples:
        if not re.fullmatch(r"\d+_\d{8}_\d+", sample.get("sample_id") or ""):
            raise ValueError(f"Invalid sample_id: {sample.get('sample_id')}")
        if not re.fullmatch(r"[A-Za-z0-9_-]+", sample.get("drive_folder_id") or ""):
            raise ValueError(f"Missing or invalid drive_folder_id for {sample['sample_id']}")
    for field in ("sample_id", "drive_folder_id"):
        if len({sample[field] for sample in samples}) != len(samples):
            raise ValueError(f"Duplicate {field} values in the selection CSV.")
    return samples


def find_rclone(requested: str | None) -> str:
    if requested:
        executable = shutil.which(requested)
    else:
        portable = REPO_ROOT / "tools" / "rclone" / "rclone.exe"
        executable = str(portable) if portable.is_file() else shutil.which("rclone")
    if not executable:
        raise ValueError("rclone is not installed. Install it or pass --rclone C:/path/to/rclone.exe.")
    return executable


def download(samples: list[dict[str, str]], destination: Path, rclone: str,
             remote: str, preview: bool) -> None:
    if not re.fullmatch(r"[^:]+:", remote):
        raise ValueError("Remote must be a connection name ending in ':', for example gdrive:.")
    remotes = subprocess.run([rclone, "listremotes"], check=True, capture_output=True,
                             text=True, encoding="utf-8").stdout.splitlines()
    if remote not in remotes:
        raise ValueError(
            f"Google Drive connection {remote!r} is not configured. "
            f"Run & \"{rclone}\" config in PowerShell and create it first."
        )
    print(f"Selected sample folders: {len(samples)}\nDestination: {destination}", flush=True)
    for sample in samples:
        command = [rclone, "copy", remote, str(destination / sample["sample_id"]),
                   "--drive-root-folder-id", sample["drive_folder_id"], "--progress"]
        if preview:
            command.append("--dry-run")
        print(f"Sample: {sample['sample_id']}", flush=True)
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as error:
            raise ValueError(
                f"rclone failed for {sample['sample_id']} (exit {error.returncode}). "
                "Fix the error and rerun; prior downloads are retained."
            ) from error
    if preview:
        print("Preview complete. No files downloaded. Omit --preview to download.")
    else:
        print(f"Download complete. Use {destination} as --raw-root for batch preparation.")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selection-csv", required=True, type=Path)
    parser.add_argument("--destination", required=True, type=Path)
    parser.add_argument("--remote", default="gdrive:")
    parser.add_argument("--rclone", default=None, help="Executable path; otherwise use tools/rclone or PATH.")
    parser.add_argument("--preview", action="store_true", help="List planned transfers without downloading.")
    args = parser.parse_args(argv)
    try:
        samples = read_selection(args.selection_csv)
        download(samples, args.destination.resolve(), find_rclone(args.rclone), args.remote, args.preview)
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"Download failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
