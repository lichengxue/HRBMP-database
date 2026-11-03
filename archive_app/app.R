library(shiny)
repo_root <- Sys.getenv("FJS_REPO_ROOT", normalizePath("..", winslash = "/", mustWork = TRUE))
source(file.path(repo_root, "archive_app", "workflow.R"))
source(file.path(repo_root, "archive_app", "wizard.R"))
assign("%||%", function(left, right) if (is.null(left)) right else left)
work_default <- fjs_app_work_root(repo_root)
user_root <- Sys.getenv("USERPROFILE", path.expand("~"))
python_default <- fjs_app_python(repo_root)
app_version <- fjs_app_version(repo_root)
fresh_output <- function(root, label, kind = "packages") {
  label <- gsub("[^A-Za-z0-9_.-]", "_", label)
  tempfile(paste0(label, "_", format(Sys.time(), "%Y%m%d_%H%M%S"), "_"), tmpdir = file.path(root, kind))
}
folder_picker <- function(id, label, value = "") {
  div(class = "path-picker", textInput(id, label, value),
      shinyFiles::shinyDirButton(paste0(id, "_browse"), "Browse", label))
}
file_picker <- function(id, label) {
  div(class = "path-picker", textInput(id, label),
      shinyFiles::shinyFilesButton(paste0(id, "_browse"), "Browse", label, multiple = FALSE))
}
manual_key_input <- function() {
  htmltools::tagQuery(passwordInput("secret", "Private Supabase API key", ""))$
    find("input")$addAttrs(autocomplete = "off", spellcheck = "false")$allTags()
}
ui <- fluidPage(
  tags$head(tags$title("FJS Supabase Uploader"),
    tags$link(rel = "stylesheet", href = paste0("style.css?v=",
      unname(tools::md5sum(file.path(repo_root, "archive_app", "www", "style.css"))))),
    tags$script(src = paste0("browse-sort.js?v=",
      unname(tools::md5sum(file.path(repo_root, "archive_app", "www", "browse-sort.js"))))),
    tags$script(HTML("
      Shiny.addCustomMessageHandler('fjs-controls', function(states) {
        Object.keys(states).forEach(function(id) {
          var el = document.getElementById(id); if (el) el.disabled = states[id];
        });
      });
      Shiny.addCustomMessageHandler('fjs-step', function(message) {
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    "))),
  div(class = "app-shell",
    tags$aside(class = "rail", div(class = "brand-mark", "HR"),
      div(class = "brand-name", "HRBMP", tags$span("Supabase uploader")),
      div(class = "rail-caption", "YOUR UPLOAD"), uiOutput("step_list"),
      div(class = "rail-bottom", div(class = "local-dot"), "Private files stay local",
        tags$p("Working files are saved outside Git. Your full dataset is read in place."))),
    tags$main(class = "main",
      div(class = "page-header", div(tags$p(class = "eyebrow", "FALL JUVENILE SURVEY"),
        tags$h1("Upload samples to Supabase"),
        tags$p(class = "subtitle", "One step at a time. Each completed step opens the next.")),
        div(class = "app-tools", tags$span(paste0("v", app_version)),
          actionButton("open_manual", "User manual", class = "btn-outline"))),
      uiOutput("step_status"), uiOutput("run_progress"), uiOutput("error_message"),
      tags$fieldset(id = "wizard_fields", tabsetPanel(id = "wizard", type = "hidden",
        tabPanel("Samples", value = "source",
          div(class = "card",
            div(class = "step-heading", tags$span("STEP 1 OF 4"), tags$h2("Choose your sample files")),
            tags$p("Select the downloaded ZIP parts or an existing folder of sample folders."),
            radioButtons("source_mode", NULL, c("Downloaded ZIPs" = "zip", "Sample folders" = "raw"), inline = TRUE),
            folder_picker("source_dir", "Source folder", file.path(user_root, "Downloads")),
            conditionalPanel("input.source_mode === 'zip'",
              selectInput("zip_group", "ZIP download", choices = character()),
              numericInput("expected_parts", "Number of ZIP parts", 3, min = 1, step = 1),
              tableOutput("zip_files")),
            tags$details(class = "optional", tags$summary("Save location"),
              folder_picker("work_root", "Local work folder (outside Git)", work_default),
              tags$p(class = "hint", "Merged files, upload packages, and temporary files stay here. You can choose another drive.")),
            div(class = "action-row", actionButton("source_next", "Merge files & continue", class = "btn-primary")))),
        tabPanel("Survey data", value = "metadata",
          div(class = "card",
            div(class = "step-heading", tags$span("STEP 2 OF 4"), tags$h2("Select your survey data")),
            uiOutput("source_summary"),
            file_picker("confidential_csv", "Local survey CSV (full dataset or matching subset)"),
            tags$p(class = "hint", "The full CSV stays unchanged in its original location. Only rows for these sample folders are saved."),
            file_picker("dictionary", "Data dictionary (.xlsx)"),
            textInput("batch_name", "Batch name", "FJS_archive_batch"),
            tags$p(class = "hint", "The next button extracts matching rows, prepares the files, and runs the upload checks automatically. Nothing is uploaded yet."),
            div(class = "action-row",
              actionButton("back_source", "Back to sample files", class = "btn-outline"),
              actionButton("prepare_next", "Prepare & check upload", class = "btn-primary")))),
        tabPanel("Review", value = "review",
          div(class = "card",
            div(class = "step-heading", tags$span("STEP 3 OF 4"), tags$h2("Review your upload")),
            uiOutput("package_summary"),
            uiOutput("excluded_photos_note"),
            tags$h3("Quality checks"), verbatimTextOutput("qc_report"),
            tags$details(class = "optional", tags$summary("Sample IDs"), tableOutput("sample_table")),
            checkboxInput("qc_reviewed", "I have reviewed the samples and quality checks.", FALSE),
            div(class = "action-row",
              actionButton("back_metadata", "Back to survey data", class = "btn-outline"),
              actionButton("review_next", "Continue to upload", class = "btn-primary")))),
        tabPanel("Upload", value = "publish",
          div(class = "card",
            div(class = "step-heading", tags$span("STEP 4 OF 4"), tags$h2("Upload to Supabase")),
            uiOutput("upload_summary"),
            textInput("supabase_url", "Supabase project URL", "https://vnqulddrlhkftcqpekpl.supabase.co"),
            manual_key_input(), actionButton("clear_secret", "Clear key", class = "btn-small"),
            tags$p(class = "hint", "Enter the secret/service-role key yourself. It is cleared when upload starts and is never saved in a file or log."),
            tags$details(class = "optional", tags$summary("Retry options"),
              checkboxInput("upsert", "Replace files already stored at the same paths", FALSE)),
            div(class = "action-row", actionButton("back_review", "Back to review", class = "btn-outline"),
              actionButton("publish", "Upload & verify", class = "btn-primary")))),
        tabPanel("Complete", value = "done",
          div(class = "card complete-card", div(class = "complete-mark", "\u2713"),
            tags$h2("Upload complete"), tags$p("Your samples and archive files were uploaded and verified."),
            uiOutput("done_summary"),
            actionButton("start_again", "Start another upload", class = "btn-outline"))))),
      tags$details(class = "run-details", tags$summary("Run details"),
        verbatimTextOutput("run_log")),
      tags$footer(paste("FJS Supabase Uploader", paste0("v", app_version)), tags$span("Local preparation \u00b7 Private access \u00b7 Verified upload"))))
)

server <- function(input, output, session) {
  busy <- reactiveVal(FALSE)
  state <- reactiveValues(step = "source", source = NULL, package = NULL, prepared_signature = NULL,
    dry_fingerprint = NULL, dry_url = NULL, process = NULL, request = NULL, cancelled = FALSE,
    log = "", log_pending = "", log_file = NULL, secret = "", error = "", pending = NULL,
    restored_root = "", checked_url = NULL, upload_progress = NULL)
  observeEvent(input$open_manual, {
    releases <- jsonlite::fromJSON(file.path(repo_root, "archive_app", "releases.json"), simplifyVector = FALSE)
    showModal(modalDialog(title = paste("User manual", paste0("v", app_version)), size = "l",
      easyClose = TRUE, footer = modalButton("Close manual"),
      tabsetPanel(tabPanel("End-to-end guide",
        div(class = "user-manual", includeHTML(file.path(repo_root, "archive_app", "manual.html")))),
        tabPanel("Version history", div(class = "user-manual",
          tags$p("The version identifies the local GUI code. Updating GitHub does not update an already running app."),
          lapply(releases, function(release) tagList(tags$h3(paste0("v", release$version, " — ", release$date)),
            tags$ul(lapply(release$notes, tags$li)))))))))
  })
  roots <- c(Downloads = file.path(user_root, "Downloads"),
             Desktop = file.path(user_root, "Desktop"),
             Home = normalizePath(user_root, winslash = "/"), Work = work_default)
  roots <- roots[dir.exists(roots)]
  download_root <- if ("Downloads" %in% names(roots)) "Downloads" else "Home"
  for (id in c("source_dir", "work_root")) local({
    field <- id
    shinyFiles::shinyDirChoose(input, paste0(field, "_browse"), roots = roots, session = session,
      updateFreq = 1000, defaultRoot = if (field == "work_root" && "Work" %in% names(roots)) "Work" else download_root)
    observeEvent(input[[paste0(field, "_browse")]], {
      selected <- shinyFiles::parseDirPath(roots, input[[paste0(field, "_browse")]])
      if (length(selected) && nzchar(selected)) updateTextInput(session, field, value = selected)
    })
  })
  for (id in c("confidential_csv", "dictionary")) local({
    field <- id
    shinyFiles::shinyFileChoose(input, paste0(field, "_browse"), roots = roots, session = session,
      updateFreq = 1000, defaultRoot = download_root,
      filetypes = if (field == "dictionary") "xlsx" else "csv")
    observeEvent(input[[paste0(field, "_browse")]], {
      selected <- shinyFiles::parseFilePaths(roots, input[[paste0(field, "_browse")]])
      if (nrow(selected)) updateTextInput(session, field, value = selected$datapath[[1]])
    })
  })
  go <- function(step) {
    state$step <- step
    state$error <- ""
    updateTabsetPanel(session, "wizard", selected = step)
    session$sendCustomMessage("fjs-step", list())
  }
  require_step <- function(step) {
    if (busy()) stop("Please wait for the current step to finish.")
    if (!identical(state$step, step)) stop("Complete the current step first.")
  }
  safe_action <- function(action) tryCatch(action(), error = function(e) {
    state$error <- fjs_app_redact(conditionMessage(e), input$secret %||% "")
  })
  settings <- function() {
    metadata_demo <- any(vapply(c(input$confidential_csv %||% "", input$dictionary %||% ""), function(path) {
      nzchar(path) && file.exists(path) && fjs_wizard_is_demo(path)
    }, logical(1)))
    list(app_version = app_version, work_root = fjs_app_work_root(repo_root, input$work_root),
      source_mode = "raw", source_dir = state$source$root %||% input$source_dir,
      metadata_mode = "confidential", confidential_csv = trimws(input$confidential_csv %||% ""),
      dictionary = trimws(input$dictionary %||% ""), batch_name = trimws(input$batch_name %||% ""),
      access_level = "private", python = python_default,
      supabase_url = trimws(input$supabase_url %||% ""),
      upsert = isTRUE(input$upsert), demo = if (is.null(state$source)) FALSE else
        isTRUE(state$source$demo) || fjs_wizard_is_demo(state$source$root) || metadata_demo,
      package_root = state$package$root %||% "")
  }
  save_progress <- function(completed = FALSE) {
    if (!is.null(state$source)) fjs_wizard_save(settings()$work_root, state$source, settings(), state$package, completed)
  }
  append_log <- function(text, flush = FALSE) {
    chunk <- fjs_app_log_chunk(isolate(state$log_pending), text, isolate(state$secret), flush)
    isolate(state$log_pending <- chunk$pending)
    if (!nzchar(chunk$clean)) return()
    isolate({
      state$upload_progress <- fjs_app_upload_progress(state$upload_progress, chunk$clean)
      state$log <- paste0(state$log, chunk$clean)
      if (nchar(state$log) > 50000) state$log <- substr(state$log, nchar(state$log) - 49999, nchar(state$log))
      if (!is.null(state$log_file)) cat(chunk$clean, file = state$log_file, append = TRUE)
    })
  }
  start_job <- function(operation, cfg, secret = "") {
    if (busy()) stop("Another step is running.")
    if (!file.exists(cfg$python)) stop("Python was not found. Set FJS_PYTHON to your Python executable and restart the app.")
    if (any(c("secret", "api_key", "password") %in% names(cfg))) stop("Credentials cannot be saved in a job.")
    folder <- file.path(fjs_app_work_root(repo_root, cfg$work_root), "jobs")
    dir.create(folder, recursive = TRUE, showWarnings = FALSE)
    request <- tempfile(paste0(operation, "-"), tmpdir = folder, fileext = ".rds")
    job <- list(operation = operation, settings = cfg, result_file = paste0(request, ".result.rds"))
    saveRDS(job, request)
    state$request <- job
    state$log_file <- paste0(request, ".log")
    file.create(state$log_file)
    state$log <- ""; state$log_pending <- ""; state$secret <- secret
    state$error <- ""; state$cancelled <- FALSE
    state$upload_progress <- if (operation == "publish")
      list(uploaded = 0, failed = 0, total = state$package$assets, phase = "tables") else NULL
    temporary <- file.path(cfg$work_root, "temporary")
    dir.create(temporary, recursive = TRUE, showWarnings = FALSE)
    rscript <- file.path(R.home("bin"), if (.Platform$OS.type == "windows") "Rscript.exe" else "Rscript")
    state$process <- processx::process$new(rscript,
      c("--vanilla", file.path(repo_root, "archive_app/worker.R"), repo_root, request),
      stdout = "|", stderr = "2>&1", wd = repo_root, cleanup_tree = TRUE, windows_hide_window = TRUE,
      env = c("current", PYTHONUTF8 = "1", LANG = "C", LC_ALL = "C",
        TMPDIR = temporary, TEMP = temporary, TMP = temporary, SUPABASE_SERVICE_ROLE_KEY = secret))
    busy(TRUE)
    if (operation == "publish") updateTextInput(session, "secret", value = "")
  }
  groups <- reactive(fjs_app_zip_groups(input$source_dir %||% ""))
  observeEvent(groups(), {
    choices <- groups()
    selected <- if (isTRUE(input$zip_group %in% choices$key)) input$zip_group else tail(choices$key, 1L)
    if (!nrow(choices)) selected <- character()
    updateSelectInput(session, "zip_group", choices = setNames(choices$key, choices$label), selected = selected)
  }, ignoreNULL = FALSE)
  observeEvent(input$source_mode, {
    updateActionButton(session, "source_next", label = if (input$source_mode == "zip") "Merge files & continue" else "Use these folders & continue")
  })
  output$zip_files <- renderTable({
    req(input$source_mode == "zip", nzchar(input$zip_group))
    files <- tryCatch(fjs_app_selected_zips(input$source_dir, input$zip_group, input$expected_parts), error = function(e) character())
    if (!length(files)) return(data.frame(Check = "Select the complete set of ZIP parts."))
    data.frame(File = basename(files), Size = vapply(file.info(files)$size, fjs_app_size, character(1)))
  })
  observeEvent(input$work_root, safe_action(function() {
    if (busy() || state$step != "source") return()
    root <- fjs_app_work_root(repo_root, input$work_root)
    if (identical(state$restored_root, root)) return()
    state$restored_root <- root
    resumed <- fjs_wizard_resume(root, repo_root)
    if (is.null(resumed)) return()
    state$source <- resumed$source
    state$package <- resumed$package
    updateRadioButtons(session, "source_mode", selected = "raw")
    updateTextInput(session, "source_dir", value = resumed$source$root)
    for (field in c("confidential_csv", "dictionary", "batch_name", "supabase_url")) {
      value <- resumed$settings[[field]]
      if (is.character(value) && length(value) == 1L && nzchar(value)) updateTextInput(session, field, value = value)
    }
    if (identical(resumed$settings$batch_name, "FJS_archive_batch") &&
        startsWith(resumed$settings$zip_group %||% "", "Batch5")) updateTextInput(session, "batch_name", value = "FJS_Batch5")
    if (is.null(resumed$package)) {
      go("metadata")
    } else if (resumed$completed) {
      go("done")
    } else {
      go("review")
      cfg <- settings()
      cfg$supabase_url <- resumed$settings$supabase_url %||% cfg$supabase_url
      cfg$fingerprint <- resumed$package$fingerprint
      start_job("dry_run", cfg)
    }
  }))
  observeEvent(input$source_next, safe_action(function() {
    require_step("source")
    state$package <- NULL; state$prepared_signature <- NULL; state$dry_fingerprint <- NULL
    root <- fjs_app_work_root(repo_root, input$work_root)
    if (input$source_mode == "raw") {
      state$source <- fjs_wizard_inventory(input$source_dir, repo_root)
      save_progress(); go("metadata")
    } else {
      fjs_app_selected_zips(input$source_dir, input$zip_group, input$expected_parts)
      cfg <- settings()
      cfg$source_mode <- "zip"; cfg$source_dir <- fjs_app_absolute(input$source_dir)
      cfg$demo <- fjs_wizard_is_demo(cfg$source_dir)
      cfg$zip_group <- input$zip_group; cfg$expected_parts <- input$expected_parts
      cfg$output_root <- fresh_output(root, "FJS_merged", "merged")
      start_job("merge", cfg)
    }
  }))
  observeEvent(input$prepare_next, safe_action(function() {
    require_step("metadata")
    req(state$source)
    cfg <- settings()
    if (!file.exists(cfg$confidential_csv) || !file.exists(cfg$dictionary)) stop("Choose your local survey CSV and data dictionary.")
    fjs_app_private_path(cfg$confidential_csv, repo_root)
    if (!nzchar(cfg$batch_name)) stop("Enter a batch name.")
    if (!fjs_wizard_url_valid(cfg$supabase_url)) stop("Enter a valid Supabase project URL.")
    source <- fjs_wizard_inventory(state$source$root, repo_root)
    signature <- fjs_wizard_signature(cfg, source)
    if (!is.null(state$package) && identical(signature, state$prepared_signature)) {
      current <- fjs_app_package(state$package$root, repo_root)
      if (identical(current$fingerprint, state$package$fingerprint)) {
        go("review")
        if (!identical(state$dry_fingerprint, current$fingerprint) ||
            !identical(state$dry_url, cfg$supabase_url)) {
          cfg$fingerprint <- current$fingerprint
          start_job("dry_run", cfg)
        }
        return()
      }
    }
    source$demo <- isTRUE(source$demo) || isTRUE(state$source$demo)
    state$source <- source; state$package <- NULL; state$dry_fingerprint <- NULL
    state$prepared_signature <- signature
    cfg$output_root <- fresh_output(cfg$work_root, cfg$batch_name)
    start_job("prepare_checked", cfg)
  }))
  observeEvent(input$review_next, safe_action(function() {
    require_step("review")
    if (!isTRUE(input$qc_reviewed)) stop("Review the samples and quality checks, then tick the review box.")
    pkg <- fjs_app_package(state$package$root, repo_root)
    if (!identical(pkg$fingerprint, state$dry_fingerprint)) stop("The package changed or its checks did not pass. Return to survey data and prepare it again.")
    go("publish")
  }))
  observeEvent(input$back_source, safe_action(function() { require_step("metadata"); go("source") }))
  observeEvent(input$back_metadata, safe_action(function() { require_step("review"); go("metadata") }))
  observeEvent(input$back_review, safe_action(function() {
    require_step("publish")
    state$pending <- NULL; state$secret <- ""
    updateTextInput(session, "secret", value = "")
    go("review")
  }))
  observeEvent(input$sidebar_step, safe_action(function() {
    steps <- c("source", "metadata", "review", "publish")
    target <- input$sidebar_step
    if (busy() || !is.character(target) || length(target) != 1L ||
        !target %in% steps || !state$step %in% steps) return()
    if (match(target, steps) >= match(state$step, steps)) return()
    state$pending <- NULL; state$secret <- ""
    updateTextInput(session, "secret", value = "")
    go(target)
  }))
  destination <- debounce(reactive(trimws(input$supabase_url %||% "")), 500)
  observeEvent(destination(), safe_action(function() {
    if (state$step != "publish" || busy() || is.null(state$package)) return()
    url <- destination()
    if (identical(url, state$dry_url)) return()
    state$dry_fingerprint <- NULL
    if (!fjs_wizard_url_valid(url)) {
      state$error <- "Enter the Supabase project URL, such as https://your-project.supabase.co."
      return()
    }
    cfg <- settings()
    cfg$fingerprint <- fjs_app_package(cfg$package_root, repo_root)$fingerprint
    start_job("dry_run", cfg)
  }), ignoreInit = TRUE)
  observeEvent(input$clear_secret, {
    if (!busy()) { updateTextInput(session, "secret", value = ""); state$secret <- "" }
  })
  upload_ready <- function() {
    require_step("publish")
    cfg <- settings()
    pkg <- fjs_app_package(cfg$package_root, repo_root)
    fjs_app_publish_ready(pkg, state$dry_fingerprint, state$dry_url, cfg$supabase_url, input$qc_reviewed)
    if (!nzchar(trimws(input$secret %||% ""))) stop("Enter your private Supabase API key.")
    cfg$fingerprint <- pkg$fingerprint
    cfg
  }
  observeEvent(input$publish, safe_action(function() {
    cfg <- upload_ready()
    state$pending <- cfg
    showModal(modalDialog(title = "Upload this batch?",
      tags$p(paste(state$package$samples, "samples and", state$package$assets, "files will be uploaded with private access.")),
      tags$strong(cfg$supabase_url),
      tags$p(if (cfg$upsert) "Files at existing Storage paths may be replaced." else "Files at existing Storage paths will be kept."),
      footer = tagList(modalButton("Cancel"), actionButton("confirm_publish", "Upload & verify", class = "btn-primary"))))
  }))
  observeEvent(input$confirm_publish, safe_action(function() {
    cfg <- upload_ready()
    if (is.null(state$pending) || !identical(cfg, state$pending)) stop("The upload settings changed. Review the confirmation again.")
    removeModal()
    start_job("publish", cfg, trimws(input$secret))
    state$pending <- NULL
  }))
  observeEvent(input$start_again, safe_action(function() {
    require_step("done")
    state$upload_progress <- NULL
    state$source <- NULL; state$package <- NULL; state$dry_fingerprint <- NULL
    state$prepared_signature <- NULL
    updateRadioButtons(session, "source_mode", selected = "zip")
    updateTextInput(session, "source_dir", value = file.path(user_root, "Downloads"))
    updateTextInput(session, "secret", value = "")
    go("source")
  }))
  observe({
    invalidateLater(350, session)
    isolate({
      process <- state$process
      if (is.null(process)) return()
      process$poll_io(0)
      append_log(process$read_output())
      if (process$is_alive()) return()
      append_log(process$read_all_output(), flush = TRUE)
      completed <- state$request
      success <- identical(process$get_exit_status(), 0L) && !state$cancelled && file.exists(completed$result_file)
      result <- if (success) readRDS(completed$result_file) else list(ok = FALSE)
      state$process <- NULL; busy(FALSE)
      tryCatch({
        if (!success || !isTRUE(result$ok)) {
          if (completed$operation == "publish" && !is.null(state$upload_progress)) state$upload_progress$phase <- "stopped"
          messages <- grep("Error:|failed|matched [0-9]+/", strsplit(state$log, "\n", fixed = TRUE)[[1]], value = TRUE)
          state$error <- if (state$cancelled) "Step stopped. You can retry when ready." else
            if (length(messages)) tail(messages, 1L) else "This step did not finish. Open Run details below for the error."
          if (completed$operation == "publish") state$error <- paste(state$error, "Some records or files may already have uploaded.")
        } else if (completed$operation == "merge") {
          state$source <- fjs_wizard_inventory(result$raw_root, repo_root)
          state$source$demo <- isTRUE(completed$settings$demo)
          if (state$source$demo) saveRDS(TRUE, file.path(state$source$root, ".fjs_synthetic.rds"))
          updateRadioButtons(session, "source_mode", selected = "raw")
          updateTextInput(session, "source_dir", value = result$raw_root)
          if (startsWith(completed$settings$zip_group, "Batch5")) updateTextInput(session, "batch_name", value = "FJS_Batch5")
          save_progress(); go("metadata")
        } else if (completed$operation == "prepare_checked") {
          state$package <- fjs_app_package(result$package_root, repo_root)
          state$dry_fingerprint <- result$checked_fingerprint
          state$dry_url <- result$checked_url
          updateCheckboxInput(session, "qc_reviewed", value = FALSE)
          save_progress(); go("review")
        } else if (completed$operation == "dry_run") {
          state$dry_fingerprint <- completed$settings$fingerprint
          state$dry_url <- completed$settings$supabase_url
          state$error <- ""
        } else if (completed$operation == "publish" && isTRUE(result$verified)) {
          state$upload_progress$phase <- "complete"
          save_progress(completed = TRUE); go("done")
        }
      }, error = function(e) { state$error <- fjs_app_redact(conditionMessage(e), state$secret) })
      state$secret <- ""
    })
  })
  observeEvent(input$stop_run, {
    if (!is.null(state$process)) { state$cancelled <- TRUE; state$process$kill_tree() }
  })
  output$step_list <- renderUI({
    labels <- c(source = "Sample files", metadata = "Survey data", review = "Review", publish = "Upload")
    current <- match(state$step, c(names(labels), "done"))
    tagList(lapply(seq_along(labels), function(i) {
      clickable <- i < current && current <= length(labels) && !busy()
      div(class = paste("rail-step", if (i < current) "finished" else if (i == current) "current" else ""),
        tags$button(type = "button", class = "step-circle", `data-step` = names(labels)[[i]],
        disabled = if (!clickable) "disabled" else NULL,
        `aria-current` = if (i == current) "step" else NULL,
        `aria-label` = paste(if (clickable) "Back to" else "Step", labels[[i]]),
        onclick = "Shiny.setInputValue('sidebar_step', this.dataset.step, {priority: 'event'});", i),
        div(tags$strong(labels[[i]]),
          tags$small(if (i < current) "Complete" else if (i == current) "Current step" else "Next")))
    }))
  })
  output$step_status <- renderUI({
    if (is.null(state$source) || state$step == "source") return(NULL)
    div(class = "status-banner success", span(class = "status-dot"),
      paste(state$source$samples, if (state$source$samples == 1) "sample folder and" else "sample folders and",
        state$source$assets, "files are ready."))
  })
  output$source_summary <- renderUI({
    req(state$source)
    div(class = "source-note", tags$strong(paste("Step 1 complete:", state$source$samples,
        if (state$source$samples == 1) "sample ready." else "samples ready.")),
        tags$p(class = "hint", state$source$root))
  })
  output$package_summary <- renderUI({
    req(state$package)
    pkg <- state$package
    div(class = "review-summary", tags$strong(paste(pkg$samples, if (pkg$samples == 1) "sample" else "samples",
        "\u00b7", pkg$assets, "files", "\u00b7", fjs_app_size(pkg$bytes))),
      tags$p("Metadata matched. The local upload checks passed. Access: private."),
      if (pkg$demo) tags$p(class = "hint", "Synthetic test package. Live upload is disabled."))
  })
  output$upload_summary <- renderUI({
    req(state$package)
    div(class = "source-note", tags$strong(paste(state$package$samples,
        if (state$package$samples == 1) "sample and" else "samples and", state$package$assets, "files")),
      tags$p(if (identical(trimws(input$supabase_url %||% ""), state$dry_url) && !is.null(state$dry_fingerprint))
        "Reviewed and checked. Enter your key to upload." else "The destination is being checked."))
  })
  output$done_summary <- renderUI({
    req(state$step == "done", state$package)
    reports <- list.files(file.path(state$package$root, "reports"), pattern = "^upload_.*[.]txt$", full.names = TRUE)
    latest <- if (length(reports)) tail(sort(reports), 1L) else ""
    div(tags$p(paste(state$package$samples, "sample records and", state$package$assets, "archive files verified.")),
        tags$p(class = "hint", paste("Local package:", state$package$root)),
        if (nzchar(latest)) tagList(tags$p(class = "hint", paste("Saved upload report:", latest)),
          downloadButton("download_upload_report", "Download upload report")))
  })
  output$download_upload_report <- downloadHandler(
    filename = function() {
      req(state$package)
      reports <- sort(list.files(file.path(state$package$root, "reports"), pattern = "^upload_.*[.]txt$", full.names = TRUE))
      req(length(reports))
      basename(tail(reports, 1L))
    },
    content = function(file) {
      req(state$package)
      reports <- sort(list.files(file.path(state$package$root, "reports"), pattern = "^upload_.*[.]txt$", full.names = TRUE))
      req(length(reports))
      if (!file.copy(tail(reports, 1L), file, overwrite = TRUE)) stop("Could not download the saved report.")
    }, contentType = "text/plain; charset=utf-8")
  output$qc_report <- renderText(state$package$qc %||% "")
  output$excluded_photos_note <- renderUI({
    req(state$package)
    excluded <- state$package$exclusions
    if (is.null(excluded) || !nrow(excluded)) return(NULL)
    div(class = "source-note",
      tags$h3(paste(nrow(excluded), "photos kept locally and excluded from upload")),
      tags$p("These photos have no matching survey taxon record. They remain on your computer and will not be uploaded. This information does not block the next step."),
      tags$ul(lapply(excluded$original_file_name, tags$li)),
      tags$p(class = "hint", "Use Back to survey data to choose corrected metadata. After making corrections, prepare and check the upload again."))
  })
  output$sample_table <- renderTable({
    req(state$package)
    samples <- state$package$tables$fjs_samples
    head(samples[, intersect(c("sample_id", "sample_date", "year"), names(samples)), drop = FALSE], 50)
  })
  output$error_message <- renderUI({
    if (!nzchar(state$error)) return(NULL)
    div(class = "error-note", tags$strong("This step needs attention"), tags$p(state$error))
  })
  output$run_progress <- renderUI({
    progress <- state$upload_progress
    if (!is.null(progress)) {
      return(div(class = "run-progress", `aria-live` = "polite",
        tags$strong(paste0(progress$uploaded, "/", progress$total, " files uploaded")),
        tags$progress(value = progress$uploaded, max = max(1, progress$total),
          `aria-label` = "Successfully uploaded files"),
        tags$p(switch(progress$phase, tables = "Updating database records before file upload…",
          upload = "Uploading archive files…", verify = "Files uploaded. Verifying database records and stored files…",
          complete = "Upload and verification complete.", stopped = "Upload stopped. Check Run details before retrying.")),
        if (progress$failed > 0) tags$p(paste(progress$failed, "files failed; they are not counted as uploaded.")),
        if (busy()) actionButton("stop_run", "Stop this step", class = "btn-small")))
    }
    if (!busy()) return(NULL)
    label <- switch(state$request$operation, merge = "Merging your sample files",
      prepare_checked = "Matching survey data and preparing your upload",
      dry_run = "Checking the upload files", publish = "Uploading and verifying your batch")
    if (state$request$operation == "merge") {
      lines <- grep("Unzipping part [0-9]+/[0-9]+", strsplit(state$log, "\n", fixed = TRUE)[[1]], value = TRUE)
      if (length(lines)) {
        parts <- regmatches(tail(lines, 1L), regexec("Unzipping part ([0-9]+)/([0-9]+)", tail(lines, 1L)))[[1]]
        label <- paste("Unzipping part", parts[[2]], "of", parts[[3]])
      }
    }
    div(class = "run-progress", tags$strong(label), tags$progress(),
      tags$p("Please keep this page open. The next step will open automatically."),
      actionButton("stop_run", "Stop this step", class = "btn-small"))
  })
  output$run_log <- renderText(if (nzchar(state$log)) state$log else "Details will appear here if a step runs.")
  observe({
    running <- busy()
    ready <- !is.null(state$package) && !isTRUE(state$package$demo) &&
      !is.null(state$dry_fingerprint) && identical(trimws(input$supabase_url %||% ""), state$dry_url) &&
      isTRUE(input$qc_reviewed) && nzchar(trimws(input$secret %||% ""))
    have_metadata <- all(nzchar(trimws(c(input$confidential_csv %||% "", input$dictionary %||% "", input$batch_name %||% ""))))
    session$sendCustomMessage("fjs-controls", list(wizard_fields = running,
      source_next = running, prepare_next = running || !have_metadata,
      review_next = running || !isTRUE(input$qc_reviewed) || is.null(state$dry_fingerprint),
      publish = running || !ready, clear_secret = running, back_source = running,
      back_metadata = running, back_review = running, start_again = running))
  })
  session$onSessionEnded(function() {
    isolate({ if (!is.null(state$process)) try(state$process$kill_tree(), silent = TRUE); state$secret <- "" })
  })
}
shinyApp(ui, server)
