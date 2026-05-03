#!/usr/bin/env Rscript

# Create the prototype SQLite database from schema.sql.

required_packages <- c('DBI', 'RSQLite')
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop(sprintf('Missing packages: %s\nInstall with install.packages(c(%s))',
               paste(missing_packages, collapse = ', '),
               paste(sprintf('"%s"', missing_packages), collapse = ', ')))
}

message('Starting database creation...')

db_path <- 'database/hrbmp.sqlite'
schema_path <- 'database/schema.sql'

if (!file.exists(schema_path)) {
  stop(sprintf('Schema file not found: %s', schema_path))
}

con <- DBI::dbConnect(RSQLite::SQLite(), dbname = db_path)
on.exit(DBI::dbDisconnect(con), add = TRUE)

schema_sql <- paste(readLines(schema_path, warn = FALSE), collapse = '\n')
DBI::dbExecute(con, schema_sql)

message(sprintf('Database created or updated at: %s', db_path))
message('Done.')
