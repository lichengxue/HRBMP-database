-- HRBMP SQLite schema
-- Prototype only. Designed for reproducibility and clarity.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS stations (
  station_id TEXT PRIMARY KEY,
  station_name TEXT,
  river_mile REAL,
  latitude REAL,
  longitude REAL,
  region TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sampling_events (
  event_id TEXT PRIMARY KEY,
  station_id TEXT,
  sample_date TEXT,
  year INTEGER,
  month INTEGER,
  gear_type TEXT,
  program TEXT,
  sampling_depth_m REAL,
  notes TEXT,
  FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

CREATE TABLE IF NOT EXISTS taxa (
  taxon_id TEXT PRIMARY KEY,
  scientific_name TEXT,
  common_name TEXT,
  taxonomic_group TEXT,
  life_stage TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS observations (
  observation_id TEXT PRIMARY KEY,
  event_id TEXT,
  taxon_id TEXT,
  count INTEGER,
  abundance REAL,
  abundance_unit TEXT,
  preserved_specimen_count INTEGER,
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES sampling_events(event_id),
  FOREIGN KEY (taxon_id) REFERENCES taxa(taxon_id)
);

CREATE TABLE IF NOT EXISTS environmental_observations (
  env_id TEXT PRIMARY KEY,
  event_id TEXT,
  temperature_c REAL,
  salinity_psu REAL,
  dissolved_oxygen_mg_l REAL,
  turbidity_ntu REAL,
  chlorophyll_a REAL,
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES sampling_events(event_id)
);

CREATE TABLE IF NOT EXISTS metadata_sources (
  source_id TEXT PRIMARY KEY,
  source_name TEXT,
  file_name TEXT,
  contact TEXT,
  institution TEXT,
  date_added TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS data_domains (
  domain_id TEXT PRIMARY KEY,
  domain_name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS monitoring_programs (
  program_id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL UNIQUE,
  program_type TEXT,
  start_year INTEGER,
  end_year INTEGER,
  default_access_level TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS hrbmp_regions (
  region_code TEXT PRIMARY KEY,
  region_number INTEGER UNIQUE,
  region_name TEXT NOT NULL,
  river_mile_start REAL,
  river_mile_end REAL,
  display_order INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS dataset_catalog (
  dataset_id TEXT PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  domain_id TEXT,
  source_database TEXT,
  default_access_level TEXT,
  api_endpoint TEXT,
  description TEXT,
  FOREIGN KEY (domain_id) REFERENCES data_domains(domain_id)
);

CREATE TABLE IF NOT EXISTS data_variables (
  variable_id TEXT PRIMARY KEY,
  domain_id TEXT,
  source_database TEXT,
  variable_name TEXT NOT NULL,
  display_name TEXT,
  unit TEXT,
  value_type TEXT,
  public_description TEXT,
  FOREIGN KEY (domain_id) REFERENCES data_domains(domain_id)
);

CREATE TABLE IF NOT EXISTS access_levels (
  access_level_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  login_required INTEGER NOT NULL DEFAULT 0,
  manual_approval_required INTEGER NOT NULL DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS image_metadata_runs (
  run_id TEXT PRIMARY KEY,
  run_started_at_utc TEXT NOT NULL,
  run_completed_at_utc TEXT,
  scan_roots_json TEXT,
  files_found INTEGER NOT NULL DEFAULT 0,
  files_archived INTEGER NOT NULL DEFAULT 0,
  tags_archived INTEGER NOT NULL DEFAULT 0,
  extraction_tool TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS image_file_metadata (
  archive_file_id TEXT PRIMARY KEY,
  run_id TEXT,
  source_collection TEXT,
  gallery_category TEXT,
  sample_id TEXT,
  asset_kind TEXT,
  storage_bucket TEXT,
  storage_object_path TEXT,
  original_file_name TEXT,
  relative_path TEXT NOT NULL,
  absolute_path TEXT,
  directory TEXT,
  file_name TEXT NOT NULL,
  file_extension TEXT,
  mime_type TEXT,
  file_size_bytes INTEGER,
  md5_checksum TEXT,
  manifest_sha256 TEXT,
  file_modified_at TEXT,
  exif_tool_version TEXT,
  image_width INTEGER,
  image_height INTEGER,
  image_size TEXT,
  megapixels REAL,
  orientation TEXT,
  camera_make TEXT,
  camera_model TEXT,
  lens_model TEXT,
  software TEXT,
  create_date TEXT,
  date_time_original TEXT,
  modify_date TEXT,
  gps_latitude REAL,
  gps_longitude REAL,
  gps_altitude REAL,
  gps_date_time TEXT,
  gps_position TEXT,
  title TEXT,
  description TEXT,
  artist TEXT,
  copyright TEXT,
  keywords TEXT,
  contains_gps INTEGER NOT NULL DEFAULT 0,
  access_level_id TEXT NOT NULL DEFAULT 'internal',
  raw_metadata_json TEXT,
  extracted_at_utc TEXT NOT NULL,
  extraction_status TEXT NOT NULL DEFAULT 'ok',
  notes TEXT,
  FOREIGN KEY (run_id) REFERENCES image_metadata_runs(run_id),
  FOREIGN KEY (access_level_id) REFERENCES access_levels(access_level_id)
);

CREATE TABLE IF NOT EXISTS image_metadata_tags (
  archive_file_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  tag_value TEXT,
  tag_group TEXT,
  extracted_at_utc TEXT NOT NULL,
  PRIMARY KEY (archive_file_id, tag_name),
  FOREIGN KEY (archive_file_id) REFERENCES image_file_metadata(archive_file_id) ON DELETE CASCADE
);

CREATE VIEW IF NOT EXISTS public_image_file_metadata AS
SELECT
  archive_file_id,
  source_collection,
  gallery_category,
  sample_id,
  asset_kind,
  storage_bucket,
  storage_object_path,
  original_file_name,
  relative_path,
  file_name,
  file_extension,
  mime_type,
  file_size_bytes,
  image_width,
  image_height,
  image_size,
  orientation,
  create_date,
  date_time_original,
  title,
  description,
  keywords,
  extracted_at_utc
FROM image_file_metadata
WHERE access_level_id = 'public';

CREATE TABLE IF NOT EXISTS roles (
  role_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role_rank INTEGER NOT NULL,
  login_required INTEGER NOT NULL DEFAULT 1,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_access_levels (
  role_id TEXT NOT NULL,
  access_level_id TEXT NOT NULL,
  PRIMARY KEY (role_id, access_level_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (access_level_id) REFERENCES access_levels(access_level_id)
);

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  affiliation TEXT,
  account_status TEXT NOT NULL DEFAULT 'pending',
  password_hash TEXT,
  password_algorithm TEXT,
  password_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  approved_by TEXT,
  deactivated_at TEXT,
  notes TEXT,
  FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by TEXT,
  expires_at TEXT,
  notes TEXT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS dataset_access_policy (
  dataset_id TEXT PRIMARY KEY,
  access_level_id TEXT NOT NULL,
  release_status TEXT NOT NULL DEFAULT 'draft',
  contains_sensitive_data INTEGER NOT NULL DEFAULT 0,
  embargo_until TEXT,
  public_metadata_allowed INTEGER NOT NULL DEFAULT 1,
  public_map_allowed INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  FOREIGN KEY (dataset_id) REFERENCES dataset_catalog(dataset_id),
  FOREIGN KEY (access_level_id) REFERENCES access_levels(access_level_id)
);

CREATE TABLE IF NOT EXISTS dataset_role_permissions (
  dataset_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  can_view_metadata INTEGER NOT NULL DEFAULT 0,
  can_view_map INTEGER NOT NULL DEFAULT 0,
  can_download_summary INTEGER NOT NULL DEFAULT 0,
  can_download_record_level INTEGER NOT NULL DEFAULT 0,
  can_request_access INTEGER NOT NULL DEFAULT 0,
  can_manage_metadata INTEGER NOT NULL DEFAULT 0,
  can_manage_users INTEGER NOT NULL DEFAULT 0,
  can_download_full_database INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dataset_id, role_id),
  FOREIGN KEY (dataset_id) REFERENCES dataset_catalog(dataset_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE IF NOT EXISTS access_requests (
  request_id TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  affiliation TEXT,
  requested_role_id TEXT,
  requested_dataset_id TEXT,
  project_title TEXT,
  purpose TEXT,
  data_use_agreement_status TEXT NOT NULL DEFAULT 'not_sent',
  request_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  decision_notes TEXT,
  FOREIGN KEY (requested_role_id) REFERENCES roles(role_id),
  FOREIGN KEY (requested_dataset_id) REFERENCES dataset_catalog(dataset_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS data_use_agreements (
  agreement_id TEXT PRIMARY KEY,
  user_id TEXT,
  dataset_id TEXT,
  agreement_version TEXT NOT NULL,
  accepted_at TEXT,
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (dataset_id) REFERENCES dataset_catalog(dataset_id)
);

CREATE TABLE IF NOT EXISTS download_audit_log (
  audit_id TEXT PRIMARY KEY,
  user_id TEXT,
  dataset_id TEXT,
  endpoint TEXT,
  filters_json TEXT,
  row_count INTEGER,
  downloaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  access_decision TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (dataset_id) REFERENCES dataset_catalog(dataset_id)
);

-- Helpful indexes for joins and date filters.
CREATE INDEX IF NOT EXISTS idx_sampling_events_station_id ON sampling_events(station_id);
CREATE INDEX IF NOT EXISTS idx_sampling_events_year ON sampling_events(year);
CREATE INDEX IF NOT EXISTS idx_sampling_events_sample_date ON sampling_events(sample_date);
CREATE INDEX IF NOT EXISTS idx_observations_event_id ON observations(event_id);
CREATE INDEX IF NOT EXISTS idx_observations_taxon_id ON observations(taxon_id);
CREATE INDEX IF NOT EXISTS idx_environmental_observations_event_id ON environmental_observations(event_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_programs_name ON monitoring_programs(program_name);
CREATE INDEX IF NOT EXISTS idx_hrbmp_regions_display_order ON hrbmp_regions(display_order);
CREATE INDEX IF NOT EXISTS idx_dataset_catalog_domain_id ON dataset_catalog(domain_id);
CREATE INDEX IF NOT EXISTS idx_data_variables_domain_id ON data_variables(domain_id);
CREATE INDEX IF NOT EXISTS idx_data_variables_source_database ON data_variables(source_database);
CREATE INDEX IF NOT EXISTS idx_access_levels_sort_order ON access_levels(sort_order);
CREATE INDEX IF NOT EXISTS idx_image_metadata_runs_started ON image_metadata_runs(run_started_at_utc);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_source_collection ON image_file_metadata(source_collection);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_sample_id ON image_file_metadata(sample_id);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_asset_kind ON image_file_metadata(asset_kind);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_access_level ON image_file_metadata(access_level_id);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_contains_gps ON image_file_metadata(contains_gps);
CREATE INDEX IF NOT EXISTS idx_image_file_metadata_storage_path ON image_file_metadata(storage_bucket, storage_object_path);
CREATE INDEX IF NOT EXISTS idx_image_metadata_tags_tag_name ON image_metadata_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_roles_rank ON roles(role_rank);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_dataset_access_policy_access_level ON dataset_access_policy(access_level_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_download_audit_log_dataset_id ON download_audit_log(dataset_id);
CREATE INDEX IF NOT EXISTS idx_download_audit_log_user_id ON download_audit_log(user_id);
