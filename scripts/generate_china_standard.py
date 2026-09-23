#!/usr/bin/env python3
"""Generate normalized WS/T 423—2022 reference data from the source workbook."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
DOC_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


AGE_SHEETS = {
    "B.1 男童年龄别体重(标准差)": ("boy", "weight"),
    "B.2 女童年龄别体重(标准差)": ("girl", "weight"),
    "B.3 男童年龄别身长身高(标准差)": ("boy", "stature"),
    "B.4 女童年龄别身长身高(标准差)": ("girl", "stature"),
    "B.9 男童年龄别BMI(标准差)": ("boy", "bmi"),
    "B.10 女童年龄别BMI(标准差)": ("girl", "bmi"),
    "B.11 男童年龄别头围(标准差)": ("boy", "headCircumference"),
    "B.12 女童年龄别头围(标准差)": ("girl", "headCircumference"),
}

STATURE_SHEETS = {
    "B.5 男童身长别体重(标准差)": ("boy", "length"),
    "B.6 女童身长别体重(标准差)": ("girl", "length"),
    "B.7 男童身高别体重(标准差)": ("boy", "height"),
    "B.8 女童身高别体重(标准差)": ("girl", "height"),
}


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Invalid cell reference: {reference}")
    value = 0
    for char in letters.group(0):
        value = value * 26 + ord(char) - ord("A") + 1
    return value - 1


def parse_age(value: str) -> int:
    if match := re.fullmatch(r"(\d+)月", value):
        return int(match.group(1))
    if match := re.fullmatch(r"(\d+)岁(?:(\d+)月)?", value):
        return int(match.group(1)) * 12 + int(match.group(2) or 0)
    raise ValueError(f"Unknown age label: {value}")


def load_workbook_rows(path: Path) -> dict[str, list[list[object | None]]]:
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("m:si", NS):
                shared_strings.append("".join(node.text or "" for node in item.iterfind(".//m:t", NS)))

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relationships.findall("r:Relationship", REL_NS)
        }

        result: dict[str, list[list[object | None]]] = {}
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            name = sheet.attrib["name"]
            if name not in AGE_SHEETS and name not in STATURE_SHEETS:
                continue
            target = targets[sheet.attrib[DOC_REL]].lstrip("/")
            if not target.startswith("xl/"):
                target = f"xl/{target}"
            sheet_xml = ET.fromstring(archive.read(target))
            parsed_rows: list[list[object | None]] = []
            for row in sheet_xml.findall("m:sheetData/m:row", NS):
                values: list[object | None] = []
                for cell in row.findall("m:c", NS):
                    index = column_index(cell.attrib["r"])
                    while len(values) <= index:
                        values.append(None)
                    cell_type = cell.attrib.get("t")
                    value_node = cell.find("m:v", NS)
                    if cell_type == "inlineStr":
                        text_node = cell.find("m:is/m:t", NS)
                        value: object | None = text_node.text if text_node is not None else ""
                    elif value_node is None:
                        value = None
                    elif cell_type == "s":
                        value = shared_strings[int(value_node.text or "0")]
                    elif cell_type in {"str", "e"}:
                        value = value_node.text
                    else:
                        number = float(value_node.text or "0")
                        value = int(number) if number.is_integer() else number
                    values[index] = value
                parsed_rows.append(values)
            result[name] = parsed_rows
        return result


def data_rows(rows: list[list[object | None]], key_parser) -> list[list[float | int]]:
    parsed: list[list[float | int]] = []
    for row in rows[3:]:
        if not row or row[0] in (None, "") or str(row[0]).startswith("注"):
            continue
        if len(row) < 8 or any(value is None for value in row[:8]):
            raise ValueError(f"Incomplete standard row: {row}")
        parsed.append([key_parser(row[0]), *[float(value) for value in row[1:8]]])
    return parsed


def validate_series(name: str, rows: list[list[float | int]], expected_count: int) -> None:
    if len(rows) != expected_count:
        raise ValueError(f"{name}: expected {expected_count} rows, got {len(rows)}")
    keys = [row[0] for row in rows]
    if keys != sorted(set(keys)):
        raise ValueError(f"{name}: keys are not unique and increasing")
    for row in rows:
        thresholds = row[1:]
        if thresholds != sorted(thresholds) or len(set(thresholds)) != 7:
            raise ValueError(f"{name}: thresholds are not strictly increasing at {row[0]}")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate_china_standard.py SOURCE.xlsx OUTPUT.json")

    source_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    sheets = load_workbook_rows(source_path)

    data = {
        "metadata": {
            "code": "WS/T 423—2022",
            "name": "7岁以下儿童生长标准",
            "publisher": "中华人民共和国国家卫生健康委员会",
            "publishedAt": "2022-09-19",
            "effectiveAt": "2023-03-01",
            "ageRangeMonths": [0, 84],
            "sdColumns": [-3, -2, -1, 0, 1, 2, 3],
        },
        "ageBased": {"boy": {}, "girl": {}},
        "statureBasedWeight": {"boy": {}, "girl": {}},
    }

    for sheet_name, (gender, metric) in AGE_SHEETS.items():
        rows = data_rows(sheets[sheet_name], lambda value: parse_age(str(value)))
        validate_series(sheet_name, rows, 29 if metric == "headCircumference" else 44)
        data["ageBased"][gender][metric] = rows

    for sheet_name, (gender, stature_type) in STATURE_SHEETS.items():
        rows = data_rows(sheets[sheet_name], lambda value: int(float(value)))
        validate_series(sheet_name, rows, 56)
        expected_bounds = (45, 100) if stature_type == "length" else (75, 130)
        if (rows[0][0], rows[-1][0]) != expected_bounds:
            raise ValueError(f"{sheet_name}: unexpected range")
        data["statureBasedWeight"][gender][stature_type] = rows

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {output_path}")


if __name__ == "__main__":
    main()
