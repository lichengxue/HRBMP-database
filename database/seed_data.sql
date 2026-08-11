-- IMPORTANT: ALL DATA BELOW ARE FAKE PLACEHOLDER DATA FOR PROTOTYPE TESTING ONLY.
-- Do NOT interpret these values as official HRBMP observations.

PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO stations (station_id, station_name, river_mile, latitude, longitude, region, notes) VALUES
('ST001', 'Upper Reach - Prototype', 145.2, 42.2500, -73.7900, 'Upper Hudson', 'Fake placeholder station'),
('ST002', 'Mid Reach - Prototype', 98.4, 41.7000, -73.9500, 'Mid Hudson', 'Fake placeholder station'),
('ST003', 'Lower Reach - Prototype', 32.7, 40.8000, -73.9800, 'Lower Hudson', 'Fake placeholder station');

INSERT OR REPLACE INTO sampling_events (event_id, station_id, sample_date, year, month, gear_type, program, sampling_depth_m, notes) VALUES
('EV001', 'ST001', '2024-06-10', 2024, 6, 'Trawl', 'Prototype Survey', 5.5, 'Fake event record'),
('EV002', 'ST002', '2024-07-15', 2024, 7, 'Seine', 'Prototype Survey', 3.1, 'Fake event record'),
('EV003', 'ST003', '2025-05-20', 2025, 5, 'Trawl', 'Prototype Survey', 6.0, 'Fake event record'),
('EV004', 'ST001', '2025-08-12', 2025, 8, 'Seine', 'Prototype Survey', 4.2, 'Fake event record');

INSERT OR REPLACE INTO taxa (taxon_id, scientific_name, common_name, taxonomic_group, life_stage, notes) VALUES
('TX001', 'Morone saxatilis', 'Striped Bass', 'Fish', 'Juvenile', 'Fake placeholder taxon'),
('TX002', 'Alosa sapidissima', 'American Shad', 'Fish', 'Adult', 'Fake placeholder taxon'),
('TX003', 'Fundulus heteroclitus', 'Mummichog', 'Fish', 'Adult', 'Fake placeholder taxon'),
('TX004', 'Crangon septemspinosa', 'Sand Shrimp', 'Invertebrate', 'Adult', 'Fake placeholder taxon');

INSERT OR REPLACE INTO observations (observation_id, event_id, taxon_id, count, abundance, abundance_unit, preserved_specimen_count, notes) VALUES
('OB001', 'EV001', 'TX001', 22, 22.0, 'individuals', 5, 'Fake observation'),
('OB002', 'EV001', 'TX004', 41, 41.0, 'individuals', 8, 'Fake observation'),
('OB003', 'EV002', 'TX003', 55, 55.0, 'individuals', 12, 'Fake observation'),
('OB004', 'EV002', 'TX002', 17, 17.0, 'individuals', 4, 'Fake observation'),
('OB005', 'EV003', 'TX001', 29, 29.0, 'individuals', 7, 'Fake observation'),
('OB006', 'EV003', 'TX003', 63, 63.0, 'individuals', 10, 'Fake observation'),
('OB007', 'EV004', 'TX004', 38, 38.0, 'individuals', 6, 'Fake observation');

INSERT OR REPLACE INTO environmental_observations (env_id, event_id, temperature_c, salinity_psu, dissolved_oxygen_mg_l, turbidity_ntu, chlorophyll_a, notes) VALUES
('EN001', 'EV001', 19.3, 2.4, 8.1, 11.2, 6.8, 'Fake environmental record'),
('EN002', 'EV002', 23.1, 4.8, 7.4, 16.7, 9.1, 'Fake environmental record'),
('EN003', 'EV003', 17.8, 7.2, 8.6, 9.3, 5.7, 'Fake environmental record'),
('EN004', 'EV004', 24.5, 3.9, 7.0, 18.2, 10.4, 'Fake environmental record');

INSERT OR REPLACE INTO metadata_sources (source_id, source_name, file_name, contact, institution, date_added, notes) VALUES
('SRC001', 'Prototype Seed Script', 'database/seed_data.sql', 'prototype@example.org', 'HRBMP Prototype', '2026-05-03', 'Fake placeholder provenance record');

INSERT OR REPLACE INTO data_domains (domain_id, domain_name, description) VALUES
('biological', 'Biological Records', 'Taxa, life stage, event, station, and abundance fields used for HRBMP biological data downloads.'),
('environmental', 'Environmental Records', 'Survey-linked and external environmental variables used for HRBMP data screening.'),
('sampling_images', 'Sampling Image Catalog', 'Species, life-stage, image type, and archive metadata for field and sample images.'),
('metadata', 'Metadata Catalog', 'Dataset, variable, region, source, and access documentation used by the GUI and API.');

