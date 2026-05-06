-- Example analysis queries for the HRBMP prototype database.

-- 1) Row counts by table.
SELECT 'stations' AS table_name, COUNT(*) AS n FROM stations
UNION ALL SELECT 'sampling_events', COUNT(*) FROM sampling_events
UNION ALL SELECT 'taxa', COUNT(*) FROM taxa
UNION ALL SELECT 'observations', COUNT(*) FROM observations
UNION ALL SELECT 'environmental_observations', COUNT(*) FROM environmental_observations
UNION ALL SELECT 'dataset_catalog', COUNT(*) FROM dataset_catalog
UNION ALL SELECT 'data_variables', COUNT(*) FROM data_variables
UNION ALL SELECT 'hrbmp_regions', COUNT(*) FROM hrbmp_regions
UNION ALL SELECT 'access_levels', COUNT(*) FROM access_levels
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'dataset_access_policy', COUNT(*) FROM dataset_access_policy
UNION ALL SELECT 'dataset_role_permissions', COUNT(*) FROM dataset_role_permissions;

-- 2) Annual total abundance.
SELECT se.year, SUM(o.abundance) AS total_abundance
FROM observations o
JOIN sampling_events se ON se.event_id = o.event_id
GROUP BY se.year
ORDER BY se.year;

-- 3) Taxa totals.
SELECT t.scientific_name, t.common_name, SUM(o.abundance) AS total_abundance
FROM observations o
JOIN taxa t ON t.taxon_id = o.taxon_id
GROUP BY t.taxon_id, t.scientific_name, t.common_name
ORDER BY total_abundance DESC;

-- 4) Metadata variables by source database.
SELECT source_database, display_name, unit, value_type
FROM data_variables
ORDER BY source_database, display_name;

-- 5) Dataset access policy.
SELECT
  d.dataset_name,
  a.display_name AS minimum_access,
  p.release_status,
  p.contains_sensitive_data,
  p.embargo_until
FROM dataset_access_policy p
JOIN dataset_catalog d ON d.dataset_id = p.dataset_id
JOIN access_levels a ON a.access_level_id = p.access_level_id
ORDER BY d.dataset_name;

-- 6) Permission matrix for downloads.
SELECT
  d.dataset_name,
  r.display_name AS role_name,
  rp.can_download_summary,
  rp.can_download_record_level,
  rp.can_manage_metadata,
  rp.can_download_full_database
FROM dataset_role_permissions rp
JOIN dataset_catalog d ON d.dataset_id = rp.dataset_id
JOIN roles r ON r.role_id = rp.role_id
ORDER BY d.dataset_name, r.role_rank;
