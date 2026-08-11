#!/usr/bin/env Rscript

# Archive supplemental image metadata in SQLite.
#
# This workflow reads image file metadata with ExifTool and stores:
# - one searchable summary row per image in image_file_metadata, and
# - tag/value details in image_metadata_tags.
#
# Default roots are chosen from the current FJS storage-upload-ready layout:
# - data/processed/FJS_storage_upload_ready/storage_upload_ready/samples
# - data/processed/FJS_2017_sample/storage_upload_ready/samples
#
# GUI photo-gallery images are not scanned unless --include-gui-gallery is set.
# The gallery's web copies are skipped unless --include-web-gallery is also set.
#
# Example:
#   Rscript scripts/05_archive_image_exif_metadata.R
#
# First-time setup:
#   install.packages("RSQLite")
#   Install ExifTool from https://exiftool.org/ and pass --exiftool if needed.

default_db_path <- "database/hrbmp.sqlite"
default_access_level <- "internal"
default_batch_size <- 50L

default_roots <- c(
  "data/processed/FJS_storage_upload_ready/storage_upload_ready/samples",
  "data/processed/FJS_2017_sample/storage_upload_ready/samples"
)
gui_gallery_root <- "gui/assets/photo_gallery"

default_image_extensions <- c("jpg", "jpeg", "heic", "heif", "png", "tif", "tiff")
pdf_extension <- "pdf"

default_exif_tags <- c(
  "SourceFile",
  "ExifToolVersion",
  "FileName",
  "Directory",
  "FileSize",
  "FileModifyDate",
  "FileCreateDate",
  "FileType",
  "FileTypeExtension",
  "MIMEType",
  "ImageWidth",
  "ImageHeight",
  "ImageSize",
  "Megapixels",
  "Orientation",
  "Make",
  "Model",
  "LensModel",
  "Software",
  "CreateDate",
  "DateTimeOriginal",
  "ModifyDate",
  "SubSecDateTimeOriginal",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSDateTime",
  "GPSPosition",
  "GPSImgDirection",
  "GPSHPositioningError",
  "Title",
  "ImageDescription",
  "Description",
  "Artist",
  "Copyright",
  "Credit",
  "Subject",
  "Keywords",
  "Rating",
  "ColorSpace"
)

usage <- function() {
  cat(
    "Usage:\n",
    "  Rscript scripts/05_archive_image_exif_metadata.R [options]\n\n",
    "Options:\n",
    "  --db PATH                  SQLite database path. Default: database/hrbmp.sqlite\n",
    "  --root PATH                Image root to scan. Can be repeated.\n",
    "  --access-level LEVEL       Access level stored on new rows. Default: internal\n",
    "  --batch-size N             Files per ExifTool call. Default: 50\n",
    "  --limit N                  Process only the first N files for testing.\n",
    "  --include-pdf              Also read PDF metadata.\n",
    "  --include-gui-gallery      Also scan gui/assets/photo_gallery.\n",
    "  --include-web-gallery      Include gui/assets/photo_gallery/web copies when GUI is scanned.\n",
    "  --exiftool PATH            Path to an existing exiftool executable.\n",
    "  --dry-run                  Scan and report; do not write to SQLite.\n",
    "  --help                     Show this message.\n",
    "\n"
  )
}

