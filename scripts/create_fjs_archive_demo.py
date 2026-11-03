#!/usr/bin/env python3
"""Create synthetic survey metadata and ZIP parts for the local app's example."""

import argparse
import csv
import json
import zipfile
from pathlib import Path

from openpyxl import Workbook


def create_demo(root: Path) -> dict:
    sample = "98_20180101_0001"
    assets = root / "assets"
    names = [f"{sample}_01.jpg", f"{sample}_SC1.pdf", f"{sample}_LW1.pdf",
             f"{sample}_01_019_04_01_01_00.jpg"]
    if not all((assets / name).is_file() for name in names):
        raise ValueError("The R worker must create the synthetic pictures and sheets first.")
    metadata = root / "example_counts.csv"
    with metadata.open("w", encoding="utf-8", newline="") as handle:
        fields = ["TASK.CODE", "DATE", "SAMPLE.NUMBER", "TAXON.CODE", "sp.name",
                  "NUMBER.OF.YOUNG.OF.YEAR", "YEAR.OF.DATA.COLLECTION"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerow(dict(zip(fields, [98, "01/01/2018", 1, 19, "EXAMPLE FISH", 1, 2018])))
        # A second sample proves that preparation selects only the downloaded sample.
        writer.writerow(dict(zip(fields, [98, "01/02/2018", 2, 19, "EXAMPLE FISH", 1, 2018])))
    dictionary = root / "example_dictionary.xlsx"
    book = Workbook()
    sheet = book.active
    sheet.append(["var_names", "FULL NAME", "LEVEL", "UNIT", "description", "code", "code description"])
    sheet.append(["TASK.CODE", "Survey task code", "sample", "code", "Synthetic example only", 98, "Example survey"])
    book.save(dictionary)
    zip_folder = root / "zip_parts"
    zip_folder.mkdir()
    for index, members in enumerate(([names[0]], names[1:3], [names[3]]), 1):
        with zipfile.ZipFile(zip_folder / f"FJS_Example-1-{index:03d}.zip", "w", zipfile.ZIP_DEFLATED) as bundle:
            for name in members:
                bundle.write(assets / name, f"FJS_Example/{sample}/{name}")
    info = dict(source_dir=str(zip_folder), metadata_csv=str(metadata),
                dictionary=str(dictionary), zip_group="FJS_Example-1", expected_parts=3)
    (root / "demo_info.json").write_text(json.dumps(info, indent=2), encoding="utf-8")
    print("Created synthetic example: 3 ZIP parts, 1 sample, 4 archive files.")
    return info


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", required=True, type=Path)
    create_demo(parser.parse_args().output_root.resolve())
