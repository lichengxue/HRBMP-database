# Unzip and merge FJS sample folders using only the R packages installed with R.
# Source this file from your R code, then call merge_fjs_sample_zips().
# The original ZIPs are retained. Only this function's extraction folder is removed.

merge_fjs_sample_zips <- function(zip_dir, output_dir, zip_pattern = "\\.zip$",
                                  expected_parts = NULL) {
  if (!dir.exists(zip_dir)) stop("ZIP folder does not exist: ", zip_dir)
  if (file.exists(output_dir)) stop("Output already exists. Choose a new output folder: ", output_dir)
  zip_dir <- normalizePath(zip_dir, winslash = "/", mustWork = TRUE)
  archives <- sort(list.files(zip_dir, pattern = zip_pattern, full.names = TRUE,
                             ignore.case = TRUE))
  archives <- archives[!file.info(archives)$isdir]
  if (!length(archives)) stop("No ZIP files match the pattern in: ", zip_dir)
  if (!is.null(expected_parts)) {
    if (length(expected_parts) != 1L || is.na(expected_parts) ||
        expected_parts < 1L || expected_parts != as.integer(expected_parts)) {
      stop("expected_parts must be a positive whole number.")
    }
    if (length(archives) != expected_parts) {
      stop("Expected ", expected_parts, " ZIP parts, found ", length(archives),
           ". Check that all downloads are complete.")
    }
    part_pattern <- "-[0-9]{3}\\.zip$"
    if (all(grepl(part_pattern, basename(archives), ignore.case = TRUE))) {
      groups <- sub(part_pattern, "", basename(archives), ignore.case = TRUE)
      numbers <- as.integer(sub(".*-([0-9]{3})\\.zip$", "\\1",
                                basename(archives), ignore.case = TRUE))
      if (length(unique(groups)) != 1L || !identical(sort(numbers), seq_len(expected_parts))) {
        stop("The selected ZIPs must be parts 001 through ",
             sprintf("%03d", expected_parts), " of the same download.")
      }
    }
  }

  temporary_parent <- normalizePath(tempdir(), winslash = "/", mustWork = TRUE)
  extraction_root <- tempfile("fjs-merge-", tmpdir = temporary_parent)
  if (!dir.create(extraction_root)) stop("Cannot create temporary extraction folder.")
  extraction_root <- normalizePath(extraction_root, winslash = "/", mustWork = TRUE)
  on.exit({
    # Resolve and check the exact generated target before recursive deletion.
    target <- normalizePath(extraction_root, winslash = "/", mustWork = FALSE)
    parent <- normalizePath(dirname(target), winslash = "/", mustWork = TRUE)
    if (identical(parent, temporary_parent) && startsWith(basename(target), "fjs-merge-")) {
      unlink(target, recursive = TRUE, force = TRUE)
    } else {
      warning("Unexpected temporary path; not removed: ", target)
    }
  }, add = TRUE)

  records <- list()
  ignored_files <- 0L
  for (i in seq_along(archives)) {
    archive <- archives[[i]]
    message("Unzipping part ", i, "/", length(archives), ": ", basename(archive))
    entries <- utils::unzip(archive, list = TRUE)
    names_in_zip <- gsub("\\\\", "/", entries$Name)
    if (any(grepl("^/|(^|/)\\.\\.(/|$)|:", names_in_zip))) {
      stop("ZIP contains an unsafe path: ", basename(archive))
    }
    member_files <- names_in_zip[!grepl("/$", names_in_zip)]
    if (anyDuplicated(tolower(member_files))) {
      stop("ZIP repeats a filename internally; review it before merging: ", basename(archive))
    }
    part_dir <- file.path(extraction_root, sprintf("part-%03d", i))
    dir.create(part_dir)
    withCallingHandlers(
      utils::unzip(archive, exdir = part_dir, unzip = "internal"),
      warning = function(w) stop("Cannot completely extract ", basename(archive),
                                  ": ", conditionMessage(w), call. = FALSE)
    )
    part_dir <- normalizePath(part_dir, winslash = "/", mustWork = TRUE)
    extracted <- file.path(part_dir, names_in_zip)
    file_entries <- !grepl("/$", names_in_zip)
    extracted_info <- file.info(extracted[file_entries])
    if (any(is.na(extracted_info$size)) ||
        any(extracted_info$size != entries$Length[file_entries])) {
      stop("Missing or incomplete extracted files in: ", basename(archive))
    }
    sample_dirs <- list.dirs(part_dir, recursive = TRUE, full.names = TRUE)
    sample_dirs <- sample_dirs[grepl("^[0-9]+_[0-9]{8}_[0-9]+$", basename(sample_dirs))]
    sample_dirs <- sample_dirs[!grepl("(^|/)__MACOSX(/|$)", sample_dirs)]
    part_used <- character()
    for (sample_dir in sample_dirs) {
      files <- list.files(sample_dir, recursive = TRUE, full.names = TRUE, all.files = TRUE)
      files <- files[!file.info(files)$isdir]
      files <- files[!startsWith(basename(files), ".")]
      if (!length(files)) next
      files <- normalizePath(files, winslash = "/", mustWork = TRUE)
      if (any(files %in% part_used)) stop("Nested sample ID folders are ambiguous: ", sample_dir)
      part_used <- c(part_used, files)
      records[[length(records) + 1L]] <- data.frame(
        source_archive = archive,
        archive_member = substring(files, nchar(part_dir) + 2L),
        sample_id = basename(sample_dir),
        file_name = basename(files),
        source = files,
        size_bytes = file.info(files)$size,
        md5 = unname(tools::md5sum(files)),
        stringsAsFactors = FALSE
      )
    }
    ignored_files <- ignored_files + sum(file_entries) - length(part_used)
  }
  if (!length(records)) stop("No files found inside FJS sample ID folders.")
  rows <- do.call(rbind, records)
  if (anyNA(rows$md5)) stop("Cannot calculate checksums for all extracted files.")
  key <- tolower(paste(rows$sample_id, rows$file_name, sep = "/"))
  first <- match(key, key)
  conflicts <- which(rows$md5 != rows$md5[first] | rows$size_bytes != rows$size_bytes[first])
  if (length(conflicts)) {
    i <- conflicts[[1]]
    stop("Conflicting contents for ", rows$sample_id[[i]], "/", rows$file_name[[i]],
         " in ", basename(rows$source_archive[[first[[i]]]]), " and ",
         basename(rows$source_archive[[i]]), ". Output was not created.")
  }
  rows$status <- ifelse(duplicated(key), "duplicate_identical", "copied")
  rows$merged_path <- paste(rows$sample_id, rows$file_name[first], sep = "/")
  selected <- which(!duplicated(key))
  if (!dir.create(output_dir, recursive = TRUE)) stop("Cannot create output folder: ", output_dir)
  output_dir <- normalizePath(output_dir, winslash = "/", mustWork = TRUE)
  for (sample_id in unique(rows$sample_id)) {
    dir.create(file.path(output_dir, sample_id), showWarnings = FALSE)
  }
  destinations <- file.path(output_dir, rows$merged_path[selected])
  copied <- file.copy(rows$source[selected], destinations, overwrite = FALSE, copy.date = TRUE)
  if (!all(copied)) stop("Some output files could not be copied. Partial output retained: ", output_dir)
  verified <- unname(tools::md5sum(destinations))
  if (anyNA(verified) || any(verified != rows$md5[selected])) {
    stop("Output checksum verification failed. Partial output retained: ", output_dir)
  }
  log <- rows[, setdiff(names(rows), "source"), drop = FALSE]
  write.csv(log, file.path(output_dir, "source_merge_log.csv"), row.names = FALSE)
  summary <- c(
    paste0("ZIP folder: ", zip_dir),
    paste0("ZIP parts: ", length(archives)),
    paste0("Merged folder: ", output_dir),
    paste0("Sample folders: ", length(unique(rows$sample_id))),
    paste0("Merged files: ", length(selected)),
    paste0("Identical duplicate files skipped: ", sum(duplicated(key))),
    paste0("Ignored files (hidden metadata or outside sample ID folders): ", ignored_files),
    paste0("Saved file checksums verified: ", length(verified), " (MD5)"),
    "Original ZIPs retained. Temporary extraction cleaned up when the function returns."
  )
  writeLines(summary, file.path(output_dir, "merge_summary.txt"))
  cat(paste(summary, collapse = "\n"), "\n")
  invisible(output_dir)
}

