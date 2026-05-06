#!/usr/bin/env Rscript

# Load fake placeholder seed data into the prototype SQLite database.

required_packages <- c('DBI', 'RSQLite')
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop(sprintf('Missing packages: %s\nInstall with install.packages(c(%s))',
               paste(missing_packages, collapse = ', '),
               paste(sprintf('"%s"', missing_packages), collapse = ', ')))
}

message('Loading fake prototype seed data...')

db_path <- 'database/hrbmp.sqlite'
seed_path <- 'database/seed_data.sql'

if (!file.exists(db_path)) stop(sprintf('Database not found: %s. Run scripts/01_create_database.R first.', db_path))
if (!file.exists(seed_path)) stop(sprintf('Seed SQL not found: %s', seed_path))

con <- DBI::dbConnect(RSQLite::SQLite(), dbname = db_path)
on.exit(DBI::dbDisconnect(con), add = TRUE)

seed_sql <- paste(readLines(seed_path, warn = FALSE), collapse = '\n')
seed_statements <- trimws(strsplit(seed_sql, ';', fixed = TRUE)[[1]])
for (statement in seed_statements[nzchar(seed_statements)]) {
  DBI::dbExecute(con, paste0(statement, ';'))
}

tables <- c(
  'stations',
  'sampling_events',
  'taxa',
  'observations',
  'environmental_observations',
  'metadata_sources',
  'data_domains',
  'monitoring_programs',
  'hrbmp_regions',
  'dataset_catalog',
  'data_variables'
)
for (tbl in tables) {
  n <- DBI::dbGetQuery(con, sprintf('SELECT COUNT(*) AS n FROM %s', tbl))$n[[1]]
  message(sprintf('Table %-30s rows: %d', tbl, n))
}

message('Seed data load complete.')
