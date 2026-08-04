#!/usr/bin/env python3
"""Upload generated FJS import CSVs to Supabase tables.

This script does not store credentials. Pass the Supabase URL as an argument
and put a Supabase secret/service-role key in an environment variable for the
current terminal session.

Default mode is a dry run. Add --apply to write to Supabase.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_IMPORT_DIR = "data/processed/FJS_storage_upload_ready/supabase_import"
DEFAULT_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY"

TABLE_IMPORTS = [
    ("fjs_import_batches", "fjs_import_batches.csv", "batch_id"),
    ("fjs_samples", "fjs_samples.csv", "sample_id"),
    ("fjs_taxa", "fjs_taxa.csv", "taxon_code"),
    ("fjs_sample_taxa", "fjs_sample_taxa.csv", "sample_taxon_id"),
    ("fjs_representative_specimens", "fjs_representative_specimens.csv", "representative_id"),
    ("fjs_assets", "fjs_assets.csv", "asset_id"),
    ("fjs_variable_dictionary", "fjs_variable_dictionary.csv", "variable_name"),
    ("fjs_variable_code_options", "fjs_variable_code_options.csv", "variable_name,code_value"),
]

JSON_FIELDS = {"raw_event", "raw_record"}

INT_FIELDS = {
    "fjs_samples": {"year", "month"},
    "fjs_taxa": {"taxon_code"},
    "fjs_sample_taxa": {
        "taxon_code",
        "source_row_number",
        "eggs_count",
        "yolk_sac_larvae_count",
        "post_yolk_sac_larvae_count",
        "young_of_year_count",
        "unidentified_count",
        "older_count",
        "yearling_count",
        "yearling_and_older_count",
        "young_of_year_count_corrected",
        "yearling_count_corrected",
        "older_count_corrected",
        "yearling_and_older_count_corrected",
        "total_length_class_1",
        "total_length_class_2",
        "total_length_class_3",
        "total_length_class_4",
    },
    "fjs_representative_specimens": {"taxon_code"},
    "fjs_assets": {"file_size_bytes", "specimen_number", "source_sequence"},
}

NUMERIC_FIELDS = {
    "fjs_samples": {
        "river_mile",
        "latitude",
        "longitude",
        "wave_height",
        "river_depth",
        "tow_speed",
        "sample_depth_m",
        "volume_water_sampled_cubic_meters",
        "duration_minutes",
        "net_mesh",
        "net_length_opening_width_ratio",
        "flowmeter_start",
        "flowmeter_end",
        "flowmeter_difference",
        "water_temperature_c",
        "dissolved_oxygen_mg_l",
        "ph",
        "conductivity_us_cm",
        "turbidity",
        "water_quality_sample_depth",
    },
    "fjs_sample_taxa": {"division_1_cutoff_mm", "division_2_cutoff_mm"},
}


def key_is_placeholder(value: str) -> bool:
    normalized = value.strip().lower()
    return (
        not normalized
        or normalized in {"paste-your-secret-or-service-role-key-here", "paste-secret-or-service-role-key-here"}
        or (normalized.startswith("paste-") and normalized.endswith("-here"))
    )


def key_is_legacy_jwt(value: str) -> bool:
    return value.count(".") == 2 and value.startswith("eyJ")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--supabase-url", required=True, help="Project URL, e.g. https://xxx.supabase.co")
    parser.add_argument("--import-dir", default=DEFAULT_IMPORT_DIR, help="Folder containing fjs_*.csv import files")
    parser.add_argument(
        "--key-env",
        default=DEFAULT_KEY_ENV,
        help="Environment variable containing a secret/service-role key",
    )
    parser.add_argument("--apply", action="store_true", help="Actually upsert rows. Default is dry-run.")
    parser.add_argument("--chunk-size", type=int, default=500, help="Rows per API request.")
    return parser.parse_args(argv)


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def parse_int(value: str) -> int | None:
    if value == "":
        return None
    return int(float(value))


def parse_number(value: str) -> int | float | None:
    if value == "":
        return None
    number = float(value)
    return int(number) if number.is_integer() else number


def convert_value(table: str, field: str, value: str) -> Any:
    if value == "":
        return None
    if field in JSON_FIELDS:
        return json.loads(value)
    if field in INT_FIELDS.get(table, set()):
        return parse_int(value)
    if field in NUMERIC_FIELDS.get(table, set()):
        return parse_number(value)
    return value


def convert_rows(table: str, rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [
        {field: convert_value(table, field, value) for field, value in row.items()}
        for row in rows
    ]


def chunks(rows: list[dict[str, Any]], size: int) -> list[list[dict[str, Any]]]:
    return [rows[index : index + size] for index in range(0, len(rows), size)]


def upsert_rows(
    supabase_url: str,
    api_key: str,
    table: str,
    conflict_target: str,
    rows: list[dict[str, Any]],
) -> tuple[int, str]:
    query = urllib.parse.urlencode({"on_conflict": conflict_target})
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/{table}?{query}"
    headers = {
        "apikey": api_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    # Legacy JWT keys can also be sent as Bearer tokens. New sb_secret keys
    # should not be sent in Authorization because they are not JWTs.
    if key_is_legacy_jwt(api_key):
        headers["Authorization"] = f"Bearer {api_key}"

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(rows).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, body


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    import_dir = Path(args.import_dir)
    if not import_dir.exists():
        print(f"Import folder not found: {import_dir}", file=sys.stderr)
        return 1

    api_key = os.environ.get(args.key_env, "").strip()
    if args.apply and key_is_placeholder(api_key):
        print(
            f"Missing a real {args.key_env}. Set it in your terminal first; do not commit or paste it into code.",
            file=sys.stderr,
        )
        return 1
    if args.apply and api_key.startswith("sb_publishable_"):
        print(
            "This script needs a backend-only Supabase secret/service-role key. "
            "A publishable key is not enough for private table writes.",
            file=sys.stderr,
        )
        return 1

    print(f"Import folder: {import_dir}")
    if not args.apply:
        print("Dry run only. Add --apply to upsert rows.")

    failed = 0
    for table, csv_name, conflict_target in TABLE_IMPORTS:
        csv_path = import_dir / csv_name
        if not csv_path.exists():
            print(f"SKIP {table}: missing {csv_path}")
            continue

        csv_rows = read_csv_rows(csv_path)
        api_rows = convert_rows(table, csv_rows)
        print(f"{table}: {len(api_rows)} row(s) from {csv_name}")

        if not args.apply or not api_rows:
            continue

        for index, chunk in enumerate(chunks(api_rows, args.chunk_size), start=1):
            status, body = upsert_rows(args.supabase_url, api_key, table, conflict_target, chunk)
            if 200 <= status < 300:
                print(f"  chunk {index}: upserted HTTP {status}")
            else:
                failed += 1
                detail = body
                try:
                    detail = json.dumps(json.loads(body), ensure_ascii=True)
                except json.JSONDecodeError:
                    pass
                print(f"  chunk {index}: failed HTTP {status} {detail}")
                break

    if args.apply:
        print(f"\nTable upload failures: {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
