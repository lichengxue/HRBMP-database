# State helpers for the four-step uploader. Saved state never includes credentials.
fjs_wizard_inventory <- function(folder, repo) {
  folder <- fjs_app_private_path(folder, repo)
  if (!dir.exists(folder)) stop("Choose the folder containing your sample folders.")
  files <- list.files(folder, pattern = "\\.(jpe?g|pdf)$", full.names = TRUE,
                      recursive = TRUE, ignore.case = TRUE)
  relative <- substring(files, nchar(folder) + 2L)
  if (grepl("^[0-9]+_[0-9]{8}_[0-9]+$", basename(folder))) {
    relative <- paste(basename(folder), relative, sep = "/")
  }
  ids <- lapply(strsplit(relative, "/", fixed = TRUE), function(parts) {
    folders <- head(parts, -1L)
    folders[grepl("^[0-9]+_[0-9]{8}_[0-9]+$", folders)]
  })
  valid <- lengths(ids) == 1L
  files <- files[valid]
  if (!length(files)) stop("No JPG or PDF files were found inside sample ID folders.")
  info <- file.info(files)
  if (anyNA(info$size)) stop("Some sample files are unavailable. Check the source folder.")
  list(root = folder, samples = length(unique(unlist(ids[valid]))), assets = length(files),
       bytes = sum(info$size), demo = fjs_wizard_is_demo(folder),
       fingerprint = paste(c(folder, relative[valid], info$size, as.numeric(info$mtime)), collapse = "|"))
}

fjs_wizard_signature <- function(cfg, source) {
  files <- c(cfg$confidential_csv, cfg$dictionary)
  info <- file.info(files)
  paste(c(source$fingerprint, files, info$size, as.numeric(info$mtime),
          cfg$work_root, cfg$batch_name), collapse = "|")
}

fjs_wizard_is_demo <- function(path) {
  ancestor <- fjs_app_absolute(path)
  repeat {
    if (file.exists(file.path(ancestor, "demo_info.json")) ||
        file.exists(file.path(ancestor, ".fjs_synthetic.rds"))) return(TRUE)
    parent <- dirname(ancestor)
    if (identical(parent, ancestor)) return(FALSE)
    ancestor <- parent
  }
}

fjs_wizard_save <- function(work_root, source, settings, package = NULL, completed = FALSE) {
  # A whitelist prevents manual API keys or arbitrary inputs entering the state file.
  allowed <- intersect(names(settings), c("batch_name", "confidential_csv", "dictionary", "supabase_url"))
  record <- list(version = 1L, source = source, settings = settings[allowed],
                 package_root = if (is.null(package)) "" else package$root,
                 package_fingerprint = if (is.null(package)) "" else package$fingerprint,
                 completed = isTRUE(completed))
  dir.create(work_root, recursive = TRUE, showWarnings = FALSE)
  saveRDS(record, file.path(work_root, "upload_progress.rds"))
}

fjs_wizard_resume <- function(work_root, repo) {
  restore <- function(record) {
    if (isTRUE(record$source$demo)) return(NULL)
    inventory <- fjs_wizard_inventory(record$source$root, repo)
    if (fjs_wizard_is_demo(inventory$root)) return(NULL)
    package <- NULL
    if (!is.null(record$package_root) && nzchar(record$package_root)) {
      fjs_app_private_path(record$package_root, repo)
      package <- fjs_app_package(record$package_root, repo)
      if (package$demo) return(NULL)
    }
    list(source = inventory, settings = record$settings, package = package,
         completed = isTRUE(record$completed) && !is.null(package) &&
           identical(package$fingerprint, record$package_fingerprint))
  }
  state_path <- file.path(work_root, "upload_progress.rds")
  jobs <- file.path(work_root, "jobs")
  requests <- if (dir.exists(jobs)) list.files(jobs, pattern = "\\.rds$", full.names = TRUE) else character()
  requests <- requests[!grepl("\\.result\\.rds$", requests)]
  candidates <- c(if (file.exists(state_path)) state_path, requests)
  if (!length(candidates)) return(NULL)
  candidates <- candidates[order(file.info(candidates)$mtime, decreasing = TRUE)]
  for (path in candidates) {
    result <- tryCatch({
      if (identical(path, state_path)) {
        restore(readRDS(path))
      } else {
        job <- readRDS(path)
        if (!job$operation %in% c("merge", "prepare", "prepare_checked") ||
            !file.exists(job$result_file)) next
        outcome <- readRDS(job$result_file)
        if (!isTRUE(outcome$ok) || isTRUE(job$settings$demo)) next
        root <- if (job$operation == "merge") outcome$raw_root else job$settings$source_dir
        if (!is.null(outcome$package_root) && identical(job$settings$source_mode, "zip")) {
          root <- file.path(outcome$package_root, "storage_upload_ready")
        }
        restore(list(source = list(root = root), settings = job$settings,
          package_root = if (is.null(outcome$package_root)) "" else outcome$package_root,
          completed = FALSE))
      }
    }, error = function(e) NULL)
    if (!is.null(result)) return(result)
  }
  NULL
}

fjs_wizard_url_valid <- function(url) {
  length(url) == 1L && !is.na(url) &&
    grepl("^https?://[A-Za-z0-9.-]+(:[0-9]+)?/?$", trimws(url))
}
