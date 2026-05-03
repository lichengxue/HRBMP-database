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

if (!file.exists(db_path)) stop(sprintf('Database not found: %s', db_path))

con <- DBI::dbConnect(RSQLite::SQLite(), dbname = db_path)
on.exit(DBI::dbDisconnect(con), add = TRUE)

stations <- DBI::dbGetQuery(con, 'SELECT station_id, station_name, river_mile, latitude, longitude, region FROM stations ORDER BY station_id')
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
counts <- list(
  stations = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM stations')$n[[1]],
  sampling_events = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM sampling_events')$n[[1]],
  taxa = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM taxa')$n[[1]],
  observations = DBI::dbGetQuery(con, 'SELECT COUNT(*) AS n FROM observations')$n[[1]]
)

payload <- list(
  generated_at_utc = format(Sys.time(), tz = 'UTC', usetz = TRUE),
  note = 'Fake placeholder data for prototype testing only. Replace with official HRBMP data later.',
  counts = counts,
  stations = stations,
  annual_total_abundance = annual,
  taxa_totals = taxa_totals,
  environmental_summary = env_summary
)

jsonlite::write_json(payload, out_path, pretty = TRUE, auto_unbox = TRUE)
message(sprintf('Wrote: %s', out_path))
