#!/usr/bin/env Rscript

# R/Plumber API server for the HRBMP GUI.
# Run with: Rscript api/server.R

required_packages <- c('plumber', 'DBI', 'RSQLite')
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop(sprintf(
    'Missing packages: %s\nInstall with install.packages(c(%s))',
    paste(missing_packages, collapse = ', '),
    paste(sprintf('"%s"', missing_packages), collapse = ', ')
  ))
}

args <- commandArgs(trailingOnly = FALSE)
file_arg <- args[grepl('^--file=', args)]
script_path <- if (length(file_arg) > 0) {
  normalizePath(sub('^--file=', '', file_arg[[1]]), winslash = '/', mustWork = TRUE)
} else {
  candidate_paths <- c('api/server.R', 'server.R')
  existing_path <- candidate_paths[file.exists(candidate_paths)][[1]]
  normalizePath(existing_path, winslash = '/', mustWork = TRUE)
}

root <- normalizePath(file.path(dirname(script_path), '..'), winslash = '/', mustWork = TRUE)
db_path <- file.path(root, 'database', 'hrbmp.sqlite')
host <- '127.0.0.1'
port <- 8010
max_limit <- 10000L

biological_sql <- "
SELECT
  o.observation_id,
  se.event_id,
  se.sample_date,
  se.year,
  se.month,
  CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
  se.program,
  se.gear_type,
  se.sampling_depth_m,
  s.station_id,
  s.station_name,
  s.region,
  s.river_mile,
  s.latitude,
  s.longitude,
  t.taxon_id,
  t.common_name,
  t.scientific_name,
  t.taxonomic_group,
  t.life_stage,
  o.count,
  o.abundance,
  o.abundance_unit,
  o.preserved_specimen_count
FROM observations o
JOIN sampling_events se ON se.event_id = o.event_id
JOIN stations s ON s.station_id = se.station_id
JOIN taxa t ON t.taxon_id = o.taxon_id
"

environmental_sql <- "
SELECT
  eo.env_id,
  se.event_id,
  se.sample_date,
  se.year,
  se.month,
  CAST(strftime('%d', se.sample_date) AS INTEGER) AS day,
  se.program,
  se.gear_type,
  se.sampling_depth_m,
  s.station_id,
  s.station_name,
  s.region,
  s.river_mile,
  s.latitude,
  s.longitude,
  eo.temperature_c,
  eo.salinity_psu,
  eo.dissolved_oxygen_mg_l,
  eo.turbidity_ntu,
  eo.chlorophyll_a
FROM environmental_observations eo
JOIN sampling_events se ON se.event_id = eo.event_id
JOIN stations s ON s.station_id = se.station_id
"

connect <- function() {
  if (!file.exists(db_path)) {
    stop(sprintf('SQLite database not found: %s. Run scripts/01_create_database.R and scripts/02_load_example_data.R first.', db_path))
  }
  DBI::dbConnect(RSQLite::SQLite(), dbname = db_path)
}

first_value <- function(query, name) {
  value <- query[[name]]
  if (is.null(value) || length(value) == 0 || is.na(value[[1]])) return('')
  trimws(as.character(value[[1]]))
}

int_value <- function(query, name) {
  value <- first_value(query, name)
  if (!nzchar(value) || tolower(value) == 'all') return(NULL)
  parsed <- suppressWarnings(as.integer(value))
  if (is.na(parsed)) NULL else parsed
}

add_text_filter <- function(where, params, column, value) {
  if (nzchar(value) && tolower(value) != 'all') {
    where <- c(where, sprintf('LOWER(%s) = LOWER(?)', column))
    params <- c(params, value)
  }
  list(where = where, params = params)
}

add_range_filter <- function(where, params, column, start, end) {
  if (!is.null(start) && !is.null(end) && start > end) {
    tmp <- start
    start <- end
    end <- tmp
  }
  if (!is.null(start)) {
    where <- c(where, sprintf('%s >= ?', column))
    params <- c(params, start)
  }
  if (!is.null(end)) {
    where <- c(where, sprintf('%s <= ?', column))
    params <- c(params, end)
  }
  list(where = where, params = params)
}

pagination <- function(query) {
  limit <- int_value(query, 'limit')
  offset <- int_value(query, 'offset')
  if (is.null(limit)) limit <- 1000L
  if (is.null(offset)) offset <- 0L
  list(limit = max(1L, min(as.integer(limit), max_limit)), offset = max(0L, as.integer(offset)))
}

