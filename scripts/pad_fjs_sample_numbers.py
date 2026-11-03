#!/usr/bin/env python3
"""Pad SAMPLE.NUMBER in a local CSV, preserving every other field and a backup."""

from __future__ import annotations

import argparse
import csv
import hashlib
import os
import re
import shutil
import sys
import uuid
from itertools import zip_longest
from pathlib import Path

from extract_fjs_local_subset import protect_local_path


def padded(value: str, width: int = 4) -> str:
    if value in {"", "NA", "NaN", "nan"}:
        return value
    if not re.fullmatch(r"[0-9]+", value):
        raise ValueError("SAMPLE.NUMBER contains a non-integer identifier; no update was applied.")
    return value.zfill(width)


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def pad_csv(path: Path, width: int = 4, output_path: Path | None = None) -> dict:
    path = protect_local_path(path)
    target = protect_local_path(output_path) if output_path is not None else path
    if target != path and target.exists():
        raise ValueError("The output file already exists; it will not be overwritten.")
    if width < 1:
        raise ValueError("The identifier width must be positive.")
    before = path.stat()
    original_hash = checksum(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name("." + target.name + "." + uuid.uuid4().hex + ".tmp")
    rows = changed = longer = 0
    try:
        with path.open(encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            fields = reader.fieldnames or []
            if fields.count("SAMPLE.NUMBER") != 1 or len(set(fields)) != len(fields):
                raise ValueError("The CSV must have unique column names and one SAMPLE.NUMBER column.")
            with temporary.open("x", encoding="utf-8", newline="") as output:
                writer = csv.DictWriter(output, fieldnames=fields)
                writer.writeheader()
                for row in reader:
                    rows += 1
                    if None in row or any(value is None for value in row.values()):
                        raise ValueError("The CSV has a malformed row; no update was applied.")
                    old = row["SAMPLE.NUMBER"]
                    new = padded(old, width)
                    changed += old != new
                    longer += bool(re.fullmatch(r"[0-9]+", old)) and len(old) > width
                    row["SAMPLE.NUMBER"] = new
                    writer.writerow(row)
                output.flush()
                os.fsync(output.fileno())
        # Compare every row and field against the permitted transformation.
        with path.open(encoding="utf-8-sig", newline="") as original, temporary.open(encoding="utf-8", newline="") as updated:
            old_reader, new_reader = csv.DictReader(original), csv.DictReader(updated)
            if old_reader.fieldnames != new_reader.fieldnames:
                raise ValueError("Column names changed during verification.")
            verified_rows = 0
            for old, new in zip_longest(old_reader, new_reader):
                if old is None or new is None:
                    raise ValueError("Row count changed during verification.")
                expected = dict(old, **{"SAMPLE.NUMBER": padded(old["SAMPLE.NUMBER"], width)})
                if expected != new:
                    raise ValueError("An unexpected field change was detected; no update was applied.")
                verified_rows += 1
            if verified_rows != rows:
                raise ValueError("Row count changed during verification.")
        current = path.stat()
        if (before.st_size, before.st_mtime_ns) != (current.st_size, current.st_mtime_ns) or checksum(path) != original_hash:
            raise ValueError("The source CSV changed while it was being processed. Retry after it finishes saving.")
        if target != path:
            os.rename(temporary, target)
            return {"rows": rows, "updated": changed, "longer_ids_preserved": longer,
                    "backup": None, "output": str(target)}
        if not changed:
            return {"rows": rows, "updated": 0, "longer_ids_preserved": longer, "backup": None, "output": str(path)}
        backup = path.with_name(path.name + ".before_sample_padding.bak")
        index = 1
        while backup.exists():
            backup = path.with_name(path.name + f".before_sample_padding.{index}.bak")
            index += 1
        with path.open("rb") as source, backup.open("xb") as destination:
            shutil.copyfileobj(source, destination, length=1024 * 1024)
        if checksum(backup) != original_hash or checksum(path) != original_hash:
            raise ValueError("Backup verification failed or the source changed. The original CSV was not replaced.")
        os.replace(temporary, path)
        return {"rows": rows, "updated": changed, "longer_ids_preserved": longer,
                "backup": str(backup), "output": str(path)}
    finally:
        if temporary.exists():
            temporary.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--width", type=int, default=4)
    parser.add_argument("--output", type=Path, help="Save a new padded CSV instead of replacing the source.")
    args = parser.parse_args()
    try:
        result = pad_csv(args.csv, args.width, args.output)
    except (OSError, ValueError, csv.Error) as error:
        print(f"CSV formatting failed: {error}", file=sys.stderr)
        return 1
    print(f"Rows verified: {result['rows']}; sample numbers padded: {result['updated']}.")
    print(f"Longer identifiers preserved: {result['longer_ids_preserved']}. Other columns unchanged.")
    if result["backup"]:
        print("Protected-folder backup:", result["backup"])
    print("CSV:", result["output"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
