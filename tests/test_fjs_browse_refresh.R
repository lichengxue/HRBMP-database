# Verify new downloads and folders appear while Browse dialogs stay open.
repo <- normalizePath(commandArgs(trailingOnly = TRUE)[[1]], winslash = "/", mustWork = TRUE)
.libPaths(c(file.path(repo, "tools", "shiny-library"), .libPaths()))
home <- tempfile("fjs-picker-")
dir.create(file.path(home, "Downloads"), recursive = TRUE)
dir.create(file.path(home, "Desktop"))
work <- file.path(home, "work")
dir.create(work)
Sys.setenv(FJS_REPO_ROOT = repo, FJS_WORK_ROOT = work)
env <- new.env()
source(file.path(repo, "archive_app/app.R"), local = env)
env$user_root <- home
completed <- FALSE
shiny::testServer(env$server, {
  messages <- new.env(parent = emptyenv())
  session$sendCustomMessage <- function(type, message) {
    if (type %in% c("shinyFiles", "shinyDirectories")) {
      messages[[message$id]] <- jsonlite::toJSON(message, auto_unbox = TRUE)
    }
  }
  session$setInputs(work_root = work, confidential_csv_browse = 1L,
    dictionary_browse = 1L, source_dir_browse = 1L, work_root_browse = 1L)
  session$flushReact()
  stopifnot(!grepl("new_survey.csv", messages$confidential_csv_browse, fixed = TRUE))
  writeLines("SAMPLE.NUMBER\n0004", file.path(home, "Downloads", "new_survey.csv"))
  file.create(file.path(home, "Downloads", "new_dictionary.xlsx"))
  dir.create(file.path(home, "Downloads", "new_sample_folder"))
  dir.create(file.path(work, "new_work_folder"))
  session$elapse(1100)
  session$flushReact()
  stopifnot(grepl("new_survey.csv", messages$confidential_csv_browse, fixed = TRUE),
    !grepl("new_dictionary.xlsx", messages$confidential_csv_browse, fixed = TRUE),
    grepl("new_dictionary.xlsx", messages$dictionary_browse, fixed = TRUE),
    !grepl("new_survey.csv", messages$dictionary_browse, fixed = TRUE),
    grepl("new_sample_folder", messages$source_dir_browse, fixed = TRUE),
    grepl("new_work_folder", messages$work_root_browse, fixed = TRUE))
  completed <<- TRUE
})
stopifnot(completed)
# Only the test's own temporary fixture is removed.
stopifnot(identical(normalizePath(dirname(home)), normalizePath(tempdir())))
unlink(home, recursive = TRUE)
cat("Browse refresh verified: new CSV, XLSX, sample folder, and work folder appear without navigating away.\n")
