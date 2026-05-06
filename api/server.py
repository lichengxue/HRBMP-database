#!/usr/bin/env python3
"""Small SQLite-backed API for the HRBMP GUI.

This is intentionally dependency-free so collaborators can run it from a clean
checkout with the Python standard library. It serves the static GUI and a few
API endpoints from the local SQLite database.
"""

from __future__ import annotations

import csv
import json
import mimetypes
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "database" / "hrbmp.sqlite"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8010
MAX_LIMIT = 10000


BIOLOGICAL_SQL = """
SELECT
  o.observation_id,
  se.event_id,
  se.sample_date,
  se.year,
  se.month,
  CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
  se.program,
  se.gear_type,
  se.sampling_depth_m,
  s.station_id,
  s.station_name,
  s.region,
  s.river_mile,
  s.latitude,
  s.longitude,
  t.taxon_id,
  t.common_name,
  t.scientific_name,
  t.taxonomic_group,
  t.life_stage,
  o.count,
  o.abundance,
  o.abundance_unit,
  o.preserved_specimen_count
FROM observations o
JOIN sampling_events se ON se.event_id = o.event_id
JOIN stations s ON s.station_id = se.station_id
JOIN taxa t ON t.taxon_id = o.taxon_id
"""


ENVIRONMENTAL_SQL = """
SELECT
  eo.env_id,
  se.event_id,
  se.sample_date,
  se.year,
  se.month,
  CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
  se.program,
  se.gear_type,
  se.sampling_depth_m,
  s.station_id,
  s.station_name,
  s.region,
  s.river_mile,
  s.latitude,
  s.longitude,
  eo.temperature_c,
  eo.salinity_psu,
  eo.dissolved_oxygen_mg_l,
  eo.turbidity_ntu,
  eo.chlorophyll_a
FROM environmental_observations eo
JOIN sampling_events se ON se.event_id = eo.event_id
JOIN stations s ON s.station_id = se.station_id
"""


def connect() -> sqlite3.Connection:
  if not DB_PATH.exists():
    raise FileNotFoundError(f"SQLite database not found: {DB_PATH}")
  connection = sqlite3.connect(DB_PATH)
  connection.row_factory = sqlite3.Row
  return connection


def first_value(query: dict[str, list[str]], name: str) -> str:
  return (query.get(name, [""])[0] or "").strip()


def int_value(query: dict[str, list[str]], name: str) -> int | None:
  value = first_value(query, name)
  if not value or value.lower() == "all":
    return None
  try:
    return int(value)
  except ValueError:
    return None


def add_text_filter(where: list[str], params: list[object], column: str, value: str) -> None:
  if value and value.lower() != "all":
    where.append(f"LOWER({column}) = LOWER(?)")
    params.append(value)


def add_range_filter(where: list[str], params: list[object], column: str, start: int | None, end: int | None) -> None:
  if start is not None and end is not None and start > end:
    start, end = end, start
  if start is not None:
    where.append(f"{column} >= ?")
    params.append(start)
  if end is not None:
    where.append(f"{column} <= ?")
    params.append(end)


def pagination(query: dict[str, list[str]]) -> tuple[int, int]:
  limit = int_value(query, "limit") or 1000
  offset = int_value(query, "offset") or 0
  return max(1, min(limit, MAX_LIMIT)), max(0, offset)


def biological_query(query: dict[str, list[str]]) -> tuple[str, list[object]]:
  where: list[str] = []
  params: list[object] = []

  species = first_value(query, "species")
  if species and species.lower() != "all":
    where.append("(LOWER(t.common_name) = LOWER(?) OR LOWER(t.scientific_name) = LOWER(?))")
    params.extend([species, species])

  add_text_filter(where, params, "t.life_stage", first_value(query, "life_stage"))
  add_text_filter(where, params, "se.program", first_value(query, "program"))
  add_text_filter(where, params, "s.region", first_value(query, "region"))
  add_range_filter(where, params, "se.year", int_value(query, "year_start"), int_value(query, "year_end"))
  add_range_filter(where, params, "se.month", int_value(query, "month_start"), int_value(query, "month_end"))
  add_range_filter(where, params, "CAST(strftime('%d', se.sample_date) AS INTEGER)", int_value(query, "day_start"), int_value(query, "day_end"))

  sql = BIOLOGICAL_SQL
  if where:
    sql += " WHERE " + " AND ".join(where)
  sql += " ORDER BY se.sample_date, s.river_mile, t.common_name, o.observation_id"
  return sql, params


