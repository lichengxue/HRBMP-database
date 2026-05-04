#!/usr/bin/env Rscript

# Export summary JSON for the static GUI.

required_packages <- c('DBI', 'RSQLite', 'jsonlite')
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop(sprintf('Missing packages: %s\nInstall with install.packages(c(%s))',
               paste(missing_packages, collapse = ', '),
               paste(sprintf('"%s"', missing_packages), collapse = ', ')))
}

message('Exporting GUI summary JSON...')

db_path <- 'database/hrbmp.sqlite'
out_path <- 'gui/data/example_summary.json'
bio_geojson_path <- 'gui/data/biological_availability.geojson'
env_geojson_path <- 'gui/data/environmental_availability.geojson'

if (!file.exists(db_path)) stop(sprintf('Database not found: %s', db_path))

con <- DBI::dbConnect(RSQLite::SQLite(), dbname = db_path)
on.exit(DBI::dbDisconnect(con), add = TRUE)

stations <- DBI::dbGetQuery(con, 'SELECT station_id, station_name, river_mile, latitude, longitude, region FROM stations ORDER BY station_id')
sampling_events <- DBI::dbGetQuery(con, "
  SELECT se.event_id, se.station_id, s.station_name, s.region, se.sample_date,
         se.year, se.month, CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
         se.gear_type, se.program, se.sampling_depth_m
  FROM sampling_events se
  JOIN stations s ON s.station_id = se.station_id
  ORDER BY se.sample_date, se.event_id
")
annual <- DBI::dbGetQuery(con, '
  SELECT se.year, ROUND(SUM(o.abundance), 2) AS total_abundance
  FROM observations o
  JOIN sampling_events se ON se.event_id = o.event_id
  GROUP BY se.year
  ORDER BY se.year
')
taxa_totals <- DBI::dbGetQuery(con, '
  SELECT t.taxon_id, t.scientific_name, t.common_name, t.taxonomic_group,
         ROUND(SUM(o.abundance), 2) AS total_abundance
  FROM observations o
  JOIN taxa t ON t.taxon_id = o.taxon_id
  GROUP BY t.taxon_id, t.scientific_name, t.common_name, t.taxonomic_group
  ORDER BY total_abundance DESC
')
env_summary <- DBI::dbGetQuery(con, '
  SELECT
    ROUND(AVG(temperature_c), 2) AS mean_temperature_c,
    ROUND(AVG(salinity_psu), 2) AS mean_salinity_psu,
    ROUND(AVG(dissolved_oxygen_mg_l), 2) AS mean_dissolved_oxygen_mg_l,
    ROUND(AVG(turbidity_ntu), 2) AS mean_turbidity_ntu,
    ROUND(AVG(chlorophyll_a), 2) AS mean_chlorophyll_a
  FROM environmental_observations
')
biological_availability <- DBI::dbGetQuery(con, "
  SELECT s.station_id, s.station_name, s.river_mile, s.latitude, s.longitude, s.region,
         se.year, se.month, CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
         se.gear_type, se.program, t.taxon_id, t.scientific_name, t.common_name,
         t.taxonomic_group, t.life_stage,
         COUNT(DISTINCT se.event_id) AS sampling_events,
         COUNT(o.observation_id) AS biological_records,
         ROUND(COALESCE(SUM(o.abundance), 0), 2) AS total_abundance
  FROM sampling_events se
  JOIN stations s ON s.station_id = se.station_id
  LEFT JOIN observations o ON o.event_id = se.event_id
  LEFT JOIN taxa t ON t.taxon_id = o.taxon_id
  GROUP BY s.station_id, s.station_name, s.river_mile, s.latitude, s.longitude, s.region,
           se.year, se.month, CAST(strftime('%d', se.sample_date) AS INTEGER),
           se.gear_type, se.program, t.taxon_id, t.scientific_name, t.common_name,
           t.taxonomic_group, t.life_stage
  ORDER BY se.year, se.month, s.river_mile DESC
")
environmental_availability <- DBI::dbGetQuery(con, '
  SELECT s.station_id, s.station_name, s.river_mile, s.latitude, s.longitude, s.region,
         se.year, se.month, CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
         COUNT(eo.env_id) AS environmental_records,
         ROUND(AVG(eo.temperature_c), 2) AS mean_temperature_c,
         ROUND(AVG(eo.salinity_psu), 2) AS mean_salinity_psu,
         ROUND(AVG(eo.dissolved_oxygen_mg_l), 2) AS mean_dissolved_oxygen_mg_l
  FROM sampling_events se
  JOIN stations s ON s.station_id = se.station_id
  LEFT JOIN environmental_observations eo ON eo.event_id = se.event_id
  GROUP BY s.station_id, s.station_name, s.river_mile, s.latitude, s.longitude, s.region,
           se.year, se.month, CAST(strftime('%d', se.sample_date) AS INTEGER)
  ORDER BY se.year, se.month, s.river_mile DESC
')
sampling_image_catalog <- data.frame(
  catalog_id = c(
    'IMG-AE-2024-0610-01', 'IMG-AE-2025-0722-02', 'IMG-AE-2026-0812-03',
    'IMG-AS-2024-0508-01', 'IMG-AS-2025-0618-02', 'IMG-AS-2026-0924-03',
    'IMG-AT-2024-0118-01', 'IMG-AT-2025-0212-02', 'IMG-AT-2026-0315-03',
    'IMG-SB-2024-0524-01', 'IMG-SB-2025-0710-02', 'IMG-SB-2026-0830-03',
    'IMG-WP-2024-0616-01', 'IMG-WP-2025-0826-02', 'IMG-WP-2026-0918-03'
  ),
  highlight_rank = c(1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5),
  species_common = c(
    rep('American eel', 3),
    rep('Atlantic sturgeon', 3),
    rep('Atlantic tomcod', 3),
    rep('Striped Bass', 3),
    rep('White Perch', 3)
  ),
  species_scientific = c(
    rep('Anguilla rostrata', 3),
    rep('Acipenser oxyrinchus oxyrinchus', 3),
    rep('Microgadus tomcod', 3),
    rep('Morone saxatilis', 3),
    rep('Morone americana', 3)
  ),
  image_type = c(
    'Specimen photo', 'Habitat photo', 'Voucher close-up',
    'Specimen photo', 'Gear photo', 'Voucher close-up',
    'Specimen photo', 'Habitat photo', 'Voucher close-up',
    'Specimen photo', 'Gear photo', 'Voucher close-up',
    'Specimen photo', 'Habitat photo', 'Voucher close-up'
  ),
  image_count = rep(1L, 15),
  life_stage = c(
    'Juvenile', 'Glass eel / elver', 'Adult',
    'Juvenile', 'Subadult', 'Juvenile',
    'Adult', 'Larval / early life stage', 'Juvenile',
    'Young-of-year', 'Adult', 'Juvenile',
    'Adult', 'Juvenile', 'Young-of-year'
  ),
  station_id = c(
    'HRBMP-CH-04', 'HRBMP-TZ-02', 'HRBMP-KG-03',
    'HRBMP-WP-01', 'HRBMP-IP-02', 'HRBMP-AL-01',
    'HRBMP-CS-02', 'HRBMP-SG-03', 'HRBMP-PK-01',
    'HRBMP-YK-02', 'HRBMP-BT-01', 'HRBMP-CH-02',
    'HRBMP-TZ-03', 'HRBMP-HP-01', 'HRBMP-CW-02'
  ),
  station_name = c(
    'Croton-Haverstraw Nearshore Prototype',
    'Tappan Zee Tributary Mouth Prototype',
    'Kingston Channel Prototype',
    'West Point Deepwater Prototype',
    'Indian Point Mid-channel Prototype',
    'Albany Reach Prototype',
    'Catskill Winter Survey Prototype',
    'Saugerties Shoal Prototype',
    'Poughkeepsie Channel Prototype',
    'Yonkers Nearshore Prototype',
    'Battery Reach Prototype',
    'Croton-Haverstraw Shoreline Prototype',
    'Tappan Zee Open-water Prototype',
    'Hyde Park Nearshore Prototype',
    'Cornwall Backwater Prototype'
  ),
  region = c(
    'Croton-Haverstraw', 'Tappan Zee', 'Kingston',
    'West Point', 'Indian Point', 'Albany',
    'Catskill', 'Saugerties', 'Poughkeepsie',
    'Yonkers', 'Battery', 'Croton-Haverstraw',
    'Tappan Zee', 'Hyde Park', 'Cornwall'
  ),
  river_mile = c(38.6, 25.4, 91.1, 52.8, 42.7, 145.2, 113.6, 103.2, 76.9, 18.7, 2.4, 36.1, 27.8, 82.4, 58.3),
  sample_date = c(
    '2024-06-10', '2025-07-22', '2026-08-12',
    '2024-05-08', '2025-06-18', '2026-09-24',
    '2024-01-18', '2025-02-12', '2026-03-15',
    '2024-05-24', '2025-07-10', '2026-08-30',
    '2024-06-16', '2025-08-26', '2026-09-18'
  ),
  year = c(2024L, 2025L, 2026L, 2024L, 2025L, 2026L, 2024L, 2025L, 2026L, 2024L, 2025L, 2026L, 2024L, 2025L, 2026L),
  month = c(6L, 7L, 8L, 5L, 6L, 9L, 1L, 2L, 3L, 5L, 7L, 8L, 6L, 8L, 9L),
  day = c(10L, 22L, 12L, 8L, 18L, 24L, 18L, 12L, 15L, 24L, 10L, 30L, 16L, 26L, 18L),
  gear_type = c(
    'Beach seine', 'Fyke net', 'Trawl',
    'Trawl', 'Trawl', 'Trawl',
    'Trawl', 'Plankton net', 'Trawl',
    'Beach seine', 'Trawl', 'Beach seine',
    'Trawl', 'Beach seine', 'Beach seine'
  ),
  image_url = rep('', 15),
  source_url = rep('https://you.stonybrook.edu/hrbmp/database/species-highlights/', 15),
  description = c(
    'Pseudo specimen image metadata for a highlighted HRBMP species.',
    'Prototype habitat image record connected to eel sampling metadata.',
    'Pseudo voucher image record for future verified specimen photos.',
    'Pseudo protected-species image metadata for catalog layout testing.',
    'Prototype gear-context record for associating photos with survey events.',
    'Pseudo close-up record for future morphology or QA review images.',
    'Pseudo winter specimen image metadata for a highlighted species.',
    'Prototype habitat record for linking photos to early-season sampling.',
    'Pseudo close-up record for specimen image review workflows.',
    'Pseudo specimen image metadata for a focal HRBMP fish species.',
    'Prototype gear image record for event-linked catalog testing.',
    'Pseudo close-up metadata for future specimen image QA.',
    'Pseudo specimen image record for a common estuarine species.',
    'Prototype habitat image record for station-linked catalog browsing.',
    'Pseudo close-up record for future verified catalog images.'
  ),
  stringsAsFactors = FALSE
)
key_species_names <- c(
  'Atlantic tomcod', 'American shad', 'Striped bass', 'White perch',
  'Bay anchovy', 'Alewife', 'Blueback herring', 'Rainbow smelt',
  'Yellow perch', 'Spottail shiner', 'Bluefish', 'Hogchoker',
  'Atlantic menhaden'
)
all_species_names <- c(
  'Silver lamprey', 'American brook lamprey', 'Sea lamprey', 'Smooth dogfish',
  'Spiny dogfish', 'Little skate', 'Barndoor skate', 'Bluntnose stingray',
  'Shortnose sturgeon', 'Lake sturgeon', 'Atlantic sturgeon', 'Longnose gar',
  'Bowfin', 'American eel', 'Blueback herring', 'Hickory shad', 'Alewife',
  'American shad', 'Atlantic menhaden', 'Atlantic herring', 'Gizzard shad',
  'Bay anchovy', 'Central stoneroller', 'Goldfish', 'Redside dace',
  'Grass carp', 'Satinfin shiner', 'Spotfin shiner', 'Common carp',
  'Cutlips minnow', 'Brassy minnow', 'Eastern silvery minnow',
  'Bridle shiner', 'Ironcolor shiner', 'Common shiner', 'Pearl dace',
  'Hornyhead chub', 'Golden shiner', 'Emerald shiner', 'Blackchin shiner',
  'Blacknose shiner', 'Spottail shiner', 'Bluntnose minnow', 'Fathead minnow',
  'Longnose dace', 'Creek chub', 'Fallfish', 'White sucker',
  'Northern hog sucker', 'Shorthead redhorse', 'White catfish',
  'Yellow bullhead', 'Brown bullhead', 'Channel catfish', 'Stonecat',
  'Tadpole madtom', 'Margined madtom', 'Redfin pickerel', 'Northern pike',
  'Chain pickerel', 'Eastern mudminnow', 'Rainbow smelt', 'Lake whitefish',
  'Rainbow trout', 'Atlantic salmon', 'Brown trout', 'Brook trout',
  'Lake trout', 'Trout-perch', 'Atlantic tomcod', 'Oyster toadfish',
  'Atlantic needlefish', 'Banded killifish', 'Mummichog', 'Striped killifish',
  'Brook silverside', 'Atlantic silverside', 'Fourspine stickleback',
  'Threespine stickleback', 'Lined seahorse', 'Northern pipefish',
  'Northern sea robin', 'Striped sea robin', 'Longhorn sculpin', 'White perch',
  'Striped bass', 'Black sea bass', 'Mud sunfish', 'Rock bass',
  'Redbreast sunfish', 'Pumpkinseed', 'Bluegill', 'Smallmouth bass',
  'Largemouth bass', 'Black crappie', 'Tessellated darter', 'Yellow perch',
  'Walleye', 'Bluefish', 'Weakfish', 'Spot', 'Atlantic croaker',
  'Black drum', 'Striped mullet', 'Tautog', 'Cunner', 'Naked goby',
  'Atlantic mackerel', 'Butterfish', 'Summer flounder', 'Winter flounder',
  'Windowpane', 'Hogchoker', 'Northern puffer'
)
scientific_name_lookup <- c(
  'Atlantic tomcod' = 'Microgadus tomcod',
  'American shad' = 'Alosa sapidissima',
  'Striped bass' = 'Morone saxatilis',
  'White perch' = 'Morone americana',
  'Bay anchovy' = 'Anchoa mitchilli',
  'Alewife' = 'Alosa pseudoharengus',
  'Blueback herring' = 'Alosa aestivalis',
  'Rainbow smelt' = 'Osmerus mordax',
  'Yellow perch' = 'Perca flavescens',
  'Spottail shiner' = 'Notropis hudsonius',
  'Bluefish' = 'Pomatomus saltatrix',
  'Hogchoker' = 'Trinectes maculatus',
  'Atlantic menhaden' = 'Brevoortia tyrannus',
  'Atlantic sturgeon' = 'Acipenser oxyrinchus oxyrinchus',
  'American eel' = 'Anguilla rostrata'
)
life_stage_distribution <- data.frame(
  stage_code = c('EGG', 'YSL', 'PYSL', 'YOY', 'YRL', 'ADULT'),
  life_stage = c('Egg', 'Yolk-sac larvae', 'Post-yolk-sac larvae', 'Young of the year', 'Yearling', 'Adult'),
  image_type = c('Egg image', 'Yolk-sac larvae image', 'Post-yolk-sac larvae image', 'Young-of-the-year image', 'Yearling image', 'Adult image'),
  station_id = c('HRBMP-AL-01', 'HRBMP-CS-02', 'HRBMP-PK-01', 'HRBMP-CH-02', 'HRBMP-TZ-03', 'HRBMP-BT-01'),
  station_name = c(
    'Albany Spawning Reach Prototype',
    'Catskill Larval Drift Prototype',
    'Poughkeepsie Nursery Drift Prototype',
    'Croton-Haverstraw Nearshore Nursery Prototype',
    'Tappan Zee Open-water Yearling Prototype',
    'Battery Adult Survey Prototype'
  ),
  region = c('Albany', 'Catskill', 'Poughkeepsie', 'Croton-Haverstraw', 'Tappan Zee', 'Battery'),
  river_mile = c(145.2, 113.6, 76.9, 36.1, 27.8, 2.4),
  sample_date = c('2026-04-28', '2026-05-12', '2026-06-02', '2026-07-21', '2026-09-18', '2026-10-06'),
  year = c(2026L, 2026L, 2026L, 2026L, 2026L, 2026L),
  month = c(4L, 5L, 6L, 7L, 9L, 10L),
  day = c(28L, 12L, 2L, 21L, 18L, 6L),
  gear_type = c('Ichthyoplankton net', 'Ichthyoplankton net', 'Ichthyoplankton net', 'Beach seine', 'Trawl', 'Trawl'),
  stringsAsFactors = FALSE
)
make_prefix <- function(name) {
  paste0(substr(strsplit(name, '[[:space:]]+')[[1]], 1, 1), collapse = '')
}
sampling_image_catalog <- do.call(rbind, lapply(seq_along(all_species_names), function(i) {
  species <- all_species_names[[i]]
  key_rank <- match(tolower(species), tolower(key_species_names))
  is_key <- !is.na(key_rank)
  scientific <- scientific_name_lookup[[species]]
  if (is.null(scientific) || is.na(scientific)) scientific <- 'Scientific name pending'
  rows <- life_stage_distribution
  rows$catalog_id <- sprintf('IMG-%s-%s-2026-%02d', toupper(substr(make_prefix(species), 1, 6)), rows$stage_code, seq_len(nrow(rows)))
  rows$highlight_rank <- if (is_key) key_rank else 1000L + i
  rows$is_key_species <- is_key
  rows$species_common <- species
  rows$species_scientific <- scientific
  rows$image_count <- 1L
  rows$image_url <- ''
  rows$source_url <- 'https://you.stonybrook.edu/hrbmp/database/species-highlights/'
  rows$description <- sprintf('%s placeholder image metadata and prototype distribution point for %s.', rows$life_stage, species)
  rows[, c(
    'catalog_id', 'highlight_rank', 'is_key_species', 'species_common',
    'species_scientific', 'image_type', 'image_count', 'life_stage',
    'station_id', 'station_name', 'region', 'river_mile', 'sample_date',
    'year', 'month', 'day', 'gear_type', 'image_url', 'source_url',
    'description'
  )]
}))
counts <- list(
  stations = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM stations')$n[[1]],
  sampling_events = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM sampling_events')$n[[1]],
  taxa = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM taxa')$n[[1]],
  observations = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM observations')$n[[1]]
)

payload <- list(
  generated_at_utc = format(Sys.time(), tz = 'UTC', usetz = TRUE),
  note = '',
  counts = counts,
  stations = stations,
  sampling_events = sampling_events,
  annual_total_abundance = annual,
  taxa_totals = taxa_totals,
  environmental_summary = env_summary,
  biological_availability = list(),
  environmental_availability = list(),
  map_data_files = list(
    biological_availability = bio_geojson_path,
    environmental_availability = env_geojson_path
  ),
  sampling_image_catalog = sampling_image_catalog
)

jsonlite::write_json(payload, out_path, pretty = TRUE, auto_unbox = TRUE)
message(sprintf('Wrote: %s', out_path))

rows_to_geojson <- function(df, lon_col = 'longitude', lat_col = 'latitude') {
  if (nrow(df) == 0) {
    return(list(type = 'FeatureCollection', features = list()))
  }

  features <- lapply(seq_len(nrow(df)), function(i) {
    row <- df[i, , drop = FALSE]
    lon <- as.numeric(row[[lon_col]])
    lat <- as.numeric(row[[lat_col]])
    properties <- as.list(row[, setdiff(names(row), c(lon_col, lat_col)), drop = FALSE])

    list(
      type = 'Feature',
      geometry = list(
        type = 'Point',
        coordinates = list(lon, lat)
      ),
      properties = properties
    )
  })

  list(type = 'FeatureCollection', features = features)
}

jsonlite::write_json(rows_to_geojson(biological_availability), bio_geojson_path, pretty = TRUE, auto_unbox = TRUE)
message(sprintf('Wrote: %s', bio_geojson_path))

jsonlite::write_json(rows_to_geojson(environmental_availability), env_geojson_path, pretty = TRUE, auto_unbox = TRUE)
message(sprintf('Wrote: %s', env_geojson_path))
