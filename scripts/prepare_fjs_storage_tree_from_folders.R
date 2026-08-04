# Prepare a 2017-style FJS archive package from raw sample folders.
#
# This script does not connect to Supabase and does not need any API key.
# It scans local sample folders such as:
#   C:/Users/liche/Desktop/supa_data/98_20180703_0071
#
# It prepares a package shaped like data/processed/FJS_2017_sample:
#   data/processed/FJS_storage_upload_ready/
#     storage_upload_ready/
#       samples/<sample_id>/<asset_kind>/<file>
#       README_upload_instructions.txt
#       upload_ready_manifest.csv
#       upload_ready_copy_log.csv
#     supabase_import/
#       README.md
#       asset_manifest_qc.txt
#       fjs_assets_review.csv
#       fjs_representative_specimens_review.csv
#
# Example from the repository root:
#   Rscript scripts/prepare_fjs_storage_tree_from_folders.R
#
# Optional:
#   Rscript scripts/prepare_fjs_storage_tree_from_folders.R --samples 98_20180703_0071,98_20181022_1745
#   Rscript scripts/prepare_fjs_storage_tree_from_folders.R --input C:/Users/liche/Desktop/supa_data --output data/processed/FJS_storage_upload_ready

default_input_root <- "C:/Users/liche/Desktop/supa_data"
default_output_root <- "data/processed/FJS_storage_upload_ready"
bucket_name <- "fjs-archive"

