# Testable local workflow helpers shared by the Shiny server and its worker.
fjs_app_tables <- c(
  "fjs_import_batches", "fjs_samples", "fjs_taxa", "fjs_sample_taxa",
  "fjs_representative_specimens", "fjs_assets", "fjs_variable_dictionary",
  "fjs_variable_code_options"
)

fjs_app_version <- function(repo) {
  version <- trimws(readLines(file.path(repo, "archive_app", "VERSION"), warn = FALSE)[[1]])
  if (!grepl("^[0-9]+[.][0-9]+[.][0-9]+$", version)) stop("Invalid app VERSION file.")
  version
}

fjs_app_upload_progress <- function(current, text) {
  if (is.null(current)) return(NULL)
  for (line in strsplit(text, "\n", fixed = TRUE)[[1]]) {
    if (startsWith(line, "FJS_UPLOAD_PROGRESS ")) {
      value <- tryCatch(jsonlite::fromJSON(substring(line, 21L)), error = function(e) NULL)
      fields <- c("uploaded", "failed", "total")
      if (is.list(value) && all(fields %in% names(value))) {
        numbers <- unlist(value[fields], use.names = FALSE)
        if (is.numeric(numbers) && length(numbers) == 3L && all(is.finite(numbers)) &&
            all(numbers >= 0 & numbers == floor(numbers)) && value$total == current$total &&
            value$uploaded >= current$uploaded && value$failed >= current$failed &&
            value$uploaded + value$failed <= value$total) {
          current <- c(value[fields], list(phase = "upload"))
        }
      }
    }
    if (grepl("Verifying saved database rows and Storage file sizes", line, fixed = TRUE)) current$phase <- "verify"
  }
  current
}

fjs_app_size <- function(bytes) {
  if (bytes >= 1e9) sprintf("%.2f GB", bytes / 1e9)
  else if (bytes >= 1e6) sprintf("%.1f MB", bytes / 1e6)
  else sprintf("%.1f KB", bytes / 1e3)
}