biological_query <- function(query) {
  where <- character()
  params <- list()

  species <- first_value(query, 'species')
  if (nzchar(species) && tolower(species) != 'all') {
    where <- c(where, '(LOWER(t.common_name) = LOWER(?) OR LOWER(t.scientific_name) = LOWER(?))')
    params <- c(params, species, species)
  }

  result <- add_text_filter(where, params, 't.life_stage', first_value(query, 'life_stage'))
  result <- add_text_filter(result$where, result$params, 'se.program', first_value(query, 'program'))
  result <- add_text_filter(result$where, result$params, 's.region', first_value(query, 'region'))
  result <- add_range_filter(result$where, result$params, 'se.year', int_value(query, 'year_start'), int_value(query, 'year_end'))
  result <- add_range_filter(result$where, result$params, 'se.month', int_value(query, 'month_start'), int_value(query, 'month_end'))
  result <- add_range_filter(result$where, result$params, "CAST(strftime('%d', se.sample_date) AS INTEGER)", int_value(query, 'day_start'), int_value(query, 'day_end'))

  sql <- biological_sql
  if (length(result$where) > 0) {
    sql <- paste(sql, 'WHERE', paste(result$where, collapse = ' AND '))
  }
  sql <- paste(sql, 'ORDER BY se.sample_date, s.river_mile, t.common_name, o.observation_id')
  list(sql = sql, params = result$params)
}

environmental_query <- function(query) {
  where <- character()
  params <- list()

  result <- add_text_filter(where, params, 'se.program', first_value(query, 'program'))
  result <- add_text_filter(result$where, result$params, 's.region', first_value(query, 'region'))
  result <- add_range_filter(result$where, result$params, 'se.year', int_value(query, 'year_start'), int_value(query, 'year_end'))
  result <- add_range_filter(result$where, result$params, 'se.month', int_value(query, 'month_start'), int_value(query, 'month_end'))
  result <- add_range_filter(result$where, result$params, "CAST(strftime('%d', se.sample_date) AS INTEGER)", int_value(query, 'day_start'), int_value(query, 'day_end'))

  sql <- environmental_sql
  if (length(result$where) > 0) {
    sql <- paste(sql, 'WHERE', paste(result$where, collapse = ' AND '))
  }
  sql <- paste(sql, 'ORDER BY se.sample_date, s.river_mile, eo.env_id')
  list(sql = sql, params = result$params)
}

rows_for <- function(query_parts, query) {
  page <- pagination(query)
  con <- connect()
  on.exit(DBI::dbDisconnect(con), add = TRUE)
  DBI::dbGetQuery(
    con,
    paste(query_parts$sql, 'LIMIT ? OFFSET ?'),
    params = c(query_parts$params, page$limit, page$offset)
  )
}

filter_values <- function() {
  con <- connect()
  on.exit(DBI::dbDisconnect(con), add = TRUE)
  list(
    species = DBI::dbGetQuery(con, 'SELECT DISTINCT common_name FROM taxa WHERE common_name IS NOT NULL ORDER BY common_name')[[1]],
    life_stages = DBI::dbGetQuery(con, 'SELECT DISTINCT life_stage FROM taxa WHERE life_stage IS NOT NULL ORDER BY life_stage')[[1]],
    programs = DBI::dbGetQuery(con, 'SELECT DISTINCT program FROM sampling_events WHERE program IS NOT NULL ORDER BY program')[[1]],
    regions = DBI::dbGetQuery(con, 'SELECT DISTINCT region FROM stations WHERE region IS NOT NULL ORDER BY region')[[1]],
    years = DBI::dbGetQuery(con, 'SELECT DISTINCT year FROM sampling_events WHERE year IS NOT NULL ORDER BY year')[[1]],
    months = DBI::dbGetQuery(con, 'SELECT DISTINCT month FROM sampling_events WHERE month IS NOT NULL ORDER BY month')[[1]]
  )
}

