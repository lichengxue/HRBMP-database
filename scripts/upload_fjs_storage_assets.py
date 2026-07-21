#!/usr/bin/env python3
"""Upload FJS archive files listed in fjs_assets.csv to Supabase Storage.

This script does not store credentials. Pass the Supabase URL as an argument and
put a Supabase secret/service-role key in an environment variable for the
current terminal session.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


DEFAULT_MANIFEST = "data/processed/FJS_2017_sample/supabase_import/fjs_assets.csv"
DEFAULT_BUCKET = "fjs-archive"
DEFAULT_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY"


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
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST, help="Path to generated fjs_assets.csv")
    parser.add_argument("--bucket", default=DEFAULT_BUCKET, help="Supabase Storage bucket name")
    parser.add_argument(
        "--key-env",
        default=DEFAULT_KEY_ENV,
        help="Environment variable containing a secret/service-role key",
    )
    parser.add_argument("--apply", action="store_true", help="Actually upload files. Default is dry-run.")
    parser.add_argument("--upsert", action="store_true", help="Overwrite existing objects at the same path.")
    parser.add_argument("--limit", type=int, default=0, help="Upload only the first N manifest rows.")
    parser.add_argument("--sleep", type=float, default=0.0, help="Seconds to wait between uploads.")
    return parser.parse_args(argv)


def read_manifest(path: Path, bucket: str) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    return [row for row in rows if row.get("storage_bucket", bucket) == bucket]


def upload_file(
    supabase_url: str,
    api_key: str,
    bucket: str,
    object_path: str,
    local_path: Path,
    content_type: str,
    upsert: bool,
) -> tuple[int, str]:
    encoded_path = "/".join(urllib.parse.quote(part, safe="") for part in object_path.split("/"))
    endpoint = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{encoded_path}"

    headers = {
        "apikey": api_key,
        "Content-Type": content_type or "application/octet-stream",
    }
    # Legacy JWT keys can also be sent as Bearer tokens. New sb_secret keys
    # should not be sent in Authorization because they are not JWTs.
    if key_is_legacy_jwt(api_key):
        headers["Authorization"] = f"Bearer {api_key}"
    if upsert:
        headers["x-upsert"] = "true"

    request = urllib.request.Request(
        endpoint,
        data=local_path.read_bytes(),
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
    repo_root = Path.cwd()
    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        print(f"Manifest not found: {manifest_path}", file=sys.stderr)
        return 1

    rows = read_manifest(manifest_path, args.bucket)
    if args.limit:
        rows = rows[: args.limit]

    print(f"Manifest: {manifest_path}")
    print(f"Bucket: {args.bucket}")
    print(f"Rows: {len(rows)}")

    if not args.apply:
        print("\nDry run only. Add --apply to upload.\n")

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
            "A publishable key is for browser/API reads and cannot safely upload Storage files here.",
            file=sys.stderr,
        )
        return 1

    success = 0
    failed = 0
    for index, row in enumerate(rows, start=1):
        local_source = row["local_source_path"]
        local_path = repo_root / local_source
        object_path = row["storage_object_path"]
        content_type = row.get("mime_type", "application/octet-stream")

        if not local_path.exists():
            failed += 1
            print(f"[{index}/{len(rows)}] MISSING {local_source}")
            continue

        size_mb = local_path.stat().st_size / (1024 * 1024)
        print(f"[{index}/{len(rows)}] {local_source} -> {object_path} ({size_mb:.2f} MB)")

        if not args.apply:
            continue

        status, body = upload_file(
            args.supabase_url,
            api_key,
            args.bucket,
            object_path,
            local_path,
            content_type,
            args.upsert,
        )
        if 200 <= status < 300:
            success += 1
            print(f"  uploaded: HTTP {status}")
        else:
            failed += 1
            detail = body
            try:
                detail = json.dumps(json.loads(body), ensure_ascii=True)
            except json.JSONDecodeError:
                pass
            print(f"  failed: HTTP {status} {detail}")

        if args.sleep:
            time.sleep(args.sleep)

    if args.apply:
        print(f"\nUploaded: {success}; failed: {failed}")
        return 0 if failed == 0 else 1

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
