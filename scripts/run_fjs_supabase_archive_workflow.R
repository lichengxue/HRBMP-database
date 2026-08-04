# Run the local FJS archive preparation workflow.
#
# This is the main "one command" workflow for preparing a Supabase archive
# package from:
# - a processed abundance/count metadata CSV, and
# - raw sample folders containing jar labels, representative fish images,
#   field sheets, and lab sheets.
#
# It does not connect to Supabase and does not need any API key.
#
# Example from the repository root:
#   Rscript scripts/run_fjs_supabase_archive_workflow.R --raw-root C:/Users/liche/Desktop/supa_data --metadata-csv C:/Users/liche/Downloads/FJS_2018_10sample.csv --output-root data/processed/FJS_storage_upload_ready --batch-name FJS_2018_10sample

default_raw_root <- "C:/Users/liche/Desktop/supa_data"
default_metadata_csv <- "C:/Users/liche/Downloads/FJS_2018_10sample.csv"
default_output_root <- "data/processed/FJS_storage_upload_ready"
default_data_dictionary <- "data/raw/FJS_2017_sample/FJS_data_dictionary.xlsx"
default_batch_name <- "FJS_archive_batch"
default_access_level <- "private"

parse_args <- function(args) {
  values <- list(
    raw_root = default_raw_root,
    metadata_csv = default_metadata_csv,
    output_root = default_output_root,
    data_dictionary = default_data_dictionary,
    batch_name = default_batch_name,
    access_level = default_access_level,
    python = "",
    skip_storage_ready = FALSE
  )

  i <- 1
  while (i <= length(args)) {
    key <- args[[i]]
    value <- if (i < length(args)) args[[i + 1]] else NA_character_

    if (key == "--raw-root") {
      values$raw_root <- value
      i <- i + 2
    } else if (key == "--metadata-csv") {
      values$metadata_csv <- value
      i <- i + 2
    } else if (key == "--output-root") {
      values$output_root <- value
      i <- i + 2
    } else if (key == "--data-dictionary") {
      values$data_dictionary <- value
      i <- i + 2
    } else if (key == "--batch-name") {
      values$batch_name <- value
      i <- i + 2
    } else if (key == "--access-level") {
      values$access_level <- value
      i <- i + 2
    } else if (key == "--python") {
      values$python <- value
      i <- i + 2
    } else if (key == "--skip-storage-ready") {
      values$skip_storage_ready <- TRUE
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

csv_row_count <- function(path) {
  if (!file.exists(path)) {
    return(NA_integer_)
  }
  nrow(read.csv(path, stringsAsFactors = FALSE, check.names = FALSE))
}

args <- parse_args(commandArgs(trailingOnly = TRUE))

if (!dir.exists(args$raw_root)) {
  stop("Raw sample folder does not exist: ", args$raw_root)
}
if (!file.exists(args$metadata_csv)) {
  stop("Metadata CSV does not exist: ", args$metadata_csv)
}
if (!file.exists(args$data_dictionary)) {
  stop("Data dictionary does not exist: ", args$data_dictionary)
}

python <- find_python(args$python)
if (!nzchar(python) || !file.exists(python)) {
  stop("Cannot find Python. Pass --python C:/path/to/python.exe")
}

output_root <- args$output_root
source_metadata_dir <- file.path(output_root, "source_metadata")
supabase_import_dir <- file.path(output_root, "supabase_import")
storage_ready_dir <- file.path(output_root, "storage_upload_ready")
metadata_copy <- file.path(source_metadata_dir, "processed_counts_by_sample_taxon.csv")

dir.create(source_metadata_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(supabase_import_dir, recursive = TRUE, showWarnings = FALSE)

metadata_copied <- file.copy(args$metadata_csv, metadata_copy, overwrite = TRUE, copy.date = TRUE)
if (!isTRUE(metadata_copied)) {
  stop("Failed to copy metadata CSV to: ", metadata_copy)
}

build_args <- c(
  "scripts/build_fjs_archive_manifest.py",
  "--source-root", args$raw_root,
  "--processed-csv", metadata_copy,
  "--data-dictionary", args$data_dictionary,
  "--output-dir", supabase_import_dir,
  "--batch-name", args$batch_name,
  "--access-level", args$access_level
)
run_checked(python, build_args, "Building Supabase import CSVs")

if (!isTRUE(args$skip_storage_ready)) {
  rscript <- file.path(R.home("bin"), if (.Platform$OS.type == "windows") "Rscript.exe" else "Rscript")
  storage_args <- c(
    "scripts/prepare_fjs_storage_upload.R",
    "--manifest", file.path(supabase_import_dir, "fjs_assets.csv"),
    "--output", storage_ready_dir,
    "all"
  )
  run_checked(rscript, storage_args, "Preparing Supabase Storage upload folder")
}

import_files <- c(
  "fjs_import_batches.csv",
  "fjs_samples.csv",
  "fjs_taxa.csv",
  "fjs_sample_taxa.csv",
  "fjs_representative_specimens.csv",
  "fjs_assets.csv",
  "fjs_variable_dictionary.csv",
  "fjs_variable_code_options.csv"
)

counts <- data.frame(
  file = import_files,
  rows = vapply(file.path(supabase_import_dir, import_files), csv_row_count, integer(1)),
  stringsAsFactors = FALSE
)

storage_file_count <- NA_integer_
if (dir.exists(file.path(storage_ready_dir, "samples"))) {
  storage_file_count <- length(list.files(file.path(storage_ready_dir, "samples"), recursive = TRUE, full.names = TRUE))
}

summary_lines <- c(
  "FJS Supabase archive workflow summary",
  "",
  paste0("Raw sample folder: ", normalize_for_log(args$raw_root)),
  paste0("Input metadata CSV: ", normalize_for_log(args$metadata_csv)),
  paste0("Copied metadata CSV: ", normalize_for_log(metadata_copy)),
  paste0("Output package: ", normalize_for_log(output_root)),
  paste0("Batch name: ", args$batch_name),
  paste0("Access level: ", args$access_level),
  "",
  "Generated import CSV row counts:"
)
summary_lines <- c(summary_lines, paste0("- ", counts$file, ": ", counts$rows))
summary_lines <- c(
  summary_lines,
  "",
  paste0("Storage-ready file count: ", ifelse(is.na(storage_file_count), "not prepared", storage_file_count)),
  "",
  "Supabase manual import order:",
  "1. fjs_import_batches.csv",
  "2. fjs_samples.csv",
  "3. fjs_taxa.csv",
  "4. fjs_sample_taxa.csv",
  "5. fjs_representative_specimens.csv",
  "6. fjs_assets.csv",
  "7. fjs_variable_dictionary.csv",
  "8. fjs_variable_code_options.csv",
  "",
  "Storage upload folder:",
  normalize_for_log(file.path(storage_ready_dir, "samples")),
  "",
  "QC file:",
  normalize_for_log(file.path(supabase_import_dir, "asset_manifest_qc.txt"))
)

writeLines(summary_lines, file.path(output_root, "workflow_run_summary.txt"))

cat("\nWorkflow complete\n")
cat("-----------------\n")
cat("Output package: ", normalize_for_log(output_root), "\n", sep = "")
cat("Import CSVs:    ", normalize_for_log(supabase_import_dir), "\n", sep = "")
cat("Storage folder: ", normalize_for_log(file.path(storage_ready_dir, "samples")), "\n", sep = "")
cat("Summary file:   ", normalize_for_log(file.path(output_root, "workflow_run_summary.txt")), "\n", sep = "")
cat("\nGenerated import row counts:\n")
print(counts, row.names = FALSE)