parse_args <- function(args) {
  values <- list(
    db = default_db_path,
    roots = character(),
    access_level = default_access_level,
    batch_size = default_batch_size,
    limit = NA_integer_,
    include_pdf = FALSE,
    include_gui_gallery = FALSE,
    include_web_gallery = FALSE,
    install_exiftool = FALSE,
    exiftool = "",
    dry_run = FALSE,
    help = FALSE
  )

  i <- 1
  while (i <= length(args)) {
    key <- args[[i]]
    value <- if (i < length(args)) args[[i + 1]] else NA_character_

    if (key == "--db") {
      values$db <- value
      i <- i + 2
    } else if (key == "--root") {
      values$roots <- c(values$roots, value)
      i <- i + 2
    } else if (key == "--access-level") {
      values$access_level <- value
      i <- i + 2
    } else if (key == "--batch-size") {
      values$batch_size <- as.integer(value)
      i <- i + 2
    } else if (key == "--limit") {
      values$limit <- as.integer(value)
      i <- i + 2
    } else if (key == "--include-pdf") {
      values$include_pdf <- TRUE
      i <- i + 1
    } else if (key == "--include-gui-gallery") {
      values$include_gui_gallery <- TRUE
      i <- i + 1
    } else if (key == "--include-web-gallery") {
      values$include_web_gallery <- TRUE
      i <- i + 1
    } else if (key == "--install-exiftool") {
      values$install_exiftool <- TRUE
      i <- i + 1
    } else if (key == "--exiftool") {
      values$exiftool <- value
      i <- i + 2
    } else if (key == "--dry-run") {
      values$dry_run <- TRUE
      i <- i + 1
    } else if (key == "--help" || key == "-h") {
      values$help <- TRUE
      i <- i + 1
    } else {
      stop("Unknown argument: ", key)
    }
  }

  if (length(values$roots) == 0) {
    values$roots <- default_roots
    if (isTRUE(values$include_gui_gallery)) {
      values$roots <- c(values$roots, gui_gallery_root)
    }
  }
  if (is.na(values$batch_size) || values$batch_size < 1) {
    stop("--batch-size must be a positive integer")
  }

  values
}

require_packages <- function(packages) {
  missing_packages <- packages[!vapply(packages, requireNamespace, logical(1), quietly = TRUE)]
  if (length(missing_packages) > 0) {
    stop(
      "Missing packages: ", paste(missing_packages, collapse = ", "), "\n",
      "Install with:\n",
      "install.packages(c(", paste(sprintf('\"%s\"', missing_packages), collapse = ", "), "))"
    )
  }
}

utc_now <- function() {
  format(Sys.time(), tz = "UTC", usetz = TRUE)
}

normalize_slash <- function(path) {
  gsub("\\\\", "/", path)
}

normalize_path <- function(path, must_work = FALSE) {
  normalize_slash(normalizePath(path, winslash = "/", mustWork = must_work))
}

script_path <- function() {
  file_arg <- "--file="
  hits <- commandArgs(FALSE)
  hits <- hits[startsWith(hits, file_arg)]
  if (length(hits) > 0) {
    return(substring(hits[[1]], nchar(file_arg) + 1))
  }

  source_files <- vapply(sys.frames(), function(frame) {
    if (!is.null(frame$ofile)) as.character(frame$ofile) else NA_character_
  }, character(1))
  source_files <- source_files[!is.na(source_files)]
  if (length(source_files) > 0) {
    return(tail(source_files, 1))
  }

  NA_character_
}

find_repo_root <- function() {
  starts <- unique(c(getwd(), dirname(script_path())))
  starts <- starts[!is.na(starts) & nzchar(starts)]

  for (start in starts) {
    current <- normalize_path(start, must_work = FALSE)
    repeat {
      if (
        file.exists(file.path(current, "database", "schema.sql")) &&
          file.exists(file.path(current, "README.md"))
      ) {
        return(current)
      }

      parent <- dirname(current)
      if (identical(parent, current)) break
      current <- parent
    }
  }

  normalize_path(getwd(), must_work = TRUE)
}

repo_root <- find_repo_root()

local_r_library <- file.path(repo_root, "tools", "r-library")
if (dir.exists(local_r_library)) {
  .libPaths(c(local_r_library, .libPaths()))
}

is_absolute_path <- function(path) {
  grepl("^[A-Za-z]:[\\/]", path) || startsWith(path, "/") || startsWith(path, "\\\\")
}

resolve_project_path <- function(path) {
  if (file.exists(path) || dir.exists(path) || is_absolute_path(path)) {
    return(normalize_path(path, must_work = FALSE))
  }
  normalize_path(file.path(repo_root, path), must_work = FALSE)
}

