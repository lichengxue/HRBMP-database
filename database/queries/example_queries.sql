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

-- 7) Supplemental image metadata counts by source collection.
SELECT
  source_collection,
  gallery_category,
  COUNT(*) AS image_files,
  SUM(CASE WHEN contains_gps = 1 THEN 1 ELSE 0 END) AS files_with_gps
FROM image_file_metadata
GROUP BY source_collection, gallery_category
ORDER BY source_collection, gallery_category;

-- 8) FJS image files linked to samples and asset kinds.
SELECT
  sample_id,
  asset_kind,
  file_name,
  image_width,
  image_height,
  orientation,
  date_time_original,
  access_level_id
FROM image_file_metadata
WHERE source_collection LIKE 'FJS%'
ORDER BY sample_id, asset_kind, file_name;

-- 9) Review fields before any public image metadata release.
SELECT
  relative_path,
  camera_make,
  camera_model,
  date_time_original,
  gps_latitude,
  gps_longitude,
  contains_gps,
  access_level_id
FROM image_file_metadata
WHERE contains_gps = 1
   OR camera_make IS NOT NULL
   OR camera_model IS NOT NULL
ORDER BY contains_gps DESC, relative_path;
