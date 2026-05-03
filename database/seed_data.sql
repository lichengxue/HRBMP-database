-- IMPORTANT: ALL DATA BELOW ARE FAKE PLACEHOLDER DATA FOR PROTOTYPE TESTING ONLY.
-- Do NOT interpret these values as official HRBMP observations.

PRAGMA foreign_keys = ON;

INSERT INTO stations (station_id, station_name, river_mile, latitude, longitude, region, notes) VALUES
('ST001', 'Upper Reach - Prototype', 145.2, 42.2500, -73.7900, 'Upper Hudson', 'Fake placeholder station'),
('ST002', 'Mid Reach - Prototype', 98.4, 41.7000, -73.9500, 'Mid Hudson', 'Fake placeholder station'),
('ST003', 'Lower Reach - Prototype', 32.7, 40.8000, -73.9800, 'Lower Hudson', 'Fake placeholder station');

INSERT INTO sampling_events (event_id, station_id, sample_date, year, month, gear_type, program, sampling_depth_m, notes) VALUES
('EV001', 'ST001', '2024-06-10', 2024, 6, 'Trawl', 'Prototype Survey', 5.5, 'Fake event record'),
('EV002', 'ST002', '2024-07-15', 2024, 7, 'Seine', 'Prototype Survey', 3.1, 'Fake event record'),
('EV003', 'ST003', '2025-05-20', 2025, 5, 'Trawl', 'Prototype Survey', 6.0, 'Fake event record'),
('EV004', 'ST001', '2025-08-12', 2025, 8, 'Seine', 'Prototype Survey', 4.2, 'Fake event record');

INSERT INTO taxa (taxon_id, scientific_name, common_name, taxonomic_group, life_stage, notes) VALUES
('TX001', 'Morone saxatilis', 'Striped Bass', 'Fish', 'Juvenile', 'Fake placeholder taxon'),
('TX002', 'Alosa sapidissima', 'American Shad', 'Fish', 'Adult', 'Fake placeholder taxon'),
('TX003', 'Fundulus heteroclitus', 'Mummichog', 'Fish', 'Adult', 'Fake placeholder taxon'),
('TX004', 'Crangon septemspinosa', 'Sand Shrimp', 'Invertebrate', 'Adult', 'Fake placeholder taxon');

INSERT INTO observations (observation_id, event_id, taxon_id, count, abundance, abundance_unit, preserved_specimen_count, notes) VALUES
('OB001', 'EV001', 'TX001', 22, 22.0, 'individuals', 5, 'Fake observation'),
('OB002', 'EV001', 'TX004', 41, 41.0, 'individuals', 8, 'Fake observation'),
('OB003', 'EV002', 'TX003', 55, 55.0, 'individuals', 12, 'Fake observation'),
('OB004', 'EV002', 'TX002', 17, 17.0, 'individuals', 4, 'Fake observation'),
('OB005', 'EV003', 'TX001', 29, 29.0, 'individuals', 7, 'Fake observation'),
('OB006', 'EV003', 'TX003', 63, 63.0, 'individuals', 10, 'Fake observation'),
('OB007', 'EV004', 'TX004', 38, 38.0, 'individuals', 6, 'Fake observation');

INSERT INTO environmental_observations (env_id, event_id, temperature_c, salinity_psu, dissolved_oxygen_mg_l, turbidity_ntu, chlorophyll_a, notes) VALUES
('EN001', 'EV001', 19.3, 2.4, 8.1, 11.2, 6.8, 'Fake environmental record'),
('EN002', 'EV002', 23.1, 4.8, 7.4, 16.7, 9.1, 'Fake environmental record'),
('EN003', 'EV003', 17.8, 7.2, 8.6, 9.3, 5.7, 'Fake environmental record'),
('EN004', 'EV004', 24.5, 3.9, 7.0, 18.2, 10.4, 'Fake environmental record');

INSERT INTO metadata_sources (source_id, source_name, file_name, contact, institution, date_added, notes) VALUES
('SRC001', 'Prototype Seed Script', 'database/seed_data.sql', 'prototype@example.org', 'HRBMP Prototype', '2026-05-03', 'Fake placeholder provenance record');
