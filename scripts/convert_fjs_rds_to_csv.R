# Convert a local data frame to UTF-8 CSV without publishing it.
# Rscript --vanilla scripts/convert_fjs_rds_to_csv.R INPUT.rds OUTPUT.csv
convert_fjs_rds_to_csv <- function(input, output) {
  input <- normalizePath(input, winslash = "/", mustWork = TRUE)
  output <- path.expand(output)
  if (file.exists(output)) stop("Output already exists; it will not be overwritten.")
  if (tolower(tools::file_ext(output)) != "csv") stop("Output must have a .csv extension.")
  ancestor <- dirname(output)
  repeat {
    if (file.exists(file.path(ancestor, ".git")) || dir.exists(file.path(ancestor, ".git"))) {
      stop("Confidential exports must be outside Git repositories.")
    }
    parent <- dirname(ancestor)
    if (identical(parent, ancestor)) break
    ancestor <- parent
  }
  original_md5 <- unname(tools::md5sum(input))
  data <- readRDS(input)
  if (!is.data.frame(data)) stop("The RDS must contain a data frame.")
  if (anyDuplicated(names(data))) stop("Duplicate column names must be resolved before conversion.")
  kinds <- vapply(data, typeof, character(1))
  if (!all(kinds %in% c("character", "integer", "double", "logical")) ||
      any(vapply(data, is.object, logical(1)))) {
    stop("This converter expects plain character, integer, numeric, or logical columns.")
  }
  if (any(vapply(data, function(x) any(is.nan(x)), logical(1)))) {
    stop("NaN values require an explicit missing-value encoding before conversion.")
  }
  if (any(vapply(data, function(x) is.character(x) && any(x == "NA", na.rm = TRUE), logical(1)))) {
    stop("Literal NA text requires an explicit missing-value encoding before conversion.")
  }
  # Seventeen significant digits preserve the original binary numeric values.
  # Numeric text is written unquoted; original text and headers remain quoted.
  encoded <- data
  numeric_columns <- which(kinds == "double")
  for (i in numeric_columns) {
    encoded[[i]] <- sprintf("%.17g", data[[i]])
    encoded[[i]][is.na(data[[i]])] <- NA_character_
  }
  quote_columns <- which(kinds == "character")
  if ("SAMPLE.NUMBER" %in% names(data)) {
    sample <- data[["SAMPLE.NUMBER"]]
    if (is.numeric(sample) && any(!is.na(sample) & (sample < 0 | sample != floor(sample)))) {
      stop("SAMPLE.NUMBER must contain nonnegative whole-number identifiers.")
    }
    text <- if (is.numeric(sample)) sprintf("%.0f", sample) else as.character(sample)
    if (any(!is.na(sample) & !grepl("^[0-9]+$", text))) stop("Unsupported SAMPLE.NUMBER format.")
    text[is.na(sample)] <- NA_character_
    encoded[["SAMPLE.NUMBER"]] <- ifelse(is.na(text), NA_character_,
      paste0(strrep("0", pmax(0L, 4L - nchar(text))), text))
    quote_columns <- union(quote_columns, match("SAMPLE.NUMBER", names(data)))
  }
  dir.create(dirname(output), recursive = TRUE, showWarnings = FALSE)
  temporary <- tempfile(".fjs-convert-", tmpdir = dirname(output), fileext = ".csv")
  on.exit(if (file.exists(temporary)) unlink(temporary), add = TRUE)
  write.csv(encoded, temporary, row.names = FALSE, na = "NA", fileEncoding = "UTF-8",
            quote = quote_columns)
  column_types <- unname(c(character = "character", integer = "integer",
                          double = "numeric", logical = "logical")[kinds])
  if ("SAMPLE.NUMBER" %in% names(data)) {
    column_types[match("SAMPLE.NUMBER", names(data))] <- "character"
  }
  restored <- read.csv(temporary, colClasses = column_types, check.names = FALSE,
                       stringsAsFactors = FALSE, na.strings = "NA", fileEncoding = "UTF-8")
  if (!identical(dim(data), dim(restored)) || !identical(names(data), names(restored))) {
    stop("CSV row count or column names changed during conversion.")
  }
  equal <- vapply(seq_along(data), function(i) {
    if (names(data)[[i]] == "SAMPLE.NUMBER") return(identical(encoded[[i]], restored[[i]]))
    isTRUE(all.equal(data[[i]], restored[[i]], tolerance = 0, check.attributes = FALSE))
  }, logical(1))
  if (!all(equal)) stop("CSV values did not round-trip in: ", paste(names(data)[!equal], collapse = ", "))
  if ("SAMPLE.NUMBER" %in% names(data)) {
    labels <- restored[["SAMPLE.NUMBER"]]
    if (!identical(labels, encoded[["SAMPLE.NUMBER"]])) stop("Padded sample identifiers did not verify.")
    if (is.numeric(data[["SAMPLE.NUMBER"]]) &&
        !isTRUE(all.equal(as.numeric(labels), as.numeric(data[["SAMPLE.NUMBER"]]), tolerance = 0))) {
      stop("Sample identifier meanings changed during conversion.")
    }
  }
  if (!identical(original_md5, unname(tools::md5sum(input)))) stop("The source RDS changed during conversion.")
  if (!file.rename(temporary, output)) stop("Could not finalize the CSV file.")
  cat("Converted and verified:", nrow(data), "rows and", ncol(data), "columns.\n")
  cat("All values and missing values passed the round-trip check.\n")
  cat("Original RDS unchanged. No files were uploaded.\n")
  cat("CSV:", normalizePath(output, winslash = "/", mustWork = TRUE), "\n")
  invisible(output)
}

if (sys.nframe() == 0L) {
  arguments <- commandArgs(trailingOnly = TRUE)
  if (length(arguments) != 2L) stop("Usage: Rscript convert_fjs_rds_to_csv.R INPUT.rds OUTPUT.csv")
  convert_fjs_rds_to_csv(arguments[[1]], arguments[[2]])
}