metadata_payload <- function() {
  con <- connect()
  on.exit(DBI::dbDisconnect(con), add = TRUE)
  list(
    datasets = DBI::dbGetQuery(con, "
      SELECT dataset_id, dataset_name, domain_id, source_database, default_access_level, api_endpoint, description
      FROM dataset_catalog
      ORDER BY dataset_name
    "),
    variables = DBI::dbGetQuery(con, "
      SELECT variable_id, domain_id, source_database, variable_name, display_name, unit, value_type, public_description
      FROM data_variables
      ORDER BY domain_id, source_database, display_name
    "),
    programs = DBI::dbGetQuery(con, "
      SELECT program_id, program_name, program_type, start_year, end_year, default_access_level, description
      FROM monitoring_programs
      ORDER BY program_type, program_name
    "),
    regions = DBI::dbGetQuery(con, "
      SELECT region_code, region_number, region_name, river_mile_start, river_mile_end, display_order, notes
      FROM hrbmp_regions
      ORDER BY display_order
    "),
    sources = DBI::dbGetQuery(con, "
      SELECT source_id, source_name, file_name, contact, institution, date_added, notes
      FROM metadata_sources
      ORDER BY date_added DESC, source_name
    "),
    access_levels = DBI::dbGetQuery(con, "
      SELECT access_level_id, display_name, sort_order, login_required, manual_approval_required, description
      FROM access_levels
      ORDER BY sort_order
    "),
    roles = DBI::dbGetQuery(con, "
      SELECT role_id, display_name, role_rank, login_required, description
      FROM roles
      ORDER BY role_rank
    "),
    dataset_access_policy = DBI::dbGetQuery(con, "
      SELECT
        p.dataset_id,
        d.dataset_name,
        p.access_level_id,
        a.display_name AS access_level_name,
        p.release_status,
        p.contains_sensitive_data,
        p.embargo_until,
        p.public_metadata_allowed,
        p.public_map_allowed,
        p.notes
      FROM dataset_access_policy p
      JOIN dataset_catalog d ON d.dataset_id = p.dataset_id
      JOIN access_levels a ON a.access_level_id = p.access_level_id
      ORDER BY d.dataset_name
    "),
    dataset_role_permissions = DBI::dbGetQuery(con, "
      SELECT
        rp.dataset_id,
        d.dataset_name,
        rp.role_id,
        r.display_name AS role_name,
        rp.can_view_metadata,
        rp.can_view_map,
        rp.can_download_summary,
        rp.can_download_record_level,
        rp.can_request_access,
        rp.can_manage_metadata,
        rp.can_manage_users,
        rp.can_download_full_database
      FROM dataset_role_permissions rp
      JOIN dataset_catalog d ON d.dataset_id = rp.dataset_id
      JOIN roles r ON r.role_id = rp.role_id
      ORDER BY d.dataset_name, r.role_rank
    ")
  )
}

csv_text <- function(records) {
  if (nrow(records) == 0) return('')
  paste(capture.output(utils::write.csv(records, row.names = FALSE, na = '')), collapse = '\n')
}

set_csv_headers <- function(res, filename) {
  res$setHeader('Content-Type', 'text/csv; charset=utf-8')
  res$setHeader('Content-Disposition', sprintf('attachment; filename="%s"', filename))
  invisible(res)
}

router <- plumber::pr()

router <- plumber::pr_filter(router, 'cors', function(req, res) {
  res$setHeader('Access-Control-Allow-Origin', '*')
  res$setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res$setHeader('Access-Control-Allow-Headers', 'Content-Type')
  plumber::forward()
})

router <- plumber::pr_get(router, '/', function(res) {
  res$status <- 302
  res$setHeader('Location', '/gui/')
  ''
})

router <- plumber::pr_static(router, '/gui', file.path(root, 'gui'))

router <- plumber::pr_get(router, '/api/health', function() {
  list(status = 'ok', database = db_path, database_exists = file.exists(db_path), server = 'R plumber')
})

router <- plumber::pr_get(router, '/api/filters', function() {
  filter_values()
})

router <- plumber::pr_get(router, '/api/metadata', function() {
  metadata_payload()
})

router <- plumber::pr_get(router, '/api/metadata/datasets', function() {
  list(datasets = metadata_payload()$datasets)
})

router <- plumber::pr_get(router, '/api/metadata/variables', function() {
  list(variables = metadata_payload()$variables)
})

router <- plumber::pr_get(router, '/api/metadata/programs', function() {
  list(programs = metadata_payload()$programs)
})

router <- plumber::pr_get(router, '/api/metadata/regions', function() {
  list(regions = metadata_payload()$regions)
})

router <- plumber::pr_get(router, '/api/metadata/sources', function() {
  list(sources = metadata_payload()$sources)
})

router <- plumber::pr_get(router, '/api/access-policy', function() {
  metadata <- metadata_payload()
  list(
    access_levels = metadata$access_levels,
    roles = metadata$roles,
    dataset_access_policy = metadata$dataset_access_policy,
    dataset_role_permissions = metadata$dataset_role_permissions
  )
})

router <- plumber::pr_get(router, '/api/biological-records', function(req) {
  records <- rows_for(biological_query(req$argsQuery), req$argsQuery)
  list(count = nrow(records), records = records)
})

router <- plumber::pr_get(
  router,
  '/api/biological-records.csv',
  function(req, res) {
    records <- rows_for(biological_query(req$argsQuery), req$argsQuery)
    set_csv_headers(res, 'hrbmp_biological_records.csv')
    csv_text(records)
  },
  serializer = plumber::serializer_text()
)

router <- plumber::pr_get(router, '/api/environmental-records', function(req) {
  records <- rows_for(environmental_query(req$argsQuery), req$argsQuery)
  list(count = nrow(records), records = records)
})

router <- plumber::pr_get(
  router,
  '/api/environmental-records.csv',
  function(req, res) {
    records <- rows_for(environmental_query(req$argsQuery), req$argsQuery)
    set_csv_headers(res, 'hrbmp_environmental_records.csv')
    csv_text(records)
  },
  serializer = plumber::serializer_text()
)

message(sprintf('HRBMP R API and GUI server running at http://%s:%s/gui/', host, port))
message(sprintf('API health check: http://%s:%s/api/health', host, port))
plumber::pr_run(router, host = host, port = port)
