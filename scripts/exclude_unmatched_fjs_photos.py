"""Keep unmatched representative photos local when preparing an app upload."""
import argparse
import csv
import os
from collections import defaultdict
from pathlib import Path
from tempfile import NamedTemporaryFile

from build_fjs_archive_manifest import build_qc_lines, classify_asset
from extract_fjs_local_subset import protect_local_path


def read(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames, list(reader)


def write(path, fields, rows):
    with NamedTemporaryFile(mode="w", encoding="utf-8", newline="", dir=path.parent,
                            delete=False) as handle:
        temporary = Path(handle.name)
        try:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
        except BaseException:
            handle.close()
            temporary.unlink(missing_ok=True)
            raise
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def exclude_unmatched(root):
    root = protect_local_path(root)
    manifest = root / "supabase_import/fjs_assets.csv"
    fields, assets = read(manifest)
    excluded = [row for row in assets if row["asset_kind"] == "other"
                and row.get("notes", "").startswith("Possible representative image for taxon ")
                and "no matching processed sample-taxon row" in row["notes"]]
    if not excluded:
        return 0
    record = root / "excluded_local_photos.csv"
    if record.exists():
        raise ValueError("An exclusion record already exists; review it before preparing again.")
    excluded_ids = {row["asset_id"] for row in excluded}
    kept = [row for row in assets if row["asset_id"] not in excluded_ids]
    ready_path = root / "storage_upload_ready/upload_ready_manifest.csv"
    ready_fields, ready = read(ready_path)
    if {r["asset_id"] for r in ready} != {r["asset_id"] for r in assets}:
        raise ValueError("Upload manifests disagree; exclusion was not applied.")
    for row in excluded:
        if not Path(row["local_source_path"]).is_file():
            raise ValueError("An excluded photo is missing locally.")
    record_fields = ["asset_id", "sample_id", "original_file_name", "local_source_path", "sha256", "reason"]
    write(record, record_fields, [{k: (row[k] if k != "reason" else
          "No matching survey sample-taxon record; retained locally, excluded from upload.")
          for k in record_fields} for row in excluded])
    write(manifest, fields, kept)
    write(ready_path, ready_fields, [r for r in ready if r["asset_id"] not in excluded_ids])
    _, metadata = read(root / "source_metadata/processed_counts_by_sample_taxon.csv")
    views = defaultdict(list)
    for row in kept:
        if row.get("representative_id"):
            taxon = int(classify_asset(Path(row["original_file_name"]), row["sample_id"])["taxon_code"])
            views[(row["sample_id"], taxon)].append(row["original_file_name"])
    qc = build_qc_lines(metadata, kept, views)
    qc = [line.replace("Taxa with positive counts:", "Sample-taxon groups with positive counts:") for line in qc]
    qc += ["", "Photos retained locally and excluded from upload (informational):"]
    qc += ["  " + row["original_file_name"] for row in excluded]
    (root / "supabase_import/asset_manifest_qc.txt").write_text("\n".join(qc) + "\n", encoding="utf-8")
    return len(excluded)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package-root", required=True, type=Path)
    args = parser.parse_args()
    print(f"Unmatched photos retained locally and excluded from upload: {exclude_unmatched(args.package_root)}")
