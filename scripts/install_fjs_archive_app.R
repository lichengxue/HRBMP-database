# Run from the repository root. Packages are installed locally, outside Git.
repo_root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
if (!file.exists(file.path(repo_root, "AGENTS.md"))) stop("Run this from the HRBMP-database folder.")
library_dir <- file.path(repo_root, "tools", "shiny-library")
dir.create(library_dir, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(library_dir, .libPaths()))
packages <- c("shiny", "processx", "shinyFiles")
package_type <- if (.Platform$OS.type == "windows") "binary" else "source"
available <- available.packages(repos = "https://cloud.r-project.org", type = package_type)
dependencies <- tools::package_dependencies(packages, db = available,
  which = c("Depends", "Imports", "LinkingTo"), recursive = TRUE)
required <- unique(c(packages, unlist(dependencies, use.names = FALSE)))
standard <- installed.packages(lib.loc = .Library)
standard <- rownames(standard)[!is.na(standard[, "Priority"])]
required <- setdiff(required, c("R", standard))
installed_local <- rownames(installed.packages(lib.loc = library_dir))
missing <- setdiff(required, installed_local)
if (length(missing)) {
  install.packages(missing, lib = library_dir, repos = "https://cloud.r-project.org",
                   type = package_type, dependencies = FALSE)
}
failed <- packages[!vapply(packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(failed)) stop("Packages still missing: ", paste(failed, collapse = ", "))
cat("Shiny archive app dependencies are ready.\n")
for (package in packages) cat(package, as.character(packageVersion(package)), "\n")
