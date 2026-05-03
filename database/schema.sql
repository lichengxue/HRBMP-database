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

-- Helpful indexes for joins and date filters.
CREATE INDEX IF NOT EXISTS idx_sampling_events_station_id ON sampling_events(station_id);
CREATE INDEX IF NOT EXISTS idx_sampling_events_year ON sampling_events(year);
CREATE INDEX IF NOT EXISTS idx_sampling_events_sample_date ON sampling_events(sample_date);
CREATE INDEX IF NOT EXISTS idx_observations_event_id ON observations(event_id);
CREATE INDEX IF NOT EXISTS idx_observations_taxon_id ON observations(taxon_id);
CREATE INDEX IF NOT EXISTS idx_environmental_observations_event_id ON environmental_observations(event_id);
