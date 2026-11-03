"""Save a local, credential-free report from a successful batch verification."""
import argparse
import csv
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import uuid

from extract_fjs_local_subset import protect_local_path
from upload_fjs_supabase_tables import TABLE_IMPORTS


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_report(root, url, app_version, operation="upload_and_verify", allow_legacy=False):
    root = protect_local_path(root)
    if not re.fullmatch(r"https?://[A-Za-z0-9.-]+(?::[0-9]+)?/?", url):
        raise ValueError("Use a project URL without credentials, query parameters, or paths.")
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", app_version):
        raise ValueError("Invalid reporting app version.")
    imports = root / "supabase_import"
    verification_path = root / "supabase_verification.json"
    verification = json.loads(verification_path.read_text(encoding="utf-8"))
    if verification.get("ok") is not True:
        raise ValueError("A successful verification is required for a completion report.")
    tables = {table: read_csv(imports / name) for table, name, _ in TABLE_IMPORTS}
    samples, assets = tables["fjs_samples"], tables["fjs_assets"]
    if (verification.get("samples") != len(samples) or
            verification.get("asset_records") != len(assets) or
            verification.get("storage_objects") != len(assets)):
        raise ValueError("Verification counts do not match this package.")
    hashes = {name: checksum(imports / name) for _, name, _ in TABLE_IMPORTS}
    recorded_hashes = verification.get("import_sha256")
    if recorded_hashes is None and not allow_legacy:
        raise ValueError("Saved verification predates package fingerprints; verify again before reporting.")
    if recorded_hashes is not None and recorded_hashes != hashes:
        raise ValueError("The package changed after verification; verify again before reporting.")
    if verification.get("supabase_url", url).rstrip("/") != url.rstrip("/"):
        raise ValueError("The verified destination differs from the requested report destination.")
    excluded_path = root / "excluded_local_photos.csv"
    exclusions = read_csv(excluded_path) if excluded_path.exists() else []
    excluded = [{key: row.get(key, "") for key in
                 ("sample_id", "original_file_name", "local_source_path", "sha256", "reason")}
                for row in exclusions]
    now = datetime.now(timezone.utc)
    batches = tables["fjs_import_batches"]
    qc_path = imports / "asset_manifest_qc.txt"
    report = {
        "report_schema_version": 1, "status": "verification_succeeded",
        "report_created_at_utc": now.isoformat(),
        "verified_at_utc": verification.get("verified_at"),
        "reporting_app_version": app_version, "operation": operation,
        "evidence": "Saved verification; report creation does not perform a new remote check.",
        "legacy_verification": recorded_hashes is None,
        "batch_id": batches[0]["batch_id"], "batch_name": batches[0]["batch_name"],
        "supabase_url": url.rstrip("/"), "package_folder": str(root),
        "sample_count": len(samples), "taxon_count": len(tables["fjs_taxa"]),
        "survey_row_count": len(tables["fjs_sample_taxa"]),
        "verified_file_count": len(assets),
        "total_file_bytes": sum(int(row["file_size_bytes"]) for row in assets),
        "prepared_table_row_counts": {table: len(rows) for table, rows in tables.items()},
        "excluded_photo_count": len(excluded), "excluded_photos": excluded,
        "verification_checks": verification.get("checks", ""),
        "verification_report": str(verification_path),
        "verification_report_sha256": checksum(verification_path),
        "import_sha256_at_report_creation": hashes,
        "qc_report": str(qc_path), "qc_sha256": checksum(qc_path) if qc_path.exists() else None,
        "files": [{key: row.get(key, "") for key in
                   ("asset_id", "sample_id", "original_file_name", "storage_bucket",
                    "storage_object_path", "file_size_bytes", "sha256")} for row in assets],
    }
    lines = ["FJS upload completion report", "============================",
             "Status: verification succeeded", f"Batch: {report['batch_name']}",
             f"Batch ID: {report['batch_id']}", f"Verification time (UTC): {report['verified_at_utc']}",
             f"Report created (UTC): {report['report_created_at_utc']}",
             f"App version generating this report: v{app_version}", f"Operation: {operation}",
             f"Destination: {url}", f"Local package: {root}", "",
             f"Samples verified: {len(samples)}", f"Files verified: {len(assets)}",
             f"Distinct taxa: {report['taxon_count']}", f"Survey sample-taxon rows: {report['survey_row_count']}",
             f"File bytes: {report['total_file_bytes']}", "", "Prepared database table row counts:"]
    lines += [f"  {table}: {count}" for table, count in report["prepared_table_row_counts"].items()]
    lines += ["", f"Photos retained locally and excluded: {len(excluded)}"]
    lines += [f"  {row['original_file_name']}: {row['reason']}" for row in excluded]
    lines += ["", "Verification checks:", report["verification_checks"],
              "Storage contents were not downloaded again; the remote check covers existence and size.",
              report["evidence"], "The reported state is as of the verification time, not a guarantee of future availability."]
    if report["legacy_verification"]:
        lines += ["Historical report: original verification has no package fingerprints or app version.",
                  "Import hashes in the JSON describe the package at report creation."]
    lines += ["", f"Full QC report: {qc_path}", f"Verification evidence: {verification_path}",
              "The companion JSON contains the file inventory and checksums. No API key is recorded."]
    reports = root / "reports"
    reports.mkdir(exist_ok=True)
    stem = "upload_" + now.strftime("%Y%m%dT%H%M%S%fZ_") + uuid.uuid4().hex[:8]
    json_path, text_path = reports / (stem + ".json"), reports / (stem + ".txt")
    # Exclusive filenames preserve previous reports, including retry history.
    with json_path.open("x", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=True, indent=2)
    with text_path.open("x", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")
    return text_path, json_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package-root", type=Path, required=True)
    parser.add_argument("--supabase-url", required=True)
    parser.add_argument("--app-version", required=True)
    parser.add_argument("--operation", default="upload_and_verify",
                        choices=("upload_and_verify", "verify_existing_package", "historical_saved_verification"))
    parser.add_argument("--allow-legacy-verification", action="store_true")
    args = parser.parse_args()
    for path in write_report(args.package_root, args.supabase_url, args.app_version,
                             args.operation, args.allow_legacy_verification):
        print("Saved upload report:", path)