INSERT OR REPLACE INTO monitoring_programs (program_id, program_name, program_type, start_year, end_year, default_access_level, description) VALUES
('long-river-survey', 'Long River Survey', 'HRBMP Biological Survey', NULL, NULL, 'public_summary', 'Longitudinal HRBMP survey records for Hudson River biological monitoring.'),
('fall-juvenile-survey', 'Fall Juvenile Survey', 'HRBMP Biological Survey', NULL, NULL, 'public_summary', 'Juvenile-focused HRBMP survey records for seasonal biological coverage.'),
('beach-seine-survey', 'Beach Seine Survey', 'HRBMP Biological Survey', NULL, NULL, 'public_summary', 'Nearshore seine survey records for biological availability screening.'),
('hrbmp-environmental', 'HRBMP Survey-Linked Environmental Measurements', 'HRBMP Environmental Data', NULL, NULL, 'public_summary', 'Environmental measurements collected or linked at HRBMP sampling events.'),
('usgs-hydrology', 'USGS Hydrology', 'External Environmental Data', NULL, NULL, 'public_summary', 'Hydrological variables that may be linked to HRBMP records by station, date, or river segment.'),
('epa-water-quality-portal', 'EPA / Water Quality Portal', 'External Environmental Data', NULL, NULL, 'public_summary', 'Water quality variables that may be linked to HRBMP records where available.'),
('noaa-coastal-oceanographic', 'NOAA Coastal/Oceanographic', 'External Environmental Data', NULL, NULL, 'public_summary', 'Coastal, tide, water level, wind, and oceanographic variables that may support HRBMP context.');

INSERT OR REPLACE INTO hrbmp_regions (region_code, region_number, region_name, river_mile_start, river_mile_end, display_order, notes) VALUES
('BT', 0, 'Battery', 0, 11, 0, 'HRBMP longitudinal river region.'),
('YK', 1, 'Yonkers', 12, 23, 1, 'HRBMP longitudinal river region.'),
('TZ', 2, 'Tappan Zee', 24, 33, 2, 'HRBMP longitudinal river region.'),
('CH', 3, 'Croton-Haverstraw', 34, 38, 3, 'HRBMP longitudinal river region.'),
('IP', 4, 'Indian Point', 39, 46, 4, 'HRBMP longitudinal river region.'),
('WP', 5, 'West Point', 47, 55, 5, 'HRBMP longitudinal river region.'),
('CW', 6, 'Cornwall', 56, 61, 6, 'HRBMP longitudinal river region.'),
('PK', 7, 'Poughkeepsie', 62, 76, 7, 'HRBMP longitudinal river region.'),
('HP', 8, 'Hyde Park', 77, 85, 8, 'HRBMP longitudinal river region.'),
('KG', 9, 'Kingston', 86, 93, 9, 'HRBMP longitudinal river region.'),
('SG', 10, 'Saugerties', 94, 106, 10, 'HRBMP longitudinal river region.'),
('CS', 11, 'Catskill', 107, 124, 11, 'HRBMP longitudinal river region.'),
('AL', 12, 'Albany', 125, 152, 12, 'HRBMP longitudinal river region.');

INSERT OR REPLACE INTO dataset_catalog (dataset_id, dataset_name, domain_id, source_database, default_access_level, api_endpoint, description) VALUES
('biological-records', 'Biological Records', 'biological', 'HRBMP database', 'public_summary', '/api/biological-records', 'Filtered biological observation records joined to event, station, region, species, and life-stage metadata.'),
('environmental-records', 'Environmental Records', 'environmental', 'HRBMP database', 'public_summary', '/api/environmental-records', 'Filtered environmental records joined to event, station, region, and date metadata.'),
('sampling-image-catalog', 'Sampling Image Catalog', 'sampling_images', 'HRBMP image archive', 'public_summary', NULL, 'Species and life-stage image inventory for catalog review and future archive linking.'),
('image-exif-metadata', 'Image EXIF Metadata Archive', 'sampling_images', 'HRBMP image archive', 'internal', NULL, 'Supplemental image file metadata extracted from reviewed local image folders for QA/QC, provenance, and release review.'),
('metadata-catalog', 'Metadata Catalog', 'metadata', 'HRBMP database', 'public', '/api/metadata', 'Dataset, variable, program, source, and HRBMP river-region metadata used by the GUI.');