fjs_app_python <- function(repo) {
  requested <- Sys.getenv("FJS_PYTHON", "")
  candidates <- c(requested, file.path(Sys.getenv("USERPROFILE", path.expand("~")),
              ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"),
              unname(Sys.which("python")), unname(Sys.which("python3")))
  candidates <- candidates[!grepl("Microsoft[/\\\\]WindowsApps", candidates, ignore.case = TRUE)]
  candidates <- candidates[nzchar(candidates) & file.exists(candidates)]
  if (length(candidates)) normalizePath(candidates[[1]], winslash = "/", mustWork = TRUE) else ""
}

fjs_app_absolute <- function(path) {
  path <- path.expand(trimws(path))
  if (!nzchar(path)) stop("Choose a folder or file first.")
  path <- as.character(fs::path_abs(path))
  ancestor <- path
  remaining <- character()
  while (!file.exists(ancestor) && !dir.exists(ancestor)) {
    parent <- dirname(ancestor)
    if (identical(parent, ancestor)) stop("Cannot access the selected drive or folder.")
    remaining <- c(basename(ancestor), remaining)
    ancestor <- parent
  }
  resolved <- as.character(fs::path_real(ancestor))
  if (length(remaining)) file.path(resolved, paste(remaining, collapse = "/")) else resolved
}

fjs_app_private_path <- function(path, repo) {
  path <- fjs_app_absolute(path)
  root <- paste0(tolower(normalizePath(repo, winslash = "/", mustWork = TRUE)), "/")
  lower <- tolower(path)
  if (startsWith(lower, root) || identical(lower, sub("/$", "", root))) {
    stop("Choose a local data folder outside the Git repository, such as Desktop/FJS_Archive_Work.")
  }
  ancestor <- path
  repeat {
    if (file.exists(file.path(ancestor, ".git")) || dir.exists(file.path(ancestor, ".git"))) {
      stop("Choose a local data folder outside Git repositories.")
    }
    parent <- dirname(ancestor)
    if (identical(parent, ancestor)) break
    ancestor <- parent
  }
  path
}

fjs_app_work_root <- function(repo, requested = Sys.getenv("FJS_WORK_ROOT", "")) {
  if (is.null(requested) || !nzchar(trimws(requested))) {
    requested <- file.path(Sys.getenv("USERPROFILE", path.expand("~")), "Desktop", "FJS_Archive_Work")
  }
  fjs_app_private_path(requested, repo)
}

fjs_app_subset_fingerprint <- function(cfg) {
  if (is.null(cfg$confidential_csv) || !file.exists(cfg$confidential_csv)) return("")
  dataset <- file.info(cfg$confidential_csv)
  if (identical(cfg$source_mode, "zip")) {
    files <- fjs_app_selected_zips(cfg$source_dir, cfg$zip_group, cfg$expected_parts)
    info <- file.info(files)
    selection <- c(files, info$size, as.numeric(info$mtime))
  } else {
    if (!dir.exists(cfg$source_dir)) return("")
    folders <- list.dirs(cfg$source_dir, recursive = TRUE, full.names = TRUE)
    selection <- sort(folders[grepl("^[0-9]+_[0-9]{8}_[0-9]+$", basename(folders))])
  }
  paste(c("subset-v1", fjs_app_absolute(cfg$confidential_csv), dataset$size,
          as.numeric(dataset$mtime), cfg$source_mode, selection), collapse = "|")
}

fjs_app_extract_subset <- function(cfg, repo) {
  if (is.null(cfg$confidential_csv) || !file.exists(cfg$confidential_csv)) {
    stop("Choose your full local confidential survey CSV.")
  }
  fjs_app_private_path(cfg$confidential_csv, repo)
  fingerprint <- fjs_app_subset_fingerprint(cfg)
  if (!is.null(cfg$subset_csv) && nzchar(cfg$subset_csv) && file.exists(cfg$subset_csv) &&
      !is.null(cfg$subset_report) && file.exists(cfg$subset_report)) {
    cached <- jsonlite::fromJSON(cfg$subset_report)
    external_cache <- tryCatch({
      fjs_app_private_path(cfg$subset_csv, repo)
      fjs_app_private_path(cfg$subset_report, repo)
      TRUE
    }, error = function(e) FALSE)
    if (external_cache && identical(cached$input_fingerprint, fingerprint) &&
        identical(cached$output_csv, cfg$subset_csv) &&
        identical(cached$subset_md5, unname(tools::md5sum(cfg$subset_csv)))) return(cached)
  }
  folder <- file.path(fjs_app_work_root(repo, cfg$work_root), "subsets")
  dir.create(folder, recursive = TRUE, showWarnings = FALSE)
  output <- tempfile("subset-", tmpdir = folder, fileext = ".csv")
  report_path <- paste0(output, ".summary.json")
  args <- c("scripts/extract_fjs_local_subset.py", "--dataset-csv", cfg$confidential_csv,
            "--output-csv", output, "--report", report_path)
  if (identical(cfg$source_mode, "zip")) {
    args <- c(args, "--zip-dir", cfg$source_dir, "--zip-pattern", fjs_app_glob(cfg$zip_group))
  } else {
    args <- c(args, "--raw-root", cfg$source_dir)
  }
  fjs_app_run(cfg$python, args, "Extracting matching rows from the local confidential dataset")
  report <- jsonlite::fromJSON(report_path)
  if (!identical(fingerprint, fjs_app_subset_fingerprint(cfg))) {
    stop("The selected inputs changed during extraction. Extract the subset again.")
  }
  report$input_fingerprint <- fingerprint
  report$report_path <- report_path
  report$subset_md5 <- unname(tools::md5sum(output))
  jsonlite::write_json(report, report_path, auto_unbox = TRUE, pretty = TRUE)
  report
}

fjs_app_zip_groups <- function(folder) {
  if (!dir.exists(folder)) return(data.frame())
  files <- list.files(folder, pattern = "\\.zip$", full.names = TRUE, ignore.case = TRUE)
  files <- files[!file.info(files)$isdir]
  if (!length(files)) return(data.frame())
  prefix <- sub("-[0-9]{3}\\.zip$", "", basename(files), ignore.case = TRUE)
  # A standalone ZIP can also be selected; its whole filename is its key.
  prefix[!grepl("-[0-9]{3}\\.zip$", basename(files), ignore.case = TRUE)] <-
    basename(files)[!grepl("-[0-9]{3}\\.zip$", basename(files), ignore.case = TRUE)]
  groups <- unique(prefix)
  do.call(rbind, lapply(groups, function(group) {
    selected <- files[prefix == group]
    data.frame(key = group, parts = length(selected),
      size_gb = round(sum(file.info(selected)$size) / 1e9, 2),
      label = paste0(group, "  ·  ", length(selected), " ZIP", if (length(selected) > 1) "s" else ""),
      stringsAsFactors = FALSE)
  }))
}

fjs_app_selected_zips <- function(folder, group, expected_parts) {
  if (!dir.exists(folder)) stop("The ZIP folder does not exist.")
  files <- list.files(folder, pattern = "\\.zip$", full.names = TRUE, ignore.case = TRUE)
  prefix <- sub("-[0-9]{3}\\.zip$", "", basename(files), ignore.case = TRUE)
  files <- files[prefix == group | basename(files) == group]
  expected_parts <- as.integer(expected_parts)
  if (is.na(expected_parts) || expected_parts < 1L) stop("Enter the expected number of ZIP parts.")
  if (length(files) != expected_parts) {
    stop("Expected ", expected_parts, " ZIP parts, found ", length(files), ". Check your downloads.")
  }
  if (all(grepl("-[0-9]{3}\\.zip$", basename(files), ignore.case = TRUE))) {
    numbers <- as.integer(sub(".*-([0-9]{3})\\.zip$", "\\1", basename(files), ignore.case = TRUE))
    if (!identical(sort(numbers), seq_len(expected_parts))) stop("One or more ZIP part numbers are missing.")
  }
  sort(files)
}

fjs_app_glob <- function(group) {
  if (grepl("[*?\\[\\]/\\\\]", group)) stop("ZIP download name contains unsupported characters.")
  if (grepl("\\.zip$", group, ignore.case = TRUE)) group else paste0(group, "-*.zip")
}

fjs_app_regex <- function(value) {
  paste0("^", gsub("([][{}()+*^$|\\\\?.])", "\\\\\\1", value), "$")
}

fjs_app_read_csv <- function(path) {
  read.csv(path, stringsAsFactors = FALSE, check.names = FALSE,
           colClasses = "character", na.strings = "", fileEncoding = "UTF-8-BOM")
}

fjs_app_package <- function(folder, repo) {
  folder <- fjs_app_absolute(folder)
  paths <- file.path(folder, "supabase_import", paste0(fjs_app_tables, ".csv"))
  missing <- paths[!file.exists(paths)]
  if (length(missing)) stop("Package is incomplete: ", paste(basename(missing), collapse = ", "))
  tables <- lapply(paths, fjs_app_read_csv)
  names(tables) <- fjs_app_tables
  samples <- tables$fjs_samples
  assets <- tables$fjs_assets
  if (!nrow(samples) || !nrow(assets)) stop("Package must contain sample rows and archive files.")
  if (!all(c("sample_id") %in% names(samples)) ||
      !all(c("asset_id", "sample_id", "local_source_path", "file_size_bytes",
             "storage_object_path", "sha256") %in% names(assets))) stop("Package columns are incomplete.")
  if (anyDuplicated(samples$sample_id) || anyDuplicated(assets$asset_id) ||
      anyDuplicated(assets$storage_object_path)) stop("Package contains duplicate sample or asset identifiers.")
  if (any(!assets$sample_id %in% samples$sample_id)) stop("Some archive files have no matching sample metadata.")
  local <- assets$local_source_path
  relative <- !grepl("^([A-Za-z]:[/\\\\]|/|\\\\\\\\)", local)
  local[relative] <- file.path(repo, local[relative])
  info <- file.info(local)
  if (anyNA(info$size) || any(info$isdir)) stop("Some archive files are missing from disk.")
  if (any(info$size != as.numeric(assets$file_size_bytes))) stop("An archive file size changed. Prepare the package again.")
  receipt_path <- file.path(folder, "archive_app_receipt.rds")
  receipt <- if (file.exists(receipt_path)) readRDS(receipt_path) else list(demo = FALSE)
  qc <- file.path(folder, "supabase_import", "asset_manifest_qc.txt")
  exclusion_path <- file.path(folder, "excluded_local_photos.csv")
  exclusions <- if (file.exists(exclusion_path)) fjs_app_read_csv(exclusion_path) else data.frame()
  if (nrow(exclusions) && (!all(c("asset_id", "original_file_name", "reason") %in% names(exclusions)) ||
      any(exclusions$asset_id %in% assets$asset_id))) {
    stop("The excluded-photo record conflicts with the upload manifest. Review the package selection.")
  }
  list(root = folder, tables = tables, samples = nrow(samples), assets = nrow(assets),
       exclusions = exclusions,
       taxa = nrow(tables$fjs_taxa), bytes = sum(info$size), demo = isTRUE(receipt$demo),
       subset_info = receipt$subset_info,
       qc = if (file.exists(qc)) paste(readLines(qc, warn = FALSE), collapse = "\n") else "No QC report found.",
       fingerprint = paste(c(folder, unname(tools::md5sum(c(paths,
                              if (file.exists(exclusion_path)) exclusion_path))), info$size,
                              as.numeric(info$mtime)), collapse = "|"))
}

fjs_app_publish_ready <- function(package, dry_fingerprint, dry_url, url, reviewed) {
  if (isTRUE(package$demo)) stop("Example packages cannot be published.")
  if (!isTRUE(reviewed)) stop("Review the QC report and mark it reviewed before publishing.")
  if (!identical(package$fingerprint, dry_fingerprint) || !identical(url, dry_url)) {
    stop("Run a successful dry run for this package and destination before publishing.")
  }
  invisible(TRUE)
}

fjs_app_redact <- function(text, secret = "") {
  if (nzchar(secret)) text <- gsub(secret, "[redacted]", text, fixed = TRUE)
  text <- gsub("sb_secret_[A-Za-z0-9_-]+", "[redacted]", text)
  gsub("eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+", "[redacted]", text)
}

fjs_app_log_chunk <- function(pending, text, secret = "", flush = FALSE) {
  combined <- paste0(pending, paste(text, collapse = "\n"))
  newline <- gregexpr("\n", combined, fixed = TRUE)[[1]]
  last <- if (flush) nchar(combined) else if (any(newline > 0L)) max(newline) else 0L
  remaining <- if (last < nchar(combined)) substring(combined, last + 1L) else ""
  clean <- if (last) fjs_app_redact(substr(combined, 1L, last), secret) else ""
  list(clean = clean, pending = remaining)
}

fjs_app_run <- function(command, args, label) {
  cat("\n", label, "\n", sep = "")
  flush.console()
  status <- system2(command, shQuote(args))
  if (!identical(status, 0L)) stop(label, " failed (exit ", status, ").")
}

fjs_app_worker <- function(job, repo) {
  setwd(repo)
  operation <- job$operation
  cfg <- job$settings
  rscript <- file.path(R.home("bin"), if (.Platform$OS.type == "windows") "Rscript.exe" else "Rscript")
  if (!operation %in% c("publish", "verify")) Sys.unsetenv("SUPABASE_SERVICE_ROLE_KEY")
  result <- list(operation = operation, ok = TRUE)
  if (operation == "prepare_checked") {
    prepared <- fjs_app_worker(list(operation = "prepare", settings = cfg), repo)
    cfg$package_root <- prepared$package_root
    fjs_app_worker(list(operation = "dry_run", settings = cfg), repo)
    prepared$operation <- operation
    prepared$checked_fingerprint <- fjs_app_package(cfg$package_root, repo)$fingerprint
    prepared$checked_url <- cfg$supabase_url
    return(prepared)
  }
  if (operation == "demo") {
    fjs_app_private_path(cfg$output_root, repo)
    if (file.exists(cfg$output_root)) stop("Example output folder already exists.")
    asset_dir <- file.path(cfg$output_root, "assets")
    dir.create(asset_dir, recursive = TRUE)
    sample <- "98_20180101_0001"
    grDevices::jpeg(file.path(asset_dir, paste0(sample, "_01.jpg")), width = 400, height = 240)
    graphics::par(mar = c(0, 0, 0, 0))
    graphics::plot.new()
    graphics::text(.5, .6, "EXAMPLE", cex = 2, col = "#16766a")
    graphics::text(.5, .35, "Synthetic archive file", cex = 1)
    grDevices::dev.off()
    file.copy(file.path(asset_dir, paste0(sample, "_01.jpg")),
              file.path(asset_dir, paste0(sample, "_01_019_04_01_01_00.jpg")))
    for (kind in c("SC1", "LW1")) {
      grDevices::pdf(file.path(asset_dir, paste0(sample, "_", kind, ".pdf")), width = 4, height = 3)
      graphics::plot.new()
      graphics::text(.5, .6, "EXAMPLE", cex = 2)
      graphics::text(.5, .35, "Synthetic sheet; no survey observations")
      grDevices::dev.off()
    }
    fjs_app_run(cfg$python, c("scripts/create_fjs_archive_demo.py", "--output-root", cfg$output_root),
                "Creating synthetic example files")
    result$demo <- jsonlite::fromJSON(file.path(cfg$output_root, "demo_info.json"))
    return(result)
  }
  if (operation == "download") {
    fjs_app_private_path(cfg$download_root, repo)
    fjs_app_run(cfg$python, c("scripts/download_fjs_drive_samples.py",
      "--selection-csv", cfg$selection_csv, "--destination", cfg$download_root,
      "--rclone", cfg$rclone, "--remote", cfg$remote), "Downloading selected Google Drive samples")
    result$raw_root <- cfg$download_root
    return(result)
  }
  if (operation %in% c("merge", "prepare", "extract") && cfg$source_mode == "zip") {
    zips <- fjs_app_selected_zips(cfg$source_dir, cfg$zip_group, cfg$expected_parts)
  }
  if (operation == "extract") {
    result$subset_info <- fjs_app_extract_subset(cfg, repo)
    return(result)
  }
  if (operation == "merge") {
    fjs_app_private_path(cfg$output_root, repo)
    source(file.path(repo, "scripts", "merge_fjs_sample_zips.R"), local = TRUE)
    # Names are individually escaped so only the reviewed download group is selected.
    pattern <- paste(vapply(basename(zips), fjs_app_regex, character(1)), collapse = "|")
    result$raw_root <- merge_fjs_sample_zips(cfg$source_dir, cfg$output_root,
                                            pattern, cfg$expected_parts)
    return(result)
  }
  if (operation == "prepare") {
    fjs_app_private_path(cfg$output_root, repo)
    if (file.exists(cfg$output_root)) stop("Choose a new output package folder.")
    if (!file.exists(cfg$dictionary)) stop("Choose the data dictionary workbook.")
    if (identical(cfg$metadata_mode, "confidential")) {
      result$subset_info <- fjs_app_extract_subset(cfg, repo)
      if (length(result$subset_info$missing_samples)) {
        stop("The local dataset matched ", result$subset_info$matched_samples, "/",
             result$subset_info$requested_samples, " samples. Review the subset and choose the correct dataset before preparing.")
      }
      cfg$metadata_csv <- result$subset_info$output_csv
    }
    if (is.null(cfg$metadata_csv) || !file.exists(cfg$metadata_csv)) stop("Choose a processed survey CSV.")
    fjs_app_run(cfg$python, c("-c", "import pandas, openpyxl"), "Checking Python spreadsheet dependencies")
    args <- c("scripts/prepare_fjs_terminal_batch.py", "--metadata-csv", cfg$metadata_csv,
              "--data-dictionary", cfg$dictionary, "--output-root", cfg$output_root,
              "--batch-name", cfg$batch_name, "--access-level", cfg$access_level,
              "--rscript", rscript)
    if (cfg$source_mode == "zip") {
      args <- c(args, "--zip-dir", cfg$source_dir, "--zip-pattern", fjs_app_glob(cfg$zip_group))
    } else {
      args <- c(args, "--raw-root", cfg$source_dir)
    }
    fjs_app_run(cfg$python, args, "Preparing the archive, metadata subset, and permanent upload files")
    fjs_app_run(cfg$python, c("scripts/exclude_unmatched_fjs_photos.py", "--package-root", cfg$output_root),
                "Keeping unmatched photos locally; selecting matched photos for upload")
    saveRDS(list(demo = isTRUE(cfg$demo), batch_name = cfg$batch_name,
                 app_version = if (is.null(cfg$app_version)) fjs_app_version(repo) else cfg$app_version,
                 subset_info = result$subset_info),
            file.path(cfg$output_root, "archive_app_receipt.rds"))
    result$package_root <- cfg$output_root
    return(result)
  }
  # Verification writes its report next to the package.
  fjs_app_private_path(cfg$package_root, repo)
  package <- fjs_app_package(cfg$package_root, repo)
  if (operation %in% c("dry_run", "publish")) {
    if (operation == "publish" && package$demo) stop("Example packages cannot be published.")
    args <- c("scripts/publish_fjs_supabase_archive_workflow.R", "--output-root",
              cfg$package_root, "--supabase-url", cfg$supabase_url, "--python", cfg$python)
    if (operation == "publish") args <- c(args, "--apply")
    if (operation == "publish" && isTRUE(cfg$upsert)) args <- c(args, "--upsert-storage")
    fjs_app_run(rscript, args, if (operation == "publish") "Publishing database rows and archive files" else "Dry run: no Supabase changes")
  }
  if (operation %in% c("publish", "verify")) {
    if (package$demo) stop("Example packages cannot be verified against a live project.")
    report <- file.path(cfg$package_root, "supabase_verification.json")
    fjs_app_run(cfg$python, c("scripts/verify_fjs_supabase_batch.py",
      "--supabase-url", cfg$supabase_url, "--import-dir", file.path(cfg$package_root, "supabase_import"),
      "--report", report), "Verifying saved database rows and Storage file sizes")
    result$verified <- TRUE
    fjs_app_run(cfg$python, c("scripts/write_fjs_upload_report.py", "--package-root", cfg$package_root,
      "--supabase-url", cfg$supabase_url, "--app-version", fjs_app_version(repo),
      "--operation", if (operation == "publish") "upload_and_verify" else "verify_existing_package"),
      "Saving the upload completion report locally")
  }
  result$package_root <- cfg$package_root
  result
}
