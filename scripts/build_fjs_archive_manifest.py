#!/usr/bin/env python3
"""Build normalized Supabase import files for a Fall Juvenile Survey archive.

The script reads a local FJS source bundle containing:
- a processed metadata CSV,
- an Excel data dictionary, and
- per-sample folders with JPG/PDF archive files.

It writes small CSV files that match the Supabase migration in
supabase/migrations/20260721130000_create_fjs_archive.sql.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import mimetypes
import re
import sys
import uuid
from collections import OrderedDict, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any


UUID_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, "https://hrbmp.local/fjs-archive")
DEFAULT_BUCKET = "fjs-archive"
DEFAULT_PROCESSED_CSV_NAME = "processed_counts_by_sample_taxon.csv"
ORIENTATION_NAMES = {
    "01": "left_side",
    "02": "right_side",
    "03": "top_down",
    "04": "bottom_up",
}


SAMPLE_FIELDS = [
    "sample_id",
    "program",
    "task_code",
    "sample_number",
    "sample_date",
    "sample_time",
    "year",
    "month",
    "site_code",
    "river_mile",
    "river_region_number",
    "river_region_name",
    "latitude",
    "longitude",
    "gear_code",
    "vessel_code",
    "wave_height",
    "tide_stage",
    "river_run",
    "river_depth",
    "tow_speed",
    "sample_depth_m",
    "volume_water_sampled_cubic_meters",
    "duration_minutes",
    "net_mesh",
    "net_length_opening_width_ratio",
    "flowmeter_number",
    "flowmeter_start",
    "flowmeter_end",
    "flowmeter_difference",
    "water_temperature_c",
    "dissolved_oxygen_mg_l",
    "ph",
    "conductivity_us_cm",
    "turbidity",
    "water_quality_sample_depth",
    "day_night",
    "source_csv_name",
    "raw_event",
    "access_level",
]

TAXA_FIELDS = [
    "taxon_code",
    "common_name",
    "scientific_name",
    "taxonomic_group",
    "notes",
]

SAMPLE_TAXA_FIELDS = [
    "sample_taxon_id",
    "sample_id",
    "taxon_code",
    "source_record_id",
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
    "division_1_cutoff_mm",
    "division_2_cutoff_mm",
    "catch_code",
    "use_code",
    "sample_narrative",
    "raw_record",
    "access_level",
]

REPRESENTATIVE_FIELDS = [
    "representative_id",
    "sample_taxon_id",
    "sample_id",
    "taxon_code",
    "representative_label",
    "notes",
]

ASSET_FIELDS = [
    "asset_id",
    "sample_id",
    "sample_taxon_id",
    "representative_id",
    "asset_kind",
    "storage_bucket",
    "storage_object_path",
    "original_file_name",
    "local_source_path",
    "mime_type",
    "file_size_bytes",
    "sha256",
    "life_stage_code",
    "specimen_number",
    "orientation_code",
    "orientation_name",
    "image_view",
    "source_sequence",
    "sheet_code",
    "access_level",
    "notes",
]

VARIABLE_FIELDS = [
    "variable_name",
    "full_name",
    "fjs_level",
    "unit",
    "description",
    "source_file_name",
]

CODE_OPTION_FIELDS = [
    "variable_name",
    "code_value",
    "code_description",
    "source_file_name",
]

IMPORT_BATCH_FIELDS = [
    "batch_id",
    "batch_name",
    "source_root",
    "processed_csv_file",
    "data_dictionary_file",
    "notes",
]


def stable_uuid(*parts: Any) -> str:
    key = "/".join("" if part is None else str(part) for part in parts)
    return str(uuid.uuid5(UUID_NAMESPACE, key))


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "none", "null"}:
        return ""
    return text


def parse_int(value: Any) -> int | None:
    text = clean(value)
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def parse_number(value: Any) -> str:
    text = clean(value)
    if not text:
        return ""
    try:
        number = float(text)
    except ValueError:
        return text
    if math.isnan(number):
        return ""
    if number.is_integer():
        return str(int(number))
    return format(number, ".15g")


def parse_text_code(value: Any) -> str:
    text = clean(value)
    if not text:
        return ""
    number = parse_int(text)
    if number is not None:
        return str(number)
    return text


def parse_date(value: Any) -> str:
    text = clean(value)
    if not text:
        return ""
    for fmt in ("%m/%d/%y", "%m/%d/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass
    raise ValueError(f"Unsupported date format: {text}")


def parse_time(value: Any) -> str:
    text = clean(value)
    if not text:
        return ""
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p"):
        try:
            return datetime.strptime(text, fmt).time().isoformat()
        except ValueError:
            pass
    raise ValueError(f"Unsupported time format: {text}")


def compact_json(row: dict[str, Any]) -> str:
    cleaned = {key: clean(value) for key, value in row.items() if clean(value)}
    return json.dumps(cleaned, sort_keys=True, separators=(",", ":"))


def relative_path(path: Path, root: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve())).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sample_id_from_row(row: dict[str, Any]) -> str:
    task_code = parse_int(row.get("TASK.CODE"))
    sample_number = parse_int(row.get("SAMPLE.NUMBER"))
    sample_date = parse_date(row.get("DATE") or row.get("SAMPLE.DATE"))
    if task_code is None or sample_number is None or not sample_date:
        raise ValueError(f"Cannot build sample_id from row: {row}")
    return f"{task_code}_{sample_date.replace('-', '')}_{sample_number}"


def row_total_count(row: dict[str, Any]) -> int:
    corrected_fields = [
        "NUMBER.OF.YOUNG.OF.YEAR_corrected",
        "NUMBER.OF.YEARLING_corrected",
        "NUMBER.OF.OLDER_corrected",
        "NUMBER.OF.YEARLING.AND.OLDER_corrected",
    ]
    raw_fields = [
        "NUMBER.OF.EGGS",
        "NUMBER.OF.YOLK.SAC.LARVAE",
        "NUMBER.OF.POST.YOLK.SAC.LARVAE",
        "NUMBER.OF.YOUNG.OF.YEAR",
        "NUMBER.OF.UNIDENTIFIED",
        "NUMBER.OF.OLDER",
        "NUMBER.OF.YEARLING",
        "NUMBER.OF.YEARLING.AND.OLDER",
    ]
    total = sum(parse_int(row.get(field)) or 0 for field in corrected_fields)
    if total:
        return total
    return sum(parse_int(row.get(field)) or 0 for field in raw_fields)


def load_processed_csv(processed_csv: Path) -> list[dict[str, str]]:
    with processed_csv.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def find_processed_csv(source_root: Path) -> Path | None:
    preferred = source_root / DEFAULT_PROCESSED_CSV_NAME
    if preferred.exists():
        return preferred

    patterns = [
        "*counts_by_sample_taxon*.csv",
        "*processed*metadata*.csv",
        "*processed*.csv",
        "*.csv",
    ]
    for pattern in patterns:
        matches = sorted(source_root.glob(pattern))
        if matches:
            return matches[0]
    return None


def build_sample_rows(
    rows: list[dict[str, Any]],
    processed_csv: Path,
    access_level: str,
) -> OrderedDict[str, dict[str, str]]:
    samples: OrderedDict[str, dict[str, str]] = OrderedDict()
    for row in rows:
        sample_id = sample_id_from_row(row)
        if sample_id in samples:
            continue
        sample_date = parse_date(row.get("DATE") or row.get("SAMPLE.DATE"))
        year = parse_int(row.get("YEAR.OF.DATA.COLLECTION"))
        month = sample_date[5:7] if sample_date else ""
        samples[sample_id] = {
            "sample_id": sample_id,
            "program": clean(row.get("survey")) or "FJS",
            "task_code": parse_text_code(row.get("TASK.CODE")),
            "sample_number": parse_text_code(row.get("SAMPLE.NUMBER")),
            "sample_date": sample_date,
            "sample_time": parse_time(row.get("TIME")),
            "year": str(year or ""),
            "month": str(int(month)) if month else "",
            "site_code": parse_text_code(row.get("SITE")),
            "river_mile": parse_number(row.get("RIVER.MILE")),
            "river_region_number": parse_text_code(row.get("river_region_number")),
            "river_region_name": clean(row.get("river_region_name")),
            "latitude": parse_number(row.get("lat_dec_deg")),
            "longitude": parse_number(row.get("lon_dec_deg")),
            "gear_code": parse_text_code(row.get("GEAR.CODE")),
            "vessel_code": parse_text_code(row.get("VESSEL.CODE")),
            "wave_height": parse_number(row.get("WAVE.HEIGHT")),
            "tide_stage": parse_text_code(row.get("TIDE.STAGE")),
            "river_run": parse_text_code(row.get("RIVER.RUN")),
            "river_depth": parse_number(row.get("RIVER.DEPTH")),
            "tow_speed": parse_number(row.get("TOW.SPEED")),
            "sample_depth_m": parse_number(row.get("SAMPLE.DEPTH.m")),
            "volume_water_sampled_cubic_meters": parse_number(
                row.get("VOLUME.OF.WATER.SAMPLED.IN.CUBIC.METERS")
            ),
            "duration_minutes": parse_number(row.get("DURATION")),
            "net_mesh": parse_number(row.get("NET.MESH")),
            "net_length_opening_width_ratio": parse_number(
                row.get("NET.LENGTH.OPENING.WIDTH.RATIO")
            ),
            "flowmeter_number": parse_text_code(row.get("FLOWMETER.NUMBER")),
            "flowmeter_start": parse_number(row.get("FLOWMETER.START")),
            "flowmeter_end": parse_number(row.get("FLOWMETER.END")),
            "flowmeter_difference": parse_number(row.get("FLOWMETER.DIFFERENCE")),
            "water_temperature_c": parse_number(row.get("WATER.TEMPERATURE")),
            "dissolved_oxygen_mg_l": parse_number(row.get("DISSOLVED.OXYGEN")),
            "ph": parse_number(row.get("PH")),
            "conductivity_us_cm": parse_number(row.get("CONDUCTIVITY")),
            "turbidity": parse_number(row.get("TURBIDITY")),
            "water_quality_sample_depth": parse_number(
                row.get("WATER.QUALITY.SAMPLE.DEPTH")
            ),
            "day_night": clean(row.get("day_night")),
            "source_csv_name": processed_csv.name,
            "raw_event": compact_json(row),
            "access_level": access_level,
        }
    return samples


def build_taxa_and_count_rows(
    rows: list[dict[str, Any]],
    access_level: str,
) -> tuple[OrderedDict[int, dict[str, str]], list[dict[str, str]], dict[tuple[str, int], str]]:
    taxa: OrderedDict[int, dict[str, str]] = OrderedDict()
    sample_taxa_rows: list[dict[str, str]] = []
    sample_taxa_ids: dict[tuple[str, int], str] = {}

    for row_number, row in enumerate(rows, start=2):
        sample_id = sample_id_from_row(row)
        taxon_code = parse_int(row.get("TAXON.CODE"))
        if taxon_code is None:
            continue

        common_name = clean(row.get("sp.name")).upper()
        if taxon_code not in taxa:
            taxa[taxon_code] = {
                "taxon_code": str(taxon_code),
                "common_name": common_name or f"TAXON {taxon_code}",
                "scientific_name": "",
                "taxonomic_group": "fish",
                "notes": "",
            }

        sample_taxon_id = stable_uuid("sample_taxon", sample_id, taxon_code)
        sample_taxa_ids[(sample_id, taxon_code)] = sample_taxon_id
        sample_taxa_rows.append(
            {
                "sample_taxon_id": sample_taxon_id,
                "sample_id": sample_id,
                "taxon_code": str(taxon_code),
                "source_record_id": clean(row.get("Unnamed: 0")),
                "source_row_number": str(row_number),
                "eggs_count": parse_number(row.get("NUMBER.OF.EGGS")),
                "yolk_sac_larvae_count": parse_number(row.get("NUMBER.OF.YOLK.SAC.LARVAE")),
                "post_yolk_sac_larvae_count": parse_number(
                    row.get("NUMBER.OF.POST.YOLK.SAC.LARVAE")
                ),
                "young_of_year_count": parse_number(row.get("NUMBER.OF.YOUNG.OF.YEAR")),
                "unidentified_count": parse_number(row.get("NUMBER.OF.UNIDENTIFIED")),
                "older_count": parse_number(row.get("NUMBER.OF.OLDER")),
                "yearling_count": parse_number(row.get("NUMBER.OF.YEARLING")),
                "yearling_and_older_count": parse_number(
                    row.get("NUMBER.OF.YEARLING.AND.OLDER")
                ),
                "young_of_year_count_corrected": parse_number(
                    row.get("NUMBER.OF.YOUNG.OF.YEAR_corrected")
                ),
                "yearling_count_corrected": parse_number(
                    row.get("NUMBER.OF.YEARLING_corrected")
                ),
                "older_count_corrected": parse_number(row.get("NUMBER.OF.OLDER_corrected")),
                "yearling_and_older_count_corrected": parse_number(
                    row.get("NUMBER.OF.YEARLING.AND.OLDER_corrected")
                ),
                "total_length_class_1": parse_number(
                    row.get("TOTAL.COUNT.IN.LENGTH.CLASS.1")
                ),
                "total_length_class_2": parse_number(
                    row.get("TOTAL.COUNT.IN.LENGTH.CLASS.2")
                ),
                "total_length_class_3": parse_number(
                    row.get("TOTAL.COUNT.IN.LENGTH.CLASS.3")
                ),
                "total_length_class_4": parse_number(
                    row.get("TOTAL.COUNT.IN.LENGTH.CLASS.4")
                ),
                "division_1_cutoff_mm": parse_number(row.get("DIVISION.1")),
                "division_2_cutoff_mm": parse_number(row.get("DIVISION.2")),
                "catch_code": parse_text_code(row.get("CATCH_CD")),
                "use_code": parse_text_code(row.get("USE.CODE")),
                "sample_narrative": clean(row.get("SAMPLE.NARRATIVE")),
                "raw_record": compact_json(row),
                "access_level": access_level,
            }
        )

    return taxa, sample_taxa_rows, sample_taxa_ids


def classify_asset(path: Path, sample_id: str) -> dict[str, str]:
    name = path.name
    sample_prefix = re.escape(sample_id)

    representative = re.match(
        rf"^{sample_prefix}_J(?P<jar>\d+)_(?P<taxon>\d{{3}})_(?P<life_stage>\d{{2}})_(?P<specimen>\d{{2}})_(?P<orientation>\d{{2}})\.jpe?g$",
        name,
        flags=re.IGNORECASE,
    )
    if representative:
        orientation_code = representative.group("orientation")
        orientation_name = ORIENTATION_NAMES.get(orientation_code, "")
        return {
            "asset_kind": "representative_species_image",
            "taxon_code": str(int(representative.group("taxon"))),
            "life_stage_code": representative.group("life_stage"),
            "specimen_number": str(int(representative.group("specimen"))),
            "orientation_code": orientation_code,
            "orientation_name": orientation_name,
            "image_view": orientation_name or orientation_code,
            "source_sequence": str(int(orientation_code)),
            "sheet_code": f"J{representative.group('jar')}",
            "notes": "",
        }

    jar_label = re.match(rf"^{sample_prefix}_J(?P<jar>\d+)\.jpe?g$", name, flags=re.IGNORECASE)
    if jar_label:
        return {
            "asset_kind": "jar_label_image",
            "taxon_code": "",
            "life_stage_code": "",
            "specimen_number": "",
            "orientation_code": "",
            "orientation_name": "",
            "image_view": "",
            "source_sequence": "",
            "sheet_code": f"J{jar_label.group('jar')}",
            "notes": "Sample jar label image.",
        }

    field_sheet = re.match(rf"^{sample_prefix}_SC(?P<seq>\d+)\.pdf$", name, flags=re.IGNORECASE)
    if field_sheet:
        return {
            "asset_kind": "field_sheet_pdf",
            "taxon_code": "",
            "life_stage_code": "",
            "specimen_number": "",
            "orientation_code": "",
            "orientation_name": "",
            "image_view": "",
            "source_sequence": str(int(field_sheet.group("seq"))),
            "sheet_code": f"SC{field_sheet.group('seq')}",
            "notes": "Field/sample collection sheet PDF. Verify SC naming convention.",
        }

    lab_sheet = re.match(rf"^{sample_prefix}_LW(?P<seq>\d+)\.pdf$", name, flags=re.IGNORECASE)
    if lab_sheet:
        return {
            "asset_kind": "lab_sheet_pdf",
            "taxon_code": "",
            "life_stage_code": "",
            "specimen_number": "",
            "orientation_code": "",
            "orientation_name": "",
            "image_view": "",
            "source_sequence": str(int(lab_sheet.group("seq"))),
            "sheet_code": f"LW{lab_sheet.group('seq')}",
            "notes": "Lab worksheet PDF. Verify LW naming convention.",
        }

    return {
        "asset_kind": "other",
        "taxon_code": "",
        "life_stage_code": "",
        "specimen_number": "",
        "orientation_code": "",
        "orientation_name": "",
        "image_view": "",
        "source_sequence": "",
        "sheet_code": "",
        "notes": "Filename did not match the expected FJS archive pattern.",
    }


def build_asset_rows(
    source_root: Path,
    repo_root: Path,
    sample_taxa_ids: dict[tuple[str, int], str],
    bucket: str,
    access_level: str,
) -> tuple[list[dict[str, str]], list[dict[str, str]], dict[tuple[str, int], list[str]]]:
    assets: list[dict[str, str]] = []
    representatives: OrderedDict[tuple[str, int], dict[str, str]] = OrderedDict()
    representative_files: dict[tuple[str, int], list[str]] = defaultdict(list)

    sample_dir_re = re.compile(r"^\d+_\d{8}_\d+$")
    for path in sorted(source_root.rglob("*")):
        if not path.is_file() or path.parent == source_root:
            continue
        if path.suffix.lower() not in {".jpg", ".jpeg", ".pdf"}:
            continue

        sample_id = path.parent.name
        if not sample_dir_re.match(sample_id):
            continue

        classification = classify_asset(path, sample_id)
        asset_kind = classification["asset_kind"]
        taxon_code = parse_int(classification["taxon_code"])
        sample_taxon_id = ""
        representative_id = ""
        notes = classification["notes"]

        if asset_kind == "representative_species_image":
            if taxon_code is None:
                asset_kind = "other"
                notes = "Representative filename could not be parsed for taxon code."
            else:
                sample_taxon_id = sample_taxa_ids.get((sample_id, taxon_code), "")
                if sample_taxon_id:
                    representative_id = stable_uuid("representative", sample_id, taxon_code)
                    key = (sample_id, taxon_code)
                    representative_files[key].append(path.name)
                    representatives.setdefault(
                        key,
                        {
                            "representative_id": representative_id,
                            "sample_taxon_id": sample_taxon_id,
                            "sample_id": sample_id,
                            "taxon_code": str(taxon_code),
                            "representative_label": f"{sample_id}_{taxon_code:03d}",
                            "notes": "One representative specimen for this sample and taxon.",
                        },
                    )
                else:
                    asset_kind = "other"
                    notes = (
                        f"Possible representative image for taxon {taxon_code}, "
                        "but no matching processed sample-taxon row was found."
                    )

        storage_object_path = f"samples/{sample_id}/{asset_kind}/{path.name}"
        mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        assets.append(
            {
                "asset_id": stable_uuid("asset", bucket, storage_object_path),
                "sample_id": sample_id,
                "sample_taxon_id": sample_taxon_id,
                "representative_id": representative_id,
                "asset_kind": asset_kind,
                "storage_bucket": bucket,
                "storage_object_path": storage_object_path,
                "original_file_name": path.name,
                "local_source_path": relative_path(path, repo_root),
                "mime_type": mime_type,
                "file_size_bytes": str(path.stat().st_size),
                "sha256": sha256_file(path),
                "life_stage_code": classification["life_stage_code"],
                "specimen_number": classification["specimen_number"],
                "orientation_code": classification["orientation_code"],
                "orientation_name": classification["orientation_name"],
                "image_view": classification["image_view"],
                "source_sequence": classification["source_sequence"],
                "sheet_code": classification["sheet_code"],
                "access_level": access_level,
                "notes": notes,
            }
        )

    return assets, list(representatives.values()), representative_files


def load_data_dictionary(data_dictionary: Path) -> tuple[list[dict[str, str]], list[dict[str, str]], list[str]]:
    warnings: list[str] = []
    if not data_dictionary.exists():
        return [], [], [f"Data dictionary not found: {data_dictionary}"]

    try:
        import pandas as pd  # type: ignore
    except ImportError:
        return [], [], ["pandas is not installed; skipped Excel data dictionary export."]

    dataframe = pd.read_excel(data_dictionary)
    dataframe.columns = [str(column).strip() for column in dataframe.columns]

    variables: OrderedDict[str, dict[str, str]] = OrderedDict()
    code_options: list[dict[str, str]] = []
    current_variable = ""

    for _, row in dataframe.iterrows():
        variable_name = clean(row.get("var_names"))
        if variable_name:
            current_variable = variable_name
            variables[current_variable] = {
                "variable_name": current_variable,
                "full_name": clean(row.get("FULL NAME")),
                "fjs_level": clean(row.get("LEVEL")),
                "unit": clean(row.get("UNIT")),
                "description": clean(row.get("description")),
                "source_file_name": data_dictionary.name,
            }

        code_value = clean(row.get("code"))
        if current_variable and code_value:
            code_number = parse_number(code_value)
            code_options.append(
                {
                    "variable_name": current_variable,
                    "code_value": code_number or code_value,
                    "code_description": clean(row.get("code description")),
                    "source_file_name": data_dictionary.name,
                }
            )

    return list(variables.values()), code_options, warnings


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_readme(output_dir: Path, bucket: str) -> None:
    text = f"""# FJS Supabase Import Files