resolve_args_paths <- function(values) {
  values$db <- resolve_project_path(values$db)
  values$roots <- vapply(values$roots, resolve_project_path, character(1), USE.NAMES = FALSE)
  values
}

relative_to_repo <- function(path) {
  path_norm <- normalize_path(path, must_work = FALSE)
  prefix <- paste0(repo_root, "/")
  if (startsWith(path_norm, prefix)) {
    return(sub(prefix, "", path_norm, fixed = TRUE))
  }
  path_norm
}

file_extension <- function(path) {
  name <- basename(path)
  has_extension <- grepl("\\.", name)
  out <- rep("", length(name))
  out[has_extension] <- tolower(sub("^.*\\.([^.]+)$", "\\1", name[has_extension]))
  out
}

as_na <- function(value) {
  if (length(value) == 0 || is.null(value)) return(NA_character_)
  value <- as.character(value[[1]])
  if (!nzchar(value) || identical(value, "NA")) return(NA_character_)
  value
}

as_num <- function(value) {
  value <- as_na(value)
  if (is.na(value)) return(NA_real_)
  parsed <- suppressWarnings(as.numeric(value))
  if (is.na(parsed)) return(NA_real_)
  parsed
}

as_int <- function(value) {
  value <- as_num(value)
  if (is.na(value)) return(NA_integer_)
  as.integer(value)
}

stringify_value <- function(value) {
  if (length(value) == 0 || is.null(value)) return(NA_character_)
  if (length(value) > 1 || is.list(value)) {
    value <- unlist(value, recursive = TRUE, use.names = FALSE)
    if (length(value) == 0) return(NA_character_)
    value <- value[!is.na(value)]
    if (length(value) == 0) return(NA_character_)
    return(paste(as.character(value), collapse = "; "))
  }
  value <- as.character(value)
  if (!nzchar(value) || identical(value, "NA")) return(NA_character_)
  value
}

json_quote <- function(value) {
  value <- as.character(value)
  value <- gsub("\\\\", "\\\\\\\\", value)
  value <- gsub("\"", "\\\\\"", value)
  value <- gsub("\r", "\\\\r", value, fixed = TRUE)
  value <- gsub("\n", "\\\\n", value, fixed = TRUE)
  value <- gsub("\t", "\\\\t", value, fixed = TRUE)
  paste0("\"", value, "\"")
}

json_object <- function(values) {
  if (length(values) == 0) return("{}")
  keys <- names(values)
  vals <- vapply(values, stringify_value, character(1))
  keep <- !is.na(vals) & nzchar(keys)
  if (!any(keep)) return("{}")
  paste0(
    "{",
    paste(paste0(json_quote(keys[keep]), ":", json_quote(vals[keep])), collapse = ","),
    "}"
  )
}

json_array <- function(values) {
  if (length(values) == 0) return("[]")
  paste0("[", paste(json_quote(values), collapse = ","), "]")
}

slug <- function(value) {
  value <- tolower(gsub("[^A-Za-z0-9]+", "_", value))
  value <- gsub("^_+|_+$", "", value)
  if (!nzchar(value)) "unknown" else value
}

is_web_gallery_file <- function(path) {
  grepl("/gui/assets/photo_gallery/web/", normalize_slash(path), fixed = TRUE)
}

find_files_to_archive <- function(roots, include_pdf, include_web_gallery, limit) {
  existing_roots <- roots[dir.exists(roots)]
  missing_roots <- setdiff(roots, existing_roots)
  if (length(missing_roots) > 0) {
    warning("Skipping missing root(s): ", paste(missing_roots, collapse = ", "))
  }
  if (length(existing_roots) == 0) {
    stop("No scan roots exist. Pass --root PATH to point at image folders.")
  }

  extensions <- default_image_extensions
  if (isTRUE(include_pdf)) {
    extensions <- c(extensions, pdf_extension)
  }

  files <- unique(unlist(lapply(existing_roots, function(root) {
    list.files(root, recursive = TRUE, full.names = TRUE, all.files = FALSE, no.. = TRUE)
  }), use.names = FALSE))
  files <- files[file.exists(files)]
  files <- files[file_extension(files) %in% extensions]

  if (!isTRUE(include_web_gallery)) {
    files <- files[!is_web_gallery_file(files)]
  }

  files <- sort(normalize_path(files, must_work = TRUE))
  if (!is.na(limit)) {
    files <- head(files, limit)
  }
  files
}

