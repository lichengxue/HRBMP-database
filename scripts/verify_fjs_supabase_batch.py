#!/usr/bin/env python3
"""Read back a published FJS batch's database records and Storage metadata."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from upload_fjs_storage_assets import key_is_legacy_jwt, key_is_placeholder


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def get_json(url: str, headers: dict[str, str]):
    request = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Do not echo arbitrary server bodies or credentials.
        raise ValueError(f"Remote verification request failed: HTTP {error.code}") from error


def fetch_rows(base: str, headers: dict[str, str], table: str, key: str,
               identifiers: list[str], fields: str) -> dict[str, dict]:
    found = {}
    for start in range(0, len(identifiers), 50):
        batch = identifiers[start:start + 50]
        query = urllib.parse.urlencode({"select": fields, key: "in.(" + ",".join(batch) + ")",
                                        "limit": len(batch)})
        rows = get_json(f"{base}/rest/v1/{table}?{query}", headers)
        if not isinstance(rows, list):
            raise ValueError(f"Unexpected response for {table}.")
        found.update({str(row[key]): row for row in rows})
    return found


def verify(base: str, key: str, import_dir: Path) -> dict:
    samples = read_csv(import_dir / "fjs_samples.csv")
    assets = read_csv(import_dir / "fjs_assets.csv")
    if not samples or not assets:
        raise ValueError("The package has no samples or assets to verify.")
    if key_is_placeholder(key) or key.startswith("sb_publishable_"):
        raise ValueError("Enter a private Supabase secret/service-role key.")
    base = base.rstrip("/")
    headers = {"apikey": key, "Accept": "application/json"}
    if key_is_legacy_jwt(key):
        headers["Authorization"] = f"Bearer {key}"
    remote_samples = fetch_rows(base, headers, "fjs_samples", "sample_id",
                               [row["sample_id"] for row in samples], "sample_id")
    missing_samples = [row["sample_id"] for row in samples if row["sample_id"] not in remote_samples]
    if missing_samples:
        raise ValueError(f"{len(missing_samples)} sample records were not found in Supabase.")
    print(f"Verified sample records: {len(samples)}", flush=True)
    remote_assets = fetch_rows(base, headers, "fjs_assets", "asset_id",
        [row["asset_id"] for row in assets], "asset_id,storage_bucket,storage_object_path,sha256")
    for row in assets:
        remote = remote_assets.get(row["asset_id"])
        if not remote or any(str(remote.get(field) or "") != row[field]
                             for field in ("storage_bucket", "storage_object_path", "sha256")):
            raise ValueError(f"Asset record missing or changed: {row['storage_object_path']}")
    print(f"Verified asset records and recorded checksums: {len(assets)}", flush=True)
    for index, row in enumerate(assets, 1):
        bucket = urllib.parse.quote(row["storage_bucket"], safe="")
        object_path = "/".join(urllib.parse.quote(part, safe="") for part in row["storage_object_path"].split("/"))
        info = get_json(f"{base}/storage/v1/object/info/authenticated/{bucket}/{object_path}", headers)
        size = info.get("size")
        if size is None:
            size = info.get("metadata", {}).get("size")
        if size is None or int(size) != int(row["file_size_bytes"]):
            raise ValueError(f"Storage file size missing or different: {row['storage_object_path']}")
        print(f"[{index}/{len(assets)}] Verified Storage file: {row['storage_object_path']}", flush=True)
    return {"ok": True, "samples": len(samples), "asset_records": len(assets),
            "storage_objects": len(assets),
            "checks": "Sample IDs, asset paths and database checksums, Storage existence and sizes. File contents are not downloaded."}


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--supabase-url", required=True)
    parser.add_argument("--import-dir", required=True, type=Path)
    parser.add_argument("--key-env", default="SUPABASE_SERVICE_ROLE_KEY")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args(argv)
    try:
        import_dir = Path(args.import_dir)
        import_hashes = {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                         for path in import_dir.glob("fjs_*.csv")}
        report = verify(args.supabase_url, os.environ.get(args.key_env, "").strip(), args.import_dir)
        if import_hashes != {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                             for path in import_dir.glob("fjs_*.csv")}:
            raise ValueError("The package changed during verification; verify again.")
        report["import_sha256"] = import_hashes
        report["supabase_url"] = args.supabase_url.rstrip("/")
    except (OSError, ValueError, KeyError, urllib.error.URLError) as error:
        if args.report:
            args.report.write_text(json.dumps({"ok": False, "error": str(error),
                "verified_at": datetime.now(timezone.utc).isoformat()}, indent=2), encoding="utf-8")
        print(f"Verification failed: {error}", file=sys.stderr)
        return 1
    report["verified_at"] = datetime.now(timezone.utc).isoformat()
    if args.report:
        args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Published batch verification complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