Generated by `scripts/build_fjs_archive_manifest.py`.

Import order:

1. `fjs_import_batches.csv`
2. `fjs_samples.csv`
3. `fjs_taxa.csv`
4. `fjs_sample_taxa.csv`
5. `fjs_representative_specimens.csv`
6. `fjs_assets.csv`
7. `fjs_variable_dictionary.csv`
8. `fjs_variable_code_options.csv`

Upload the local files listed in `fjs_assets.csv` to Supabase Storage bucket
`{bucket}` using the matching `storage_object_path` values.
"""
    (output_dir / "README.md").write_text(text, encoding="utf-8")


def build_qc_lines(
    rows: list[dict[str, Any]],
    assets: list[dict[str, str]],
    representative_files: dict[tuple[str, int], list[str]],
) -> list[str]:
    lines: list[str] = []
    expected_taxa: dict[tuple[str, int], int] = {}
    species_names: dict[tuple[str, int], str] = {}
    samples = sorted({sample_id_from_row(row) for row in rows})

    for row in rows:
        sample_id = sample_id_from_row(row)
        taxon_code = parse_int(row.get("TAXON.CODE"))
        if taxon_code is None:
            continue
        total = row_total_count(row)
        if total > 0:
            expected_taxa[(sample_id, taxon_code)] = total
            species_names[(sample_id, taxon_code)] = clean(row.get("sp.name")).upper()

    lines.append("FJS archive QC summary")
    lines.append("======================")
    lines.append(f"Samples in processed CSV: {len(samples)}")
    lines.append(f"Taxa with positive counts: {len(expected_taxa)}")
    lines.append(f"Archive assets found: {len(assets)}")
    lines.append("")

    assets_by_sample_kind: dict[tuple[str, str], int] = defaultdict(int)
    for asset in assets:
        assets_by_sample_kind[(asset["sample_id"], asset["asset_kind"])] += 1

    for sample_id in samples:
        lines.append(f"Sample {sample_id}")
        for kind in ("jar_label_image", "field_sheet_pdf", "lab_sheet_pdf"):
            count = assets_by_sample_kind[(sample_id, kind)]
            status = "OK" if count else "MISSING"
            lines.append(f"  {kind}: {count} ({status})")

    lines.append("")
    missing = sorted(set(expected_taxa) - set(representative_files))
    extra = sorted(set(representative_files) - set(expected_taxa))
    if missing:
        lines.append("Missing representative image groups for taxa with positive counts:")
        for key in missing:
            lines.append(f"  {key[0]} taxon {key[1]} {species_names.get(key, '')}".rstrip())
    else:
        lines.append("No missing representative image groups for taxa with positive counts.")

    if extra:
        lines.append("")
        lines.append("Representative image groups without positive-count processed rows:")
        for key in extra:
            lines.append(f"  {key[0]} taxon {key[1]}")

    multi_view = {key: names for key, names in representative_files.items() if len(names) > 1}
    if multi_view:
        lines.append("")
        lines.append("Representative specimens with multiple image views:")
        for key, names in sorted(multi_view.items()):
            lines.append(f"  {key[0]} taxon {key[1]}: {', '.join(sorted(names))}")

    return lines


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-root",
        default="data/raw/FJS_2017_sample",
        help="FJS raw source bundle folder.",
    )
    parser.add_argument(
        "--processed-csv",
        default=None,
        help=(
            "Processed metadata CSV path. Defaults to "
            f"{DEFAULT_PROCESSED_CSV_NAME} in source root, then compatible CSV fallbacks."
        ),
    )
    parser.add_argument(
        "--data-dictionary",
        default=None,
        help="FJS data dictionary xlsx path. Defaults to first *dictionary*.xlsx in source root.",
    )
    parser.add_argument(
        "--output-dir",
        default="data/processed/FJS_2017_sample/supabase_import",
        help="Output directory for generated import CSV files.",
    )
    parser.add_argument("--bucket", default=DEFAULT_BUCKET, help="Supabase Storage bucket name.")
    parser.add_argument(
        "--access-level",
        default="private",
        choices=("private", "restricted", "public"),
        help="Default access level written to import CSVs.",
    )
    parser.add_argument(
        "--batch-name",
        default="FJS_2017_sample",
        help="Import batch name.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    repo_root = Path.cwd()
    source_root = Path(args.source_root)
    output_dir = Path(args.output_dir)

    if not source_root.exists():
        print(f"Source root not found: {source_root}", file=sys.stderr)
        return 1

    processed_csv = Path(args.processed_csv) if args.processed_csv else None
    if processed_csv is None:
        processed_csv = find_processed_csv(source_root)
        if processed_csv is None:
            print(f"No processed metadata CSV file found in {source_root}", file=sys.stderr)
            return 1

    data_dictionary = Path(args.data_dictionary) if args.data_dictionary else None
    if data_dictionary is None:
        matches = sorted(source_root.glob("*dictionary*.xlsx"))
        data_dictionary = matches[0] if matches else source_root / "FJS_data_dictionary.xlsx"

    rows = load_processed_csv(processed_csv)
    samples = build_sample_rows(rows, processed_csv, args.access_level)
    taxa, sample_taxa_rows, sample_taxa_ids = build_taxa_and_count_rows(rows, args.access_level)
    assets, representatives, representative_files = build_asset_rows(
        source_root, repo_root, sample_taxa_ids, args.bucket, args.access_level
    )
    variables, code_options, warnings = load_data_dictionary(data_dictionary)

    import_batch = [
        {
            "batch_id": stable_uuid("import_batch", args.batch_name),
            "batch_name": args.batch_name,
            "source_root": relative_path(source_root, repo_root),
            "processed_csv_file": relative_path(processed_csv, repo_root),
            "data_dictionary_file": relative_path(data_dictionary, repo_root),
            "notes": "Generated local import metadata for the FJS archive.",
        }
    ]

    write_csv(output_dir / "fjs_import_batches.csv", IMPORT_BATCH_FIELDS, import_batch)
    write_csv(output_dir / "fjs_samples.csv", SAMPLE_FIELDS, list(samples.values()))
    write_csv(output_dir / "fjs_taxa.csv", TAXA_FIELDS, list(taxa.values()))
    write_csv(output_dir / "fjs_sample_taxa.csv", SAMPLE_TAXA_FIELDS, sample_taxa_rows)
    write_csv(output_dir / "fjs_representative_specimens.csv", REPRESENTATIVE_FIELDS, representatives)
    write_csv(output_dir / "fjs_assets.csv", ASSET_FIELDS, assets)
    write_csv(output_dir / "fjs_variable_dictionary.csv", VARIABLE_FIELDS, variables)
    write_csv(output_dir / "fjs_variable_code_options.csv", CODE_OPTION_FIELDS, code_options)
    write_readme(output_dir, args.bucket)

    qc_lines = build_qc_lines(rows, assets, representative_files)
    if warnings:
        qc_lines.extend(["", "Warnings:"])
        qc_lines.extend(f"  {warning}" for warning in warnings)
    (output_dir / "asset_manifest_qc.txt").write_text("\n".join(qc_lines) + "\n", encoding="utf-8")

    print(f"Wrote Supabase import files to {output_dir}")
    print("\n".join(qc_lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