fjs_zip_merge_main <- function(args) {
  values <- list(zip_dir = NULL, output_dir = NULL, zip_pattern = "\\.zip$", expected_parts = NULL)
  flags <- c("--zip-dir" = "zip_dir", "--output-root" = "output_dir",
             "--zip-pattern" = "zip_pattern", "--expected-parts" = "expected_parts")
  if (!length(args) || "--help" %in% args) {
    cat("Rscript scripts/merge_fjs_sample_zips.R --zip-dir FOLDER --output-root NEW_FOLDER",
        "[--zip-pattern REGEX] [--expected-parts 3]\n")
    return(invisible(NULL))
  }
  if (length(args) %% 2L != 0L) stop("Every argument must have a value.")
  for (i in seq.int(1L, length(args), by = 2L)) {
    if (!args[[i]] %in% names(flags)) stop("Unknown argument: ", args[[i]])
    values[[flags[[args[[i]]]]]] <- args[[i + 1L]]
  }
  if (is.null(values$zip_dir) || is.null(values$output_dir)) {
    stop("--zip-dir and --output-root are required.")
  }
  if (!is.null(values$expected_parts)) values$expected_parts <- as.numeric(values$expected_parts)
  do.call(merge_fjs_sample_zips, values)
}

if (sys.nframe() == 0L) fjs_zip_merge_main(commandArgs(trailingOnly = TRUE))
