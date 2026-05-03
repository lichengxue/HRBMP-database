# Database Design (SQLite Prototype)

## Table overview

- **stations**: one record per monitoring station.
- **sampling_events**: one record per sampling visit/event, linked to a station.
- **taxa**: taxonomic reference list.
- **observations**: biological observation records linking events and taxa.
- **environmental_observations**: environmental measurements per event.
- **metadata_sources**: provenance and source tracking.

## Relationships

- `stations (1) -> (many) sampling_events`
- `sampling_events (1) -> (many) observations`
- `taxa (1) -> (many) observations`
- `sampling_events (1) -> (many) environmental_observations`

## Design notes

- Text primary keys are used for readable IDs (`ST001`, `EV001`, etc.).
- Indexes are included for common filters and joins (`station_id`, `event_id`, `taxon_id`, `year`, `sample_date`).
- Dates are stored as ISO-8601 text (`YYYY-MM-DD`) in this prototype for portability.
- Seed data are fake placeholders and are clearly marked as such.