parse_args <- function(args) {
  values <- list(
    input = default_input_root,
    output = default_output_root,
    samples = "all",
    overwrite = TRUE
  )

  i <- 1
  while (i <= length(args)) {
    key <- args[[i]]
    value <- if (i < length(args)) args[[i + 1]] else NA_character_

    if (key == "--input") {
      values$input <- value
      i <- i + 2
    } else if (key == "--output") {
      values$output <- value
      i <- i + 2
    } else if (key == "--samples") {
      values$samples <- value
      i <- i + 2
    } else if (key == "--no-overwrite") {
      values$overwrite <- FALSE
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

normalize_for_csv <- function(path) {
  normalize_slash(normalizePath(path, winslash = "/", mustWork = FALSE))
}

relative_to_repo <- function(path) {
  path_norm <- normalize_for_csv(path)
  cwd_norm <- normalize_for_csv(getwd())
  prefix <- paste0(cwd_norm, "/")
  if (startsWith(path_norm, prefix)) {
    return(sub(prefix, "", path_norm, fixed = TRUE))
  }
  path_norm
}

file_extension <- function(path) {
  name <- basename(path)
  if (!grepl("\\.", name)) return("")
  tolower(sub("^.*\\.([^.]+)$", "\\1", name))
}

file_stem <- function(path) {
  sub("\\.[^.]*$", "", basename(path))
}

mime_type_for <- function(path) {
  ext <- file_extension(path)
  if (ext %in% c("jpg", "jpeg")) return("image/jpeg")
  if (ext == "png") return("image/png")
  if (ext %in% c("tif", "tiff")) return("image/tiff")
  if (ext == "pdf") return("application/pdf")
  "application/octet-stream"
}

is_image_file <- function(path) {
  file_extension(path) %in% c("jpg", "jpeg", "png", "tif", "tiff")
}

is_pdf_file <- function(path) {
  file_extension(path) == "pdf"
}

sample_id_from_folder <- function(path) {
  basename(normalizePath(path, winslash = "/", mustWork = FALSE))
}

sheet_code_from_first_token <- function(token) {
  token <- toupper(token)
  if (grepl("^J\\d+$", token)) return(token)
  if (grepl("^\\d+$", token)) return(sprintf("J%02d", as.integer(token)))
  token
}

integer_or_na <- function(value) {
  parsed <- suppressWarnings(as.integer(value))
  if (is.na(parsed)) return(NA_integer_)
  parsed
}

two_digit_or_na <- function(value) {
  parsed <- integer_or_na(value)
  if (is.na(parsed)) return(NA_character_)
  sprintf("%02d", parsed)
}

image_view_from_token <- function(token) {
  token <- two_digit_or_na(token)
  if (is.na(token)) return(NA_character_)
  if (token == "01") return("left_side")
  if (token == "02") return("right_side")
  if (token == "03") return("top_down")
  if (token == "04") return("bottom_up")
  paste0("view_", token)
}

notes_for_kind <- function(asset_kind) {
  if (asset_kind == "jar_label_image") return("Sample jar label image.")
  if (asset_kind == "field_sheet_pdf") return("Field sheet PDF for this sample.")
  if (asset_kind == "lab_sheet_pdf") return("Lab sheet PDF for this sample.")
  ""
}

sha256_file <- function(path) {
  if (requireNamespace("digest", quietly = TRUE)) {
    return(tolower(digest::digest(file = path, algo = "sha256")))
  }

  if (.Platform$OS.type == "windows") {
    output <- suppressWarnings(system2(
      "certutil",
      c("-hashfile", normalizePath(path, winslash = "\\", mustWork = TRUE), "SHA256"),
      stdout = TRUE,
      stderr = TRUE
    ))
    hash <- grep("^[0-9A-Fa-f]{64}$", trimws(output), value = TRUE)
    if (length(hash) > 0) return(tolower(hash[[1]]))
  }

  NA_character_
}

classify_file <- function(path, sample_id) {
  name <- basename(path)
  stem <- file_stem(name)
  lower_stem <- tolower(stem)
  lower_sample <- tolower(sample_id)

  if (is_pdf_file(path) && grepl(paste0("^", lower_sample, "_sc\\d+$"), lower_stem)) {
    sheet <- toupper(sub(paste0("^", lower_sample, "_"), "", lower_stem))
    return(list(
      asset_kind = "field_sheet_pdf",
      taxon_code = NA_integer_,
      life_stage_code = NA_character_,
      specimen_number = NA_integer_,
      orientation_code = NA_character_,
      orientation_name = NA_character_,
      image_view = NA_character_,
      source_sequence = NA_integer_,
      sheet_code = sheet
    ))
  }

  if (is_pdf_file(path) && grepl(paste0("^", lower_sample, "_lw\\d+$"), lower_stem)) {
    sheet <- toupper(sub(paste0("^", lower_sample, "_"), "", lower_stem))
    return(list(
      asset_kind = "lab_sheet_pdf",
      taxon_code = NA_integer_,
      life_stage_code = NA_character_,
      specimen_number = NA_integer_,
      orientation_code = NA_character_,
      orientation_name = NA_character_,
      image_view = NA_character_,
      source_sequence = NA_integer_,
      sheet_code = sheet
    ))
  }

  if (!is_image_file(path)) {
    return(NULL)
  }

  prefix <- paste0(sample_id, "_")
  remainder <- sub(paste0("^", prefix), "", stem)
  lower_remainder <- tolower(remainder)

  if (grepl("^(j)?\\d{2}$", lower_remainder)) {
    first_token <- sub("^j", "", lower_remainder)
    return(list(
      asset_kind = "jar_label_image",
      taxon_code = NA_integer_,
      life_stage_code = NA_character_,
      specimen_number = NA_integer_,
      orientation_code = NA_character_,
      orientation_name = NA_character_,
      image_view = NA_character_,
      source_sequence = NA_integer_,
      sheet_code = sheet_code_from_first_token(first_token)
    ))
  }

  parts <- strsplit(remainder, "_", fixed = TRUE)[[1]]
  sheet_code <- if (length(parts) >= 1) sheet_code_from_first_token(parts[[1]]) else NA_character_
  taxon_code <- if (length(parts) >= 2) integer_or_na(parts[[2]]) else NA_integer_
  life_stage_code <- if (length(parts) >= 3) two_digit_or_na(parts[[3]]) else NA_character_
  specimen_number <- if (length(parts) >= 4) integer_or_na(parts[[4]]) else NA_integer_
  orientation_code <- if (length(parts) >= 5) two_digit_or_na(parts[[5]]) else NA_character_
  source_sequence <- if (length(parts) >= 6) integer_or_na(parts[[6]]) else NA_integer_
  orientation_name <- image_view_from_token(orientation_code)

  list(
    asset_kind = "representative_species_image",
    taxon_code = taxon_code,
    life_stage_code = life_stage_code,
    specimen_number = specimen_number,
    orientation_code = orientation_code,
    orientation_name = orientation_name,
    image_view = orientation_name,
    source_sequence = source_sequence,
    sheet_code = sheet_code
  )
}

args <- parse_args(commandArgs(trailingOnly = TRUE))

if (!dir.exists(args$input)) {
  stop("Input folder does not exist: ", args$input)
}

output_root <- normalizePath(args$output, winslash = "/", mustWork = FALSE)
storage_ready_dir <- file.path(output_root, "storage_upload_ready")
storage_samples_dir <- file.path(storage_ready_dir, "samples")
supabase_import_dir <- file.path(output_root, "supabase_import")

sample_dirs <- list.dirs(args$input, recursive = FALSE, full.names = TRUE)
sample_dirs <- sample_dirs[grepl("^98_\\d{8}_\\d{4}$", basename(sample_dirs))]

if (!identical(tolower(args$samples), "all")) {
  requested_samples <- trimws(strsplit(args$samples, ",", fixed = TRUE)[[1]])
  sample_dirs <- sample_dirs[basename(sample_dirs) %in% requested_samples]
}

if (length(sample_dirs) == 0) {
  stop("No matching sample folders found.")
}

sample_dirs <- sample_dirs[order(basename(sample_dirs))]

rows <- data.frame(
  asset_id = character(),
  sample_id = character(),
  sample_taxon_id = character(),
  representative_id = character(),
  taxon_code_for_review = integer(),
  asset_kind = character(),
  storage_bucket = character(),
  storage_object_path = character(),
  original_file_name = character(),
  local_source_path = character(),
  mime_type = character(),
  file_size_bytes = numeric(),
  sha256 = character(),
  life_stage_code = character(),
  specimen_number = integer(),
  orientation_code = character(),
  orientation_name = character(),
  image_view = character(),
  source_sequence = integer(),
  sheet_code = character(),
  access_level = character(),
  notes = character(),
  prepared_local_path = character(),
  stringsAsFactors = FALSE
)

copy_log <- data.frame(
  sample_id = character(),
  asset_kind = character(),
  source = character(),
  destination = character(),
  status = character(),
  stringsAsFactors = FALSE
)

skipped_files <- data.frame(
  sample_id = character(),
  source = character(),
  reason = character(),
  stringsAsFactors = FALSE
)

for (sample_dir in sample_dirs) {
  sample_id <- sample_id_from_folder(sample_dir)
  files <- list.files(sample_dir, recursive = FALSE, full.names = TRUE)
  files <- files[file.info(files)$isdir == FALSE]
  files <- files[order(basename(files))]

  for (source_path in files) {
    info <- classify_file(source_path, sample_id)
    if (is.null(info)) {
      skipped_files <- rbind(
        skipped_files,
        data.frame(
          sample_id = sample_id,
          source = normalize_for_csv(source_path),
          reason = "Not an expected FJS image or sheet PDF filename.",
          stringsAsFactors = FALSE
        )
      )
      next
    }

    original_file_name <- basename(source_path)
    storage_object_path <- normalize_slash(file.path(
      "samples",
      sample_id,
      info$asset_kind,
      original_file_name
    ))
    prepared_local_path <- file.path(storage_ready_dir, storage_object_path)

    dir.create(dirname(prepared_local_path), recursive = TRUE, showWarnings = FALSE)
    copied <- file.copy(
      from = source_path,
      to = prepared_local_path,
      overwrite = args$overwrite,
      copy.date = TRUE
    )

    rows <- rbind(
      rows,
      data.frame(
        asset_id = "",
        sample_id = sample_id,
        sample_taxon_id = "",
        representative_id = "",
        taxon_code_for_review = info$taxon_code,
        asset_kind = info$asset_kind,
        storage_bucket = bucket_name,
        storage_object_path = storage_object_path,
        original_file_name = original_file_name,
        local_source_path = normalize_for_csv(source_path),
        mime_type = mime_type_for(source_path),
        file_size_bytes = file.info(source_path)$size,
        sha256 = sha256_file(source_path),
        life_stage_code = info$life_stage_code,
        specimen_number = info$specimen_number,
        orientation_code = info$orientation_code,
        orientation_name = info$orientation_name,
        image_view = info$image_view,
        source_sequence = info$source_sequence,
        sheet_code = info$sheet_code,
        access_level = "private",
        notes = notes_for_kind(info$asset_kind),
        prepared_local_path = relative_to_repo(prepared_local_path),
        stringsAsFactors = FALSE
      )
    )

    copy_log <- rbind(
      copy_log,
      data.frame(
        sample_id = sample_id,
        asset_kind = info$asset_kind,
        source = normalize_for_csv(source_path),
        destination = normalize_for_csv(prepared_local_path),
        status = if (isTRUE(copied)) "copied" else "copy_failed",
        stringsAsFactors = FALSE
      )
    )
  }
}

if (nrow(rows) == 0) {
  stop("No image/PDF archive files were classified.")
}

duplicate_paths <- rows$storage_object_path[duplicated(rows$storage_object_path)]
if (length(duplicate_paths) > 0) {
  stop(
    "Duplicate Supabase Storage object paths found:\n",
    paste(unique(duplicate_paths), collapse = "\n")
  )
}

dir.create(storage_ready_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(supabase_import_dir, recursive = TRUE, showWarnings = FALSE)

write.csv(rows, file.path(storage_ready_dir, "upload_ready_manifest.csv"), row.names = FALSE, na = "")
write.csv(copy_log, file.path(storage_ready_dir, "upload_ready_copy_log.csv"), row.names = FALSE, na = "")

assets_review <- rows[, c(
  "asset_id",
  "sample_id",
  "sample_taxon_id",
  "representative_id",
  "taxon_code_for_review",
  "asset_kind",
  "storage_bucket",
  "storage_object_path",
  "original_file_name",
  "local_source_path",
  "mime_type",
  "file_size_bytes",
  "sha256",
  "life_stage_code",
  "specimen_number",
  "orientation_code",
  "orientation_name",
  "image_view",
  "source_sequence",
  "sheet_code",
  "access_level",
  "notes"
)]
write.csv(assets_review, file.path(supabase_import_dir, "fjs_assets_review.csv"), row.names = FALSE, na = "")

representative_rows <- rows[
  rows$asset_kind == "representative_species_image" & !is.na(rows$taxon_code_for_review),
  c("sample_id", "taxon_code_for_review")
]
representative_rows <- unique(representative_rows)
if (nrow(representative_rows) > 0) {
  representative_rows <- representative_rows[order(representative_rows$sample_id, representative_rows$taxon_code_for_review), ]
  representative_review <- data.frame(
    representative_id = "",
    sample_taxon_id = "",
    sample_id = representative_rows$sample_id,
    taxon_code = representative_rows$taxon_code_for_review,
    representative_label = paste0(
      representative_rows$sample_id,
      "_taxon_",
      sprintf("%03d", representative_rows$taxon_code_for_review)
    ),
    notes = "Review against processed metadata before database import.",
    stringsAsFactors = FALSE
  )
} else {
  representative_review <- data.frame(
    representative_id = character(),
    sample_taxon_id = character(),
    sample_id = character(),
    taxon_code = integer(),
    representative_label = character(),
    notes = character(),
    stringsAsFactors = FALSE
  )
}
write.csv(
  representative_review,
  file.path(supabase_import_dir, "fjs_representative_specimens_review.csv"),
  row.names = FALSE,
  na = ""
)

sample_lines <- paste0(
  "- ",
  normalize_slash(file.path("storage_upload_ready", "samples", unique(rows$sample_id)))
)

instructions <- c(
  "FJS Supabase Storage manual upload instructions",
  "",
  "This folder was prepared by scripts/prepare_fjs_storage_tree_from_folders.R.",
  "No Supabase API key or secret key was used.",
  "",
  "Target Supabase Storage bucket:",
  paste0("- ", bucket_name),
  "",
  "Important:",
  "- The Storage paths must match the database column fjs_assets.storage_object_path.",
  "- Do not rename the folders or files after this script prepares them.",
  "- This package was prepared from image/PDF folders only. Processed sample and count metadata still need their own CSV import package.",
  "",
  "Option A: upload one sample folder",
  "1. In Supabase, open Storage.",
  paste0("2. Open the bucket named ", bucket_name, "."),
  "3. Create or open a folder named samples.",
  "4. Upload one prepared sample folder, for example 98_20180703_0071.",
  "",
  "Prepared sample folder(s):",
  sample_lines,
  "",
  "Option B: upload everything prepared here",
  "1. In Supabase, open Storage.",
  paste0("2. Open the bucket named ", bucket_name, "."),
  "3. Upload the folder named samples from this prepared output folder.",
  "",
  "After upload, object paths should look like:",
  "- samples/98_20180703_0071/jar_label_image/98_20180703_0071_01.JPG",
  "- samples/98_20180703_0071/field_sheet_pdf/98_20180703_0071_SC1.pdf",
  "",
  "Outputs:",
  "- upload_ready_manifest.csv",
  "- upload_ready_copy_log.csv"
)
writeLines(instructions, file.path(storage_ready_dir, "README_upload_instructions.txt"))

kind_counts <- as.data.frame(table(rows$asset_kind), stringsAsFactors = FALSE)
names(kind_counts) <- c("asset_kind", "count")

sample_kind_counts <- as.data.frame(table(rows$sample_id, rows$asset_kind), stringsAsFactors = FALSE)
names(sample_kind_counts) <- c("sample_id", "asset_kind", "count")
sample_kind_counts <- sample_kind_counts[sample_kind_counts$count > 0, ]

required_kinds <- c("jar_label_image", "field_sheet_pdf", "lab_sheet_pdf")
missing_required <- data.frame(sample_id = character(), missing_asset_kind = character(), stringsAsFactors = FALSE)
for (sample_id in unique(rows$sample_id)) {
  sample_rows <- rows[rows$sample_id == sample_id, , drop = FALSE]
  for (required_kind in required_kinds) {
    if (!any(sample_rows$asset_kind == required_kind)) {
      missing_required <- rbind(
        missing_required,
        data.frame(sample_id = sample_id, missing_asset_kind = required_kind, stringsAsFactors = FALSE)
      )
    }
  }
}

qc_lines <- c(
  "FJS storage package QC",
  "",
  paste0("Input folder: ", normalize_for_csv(args$input)),
  paste0("Output package: ", normalize_for_csv(output_root)),
  paste0("Storage bucket: ", bucket_name),
  paste0("Sample folders scanned: ", length(unique(rows$sample_id))),
  paste0("Archive assets classified: ", nrow(rows)),
  paste0("Files copied: ", sum(copy_log$status == "copied")),
  "",
  "Asset kind counts:"
)

qc_lines <- c(qc_lines, paste0("- ", kind_counts$asset_kind, ": ", kind_counts$count))
qc_lines <- c(qc_lines, "", "Per-sample asset counts:")
for (sample_id in unique(rows$sample_id)) {
  sample_counts <- sample_kind_counts[sample_kind_counts$sample_id == sample_id, ]
  summary <- paste0(sample_counts$asset_kind, "=", sample_counts$count, collapse = "; ")
  qc_lines <- c(qc_lines, paste0("- ", sample_id, ": ", summary))
}

if (nrow(missing_required) > 0) {
  qc_lines <- c(qc_lines, "", "Missing expected sample-level files:")
  qc_lines <- c(qc_lines, paste0("- ", missing_required$sample_id, ": ", missing_required$missing_asset_kind))
} else {
  qc_lines <- c(qc_lines, "", "Missing expected sample-level files: none")
}

if (nrow(representative_review) > 0) {
  qc_lines <- c(qc_lines, "", "Representative specimen groups inferred from filenames:")
  qc_lines <- c(qc_lines, paste0("- ", representative_review$representative_label))
}

if (nrow(skipped_files) > 0) {
  qc_lines <- c(qc_lines, "", "Skipped files:")
  qc_lines <- c(qc_lines, paste0("- ", skipped_files$sample_id, ": ", basename(skipped_files$source), " (", skipped_files$reason, ")"))
} else {
  qc_lines <- c(qc_lines, "", "Skipped files: none")
}

writeLines(qc_lines, file.path(supabase_import_dir, "asset_manifest_qc.txt"))

import_readme <- c(
  "# FJS Storage Upload Ready Package",
  "",
  "Generated by `scripts/prepare_fjs_storage_tree_from_folders.R`.",
  "",
  "This package mirrors the folder shape used by `data/processed/FJS_2017_sample`, but it was generated from image and PDF folders only.",
  "",
  "## Storage Upload",
  "",
  paste0("Upload `storage_upload_ready/samples` into the Supabase Storage bucket `", bucket_name, "`."),
  "The resulting object paths should begin with `samples/<sample_id>/...`.",
  "",
  "## Review Files",
  "",
  "- `fjs_assets_review.csv` lists every image/PDF asset and the intended Storage path.",
  "- `fjs_representative_specimens_review.csv` lists representative sample/taxon groups inferred from filenames.",
  "- `asset_manifest_qc.txt` summarizes counts and possible missing files.",
  "",
  "## Important Database Note",
  "",
  "These review CSV files are not a full direct database import. Direct import into `fjs_assets` requires matching rows in `fjs_samples` and, for representative fish images, matching `fjs_sample_taxa` and `fjs_representative_specimens` IDs from the processed metadata.",
  "",
  "Once the processed metadata CSV for these samples is available, generate/import the sample, taxon, and count tables first, then use this asset review file to connect the uploaded image/PDF records."
)
writeLines(import_readme, file.path(supabase_import_dir, "README.md"))

failed <- copy_log[copy_log$status != "copied", , drop = FALSE]

cat("\nPrepared FJS storage upload ready package\n")
cat("-----------------------------------------\n")
cat("Input:    ", normalize_for_csv(args$input), "\n", sep = "")
cat("Output:   ", normalize_for_csv(output_root), "\n", sep = "")
cat("Samples:  ", length(unique(rows$sample_id)), "\n", sep = "")
cat("Assets:   ", nrow(rows), "\n", sep = "")
cat("Copied:   ", sum(copy_log$status == "copied"), "\n", sep = "")

cat("\nAsset kinds:\n")
print(table(rows$asset_kind))

if (nrow(failed) > 0) {
  cat("\nProblems:\n")
  print(failed, row.names = FALSE)
  stop("Some files were not copied. See storage_upload_ready/upload_ready_copy_log.csv.")
}

cat("\nPrepared folder structure:\n")
cat(normalize_for_csv(file.path(output_root, "storage_upload_ready")), "\n")
cat(normalize_for_csv(file.path(output_root, "supabase_import")), "\n")

cat("\nNext step:\n")
cat("Open Supabase Storage bucket 'fjs-archive' and upload this folder inside the bucket:\n")
cat(normalize_for_csv(storage_samples_dir), "\n")
