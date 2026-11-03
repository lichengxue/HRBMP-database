# Start the local app from RStudio with source(), or from PowerShell with Rscript.
if (.Platform$OS.type == "windows") try(Sys.setlocale("LC_CTYPE", ".UTF-8"), silent = TRUE)
frames <- sys.frames()
source_paths <- vapply(frames, function(frame) {
  if (is.character(frame$ofile) && length(frame$ofile) == 1L) frame$ofile else ""
}, character(1))
file_arguments <- sub("^--file=", "", grep("^--file=", commandArgs(), value = TRUE))
script_paths <- c(rev(source_paths[nzchar(source_paths)]), file_arguments)
root_candidates <- file.path(dirname(script_paths), "..")
# RStudio's Run command can execute lines without a source-file path. In that
# case, look up from the working directory, including project subdirectories.
working_directory <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
repeat {
  root_candidates <- c(root_candidates, working_directory)
  parent_directory <- dirname(working_directory)
  if (identical(parent_directory, working_directory)) break
  working_directory <- parent_directory
}
valid_roots <- root_candidates[
  file.exists(file.path(root_candidates, "archive_app", "app.R")) &
  file.exists(file.path(root_candidates, "scripts", "install_fjs_archive_app.R"))
]
if (!length(valid_roots)) {
  stop(paste(
    "Cannot locate the HRBMP-database project.",
    "Run source() with the full path to scripts/start_fjs_archive_app.R,",
    "or setwd() to the project folder first. Do not run copied launcher lines",
    "from an unrelated working directory."
  ))
}
repo_root <- normalizePath(valid_roots[[1]], winslash = "/", mustWork = TRUE)
library_dir <- file.path(repo_root, "tools", "shiny-library")
# Changing .libPaths() does not replace namespaces already loaded by RStudio.
# Stop before Shiny attempts to unload a version imported by another package.
for (package in intersect(c("shiny", "processx", "shinyFiles"), loadedNamespaces())) {
  if (!file.exists(file.path(library_dir, package, "DESCRIPTION"))) next
  loaded_version <- as.character(getNamespaceVersion(package))
  project_version <- as.character(packageVersion(package, lib.loc = library_dir))
  if (!identical(loaded_version, project_version)) {
    stop(paste0(
      "This R session already loaded ", package, " ", loaded_version,
      "; this project uses ", project_version, ".\n",
      "Restart R (Session > Restart R in RStudio), then run:\n",
      "source(\"", repo_root, "/scripts/start_fjs_archive_app.R\")\n",
      "You can also launch the app in a fresh process using Rscript --vanilla from PowerShell."
    ), call. = FALSE)
  }
}
.libPaths(c(library_dir, .libPaths()))
cat("Archive project: ", repo_root, "\n", sep = "")
package_errors <- vapply(c("shiny", "processx", "shinyFiles"), function(package) {
  tryCatch({ loadNamespace(package); "" }, error = function(error) conditionMessage(error))
}, character(1))
failed <- names(package_errors)[nzchar(package_errors)]
if (length(failed)) {
  stop(paste0(
    "Cannot load: ", paste(failed, collapse = ", "), ".\n",
    paste(paste0(failed, ": ", package_errors[failed]), collapse = "\n"),
    "\nRestart R, then run:\nsetwd(\"", repo_root, "\")\n",
    "source(\"scripts/install_fjs_archive_app.R\")\n",
    "source(\"scripts/start_fjs_archive_app.R\")"
  ))
}
Sys.setenv(FJS_REPO_ROOT = repo_root)
port <- as.integer(Sys.getenv("FJS_APP_PORT", "8840"))
if (is.na(port) || port < 1024 || port > 65535) stop("FJS_APP_PORT must be between 1024 and 65535.")
shiny::runApp(file.path(repo_root, "archive_app"), host = "127.0.0.1", port = port,
              launch.browser = getOption("shiny.launch.browser", TRUE), display.mode = "normal")