INSERT OR REPLACE INTO data_variables (variable_id, domain_id, source_database, variable_name, display_name, unit, value_type, public_description) VALUES
('common-name', 'biological', 'HRBMP database', 'common_name', 'Common Name', NULL, 'text', 'Common species name used in public-facing filters.'),
('scientific-name', 'biological', 'HRBMP database', 'scientific_name', 'Scientific Name', NULL, 'text', 'Scientific species name used for taxonomic reference.'),
('life-stage', 'biological', 'HRBMP database', 'life_stage', 'Life Stage', NULL, 'category', 'Life-history stage such as egg, yolk-sac larvae, post-yolk-sac larvae, young of the year, yearling, or adult.'),
('count', 'biological', 'HRBMP database', 'count', 'Count', 'individuals', 'integer', 'Raw biological count recorded for an event and taxon.'),
('abundance', 'biological', 'HRBMP database', 'abundance', 'Abundance', 'variable', 'numeric', 'Abundance value and unit recorded with the biological observation.'),
('water-temperature', 'environmental', 'HRBMP database', 'temperature_c', 'Water Temperature', 'deg C', 'numeric', 'Survey-linked water temperature.'),
('dissolved-oxygen', 'environmental', 'HRBMP database', 'dissolved_oxygen_mg_l', 'Dissolved Oxygen', 'mg/L', 'numeric', 'Survey-linked dissolved oxygen.'),
('salinity', 'environmental', 'HRBMP database', 'salinity_psu', 'Salinity', 'psu', 'numeric', 'Survey-linked salinity or conductivity-derived salinity where available.'),
('turbidity', 'environmental', 'HRBMP database', 'turbidity_ntu', 'Turbidity', 'NTU', 'numeric', 'Survey-linked turbidity.'),
('sampling-depth', 'environmental', 'HRBMP database', 'sampling_depth_m', 'Sampling Depth', 'm', 'numeric', 'Depth associated with the sampling event.'),
('discharge', 'environmental', 'USGS database', 'discharge', 'Discharge', 'ft3/s', 'numeric', 'External hydrology variable for potential date and location linkage.'),
('tide-stage', 'environmental', 'USGS database', 'tide_stage', 'Tide Stage', NULL, 'numeric', 'External tide-stage context where available.'),
('gage-height', 'environmental', 'USGS database', 'gage_height', 'Gage Height', 'ft', 'numeric', 'External gage-height context where available.'),
('salt-front-position', 'environmental', 'USGS database', 'salt_front_position', 'Salt-Front Position', 'river mile', 'numeric', 'External salt-front position context where available.'),
('ph', 'environmental', 'EPA database', 'pH', 'pH', 'standard units', 'numeric', 'Water Quality Portal pH records where available.'),
('nutrients', 'environmental', 'EPA database', 'nutrients', 'Nutrients', 'variable', 'numeric', 'Water Quality Portal nutrient records where available.'),
('bacteria', 'environmental', 'EPA database', 'bacteria', 'Bacteria', 'variable', 'numeric', 'Water Quality Portal bacteria records where available.'),
('contaminants', 'environmental', 'EPA database', 'contaminants', 'Contaminants', 'variable', 'numeric', 'Water Quality Portal contaminant records where available.'),
('water-level', 'environmental', 'NOAA database', 'water_level', 'Water Level', 'm', 'numeric', 'NOAA water-level records where available.'),
('currents', 'environmental', 'NOAA database', 'currents', 'Currents', 'm/s', 'numeric', 'NOAA current records where available.'),
('winds', 'environmental', 'NOAA database', 'winds', 'Winds', 'm/s', 'numeric', 'NOAA wind records where available.'),
('atmospheric-pressure', 'environmental', 'NOAA database', 'atmospheric_pressure', 'Atmospheric Pressure', 'hPa', 'numeric', 'NOAA atmospheric-pressure records where available.');

INSERT OR REPLACE INTO access_levels (access_level_id, display_name, sort_order, login_required, manual_approval_required, description) VALUES
('public', 'Public', 0, 0, 0, 'Published metadata, maps, summaries, and public CSV exports that do not require login.'),
('registered', 'Registered External User', 10, 1, 0, 'Approved public-use datasets and higher-resolution non-sensitive downloads for registered users.'),
('approved_research', 'Approved Research User', 20, 1, 1, 'Restricted datasets released after manual review, project approval, or data-use agreement.'),
('internal', 'Data Manager', 30, 1, 1, 'Internal QA/QC, metadata editing, data request review, and release preparation.'),
('admin', 'Admin', 40, 1, 1, 'User management, full database operations, and system administration.');

INSERT OR REPLACE INTO roles (role_id, display_name, role_rank, login_required, description) VALUES
('public', 'Public', 0, 0, 'Unauthenticated public visitor.'),
('registered_external', 'Registered External User', 10, 1, 'External user with an approved account for non-sensitive public-use downloads.'),
('approved_research', 'Approved Research User', 20, 1, 'Approved collaborator with project-specific access to restricted datasets.'),
('data_manager', 'Data Manager', 30, 1, 'Database team member who can review requests, edit metadata, and support QA/QC.'),
('admin', 'Admin', 40, 1, 'Administrative account with full database and user-management permissions.');

