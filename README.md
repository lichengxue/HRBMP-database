# HRBMP Database Prototype

## Project purpose
This repository provides a **first working prototype** for a Hudson River Biological Monitoring Program (HRBMP) data workflow. It includes a normalized SQLite database design, R scripts for database setup and data export, and a simple static web GUI.

## Why this repo exists
The goal is to make HRBMP data management reproducible and understandable before introducing more complex infrastructure. This prototype uses fake placeholder data so the full workflow can be tested without requiring official source data.

## Folder structure

- `data/` – placeholders for raw data, processed outputs, and metadata
- `database/` – SQL schema, seed data, and example queries
- `scripts/` – R scripts for creating/loading/exporting data
- `gui/` – static HTML/CSS/JavaScript dashboard and exported JSON
- `docs/` – workflow and design documentation

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

## Future development plan
- Replace fake seed data with validated HRBMP source data.
- Expand QA/QC checks and metadata tracking.
- Add richer trend visualizations and map views.
- Optionally connect the GUI to a backend API in a later phase.
