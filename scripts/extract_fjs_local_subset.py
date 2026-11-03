#!/usr/bin/env python3
"""Extract matching sample rows from a read-only local confidential survey CSV.

Adapted from the user's folder-discovery and year/sample filtering workflow.
No Colab connection, dataset upload, or full-source copy is performed.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import sys
import zipfile
from collections import defaultdict
from datetime import datetime
from pathlib import Path, PurePosixPath

REPO_ROOT = Path(__file__).resolve().parents[1]
SAMPLE_PATTERN = re.compile(r"^(\d+)_(\d{8})_(\d+)$")


def protect_local_path(path: Path, repo: Path = REPO_ROOT) -> Path:
    path = path.resolve()
    if path.is_relative_to(repo.resolve()):
        raise ValueError("Keep confidential data and generated subsets outside the Git repository.")
    if any((parent / ".git").exists() for parent in (path, *path.parents)):
        raise ValueError("Keep confidential data and generated subsets outside Git repositories.")
    return path


def sample_key(name: str) -> tuple[int, str, int] | None:
    match = SAMPLE_PATTERN.fullmatch(name)
    if not match:
        return None
    try:
        datetime.strptime(match[2], "%Y%m%d")
    except ValueError:
        raise ValueError(f"Invalid date in sample folder name: {name}") from None
    return int(match[1]), match[2], int(match[3])


def discover_samples(raw_root: Path | None = None, zip_dir: Path | None = None,
                     zip_pattern: str = "*.zip") -> dict[str, tuple[int, str, int]]:
    names = set()
    if raw_root is not None:
        if not raw_root.is_dir():
            raise ValueError("The sample folder does not exist.")
        if sample_key(raw_root.name):
            names.add(raw_root.name)
        for _, directories, _ in os.walk(raw_root, followlinks=False):
            names.update(name for name in directories if SAMPLE_PATTERN.fullmatch(name))
    else:
        if zip_dir is None or not zip_dir.is_dir():
            raise ValueError("The ZIP folder does not exist.")
        archives = sorted(zip_dir.glob(zip_pattern))
        if not archives:
            raise ValueError("No ZIP files match the selected download.")
        for archive in archives:
            with zipfile.ZipFile(archive) as bundle:
                for entry in bundle.infolist():
                    parts = PurePosixPath(entry.filename.replace("\\", "/")).parts
                    if "__MACOSX" in parts:
                        continue
                    folders = parts if entry.is_dir() else parts[:-1]
                    names.update(part for part in folders if SAMPLE_PATTERN.fullmatch(part))
    result = {name: sample_key(name) for name in sorted(names)}
    if not result:
        raise ValueError("No sample ID folders were found in the selected photos.")
    return result


def integer(value: str | None) -> int | None:
    try:
        number = float(value or "")
        return int(number) if math.isfinite(number) and number.is_integer() else None
    except ValueError:
        return None


def date_key(value: str | None) -> str | None:
    text = (value or "").strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y", "%Y%m%d"):
        try:
            return datetime.strptime(text, fmt).strftime("%Y%m%d")
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(text).strftime("%Y%m%d")
    except ValueError:
        return None


def extract_subset(dataset: Path, samples: dict, output_csv: Path) -> dict:
    dataset = protect_local_path(dataset)
    output_csv = protect_local_path(output_csv)
    if dataset == output_csv:
        raise ValueError("The subset output must be different from the confidential source file.")
    if not dataset.is_file():
        raise ValueError("The confidential survey CSV does not exist.")
    if output_csv.exists():
        raise ValueError("Subset output already exists. Choose a new output file.")
    by_year_sample = defaultdict(set)
    for name, (task, date, number) in samples.items():
        by_year_sample[(int(date[:4]), number)].add(name)
    before = dataset.stat()
    rows_read = selected_rows = invalid_rows = 0
    found = set()
    created = False
    try:
        with dataset.open(encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            fields = reader.fieldnames or []
            if "SAMPLE.NUMBER" not in fields or not any(
                field in fields for field in ("YEAR.OF.DATA.COLLECTION", "DATE", "SAMPLE.DATE")
            ):
                raise ValueError("The survey CSV needs SAMPLE.NUMBER and YEAR.OF.DATA.COLLECTION or a date column.")
            if len(set(fields)) != len(fields):
                raise ValueError("The survey CSV contains duplicate column names.")
            has_task = "TASK.CODE" in fields
            has_date = "DATE" in fields or "SAMPLE.DATE" in fields
            output_csv.parent.mkdir(parents=True, exist_ok=True)
            with output_csv.open("x", encoding="utf-8", newline="") as output:
                created = True
                writer = csv.DictWriter(output, fieldnames=fields)
                writer.writeheader()
                for row in reader:
                    rows_read += 1
                    if None in row or any(value is None for value in row.values()):
                        raise ValueError(f"Malformed column count at survey row {rows_read + 1}.")
                    number = integer(row.get("SAMPLE.NUMBER"))
                    year = integer(row.get("YEAR.OF.DATA.COLLECTION"))
                    raw_date = row.get("DATE") or row.get("SAMPLE.DATE")
                    if year is None and has_date:
                        parsed = date_key(raw_date)
                        year = int(parsed[:4]) if parsed else None
                    if year is None or number is None:
                        invalid_rows += 1
                        continue
                    candidates = by_year_sample.get((year, number), set())
                    if not candidates:
                        continue
                    task = integer(row.get("TASK.CODE")) if has_task else None
                    parsed_date = date_key(raw_date) if has_date else None
                    if (has_task and task is None) or (has_date and parsed_date is None):
                        invalid_rows += 1
                        continue
                    matches = {name for name in candidates
                               if (not has_task or samples[name][0] == task)
                               and (not has_date or samples[name][1] == parsed_date)}
                    if len(matches) > 1:
                        raise ValueError("Year/sample keys are ambiguous. Include TASK.CODE and DATE to identify samples.")
                    if matches:
                        writer.writerow(row)
                        selected_rows += 1
                        found.update(matches)
        after = dataset.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise ValueError("The source CSV changed during extraction. Retry after it is finished saving.")
    except Exception:
        if created:
            output_csv.unlink(missing_ok=True)
        raise
    return {
        "source_rows": rows_read, "selected_rows": selected_rows,
        "excluded_rows": rows_read - selected_rows, "invalid_key_rows": invalid_rows,
        "requested_samples": len(samples), "matched_samples": len(found),
        "missing_samples": sorted(set(samples) - found),
        "output_csv": str(output_csv),
        "match_rule": "Year and sample number; task and date also checked when present.",
        "full_source_copied": False,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-csv", required=True, type=Path)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--raw-root", type=Path)
    source.add_argument("--zip-dir", type=Path)
    parser.add_argument("--zip-pattern", default="*.zip")
    parser.add_argument("--output-csv", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        report_path = protect_local_path(args.report)
        if report_path.resolve() in {args.dataset_csv.resolve(), args.output_csv.resolve()}:
            raise ValueError("The report must have its own output path.")
        if report_path.exists():
            raise ValueError("The extraction report already exists. Choose a new output path.")
        samples = discover_samples(args.raw_root, args.zip_dir, args.zip_pattern)
        report = extract_subset(args.dataset_csv, samples, args.output_csv)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    except (OSError, ValueError, csv.Error, zipfile.BadZipFile) as error:
        print(f"Subset extraction failed: {error}", file=sys.stderr)
        return 1
    print(f"Survey rows read: {report['source_rows']}; selected rows: {report['selected_rows']}")
    print(f"Matched samples: {report['matched_samples']}/{report['requested_samples']}; "
          f"missing: {len(report['missing_samples'])}; invalid-key rows: {report['invalid_key_rows']}")
    print("Full confidential source retained in place. Only the selected subset was saved locally.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
