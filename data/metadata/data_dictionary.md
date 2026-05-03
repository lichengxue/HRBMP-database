# HRBMP Prototype Data Dictionary

This prototype uses a normalized SQLite schema defined in `database/schema.sql`.

- `stations`: station metadata (location and region)
- `sampling_events`: event-level sampling information
- `taxa`: taxonomic reference table
- `observations`: biological observations by event and taxon
- `environmental_observations`: abiotic observations per event
- `metadata_sources`: source and provenance records

See `docs/database_design.md` for details on each field and table relationship.
