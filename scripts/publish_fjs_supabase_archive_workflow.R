# Publish a prepared FJS archive package to Supabase.
#
# This is the optional "push to Supabase" companion to
# scripts/run_fjs_supabase_archive_workflow.R.
#
# It reads the generated supabase_import CSVs and fjs_assets.csv, then:
# - upserts database rows in the correct foreign-key order, and
# - uploads image/PDF objects to Supabase Storage.
#
# Default mode is a dry run. Add --apply to write to Supabase.
#
# Required for --apply:
# - Set SUPABASE_SERVICE_ROLE_KEY in the current terminal session.
# - Do not put that key in GitHub, R scripts, CSV files, or chat.
#
# Example dry run:
#   Rscript scripts/publish_fjs_supabase_archive_workflow.R --supabase-url https://vnqulddrlhkftcqpekpl.supabase.co
#
# Example real publish:
#   Sys.setenv(SUPABASE_SERVICE_ROLE_KEY = "paste-real-secret-key-here")
#   Rscript scripts/publish_fjs_supabase_archive_workflow.R --supabase-url https://vnqulddrlhkftcqpekpl.supabase.co --apply --upsert-storage

default_output_root <- "data/processed/FJS_storage_upload_ready"
default_supabase_url <- "https://vnqulddrlhkftcqpekpl.supabase.co"
default_bucket <- "fjs-archive"
default_key_env <- "SUPABASE_SERVICE_ROLE_KEY"

parse_args <- function(args) {
  values <- list(
    supabase_url = default_supabase_url,
    output_root = default_output_root,
    bucket = default_bucket,
    key_env = default_key_env,
    python = "",
    apply = FALSE,
    upsert_storage = FALSE,
    skip_tables = FALSE,
    skip_storage = FALSE
  )

  i <- 1
  while (i <= length(args)) {
    key <- args[[i]]
    value <- if (i < length(args)) args[[i + 1]] else NA_character_

    if (key == "--supabase-url") {
      values$supabase_url <- value
      i <- i + 2
    } else if (key == "--output-root") {
      values$output_root <- value
      i <- i + 2
    } else if (key == "--bucket") {
      values$bucket <- value
      i <- i + 2
    } else if (key == "--key-env") {
      values$key_env <- value
      i <- i + 2
    } else if (key == "--python") {
      values$python <- value
      i <- i + 2
    } else if (key == "--apply") {
      values$apply <- TRUE
      i <- i + 1
    } else if (key == "--upsert-storage") {
      values$upsert_storage <- TRUE
      i <- i + 1
    } else if (key == "--skip-tables") {
      values$skip_tables <- TRUE
      i <- i + 1
    } else if (key == "--skip-storage") {
      values$skip_storage <- TRUE
      i <- i + 1
    } else {
      stop("Unknown argument: ", key)
    }
  }

  values
}

normalize_slash <- function(path) {
  gsub("\\\\", "/", path)
}

normalize_for_log <- function(path) {
  normalize_slash(normalizePath(path, winslash = "/", mustWork = FALSE))
}

find_python <- function(requested_python) {
  if (nzchar(requested_python)) {
    return(requested_python)
  }

  bundled_python <- "C:/Users/liche/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"
  if (file.exists(bundled_python)) {
    return(bundled_python)
  }

  Sys.which("python")
}

run_checked <- function(command, args, label) {
  cat("\n", label, "\n", sep = "")
  cat(paste(c(command, args), collapse = " "), "\n")
  status <- system2(command, args = args)
  if (!identical(status, 0L)) {
    stop(label, " failed with exit status ", status)
  }
}

args <- parse_args(commandArgs(trailingOnly = TRUE))

python <- find_python(args$python)
if (!nzchar(python) || !file.exists(python)) {
  stop("Cannot find Python. Pass --python C:/path/to/python.exe")
}

supabase_import_dir <- file.path(args$output_root, "supabase_import")
manifest_path <- file.path(supabase_import_dir, "fjs_assets.csv")

if (!dir.exists(supabase_import_dir)) {
  stop("Cannot find import folder: ", supabase_import_dir)
}
if (!file.exists(manifest_path)) {
  stop("Cannot find asset manifest: ", manifest_path)
}

common_apply_arg <- if (isTRUE(args$apply)) "--apply" else character()

if (!isTRUE(args$skip_tables)) {
  table_args <- c(
    "scripts/upload_fjs_supabase_tables.py",
    "--supabase-url", args$supabase_url,
    "--import-dir", supabase_import_dir,
    "--key-env", args$key_env,
    common_apply_arg
  )
  run_checked(python, table_args, "Publishing Supabase database tables")
}

if (!isTRUE(args$skip_storage)) {
  storage_args <- c(
    "scripts/upload_fjs_storage_assets.py",
    "--supabase-url", args$supabase_url,
    "--manifest", manifest_path,
    "--bucket", args$bucket,
    "--key-env", args$key_env,
    common_apply_arg
  )
  if (isTRUE(args$upsert_storage)) {
    storage_args <- c(storage_args, "--upsert")
  }
  run_checked(python, storage_args, "Publishing Supabase Storage assets")
}

cat("\nPublish workflow complete\n")
cat("-------------------------\n")
cat("Mode:        ", ifelse(isTRUE(args$apply), "APPLY", "DRY RUN"), "\n", sep = "")
cat("Supabase:    ", args$supabase_url, "\n", sep = "")
cat("Import CSVs: ", normalize_for_log(supabase_import_dir), "\n", sep = "")
cat("Manifest:    ", normalize_for_log(manifest_path), "\n", sep = "")
cat("Bucket:      ", args$bucket, "\n", sep = "")
