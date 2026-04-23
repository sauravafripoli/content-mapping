#!/usr/bin/env python3

import csv
import json
import re
from pathlib import Path


ENTITY_PATTERNS: list[tuple[str, list[str]]] = [
    # Countries
    ("China", [r"\bchina\b"]),
    ("Nigeria", [r"\bnigeria\b"]),
    ("Ghana", [r"\bghana\b"]),
    ("Kenya", [r"\bkenya\b"]),
    ("South Africa", [r"\bsouth\s+africa\b"]),
    ("Egypt", [r"\begypt\b"]),
    ("Morocco", [r"\bmorocco\b"]),
    ("Turkey", [r"\bturkey\b"]),
    ("United States", [r"\bunited\s+states\b", r"\busa\b", r"\bu\.?s\.?\b"]),
    ("DRC", [r"\bdrc\b", r"\bdr\s+congo\b", r"\bdemocratic\s+republic\s+of\s+the\s+congo\b"]),
    ("Zambia", [r"\bzambia\b"]),
    # Regions / country groups / organizations
    ("EU", [r"\beu\b", r"\beuropean\s+union\b"]),
    ("ECOWAS", [r"\becowas\b"]),
    ("BRICS", [r"\bbrics\+?\b"]),
    ("AfCFTA", [r"\bafcfta\b"]),
    ("AU-EU", [r"\bau[-\s]?eu\b"]),
    ("EU-BRICS+", [r"\beu[-\s]?brics\+\b"]),
    ("EU-China-Africa", [r"\beu[-\s]?china[-\s]?africa\b"]),
    ("Global South", [r"\bglobal[-\s]?south\b"]),
    ("South-South Cooperation", [r"\bsouth[-\s]?south\s+cooperation\b"]),
    ("West Africa", [r"\bwest\s+africa\b"]),
]


def extract_countries_from_manual_tags(manual_tags: str) -> list[str]:
    """Extract countries and country-group entities from `Manual Tags`."""
    if not manual_tags:
        return []

    text = f" {manual_tags.lower()} "
    found: list[str] = []

    for canonical_name, patterns in ENTITY_PATTERNS:
        if any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns):
            found.append(canonical_name)

    return found


def parse_manual_tags(manual_tags: str) -> list[str]:
    """Split semicolon-separated Manual Tags into a clean list."""
    if not manual_tags:
        return []

    seen = set()
    tags: list[str] = []
    for part in manual_tags.split(";"):
        tag = part.strip()
        if not tag:
            continue
        key = tag.casefold()
        if key in seen:
            continue
        seen.add(key)
        tags.append(tag)

    return tags


def read_csv_records(csv_path: Path) -> list[dict]:
    """Read one CSV file and add `program` and `countries` fields to each row."""
    program_name = csv_path.stem

    records = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            # Skip fully empty rows
            if not any((value or "").strip() for value in row.values()):
                continue

            manual_tags = row.get("Manual Tags", "")
            row["Manual Tags"] = parse_manual_tags(manual_tags)
            row["program"] = program_name
            row["countries"] = extract_countries_from_manual_tags(manual_tags)
            records.append(row)

    return records


def main() -> None:
    data_dir = Path(__file__).resolve().parent
    csv_files = sorted(data_dir.glob("*.csv"))
    output_path = data_dir / "all_programs.json"

    if not csv_files:
        print("No CSV files found.")
        return

    all_records = []
    for csv_file in csv_files:
        records = read_csv_records(csv_file)
        all_records.extend(records)
        print(f"Read: {csv_file.name} ({len(records)} rows)")

    with output_path.open("w", encoding="utf-8") as outfile:
        json.dump(all_records, outfile, ensure_ascii=False, indent=2)

    print(f"Created combined JSON: {output_path.name} ({len(all_records)} rows)")


if __name__ == "__main__":
    main()