def environmental_query(query: dict[str, list[str]]) -> tuple[str, list[object]]:
  where: list[str] = []
  params: list[object] = []

  add_text_filter(where, params, "se.program", first_value(query, "program"))
  add_text_filter(where, params, "s.region", first_value(query, "region"))
  add_range_filter(where, params, "se.year", int_value(query, "year_start"), int_value(query, "year_end"))
  add_range_filter(where, params, "se.month", int_value(query, "month_start"), int_value(query, "month_end"))
  add_range_filter(where, params, "CAST(strftime('%d', se.sample_date) AS INTEGER)", int_value(query, "day_start"), int_value(query, "day_end"))

  sql = ENVIRONMENTAL_SQL
  if where:
    sql += " WHERE " + " AND ".join(where)
  sql += " ORDER BY se.sample_date, s.river_mile, eo.env_id"
  return sql, params


def rows_for(sql: str, params: list[object], query: dict[str, list[str]]) -> list[dict[str, object]]:
  limit, offset = pagination(query)
  with connect() as connection:
    rows = connection.execute(f"{sql} LIMIT ? OFFSET ?", [*params, limit, offset]).fetchall()
  return [dict(row) for row in rows]


def filter_values() -> dict[str, list[object]]:
  with connect() as connection:
    return {
      "species": [row[0] for row in connection.execute("SELECT DISTINCT common_name FROM taxa WHERE common_name IS NOT NULL ORDER BY common_name")],
      "life_stages": [row[0] for row in connection.execute("SELECT DISTINCT life_stage FROM taxa WHERE life_stage IS NOT NULL ORDER BY life_stage")],
      "programs": [row[0] for row in connection.execute("SELECT DISTINCT program FROM sampling_events WHERE program IS NOT NULL ORDER BY program")],
      "regions": [row[0] for row in connection.execute("SELECT DISTINCT region FROM stations WHERE region IS NOT NULL ORDER BY region")],
      "years": [row[0] for row in connection.execute("SELECT DISTINCT year FROM sampling_events WHERE year IS NOT NULL ORDER BY year")],
      "months": [row[0] for row in connection.execute("SELECT DISTINCT month FROM sampling_events WHERE month IS NOT NULL ORDER BY month")],
    }


def table_rows(connection: sqlite3.Connection, sql: str) -> list[dict[str, object]]:
  return [dict(row) for row in connection.execute(sql).fetchall()]


def metadata_payload() -> dict[str, object]:
  with connect() as connection:
    return {
      "datasets": table_rows(connection, """
        SELECT dataset_id, dataset_name, domain_id, source_database, default_access_level, api_endpoint, description
        FROM dataset_catalog
        ORDER BY dataset_name
      """),
      "variables": table_rows(connection, """
        SELECT variable_id, domain_id, source_database, variable_name, display_name, unit, value_type, public_description
        FROM data_variables
        ORDER BY domain_id, source_database, display_name
      """),
      "programs": table_rows(connection, """
        SELECT program_id, program_name, program_type, start_year, end_year, default_access_level, description
        FROM monitoring_programs
        ORDER BY program_type, program_name
      """),
      "regions": table_rows(connection, """
        SELECT region_code, region_number, region_name, river_mile_start, river_mile_end, display_order, notes
        FROM hrbmp_regions
        ORDER BY display_order
      """),
      "sources": table_rows(connection, """
        SELECT source_id, source_name, file_name, contact, institution, date_added, notes
        FROM metadata_sources
        ORDER BY date_added DESC, source_name
      """),
      "access_levels": table_rows(connection, """
        SELECT access_level_id, display_name, sort_order, login_required, manual_approval_required, description
        FROM access_levels
        ORDER BY sort_order
      """),
      "roles": table_rows(connection, """
        SELECT role_id, display_name, role_rank, login_required, description
        FROM roles
        ORDER BY role_rank
      """),
      "dataset_access_policy": table_rows(connection, """
        SELECT
          p.dataset_id,
          d.dataset_name,
          p.access_level_id,
          a.display_name AS access_level_name,
          p.release_status,
          p.contains_sensitive_data,
          p.embargo_until,
          p.public_metadata_allowed,
          p.public_map_allowed,
          p.notes
        FROM dataset_access_policy p
        JOIN dataset_catalog d ON d.dataset_id = p.dataset_id
        JOIN access_levels a ON a.access_level_id = p.access_level_id
        ORDER BY d.dataset_name
      """),
      "dataset_role_permissions": table_rows(connection, """
        SELECT
          rp.dataset_id,
          d.dataset_name,
          rp.role_id,
          r.display_name AS role_name,
          rp.can_view_metadata,
          rp.can_view_map,
          rp.can_download_summary,
          rp.can_download_record_level,
          rp.can_request_access,
          rp.can_manage_metadata,
          rp.can_manage_users,
          rp.can_download_full_database
        FROM dataset_role_permissions rp
        JOIN dataset_catalog d ON d.dataset_id = rp.dataset_id
        JOIN roles r ON r.role_id = rp.role_id
        ORDER BY d.dataset_name, r.role_rank
      """),
    }