load_fjs_asset_manifests <- function() {
  manifest_paths <- list.files(
    file.path(repo_root, "data", "processed"),
    pattern = "^fjs_assets\\.csv$",
    recursive = TRUE,
    full.names = TRUE
  )
  manifest_paths <- manifest_paths[file.exists(manifest_paths)]
  if (length(manifest_paths) == 0) {
    return(data.frame())
  }

  rows <- lapply(manifest_paths, function(path) {
    dat <- read.csv(path, stringsAsFactors = FALSE, na.strings = c("", "NA"))
    rel <- relative_to_repo(path)
    parts <- strsplit(rel, "/", fixed = TRUE)[[1]]
    source_collection <- if (length(parts) >= 3) parts[[3]] else NA_character_
    dat$manifest_path <- rel
    dat$source_collection <- source_collection
    dat
  })
  out <- do.call(rbind, rows)
  out$storage_object_path <- normalize_slash(out$storage_object_path)
  out
}

path_context <- function(path) {
  rel <- relative_to_repo(path)
  rel_slash <- normalize_slash(rel)
  parts <- strsplit(rel_slash, "/", fixed = TRUE)[[1]]

  context <- list(
    source_collection = "custom",
    gallery_category = NA_character_,
    sample_id = NA_character_,
    asset_kind = NA_character_,
    storage_object_path = NA_character_,
    storage_bucket = NA_character_,
    original_file_name = basename(path),
    relative_path = rel_slash
  )

  storage_index <- match("storage_upload_ready", parts)
  samples_index <- match("samples", parts)
  if (!is.na(storage_index) && !is.na(samples_index) && length(parts) > samples_index) {
    context$source_collection <- if (storage_index > 1) parts[[storage_index - 1]] else "fjs_storage_upload_ready"
    context$storage_bucket <- "fjs-archive"
    context$storage_object_path <- paste(parts[(storage_index + 1):length(parts)], collapse = "/")
    context$sample_id <- parts[[samples_index + 1]]
    if (length(parts) >= samples_index + 2) {
      context$asset_kind <- parts[[samples_index + 2]]
    }
    return(context)
  }

  gallery_index <- match("photo_gallery", parts)
  if (!is.na(gallery_index) && length(parts) > gallery_index) {
    is_web <- length(parts) > gallery_index + 1 && parts[[gallery_index + 1]] == "web"
    category_index <- gallery_index + if (is_web) 2 else 1
    category <- if (length(parts) >= category_index) parts[[category_index]] else "uncategorized"
    context$source_collection <- if (is_web) "photo_gallery_web" else "photo_gallery_original"
    context$gallery_category <- category
    context$asset_kind <- paste0("photo_gallery_", slug(category))
    return(context)
  }

  context
}

match_manifest_row <- function(context, manifests) {
  if (nrow(manifests) == 0 || is.na(context$storage_object_path)) {
    return(NULL)
  }

  hits <- manifests[
    manifests$storage_object_path == context$storage_object_path &
      manifests$source_collection == context$source_collection,
    ,
    drop = FALSE
  ]
  if (nrow(hits) == 0) {
    hits <- manifests[manifests$storage_object_path == context$storage_object_path, , drop = FALSE]
  }
  if (nrow(hits) == 0) {
    return(NULL)
  }
  hits[1, , drop = FALSE]
}

