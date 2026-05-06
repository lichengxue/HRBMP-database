# Database Design (SQLite Prototype)

## Table overview

- **stations**: one record per monitoring station.
- **sampling_events**: one record per sampling visit/event, linked to a station.
- **taxa**: taxonomic reference list.
- **observations**: biological observation records linking events and taxa.
- **environmental_observations**: environmental measurements per event.
- **metadata_sources**: provenance and source tracking.
- **data_domains**: top-level metadata domains such as biological, environmental, image catalog, and metadata.
- **monitoring_programs**: HRBMP monitoring programs and external database/program labels used by filters.
- **hrbmp_regions**: the 13 HRBMP longitudinal Hudson River regions and river-mile ranges.
- **dataset_catalog**: public dataset descriptions and API endpoint references.
- **data_variables**: variable names, source databases, units, value types, and public descriptions.
- **access_levels**: public, registered, approved research, data manager, and admin tiers.
- **roles**: user-facing roles that can be assigned to accounts.
- **role_access_levels**: relationship between roles and access tiers.
- **users**: account records for future login. Password fields must store hashes only.
- **user_roles**: role assignments and optional expiration dates.
- **dataset_access_policy**: minimum access level, release status, sensitivity, and embargo settings by dataset.
- **dataset_role_permissions**: dataset-specific permission matrix by role.
- **access_requests**: requested access, project purpose, review status, and decision notes.
- **data_use_agreements**: data-use agreement tracking by user and dataset.
- **download_audit_log**: restricted download and access-decision logging.

## Relationships

- `stations (1) -> (many) sampling_events`
- `sampling_events (1) -> (many) observations`
- `taxa (1) -> (many) observations`
- `sampling_events (1) -> (many) environmental_observations`
- `data_domains (1) -> (many) dataset_catalog`
- `data_domains (1) -> (many) data_variables`
- `roles (many) -> (many) access_levels` through `role_access_levels`
- `users (many) -> (many) roles` through `user_roles`
- `dataset_catalog (1) -> (1) dataset_access_policy`
- `dataset_catalog (many) -> (many) roles` through `dataset_role_permissions`

## Design notes

- Text primary keys are used for readable IDs (`ST001`, `EV001`, etc.).
- Indexes are included for common filters and joins (`station_id`, `event_id`, `taxon_id`, `year`, `sample_date`).
- Dates are stored as ISO-8601 text (`YYYY-MM-DD`) in this prototype for portability.
- Metadata tables support the GUI/API layer by documenting available datasets,
  variables, programs, HRBMP regions, and source provenance.
- Access-control tables define policy only. Production access checks must be
  enforced in the API/server, not only by hiding GUI elements.
- Seed data are fake placeholders and are clearly marked as such.