class ApiHandler(SimpleHTTPRequestHandler):
  def translate_path(self, path: str) -> str:
    parsed = urlparse(path)
    safe_path = parsed.path.lstrip("/")
    resolved = (ROOT / safe_path).resolve()
    try:
      resolved.relative_to(ROOT)
    except ValueError:
      return str(ROOT / "__missing__")
    return str(resolved)

  def end_headers(self) -> None:
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    super().end_headers()

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.end_headers()

  def do_GET(self) -> None:
    parsed = urlparse(self.path)
    if parsed.path.startswith("/api/"):
      self.handle_api(parsed.path, parse_qs(parsed.query))
      return
    if parsed.path == "/":
      self.send_response(HTTPStatus.FOUND)
      self.send_header("Location", "/gui/")
      self.end_headers()
      return
    super().do_GET()

  def handle_api(self, path: str, query: dict[str, list[str]]) -> None:
    try:
      if path == "/api/health":
        self.json_response({
          "status": "ok",
          "database": str(DB_PATH),
          "database_exists": DB_PATH.exists(),
        })
      elif path == "/api/filters":
        self.json_response(filter_values())
      elif path == "/api/metadata":
        self.json_response(metadata_payload())
      elif path == "/api/metadata/datasets":
        self.json_response({"datasets": metadata_payload()["datasets"]})
      elif path == "/api/metadata/variables":
        self.json_response({"variables": metadata_payload()["variables"]})
      elif path == "/api/metadata/programs":
        self.json_response({"programs": metadata_payload()["programs"]})
      elif path == "/api/metadata/regions":
        self.json_response({"regions": metadata_payload()["regions"]})
      elif path == "/api/metadata/sources":
        self.json_response({"sources": metadata_payload()["sources"]})
      elif path == "/api/access-policy":
        metadata = metadata_payload()
        self.json_response({
          "access_levels": metadata["access_levels"],
          "roles": metadata["roles"],
          "dataset_access_policy": metadata["dataset_access_policy"],
          "dataset_role_permissions": metadata["dataset_role_permissions"],
        })
      elif path == "/api/biological-records":
        sql, params = biological_query(query)
        records = rows_for(sql, params, query)
        self.json_response({"count": len(records), "records": records})
      elif path == "/api/biological-records.csv":
        sql, params = biological_query(query)
        self.csv_response("hrbmp_biological_records.csv", rows_for(sql, params, query))
      elif path == "/api/environmental-records":
        sql, params = environmental_query(query)
        records = rows_for(sql, params, query)
        self.json_response({"count": len(records), "records": records})
      elif path == "/api/environmental-records.csv":
        sql, params = environmental_query(query)
        self.csv_response("hrbmp_environmental_records.csv", rows_for(sql, params, query))
      else:
        self.json_response({"error": f"Unknown API endpoint: {path}"}, HTTPStatus.NOT_FOUND)
    except FileNotFoundError as error:
      self.json_response({"error": str(error), "hint": "Run the SQLite setup scripts before using the API."}, HTTPStatus.SERVICE_UNAVAILABLE)
    except sqlite3.Error as error:
      self.json_response({"error": f"SQLite error: {error}"}, HTTPStatus.INTERNAL_SERVER_ERROR)

  def json_response(self, payload: dict[str, object], status: HTTPStatus = HTTPStatus.OK) -> None:
    body = json.dumps(payload, indent=2, default=str).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def csv_response(self, filename: str, records: list[dict[str, object]]) -> None:
    from io import StringIO

    buffer = StringIO()
    if records:
      writer = csv.DictWriter(buffer, fieldnames=list(records[0].keys()), lineterminator="\n")
      writer.writeheader()
      writer.writerows(records)
    body = buffer.getvalue().encode("utf-8")

    self.send_response(HTTPStatus.OK)
    self.send_header("Content-Type", "text/csv; charset=utf-8")
    self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def guess_type(self, path: str) -> str:
    if path.endswith(".geojson"):
      return "application/geo+json"
    return mimetypes.guess_type(path)[0] or "application/octet-stream"


def main() -> None:
  server = ThreadingHTTPServer((DEFAULT_HOST, DEFAULT_PORT), ApiHandler)
  print(f"HRBMP API and GUI server running at http://{DEFAULT_HOST}:{DEFAULT_PORT}/gui/")
  print(f"API health check: http://{DEFAULT_HOST}:{DEFAULT_PORT}/api/health")
  server.serve_forever()


if __name__ == "__main__":
  main()