INSERT OR REPLACE INTO role_access_levels (role_id, access_level_id) VALUES
('public', 'public'),
('registered_external', 'public'),
('registered_external', 'registered'),
('approved_research', 'public'),
('approved_research', 'registered'),
('approved_research', 'approved_research'),
('data_manager', 'public'),
('data_manager', 'registered'),
('data_manager', 'approved_research'),
('data_manager', 'internal'),
('admin', 'public'),
('admin', 'registered'),
('admin', 'approved_research'),
('admin', 'internal'),
('admin', 'admin');

INSERT OR REPLACE INTO dataset_access_policy (
  dataset_id,
  access_level_id,
  release_status,
  contains_sensitive_data,
  embargo_until,
  public_metadata_allowed,
  public_map_allowed,
  notes
) VALUES
('metadata-catalog', 'public', 'published', 0, NULL, 1, 1, 'Metadata catalog is public by default.'),
('biological-records', 'public', 'published', 0, NULL, 1, 1, 'Public downloads should use reviewed non-sensitive biological export fields.'),
('environmental-records', 'public', 'published', 0, NULL, 1, 1, 'Public downloads should use reviewed non-sensitive environmental export fields.'),
('sampling-image-catalog', 'registered', 'qa_qc', 0, NULL, 1, 1, 'Image metadata can be public, but source image downloads may require registered or approved access.'),
('image-exif-metadata', 'internal', 'qa_qc', 1, NULL, 0, 0, 'Extracted image file metadata can include GPS, camera/device details, timestamps, and other sensitive provenance fields. Review before public release.');

INSERT OR REPLACE INTO dataset_role_permissions (
  dataset_id,
  role_id,
  can_view_metadata,
  can_view_map,
  can_download_summary,
  can_download_record_level,
  can_request_access,
  can_manage_metadata,
  can_manage_users,
  can_download_full_database
) VALUES
('metadata-catalog', 'public', 1, 1, 1, 0, 0, 0, 0, 0),
('metadata-catalog', 'registered_external', 1, 1, 1, 0, 0, 0, 0, 0),
('metadata-catalog', 'approved_research', 1, 1, 1, 0, 0, 0, 0, 0),
('metadata-catalog', 'data_manager', 1, 1, 1, 1, 0, 1, 0, 0),
('metadata-catalog', 'admin', 1, 1, 1, 1, 0, 1, 1, 1),
('biological-records', 'public', 1, 1, 1, 0, 1, 0, 0, 0),
('biological-records', 'registered_external', 1, 1, 1, 1, 1, 0, 0, 0),
('biological-records', 'approved_research', 1, 1, 1, 1, 1, 0, 0, 0),
('biological-records', 'data_manager', 1, 1, 1, 1, 0, 1, 0, 0),
('biological-records', 'admin', 1, 1, 1, 1, 0, 1, 1, 1),
('environmental-records', 'public', 1, 1, 1, 0, 1, 0, 0, 0),
('environmental-records', 'registered_external', 1, 1, 1, 1, 1, 0, 0, 0),
('environmental-records', 'approved_research', 1, 1, 1, 1, 1, 0, 0, 0),
('environmental-records', 'data_manager', 1, 1, 1, 1, 0, 1, 0, 0),
('environmental-records', 'admin', 1, 1, 1, 1, 0, 1, 1, 1),
('sampling-image-catalog', 'public', 1, 1, 1, 0, 1, 0, 0, 0),
('sampling-image-catalog', 'registered_external', 1, 1, 1, 1, 1, 0, 0, 0),
('sampling-image-catalog', 'approved_research', 1, 1, 1, 1, 1, 0, 0, 0),
('sampling-image-catalog', 'data_manager', 1, 1, 1, 1, 0, 1, 0, 0),
('sampling-image-catalog', 'admin', 1, 1, 1, 1, 0, 1, 1, 1),
('image-exif-metadata', 'public', 0, 0, 0, 0, 0, 0, 0, 0),
('image-exif-metadata', 'registered_external', 0, 0, 0, 0, 1, 0, 0, 0),
('image-exif-metadata', 'approved_research', 0, 0, 0, 0, 1, 0, 0, 0),
('image-exif-metadata', 'data_manager', 1, 1, 1, 1, 0, 1, 0, 0),
('image-exif-metadata', 'admin', 1, 1, 1, 1, 0, 1, 1, 1);

INSERT OR REPLACE INTO access_requests (
  request_id,
  requester_name,
  requester_email,
  affiliation,
  requested_role_id,
  requested_dataset_id,
  project_title,
  purpose,
  data_use_agreement_status,
  request_status,
  decision_notes
) VALUES
('REQ-DEMO-001', 'Example External User', 'external.user@example.org', 'Example Institution', 'registered_external', 'biological-records', 'Prototype Access Request', 'Demonstrates how external account requests can be tracked before approval.', 'not_sent', 'pending', 'Fake placeholder request for interface testing only.');
