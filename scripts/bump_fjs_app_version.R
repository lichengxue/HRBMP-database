# Bump the GUI version and prepend release notes. Never commits or pushes.
bump_fjs_app_version <- function(repo, kind, note) {
  if (!kind %in% c("major", "minor", "patch") || length(kind) != 1L) stop("Choose major, minor, or patch.")
  if (length(note) != 1L || is.na(note) || !nzchar(trimws(note))) stop("Provide a release note.")
  version_path <- file.path(repo, "archive_app", "VERSION")
  history_path <- file.path(repo, "archive_app", "releases.json")
  current <- trimws(readLines(version_path, warn = FALSE)[[1]])
  if (!grepl("^[0-9]+[.][0-9]+[.][0-9]+$", current)) stop("Invalid current version.")
  history <- jsonlite::fromJSON(history_path, simplifyVector = FALSE)
  if (!identical(history[[1]]$version, current)) stop("Version and release history disagree.")
  parts <- as.integer(strsplit(current, ".", fixed = TRUE)[[1]])
  index <- match(kind, c("major", "minor", "patch"))
  parts[index] <- parts[index] + 1L
  if (index < 3L) parts[seq.int(index + 1L, 3L)] <- 0L
  next_version <- paste(parts, collapse = ".")
  history <- c(list(list(version = next_version, date = as.character(Sys.Date()), notes = list(trimws(note)))), history)
  encoded <- jsonlite::toJSON(history, auto_unbox = TRUE, pretty = TRUE)
  writeLines(encoded, history_path, useBytes = TRUE)
  writeLines(next_version, version_path)
  cat("App version:", current, "->", next_version, "\nRelease notes updated. No Git commit or push performed.\n")
  invisible(next_version)
}

if (sys.nframe() == 0L) {
  args <- commandArgs(trailingOnly = TRUE)
  if (length(args) != 2L) stop("Usage: Rscript scripts/bump_fjs_app_version.R patch|minor|major \"Release note\"")
  script <- sub("^--file=", "", grep("^--file=", commandArgs(), value = TRUE)[[1]])
  repo <- normalizePath(file.path(dirname(script), ".."), winslash = "/", mustWork = TRUE)
  .libPaths(c(file.path(repo, "tools", "shiny-library"), .libPaths()))
  bump_fjs_app_version(repo, args[[1]], args[[2]])
}
