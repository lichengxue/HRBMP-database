# HRBMP Prototype Workflow

This prototype follows a linear, reproducible workflow:

1. **Raw data** (`data/raw/`) – official source files will be stored here when available.
2. **Cleaning scripts** (`scripts/`) – R scripts validate, transform, and load data.
3. **Processed tables** (`data/processed/`) – optional intermediate outputs for QA/QC.
4. **SQLite database** (`database/hrbmp.sqlite`) – normalized relational structure.
5. **Exported JSON** (`gui/data/example_summary.json`) – summarized data for front-end display.
6. **HTML GUI** (`gui/index.html`) – static dashboard for quick prototype review.

This keeps the workflow transparent and reproducible for scientific collaborators.