mime_type_for <- function(path, exif_row = NULL) {
  if (!is.null(exif_row) && "MIMEType" %in% names(exif_row)) {
    value <- as_na(exif_row[["MIMEType"]])
    if (!is.na(value)) return(value)
  }
  ext <- file_extension(path)
  if (ext %in% c("jpg", "jpeg")) return("image/jpeg")
  if (ext %in% c("heic", "heif")) return("image/heic")
  if (ext == "png") return("image/png")
  if (ext %in% c("tif", "tiff")) return("image/tiff")
  if (ext == "pdf") return("application/pdf")
  "application/octet-stream"
}

metadata_json <- function(exif_row) {
  if (is.null(exif_row)) return("{}")
  values <- as.list(exif_row)
  values$source_file_normalized <- NULL
  json_object(values)
}

build_file_record <- function(path, exif_row, manifests, run_id, extracted_at_utc, access_level) {
  context <- path_context(path)
  manifest <- match_manifest_row(context, manifests)
  info <- file.info(path)

  if (!is.null(manifest)) {
    context$sample_id <- as_na(manifest$sample_id)
    context$asset_kind <- as_na(manifest$asset_kind)
    context$storage_bucket <- as_na(manifest$storage_bucket)
    context$storage_object_path <- as_na(manifest$storage_object_path)
    context$original_file_name <- as_na(manifest$original_file_name)
  }

  gps_lat <- if (is.null(exif_row)) NA_real_ else as_num(exif_row[["GPSLatitude"]])
  gps_lon <- if (is.null(exif_row)) NA_real_ else as_num(exif_row[["GPSLongitude"]])
  contains_gps <- !is.na(gps_lat) && !is.na(gps_lon)

  rel <- context$relative_path
  archive_file_id <- paste0(context$source_collection, "::", rel)
  file_name <- basename(path)

  data.frame(
    archive_file_id = archive_file_id,
    run_id = run_id,
    source_collection = context$source_collection,
    gallery_category = context$gallery_category,
    sample_id = context$sample_id,
    asset_kind = context$asset_kind,
    storage_bucket = context$storage_bucket,
    storage_object_path = context$storage_object_path,
    original_file_name = context$original_file_name,
    relative_path = rel,
    absolute_path = path,
    directory = dirname(rel),
    file_name = file_name,
    file_extension = file_extension(file_name),
    mime_type = mime_type_for(path, exif_row),
    file_size_bytes = as.integer(info$size),
    md5_checksum = unname(tools::md5sum(path)),
    manifest_sha256 = if (is.null(manifest)) NA_character_ else as_na(manifest$sha256),
    file_modified_at = format(info$mtime, tz = "UTC", usetz = TRUE),
    exif_tool_version = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["ExifToolVersion"]]),
    image_width = if (is.null(exif_row)) NA_integer_ else as_int(exif_row[["ImageWidth"]]),
    image_height = if (is.null(exif_row)) NA_integer_ else as_int(exif_row[["ImageHeight"]]),
    image_size = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["ImageSize"]]),
    megapixels = if (is.null(exif_row)) NA_real_ else as_num(exif_row[["Megapixels"]]),
    orientation = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Orientation"]]),
    camera_make = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Make"]]),
    camera_model = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Model"]]),
    lens_model = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["LensModel"]]),
    software = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Software"]]),
    create_date = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["CreateDate"]]),
    date_time_original = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["DateTimeOriginal"]]),
    modify_date = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["ModifyDate"]]),
    gps_latitude = gps_lat,
    gps_longitude = gps_lon,
    gps_altitude = if (is.null(exif_row)) NA_real_ else as_num(exif_row[["GPSAltitude"]]),
    gps_date_time = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["GPSDateTime"]]),
    gps_position = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["GPSPosition"]]),
    title = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Title"]]),
    description = if (is.null(exif_row)) NA_character_ else {
      desc <- as_na(exif_row[["Description"]])
      if (is.na(desc)) desc <- as_na(exif_row[["ImageDescription"]])
      desc
    },
    artist = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Artist"]]),
    copyright = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Copyright"]]),
    keywords = if (is.null(exif_row)) NA_character_ else as_na(exif_row[["Keywords"]]),
    contains_gps = as.integer(contains_gps),
    access_level_id = access_level,
    raw_metadata_json = metadata_json(exif_row),
    extracted_at_utc = extracted_at_utc,
    extraction_status = if (is.null(exif_row)) "no_exif_row" else "ok",
    notes = NA_character_,
    stringsAsFactors = FALSE
  )
}

