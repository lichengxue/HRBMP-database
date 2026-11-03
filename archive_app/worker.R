# Isolated child process. Request files contain paths/options, never credentials.
if (.Platform$OS.type == "windows") try(Sys.setlocale("LC_CTYPE", ".UTF-8"), silent = TRUE)
arguments <- commandArgs(trailingOnly = TRUE)
if (length(arguments) != 2L) stop("Expected repository path and job request path.")
repo_root <- normalizePath(arguments[[1]], winslash = "/", mustWork = TRUE)
.libPaths(c(file.path(repo_root, "tools", "shiny-library"), .libPaths()))
source(file.path(repo_root, "archive_app", "workflow.R"))
job <- if (grepl("\\.json$", arguments[[2]], ignore.case = TRUE)) {
  jsonlite::fromJSON(arguments[[2]], simplifyVector = FALSE)
} else readRDS(arguments[[2]])
if (any(c("secret", "api_key", "password") %in% names(job$settings))) stop("Credentials must not be saved in a job request.")
result <- tryCatch(fjs_app_worker(job, repo_root), error = function(error) {
  # The parent redacts any sensitive text before displaying or saving logs.
  message("Error: ", conditionMessage(error))
  list(ok = FALSE, operation = job$operation, message = conditionMessage(error))
})
# Errors can contain server response text. Do not serialize the message.
result$message <- NULL
saveRDS(result, job$result_file)
Sys.unsetenv("SUPABASE_SERVICE_ROLE_KEY")
quit(status = if (isTRUE(result$ok)) 0L else 1L)
