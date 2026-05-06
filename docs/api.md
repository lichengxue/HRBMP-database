# HRBMP API Prototype

The API prototype exposes filtered downloads from the local SQLite database.
It is intended for development and review, not public deployment or restricted
data access.

## Start The Server

Create and load the SQLite database first:

```bash
Rscript scripts/01_create_database.R
Rscript scripts/02_load_example_data.R
```

Then start the API and GUI server. Use the R option if you do not have Python
installed.

R option:

```bash
Rscript api/server.R
```

Required R packages:

```r
install.packages(c("plumber", "DBI", "RSQLite"))
```

On Windows, you can also start the R server with:

```text
scripts/start_r_api_server.bat
```

Python option:

```bash
python api/server.py
```

On Windows, this helper starts the R server when `Rscript` is available and
falls back to Python otherwise:

```text
scripts/start_api_server.bat
```

Open:

```text
http://127.0.0.1:8010/gui/
```

## Endpoints

- `GET /api/health`
- `GET /api/filters`
- `GET /api/metadata`
- `GET /api/metadata/datasets`
- `GET /api/metadata/variables`
- `GET /api/metadata/programs`
- `GET /api/metadata/regions`
- `GET /api/metadata/sources`
- `GET /api/access-policy`
- `GET /api/biological-records`
- `GET /api/biological-records.csv`
- `GET /api/environmental-records`
- `GET /api/environmental-records.csv`

## Filter Parameters

Biological records:

- `species`
- `life_stage`
- `program`
- `region`
- `year_start`, `year_end`
- `month_start`, `month_end`
- `day_start`, `day_end`
- `limit`, `offset`

Environmental records:

- `program`
- `region`
- `year_start`, `year_end`
- `month_start`, `month_end`
- `day_start`, `day_end`
- `limit`, `offset`

Metadata endpoints:

- `/api/metadata` returns dataset, variable, monitoring-program, region, and source metadata.
- `/api/metadata/variables` returns variable names, units, value types, source database labels, and public descriptions.
- `/api/metadata/regions` returns the 13 HRBMP river regions and river-mile ranges.

## Example Requests

```text
http://127.0.0.1:8010/api/biological-records.csv?species=Striped%20Bass&year_start=2024&year_end=2025
```

```text
http://127.0.0.1:8010/api/environmental-records?month_start=6&month_end=8
```

## Future Production Notes

Before public or restricted use, add authentication, authorization, request
logging, rate limiting, QA/QC status fields, and reviewed data-release rules.