build_tag_records <- function(file_record, exif_row, extracted_at_utc) {
  if (is.null(exif_row)) return(data.frame())
  tag_names <- setdiff(names(exif_row), "source_file_normalized")
  values <- vapply(tag_names, function(name) stringify_value(exif_row[[name]]), character(1))
  keep <- !is.na(values)
  tag_names <- tag_names[keep]
  values <- values[keep]
  if (length(tag_names) == 0) return(data.frame())

  data.frame(
    archive_file_id = file_record$archive_file_id[[1]],
    tag_name = tag_names,
    tag_value = unname(values),
    tag_group = NA_character_,
    extracted_at_utc = extracted_at_utc,
    stringsAsFactors = FALSE
  )
}

test_exiftool <- function(command) {
  err <- tempfile("exiftool-stderr-")
  on.exit(unlink(err), add = TRUE)
  out <- tryCatch(
    suppressWarnings(system2(command, args = "-ver", stdout = TRUE, stderr = err)),
    error = function(e) character()
  )
  status <- attr(out, "status")
  length(out) > 0 && (is.null(status) || identical(status, 0L))
}

find_exiftool <- function(explicit_path = "") {
  candidates <- character()
  if (nzchar(explicit_path)) {
    candidates <- c(candidates, explicit_path)
  }

  env_path <- Sys.getenv("EXIFTOOL_PATH", unset = "")
  if (nzchar(env_path)) {
    candidates <- c(candidates, env_path)
  }

  on_path <- Sys.which(c("exiftool", "exiftool.exe"))
  candidates <- c(candidates, unname(on_path[nzchar(on_path)]))
  local_tools <- list.files(
    file.path(repo_root, "tools"),
    pattern = "^exiftool\\.exe$",
    recursive = TRUE,
    full.names = TRUE
  )
  candidates <- c(
    candidates,
    local_tools,
    file.path(repo_root, "tools", "exiftool.exe"),
    file.path(repo_root, "bin", "exiftool.exe"),
    file.path(repo_root, "exiftool.exe")
  )
  candidates <- unique(candidates[nzchar(candidates)])

  for (candidate in candidates) {
    command <- if (file.exists(candidate)) normalize_path(candidate, must_work = TRUE) else candidate
    if (test_exiftool(command)) {
      return(command)
    }
  }

  k_named <- list.files(
    file.path(repo_root, "tools"),
    pattern = "^exiftool\\(-k\\)\\.exe$",
    recursive = TRUE,
    full.names = TRUE
  )
  if (length(k_named) > 0) {
    stop(
      "Found ExifTool in tools, but it is still named exiftool(-k).exe.\n",
      "Rename it to exiftool.exe and run the script again:\n",
      normalize_path(k_named[[1]], must_work = FALSE)
    )
  }

  stop(
    "ExifTool was not found.\n",
    "Install ExifTool from https://exiftool.org/ and then rerun with:\n",
    "Rscript scripts/05_archive_image_exif_metadata.R --exiftool C:/path/to/exiftool.exe\n",
    "If the file is named exiftool(-k).exe on Windows, rename it to exiftool.exe first."
  )
}

exiftool_version <- function(command) {
  out <- system2(command, args = "-ver", stdout = TRUE, stderr = FALSE)
  if (length(out) == 0) return(NA_character_)
  out[[1]]
}

