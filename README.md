# HRBMP Database Prototype

## Project purpose
This repository provides a **first working prototype** for a Hudson River Biological Monitoring Program (HRBMP) data workflow. It includes a normalized SQLite database design, R scripts for database setup and data export, and a simple static web GUI.

## Why this repo exists
The goal is to make HRBMP data management reproducible and understandable before introducing more complex infrastructure. This prototype uses fake placeholder data so the full workflow can be tested without requiring official source data.

## Folder structure

- `data/` - placeholders for raw data, processed outputs, and metadata
- `database/` - SQL schema, seed data, and example queries
- `scripts/` - R scripts for creating/loading/exporting data
- `gui/` - static HTML/CSS/JavaScript dashboard and exported JSON
- `docs/` - workflow and design documentation

## How to run the prototype

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

The GUI is organized like a small project website with tabs for Program
Description, Data Inquiry, Biological Database, Environmental Database,
Sampling Image Catalog, Issue Report, User Login, and Team / Contact.

The Biological Database and Environmental Database tabs use Leaflet maps with
GeoJSON layers exported from SQLite. The Environmental Database separates HRBMP
database, USGS database, EPA database, and NOAA database variables. The map
libraries currently load from public CDNs, so an internet connection is needed
for the interactive basemap and clustering library.

Map filters use year, month, and day ranges. Leaving day start/end open shows
the full selected month range. The Biological Database map also includes
species, life-stage, and monitoring-program selectors. The species selector
lists the 13 key species first, then the broader Hudson River species list.

The User Login tab is a static interface placeholder for future restricted
access. Real authentication and role-based permissions should be implemented in
a backend before restricted data are exposed.

The Issue Report tab provides a static form for comments, issues, questions,
and feedback that can be connected to a backend later.

The Sampling Image Catalog starts with 13 commonly discussed key species, then
provides an All Species browser. Selecting a species opens pseudo distribution,
availability, and life-stage image records for Egg, Yolk-sac larvae,
Post-yolk-sac larvae, Young of the year, Yearling, and Adult stages. The
species detail view includes clickable life-stage controls that update the
Hudson River distribution bar, data availability summary, and image archive.

## Future development plan
- Replace fake seed data with validated HRBMP source data.
- Expand Quality Assurance / Quality Control (QA/QC) checks and metadata tracking.
- Add richer trend visualizations and map views.
- Optionally connect the GUI to a backend API in a later phase.
