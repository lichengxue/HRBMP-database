#!/usr/bin/env python3
"""Prepare an FJS batch from downloaded ZIPs or a local Google Drive folder.

Merge sample assets in temporary storage, select their metadata rows, and call
the existing R preparation workflow. This command never connects to Supabase.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path, PurePosixPath, PureWindowsPath
from typing import BinaryIO

from build_fjs_archive_manifest import sample_id_from_row


REPO_ROOT = Path(__file__).resolve().parents[1]
SAMPLE_ID = re.compile(r"\d+_\d{8}_\d+")
ASSET_EXTENSIONS = {".jpg", ".jpeg", ".pdf"}
LOG_FIELDS = ["source", "member", "sample_id", "file_name", "sha256", "status"]


def asset_destination(name: str, include_all_files: bool = False) -> tuple[str, str] | None:
    """Strip download wrappers and asset subfolders, retaining the sample ID."""
    parts = name.replace("\\", "/").split("/")
    if (
        name.startswith(("/", "\\"))
        or any(part == ".." or ":" in part for part in parts)
    ):
        raise ValueError(f"Unsafe archive path: {name}")
    if "__MACOSX" in parts or parts[-1].startswith("."):
        return None
    if not include_all_files and PurePosixPath(parts[-1]).suffix.lower() not in ASSET_EXTENSIONS:
        return None
    samples = [part for part in parts[:-1] if SAMPLE_ID.fullmatch(part)]
    if len(samples) != 1:
        if samples:
            raise ValueError(f"Ambiguous sample folders: {name}")
        return None
    filename = parts[-1]
    if (
        any(char in filename for char in '<>"|?*')
        or any(ord(char) < 32 for char in filename)
        or filename.endswith((" ", "."))
        or PureWindowsPath(filename).is_reserved()
    ):
        raise ValueError(f"Unsupported Windows filename: {name}")
    return samples[0], filename


class SampleMerger:
    def __init__(self, raw_root: Path, include_all_files: bool = False):
        self.raw_root = raw_root
        self.include_all_files = include_all_files
        self.files: dict[tuple[str, str], dict[str, str]] = {}
        self.log: list[dict[str, str]] = []
        self.skipped = 0

    def add(self, source: str, member: str, stream: BinaryIO) -> None:
        destination = asset_destination(member, self.include_all_files)
        if destination is None:
            self.skipped += 1
            return
        sample_id, filename = destination
        key = (sample_id, filename.casefold())
        existing = self.files.get(key)
        digest = hashlib.sha256()
        if existing is None:
            target = self.raw_root / sample_id / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as output:
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    digest.update(chunk)
                    output.write(chunk)
        else:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
            if digest.hexdigest() != existing["sha256"]:
                raise ValueError(
                    f"Conflicting files for {sample_id}/{filename}: "
                    f"{existing['source']} ({existing['member']}) and {source} ({member}). "
                    "Different contents; neither version was chosen."
                )
        row = dict(zip(LOG_FIELDS, [source, member, sample_id, filename,
                                   digest.hexdigest(), "duplicate_identical" if existing else "merged"]))
        self.log.append(row)
        if existing is None:
            self.files[key] = row

    def from_zips(self, source: Path, pattern: str) -> None:
        archives = sorted(path for path in source.glob(pattern) if path.is_file())
        if not archives:
            raise ValueError(f"No ZIPs match {pattern!r} in {source}")
        for archive in archives:
            print(f"Reading ZIP: {archive.name}", flush=True)
            with zipfile.ZipFile(archive) as bundle:
                for entry in bundle.infolist():
                    if stat.S_ISLNK(entry.external_attr >> 16):
                        raise ValueError(f"ZIP contains a symbolic link: {entry.filename}")
                    # Validate even directory entries; never extract arbitrary ZIP paths.
                    destination = asset_destination(entry.filename, self.include_all_files)
                    if entry.is_dir() or destination is None:
                        self.skipped += 1
                        continue
                    with bundle.open(entry) as stream:
                        self.add(str(archive), entry.filename, stream)

    def from_folder(self, source: Path) -> None:
        for path in sorted(source.rglob("*")):
            if path.is_symlink():
                raise ValueError(f"Input contains a symbolic link: {path}")
            if path.is_file():
                with path.open("rb") as stream:
                    relative = path.relative_to(source).as_posix()
                    if SAMPLE_ID.fullmatch(source.name):
                        relative = f"{source.name}/{relative}"
                    self.add(str(source), relative, stream)


def write_csv(path: Path, fields: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def merge_only(args: argparse.Namespace) -> Path:
    """Save combined sample folders without requiring metadata, R, or Supabase."""
    source = (args.zip_dir or args.raw_root).resolve()
    output = args.output_root.resolve()
    if not source.is_dir():
        raise ValueError(f"Input folder does not exist: {source}")
    if output.exists():
        raise ValueError(f"Output folder already exists: {output}. Choose a new output folder.")
    with tempfile.TemporaryDirectory(prefix="fjs-merge-") as temporary:
        staging = Path(temporary).resolve()
        if staging.parent != Path(tempfile.gettempdir()).resolve():
            raise ValueError(f"Unexpected temporary folder: {staging}")
        merger = SampleMerger(staging / "samples", include_all_files=True)
        if args.zip_dir:
            merger.from_zips(source, args.zip_pattern)
        else:
            merger.from_folder(source)
        if not merger.files:
            raise ValueError("No files found inside sample ID folders (e.g. 98_20181105_1881).")
        samples = {sample_id for sample_id, _ in merger.files}
        duplicates = len(merger.log) - len(merger.files)
        # All ZIPs are read and conflicts checked before creating the final folder.
        shutil.copytree(merger.raw_root, output)
        write_csv(output / "source_merge_log.csv", LOG_FIELDS, merger.log)
        summary = (
            f"Input folder: {source}\nMerged output: {output}\n"
            f"Sample folders: {len(samples)}\nMerged files: {len(merger.files)}\n"
            f"Identical duplicate files skipped: {duplicates}\n"
            f"Ignored entries: {merger.skipped} (directory records, hidden metadata, or files outside sample folders)\n"
            "All file extensions inside sample folders are included.\n"
            "Original downloads retained. Temporary extraction removed after merging.\n"
        )
        (output / "merge_summary.txt").write_text(summary, encoding="utf-8")
        print(summary, flush=True)
    return output


def select_metadata(source: Path, destination: Path, samples: set[str]) -> tuple[int, int]:
    with source.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        if not fields:
            raise ValueError("Metadata CSV has no header.")
        rows = list(reader)
    selected = [row for row in rows if sample_id_from_row(row) in samples]
    found = {sample_id_from_row(row) for row in selected}
    missing = samples - found
    if missing:
        raise ValueError("Sample folders have no metadata rows: " + ", ".join(sorted(missing)))
    write_csv(destination, fields, selected)
    return len(selected), len(rows) - len(selected)


def retain_upload_sources(output: Path) -> None:
    """Publishers must read permanent copies, never the temporary merged files."""
    manifest = output / "supabase_import" / "fjs_assets.csv"
    with manifest.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        rows = list(reader)
    if not fields or not rows:
        raise ValueError("Preparation produced no asset rows.")
    storage = (output / "storage_upload_ready").resolve()
    for row in rows:
        local = (storage / row["storage_object_path"]).resolve()
        if not local.is_relative_to(storage) or not local.is_file():
            raise ValueError(f"Prepared asset missing or outside output folder: {local}")
        with local.open("rb") as handle:
            checksum = hashlib.file_digest(handle, "sha256").hexdigest()
        if checksum != row["sha256"]:
            raise ValueError(f"Prepared asset checksum mismatch: {local}")
        row["local_source_path"] = local.as_posix()
    write_csv(manifest, fields, rows)
    prepared_rows = [dict(row, prepared_local_path=row["local_source_path"]) for row in rows]
    write_csv(storage / "upload_ready_manifest.csv", fields + ["prepared_local_path"], prepared_rows)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--zip-dir", type=Path, help="Folder with this batch's downloaded ZIPs.")
    source.add_argument("--raw-root", type=Path, help="Folder downloaded directly from Drive.")
    parser.add_argument("--zip-pattern", default="*.zip", help="ZIP filename glob, e.g. 98_20180703_*.zip")
    parser.add_argument("--merge-only", action="store_true", help="Only unzip/merge sample folders; no metadata or R needed.")
    parser.add_argument("--metadata-csv", type=Path, help="Processed survey CSV: required unless --merge-only.")
    parser.add_argument("--data-dictionary", type=Path, help="Required unless --merge-only.")
    parser.add_argument("--output-root", required=True, type=Path, help="New output folder; existing folders are refused.")
    parser.add_argument("--batch-name", default=None)
    parser.add_argument("--access-level", choices=("private", "restricted", "public"), default="private")
    parser.add_argument("--rscript", default="Rscript", help="Rscript executable name or full path.")
    args = parser.parse_args(argv)
    if not args.merge_only and (args.metadata_csv is None or args.data_dictionary is None):
        parser.error("--metadata-csv and --data-dictionary are required unless --merge-only is used.")
    return args


def prepare(args: argparse.Namespace) -> Path:
    source = (args.zip_dir or args.raw_root).resolve()
    metadata = args.metadata_csv.resolve()
    dictionary = args.data_dictionary.resolve()
    output = args.output_root.resolve()
    if not source.is_dir():
        raise ValueError(f"Input folder does not exist: {source}")
    for path in (metadata, dictionary):
        if not path.is_file():
            raise ValueError(f"Input file does not exist: {path}")
    if output.exists():
        raise ValueError(f"Output folder already exists: {output}. Choose a new batch folder.")
    rscript = shutil.which(args.rscript)
    if not rscript:
        raise ValueError("Cannot find Rscript. Pass --rscript with the full path to Rscript.exe.")
    # The underlying Excel dictionary export requires these packages.
    import pandas  # noqa: F401
    import openpyxl  # noqa: F401

    with tempfile.TemporaryDirectory(prefix="fjs-batch-") as temporary:
        staging = Path(temporary).resolve()
        # Verify the generated deletion target is inside the OS temporary folder.
        if staging.parent != Path(tempfile.gettempdir()).resolve():
            raise ValueError(f"Unexpected temporary folder: {staging}")
        raw = staging / "samples"
        merger = SampleMerger(raw)
        if args.zip_dir:
            merger.from_zips(source, args.zip_pattern)
        else:
            merger.from_folder(source)
        if not merger.files:
            raise ValueError("No JPG/JPEG/PDF assets inside sample ID folders (e.g. 98_20180703_0066).")
        samples = {sample_id for sample_id, _ in merger.files}
        subset = staging / "processed_counts_by_sample_taxon.csv"
        kept, excluded = select_metadata(metadata, subset, samples)
        duplicates = len(merger.log) - len(merger.files)
        print(f"Merged {len(samples)} samples, {len(merger.files)} assets; "
              f"{duplicates} identical duplicates; {merger.skipped} ignored entries.", flush=True)
        print(f"Metadata: {kept} rows selected; {excluded} rows outside this batch.", flush=True)
        subprocess.run([
            rscript, str(REPO_ROOT / "scripts" / "run_fjs_supabase_archive_workflow.R"),
            "--raw-root", str(raw), "--metadata-csv", str(subset),
            "--data-dictionary", str(dictionary), "--output-root", str(output),
            "--batch-name", args.batch_name or output.name,
            "--access-level", args.access_level, "--python", sys.executable,
        ], cwd=REPO_ROOT, check=True)
        retain_upload_sources(output)
        write_csv(output / "source_merge_log.csv", LOG_FIELDS, merger.log)
        summary = output / "workflow_run_summary.txt"
        with summary.open("a", encoding="utf-8") as handle:
            handle.write(
                f"\nTerminal batch input: {source}\nOriginal metadata CSV: {metadata}\n"
                f"Selected metadata rows: {kept}; excluded rows: {excluded}\n"
                f"Identical duplicate assets skipped: {duplicates}\n"
                "Temporary merged sources removed after preparation.\n"
                "fjs_assets.csv and upload_ready_manifest.csv reference permanent storage_upload_ready copies.\n"
                "The temporary paths above and in the copy log are provenance only.\n"
            )
    return output


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    try:
        output = merge_only(args) if args.merge_only else prepare(args)
    except (OSError, ValueError, ImportError, zipfile.BadZipFile, RuntimeError,
            subprocess.CalledProcessError) as error:
        print(f"Preparation failed: {error}", file=sys.stderr)
        return 1
    print(f"\n{'Merged sample folders' if args.merge_only else 'Terminal batch'} ready: {output}")
    print("Temporary files removed. No files were uploaded to Supabase.")
    if args.merge_only:
        print("Use this output folder as --raw-root when preparing the archive package later.")
    else:
        print(f"Review QC: {output / 'supabase_import' / 'asset_manifest_qc.txt'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
