# Prepare a local upload folder for FJS archive files.
#
# This script does not connect to Supabase and does not need any API key.
# It copies files listed in fjs_assets.csv into the same folder structure used
# by the Supabase Storage object paths.
#
# Example from the repository root:
#   Rscript scripts/prepare_fjs_storage_upload.R 98_20171023_1592
#   Rscript scripts/prepare_fjs_storage_upload.R --manifest data/processed/FJS_storage_upload_ready/supabase_import/fjs_assets.csv --output data/processed/FJS_storage_upload_ready/storage_upload_ready all
#
# Then upload the prepared folder in Supabase Dashboard > Storage > fjs-archive.

default_manifest_path <- "data/processed/FJS_2017_sample/supabase_import/fjs_assets.csv"
default_output_root <- "data/processed/FJS_2017_sample/storage_upload_ready"

parse_args <- function(args) {
  values <- list(
    manifest = default_manifest_path,
    output = default_output_root,
    overwrite = TRUE,
    samples = character()
  )

  i <- 1
  while (i <= length(args)) {
    key <- args[[i]]
    value <- if (i < length(args)) args[[i + 1]] else NA_character_

    if (key == "--manifest") {
      values$manifest <- value
      i <- i + 2
    } else if (key == "--output") {
      values$output <- value
      i <- i + 2
    } else if (key == "--no-overwrite") {
      values$overwrite <- FALSE
      i <- i + 1
    } else {
      values$samples <- c(values$samples, key)
      i <- i + 1
    }
  }

  values
}

parsed_args <- parse_args(commandArgs(trailingOnly = TRUE))
manifest_path <- parsed_args$manifest
output_root <- parsed_args$output
overwrite_existing <- parsed_args$overwrite
sample_ids <- parsed_args$samples

if (!file.exists(manifest_path)) {
  stop(
    "Cannot find manifest: ", manifest_path, "\n",
    "Run this script from the HRBMP-database repository root."
  )
}

assets <- read.csv(
  manifest_path,
  stringsAsFactors = FALSE,
  na.strings = c("", "NA")
)

required_columns <- c(
  "sample_id",
  "asset_kind",
  "storage_object_path",
  "original_file_name",
  "local_source_path"
)
missing_columns <- setdiff(required_columns, names(assets))
if (length(missing_columns) > 0) {
  stop("Manifest is missing columns: ", paste(missing_columns, collapse = ", "))
}

if (length(sample_ids) == 0 || identical(tolower(sample_ids), "all")) {
  selected_assets <- assets
} else {
  selected_assets <- assets[assets$sample_id %in% sample_ids, , drop = FALSE]
}

if (nrow(selected_assets) == 0) {
  stop(
    "No assets found for sample id(s): ",
    if (length(sample_ids) == 0) "all" else paste(sample_ids, collapse = ", ")
  )
}

duplicate_paths <- unique(
  selected_assets$storage_object_path[duplicated(selected_assets$storage_object_path)]
)
if (length(duplicate_paths) > 0) {
  stop(
    "The manifest contains duplicate storage_object_path values:\n",
    paste(duplicate_paths, collapse = "\n")
  )
}

dir.create(output_root, recursive = TRUE, showWarnings = FALSE)

copy_results <- data.frame(
  sample_id = character(),
  asset_kind = character(),
  source = character(),
  destination = character(),
  status = character(),
  stringsAsFactors = FALSE
)