read_exif_batches <- function(files, batch_size, exiftool_cmd) {
  out <- list()
  if (length(files) == 0) return(data.frame())

  starts <- seq(1, length(files), by = batch_size)
  for (start in starts) {
    end <- min(start + batch_size - 1, length(files))
    batch <- files[start:end]
    message(sprintf("Reading image metadata %s-%s of %s", start, end, length(files)))

    dat <- tryCatch({
      err <- tempfile("exiftool-batch-stderr-")
      on.exit(unlink(err), add = TRUE)
      lines <- system2(
        exiftool_cmd,
        args = c("-csv", "-n", paste0("-", default_exif_tags), batch),
        stdout = TRUE,
        stderr = err
      )
      status <- attr(lines, "status")
      if (!is.null(status) && !identical(status, 0L)) {
        warning("ExifTool returned status ", status, " for batch starting at ", start)
      }
      if (length(lines) == 0) {
        data.frame()
      } else {
        read.csv(
          text = paste(lines, collapse = "\n"),
          stringsAsFactors = FALSE,
          check.names = FALSE,
          na.strings = c("", "NA")
        )
      }
    }, error = function(e) {
        warning("ExifTool failed for batch starting at ", start, ": ", conditionMessage(e))
        data.frame()
      })
    if (nrow(dat) > 0) {
      out[[length(out) + 1]] <- as.data.frame(dat, stringsAsFactors = FALSE)
    }
  }

  if (length(out) == 0) {
    return(data.frame())
  }
  all_names <- unique(unlist(lapply(out, names), use.names = FALSE))
  aligned <- lapply(out, function(dat) {
    missing <- setdiff(all_names, names(dat))
    for (name in missing) dat[[name]] <- NA
    dat[, all_names, drop = FALSE]
  })
  do.call(rbind, aligned)
}

ensure_image_schema <- function(con) {
  schema_sql <- paste(readLines(file.path(repo_root, "database", "schema.sql"), warn = FALSE), collapse = "\n")
  statements <- trimws(strsplit(schema_sql, ";", fixed = TRUE)[[1]])
  for (statement in statements[nzchar(statements)]) {
    DBI::dbExecute(con, paste0(statement, ";"))
  }
}

ensure_access_level <- function(con, access_level) {
  exists <- DBI::dbGetQuery(
    con,
    "SELECT COUNT(*) AS n FROM access_levels WHERE access_level_id = ?",
    params = list(access_level)
  )$n[[1]]
  if (exists > 0) return(invisible(TRUE))

  DBI::dbExecute(
    con,
    "
    INSERT INTO access_levels (
      access_level_id,
      display_name,
      sort_order,
      login_required,
      manual_approval_required,
      description
    ) VALUES (?, ?, 30, 1, 1, ?)
    ",
    params = list(
      access_level,
      paste(tools::toTitleCase(gsub("_", " ", access_level))),
      "Automatically added for image metadata archive rows."
    )
  )
  invisible(TRUE)
}

upsert_archive <- function(con, file_records, tag_records, run_record) {
  DBI::dbWithTransaction(con, {
    DBI::dbAppendTable(con, "image_metadata_runs", run_record)

    DBI::dbExecute(con, "DROP TABLE IF EXISTS temp_current_image_metadata_ids")
    DBI::dbExecute(con, "CREATE TEMP TABLE temp_current_image_metadata_ids (archive_file_id TEXT PRIMARY KEY)")
    DBI::dbAppendTable(
      con,
      "temp_current_image_metadata_ids",
      data.frame(archive_file_id = file_records$archive_file_id, stringsAsFactors = FALSE)
    )

    DBI::dbExecute(
      con,
      "DELETE FROM image_metadata_tags WHERE archive_file_id IN (SELECT archive_file_id FROM temp_current_image_metadata_ids)"
    )
    DBI::dbExecute(
      con,
      "DELETE FROM image_file_metadata WHERE archive_file_id IN (SELECT archive_file_id FROM temp_current_image_metadata_ids)"
    )

    DBI::dbAppendTable(con, "image_file_metadata", file_records)
    if (nrow(tag_records) > 0) {
      DBI::dbAppendTable(con, "image_metadata_tags", tag_records)
    }
  })
}

