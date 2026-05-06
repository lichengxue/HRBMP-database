# HRBMP Prototype Data Dictionary

This prototype uses a normalized SQLite schema defined in `database/schema.sql`.

- `stations`: station metadata (location and region)
- `sampling_events`: event-level sampling information
- `taxa`: taxonomic reference table
- `observations`: biological observations by event and taxon
- `environmental_observations`: abiotic observations per event
- `metadata_sources`: source and provenance records
- `data_domains`: high-level biological, environmental, image, and metadata domains
- `monitoring_programs`: HRBMP and external program/database labels used by the GUI
- `hrbmp_regions`: the 13 HRBMP Hudson River regions and river-mile ranges
- `dataset_catalog`: public-facing dataset descriptions and API endpoint links
- `data_variables`: variable names, units, source databases, and descriptions
- `access_levels`: public-to-admin access tier definitions
- `roles`: user role labels used by the future login system
- `role_access_levels`: allowed access tiers for each role
- `users`: account records; password fields are for hashes only
- `user_roles`: role assignments and expiration dates
- `dataset_access_policy`: release status, access level, sensitivity, and embargo policy by dataset
- `dataset_role_permissions`: permissions for each role and dataset
- `access_requests`: pending and reviewed requests for higher access
- `data_use_agreements`: agreement status for approved users and datasets
- `download_audit_log`: restricted download and access-decision records

See `docs/database_design.md` for details on each field and table relationship.