for (i in seq_len(nrow(selected_assets))) {
  row <- selected_assets[i, ]
  source_path <- row$local_source_path
  storage_parts <- strsplit(row$storage_object_path, "/", fixed = TRUE)[[1]]
  destination_path <- do.call(file.path, as.list(c(output_root, storage_parts)))

  if (!file.exists(source_path)) {
    copy_results <- rbind(
      copy_results,
      data.frame(
        sample_id = row$sample_id,
        asset_kind = row$asset_kind,
        source = source_path,
        destination = destination_path,
        status = "missing_source",
        stringsAsFactors = FALSE
      )
    )
    next
  }

  dir.create(dirname(destination_path), recursive = TRUE, showWarnings = FALSE)
  copied <- file.copy(
    from = source_path,
    to = destination_path,
    overwrite = overwrite_existing,
    copy.date = TRUE
  )

  copy_results <- rbind(
    copy_results,
    data.frame(
      sample_id = row$sample_id,
      asset_kind = row$asset_kind,
      source = source_path,
      destination = destination_path,
      status = if (isTRUE(copied)) "copied" else "copy_failed",
      stringsAsFactors = FALSE
    )
  )
}

selected_assets$prepared_local_path <- file.path(
  output_root,
  vapply(
    strsplit(selected_assets$storage_object_path, "/", fixed = TRUE),
    function(parts) do.call(file.path, as.list(parts)),
    character(1)
  )
)

write.csv(
  selected_assets,
  file.path(output_root, "upload_ready_manifest.csv"),
  row.names = FALSE
)
write.csv(
  copy_results,
  file.path(output_root, "upload_ready_copy_log.csv"),
  row.names = FALSE
)

sample_folder_lines <- paste0(
  "- ",
  file.path(output_root, "samples", unique(selected_assets$sample_id))
)

example_sample_id <- unique(selected_assets$sample_id)[1]
example_path_lines <- paste0(
  "- ",
  head(selected_assets$storage_object_path, 2)
)

instructions <- c(
  "FJS Supabase Storage manual upload instructions",
  "",
  "This folder was prepared by scripts/prepare_fjs_storage_upload.R.",
  "No Supabase API key or secret key was used.",
  "",
  "Target Supabase Storage bucket:",
  "- fjs-archive",
  "",
  "Important:",
  "- The Storage paths must match the database column fjs_assets.storage_object_path.",
  "- Do not rename the folders or files after this script prepares them.",
  "",
  "Option A: upload one sample folder",
  "1. In Supabase, open Storage.",
  "2. Open the bucket named fjs-archive.",
  "3. Create or open a folder named samples.",
  paste0("4. Upload the prepared sample folder, for example ", example_sample_id, "."),
  "",
  "Prepared sample folder(s):",
  sample_folder_lines,
  "",
  "Option B: upload everything prepared here",
  "1. In Supabase, open Storage.",
  "2. Open the bucket named fjs-archive.",
  "3. Upload the folder named samples from this prepared output folder.",
  "",
  "After upload, object paths should look like:",
  example_path_lines
)
writeLines(instructions, file.path(output_root, "README_upload_instructions.txt"))

failed <- copy_results[copy_results$status != "copied", , drop = FALSE]

cat("\nPrepared FJS Storage upload folder\n")
cat("----------------------------------\n")
cat("Manifest: ", manifest_path, "\n", sep = "")
cat("Output:   ", normalizePath(output_root, winslash = "/", mustWork = FALSE), "\n", sep = "")
cat("Assets:   ", nrow(selected_assets), "\n", sep = "")
cat("Copied:   ", sum(copy_results$status == "copied"), "\n", sep = "")

if (nrow(failed) > 0) {
  cat("Problems: ", nrow(failed), "\n\n", sep = "")
  print(failed[, c("sample_id", "asset_kind", "source", "status")], row.names = FALSE)
  stop("Some files were not prepared. See upload_ready_copy_log.csv.")
}

cat("\nNext step:\n")
cat("Open Supabase Storage bucket fjs-archive. To upload one sample, open/create the 'samples' folder first, then upload this folder:\n")
cat(normalizePath(file.path(output_root, "samples", unique(selected_assets$sample_id)[1]), winslash = "/", mustWork = FALSE), "\n")
if (length(unique(selected_assets$sample_id)) > 1) {
  cat("There are multiple samples prepared; see README_upload_instructions.txt for the full list.\n")
}