args <- parse_args(commandArgs(trailingOnly = TRUE))
if (isTRUE(args$help)) {
  usage()
  quit(save = "no", status = 0)
}
args <- resolve_args_paths(args)
if (isTRUE(args$install_exiftool)) {
  warning(
    "--install-exiftool was used by the older exiftoolr-based version and is now ignored. ",
    "Install ExifTool separately from https://exiftool.org/ or pass --exiftool C:/path/to/exiftool.exe."
  )
}

files <- find_files_to_archive(
  roots = args$roots,
  include_pdf = args$include_pdf,
  include_web_gallery = args$include_web_gallery,
  limit = args$limit
)

message("Image/PDF files found for metadata archive: ", length(files))
if (length(files) == 0) {
  quit(save = "no", status = 0)
}

if (isTRUE(args$dry_run)) {
  print(data.frame(relative_path = vapply(files, relative_to_repo, character(1)), stringsAsFactors = FALSE))
  message("Dry run only; no database changes written.")
  quit(save = "no", status = 0)
}

require_packages(c("RSQLite"))
exiftool_cmd <- find_exiftool(args$exiftool)
tool_version <- exiftool_version(exiftool_cmd)

started_at <- utc_now()
run_id <- paste0("image-exif-", format(Sys.time(), "%Y%m%d%H%M%S"))

exif_data <- read_exif_batches(files, args$batch_size, exiftool_cmd)
if (nrow(exif_data) > 0 && "SourceFile" %in% names(exif_data)) {
  exif_data$source_file_normalized <- normalize_path(exif_data$SourceFile, must_work = FALSE)
} else {
  exif_data$source_file_normalized <- character()
}

manifests <- load_fjs_asset_manifests()
extracted_at <- utc_now()

file_records <- list()
tag_records <- list()
for (path in files) {
  hit <- if (nrow(exif_data) > 0) {
    exif_data[exif_data$source_file_normalized == normalize_path(path, must_work = FALSE), , drop = FALSE]
  } else {
    data.frame()
  }
  exif_row <- if (nrow(hit) > 0) hit[1, , drop = FALSE] else NULL
  file_record <- build_file_record(
    path = path,
    exif_row = exif_row,
    manifests = manifests,
    run_id = run_id,
    extracted_at_utc = extracted_at,
    access_level = args$access_level
  )
  file_records[[length(file_records) + 1]] <- file_record
  tags <- build_tag_records(file_record, exif_row, extracted_at)
  if (nrow(tags) > 0) {
    tag_records[[length(tag_records) + 1]] <- tags
  }
}

file_records <- do.call(rbind, file_records)
tag_records <- if (length(tag_records) == 0) data.frame() else do.call(rbind, tag_records)

con <- DBI::dbConnect(RSQLite::SQLite(), dbname = args$db)
on.exit(DBI::dbDisconnect(con), add = TRUE)
DBI::dbExecute(con, "PRAGMA foreign_keys = ON")
ensure_image_schema(con)
ensure_access_level(con, args$access_level)

run_record <- data.frame(
  run_id = run_id,
  run_started_at_utc = started_at,
  run_completed_at_utc = utc_now(),
  scan_roots_json = json_array(args$roots),
  files_found = length(files),
  files_archived = nrow(file_records),
  tags_archived = nrow(tag_records),
  extraction_tool = paste0("ExifTool ", as.character(tool_version)),
  notes = NA_character_,
  stringsAsFactors = FALSE
)

upsert_archive(con, file_records, tag_records, run_record)

message("Wrote image_file_metadata rows: ", nrow(file_records))
message("Wrote image_metadata_tags rows: ", nrow(tag_records))
message("Database: ", normalize_path(args$db, must_work = FALSE))
message("Run ID: ", run_id)
