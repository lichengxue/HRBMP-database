# HRBMP Data Access Portal

[![Open Web GUI](https://img.shields.io/badge/Open-Web%20GUI-2f6f73?style=for-the-badge&logo=githubpages&logoColor=white)](https://lichengxue.github.io/HRBMP-database/)

## Project purpose
This repository provides a working foundation for a Hudson River Biological Monitoring Program (HRBMP) data workflow. It includes a normalized SQLite database design, R scripts for database setup and data export, and a static web GUI.

## Why this repo exists
The goal is to make HRBMP data management reproducible and understandable before introducing more complex infrastructure. The current GUI uses test records for interface review and should be replaced with validated HRBMP source data before public release.

## Folder structure

- `data/` - placeholders for raw data, processed outputs, and metadata
- `database/` - SQL schema, seed data, and example queries
- `scripts/` - R scripts for creating/loading/exporting data
- `api/` - lightweight SQLite-backed API server for JSON and CSV downloads
- `gui/` - static HTML/CSS/JavaScript dashboard and exported JSON
- `docs/` - workflow and design documentation

## How to run the prototype

### Publish the GUI with GitHub Pages
GitHub Pages only offers `/` and `/docs` as folder choices when publishing
directly from a branch. This repo keeps the static web app in `gui/`, so use
the included GitHub Actions workflow instead:

1. Push the repository to GitHub.
2. In the repository, open **Settings** > **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. The `Deploy GUI to GitHub Pages` workflow publishes `gui/index.html` and
   the matching `gui/style.css`, `gui/app.js`, `gui/assets/`, and `gui/data/`
   files as the Pages site.

### 1) Create the SQLite database
```bash
Rscript scripts/01_create_database.R
```

### 2) Load fake example data
```bash
Rscript scripts/02_load_example_data.R
```

### 3) Export GUI JSON data
```bash
Rscript scripts/03_export_gui_data.R
```

### 4) Open the GUI locally
Open `gui/index.html` in a browser. If your browser blocks local JSON file loading, serve the folder locally:

```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000/gui/`.

### 5) Run the SQLite API server
The API server can serve both the GUI and filtered data-download endpoints.
Use either the R server or the Python server. The R server is the better fit if
you are working mainly in RStudio.

R option:

```bash
Rscript api/server.R
```

On Windows, you can also double-click:

```text
scripts/start_r_api_server.bat
```

The R option requires:

```r
install.packages(c("plumber", "DBI", "RSQLite"))
```

Python option:

```bash
python api/server.py
```

Then visit `http://127.0.0.1:8010/gui/`.

On Windows, this helper starts the R server when `Rscript` is available and
falls back to Python otherwise:

```text
scripts/start_api_server.bat
```

The R-specific helper is:

```text
scripts/start_r_api_server.bat
```

Keep the server window open while using API downloads. If the browser says
`127.0.0.1 refused to connect`, the API server is not running.

Useful endpoints:

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

The GUI is organized like a small project website with tabs for Program
Description, Data Inquiry, Biological Database, Environmental Database,
Sampling Image Catalog, Educational Materials, Photo Gallery, Issue Report,
User Login, and Team / Contact.

The Biological Database and Environmental Database tabs use Leaflet maps with
GeoJSON layers exported from SQLite. The Environmental Database separates HRBMP
database, USGS database, EPA database, and NOAA database variables. The map
libraries currently load from public CDNs, so an internet connection is needed
for the interactive basemap and clustering library.

Map filters use year, month, and day ranges. Leaving day start/end open shows
the full selected month range. The Biological Database map also includes
species, life-stage, and monitoring-program selectors. The species selector
lists the 13 key species first, then the broader Hudson River species list.
The Biological Database includes biological record totals by HRBMP region, an
HRBMP Region 0 to Region 12 boundary-line layer, and a data request form that
summarizes the current screening filters. The data request form links to the
official HRBMP Data Sharing Policy and includes fields for applicant details,
project abstract, specific data scope, and data use plan. The
Environmental Database similarly focuses on environmental records and selected
covariate context.

The Biological Database and Environmental Database pages also include API
download links. When the GUI is served through `api/server.py`, these links use
the current filters to request CSV or JSON directly from SQLite.

The Program Description page includes a SQLite Metadata Catalog. When the API
server is running, this section reads dataset, variable, program, source, and
HRBMP river-region metadata from SQLite through `/api/metadata`.

To regenerate the test biological map points:

```bash
node scripts/generate_gui_test_points.js
```

The User Login tab is a static interface placeholder for future restricted
access. It now displays the SQLite access tiers and dataset access policy, and
includes a request-access form placeholder. Real authentication, role checks,
and restricted downloads must be implemented in the backend/API before
restricted data are exposed.

The Issue Report tab provides a static form for comments, issues, questions,
and feedback that can be connected to a backend later.

The ribbon navigation provides dropdown menus under Educational Materials and
Photo Gallery. Each dropdown item opens its own page route, including HRBMP
history, current research, classroom materials, outreach activities, Hudson
River photos, field sampling photos, sample warehouse photos, and lab sample
processing photos.

The Sampling Image Catalog starts with 13 commonly discussed key species, then
provides an All Species browser. Selecting a species opens pseudo distribution,
availability, and life-stage image records for Egg, Yolk-sac larvae,
Post-yolk-sac larvae, Young of the year, Yearling, and Adult stages. The
species detail view includes clickable life-stage controls that update the
Hudson River distribution bar, data availability summary, and image archive.

## Future development plan
- Replace test records with validated HRBMP source data.
- Expand Quality Assurance / Quality Control (QA/QC) checks and metadata tracking.
- Add richer trend visualizations and map views.
- Optionally connect the GUI to a backend API in a later phase.

See `docs/github_vs_database.md` for guidance on what belongs in GitHub versus
what should stay in a local or hosted SQLite/API environment.
See `docs/access_control_design.md` for the planned login, role, request, and
download-audit structure.
