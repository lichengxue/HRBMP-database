# FJS Supabase Uploader

A local Shiny app with one purpose: upload a reviewed sample batch to Supabase.
It shows one step at a time and advances automatically when a step succeeds.
It reuses the repository's R and Python preparation and publishing scripts.

The header's **User manual** button opens the complete setup and upload guide,
including required files, confidential-data handling, errors, retries, and
updates. Its **Version history** tab lists release notes. The current GUI
version is read from `archive_app/VERSION` and displayed in the header/footer.

During upload, a determinate bar shows confirmed successful uploads as
`30/613 files uploaded`. Failed files are counted separately. Verification
follows upload, and completion still requires successful remote verification.
After verification the app saves timestamped text and JSON completion reports
under `<package>/reports/`, outside Git. The completion screen shows the saved
path and a **Download upload report** button. Reports contain batch totals,
excluded photos, version, verification evidence and time, and file checksums;
credentials are not recorded. Prior reports remain available after retries.

## Start

Use a fresh R process from PowerShell:

~~~powershell
& "C:\Program Files\R\R-4.5.2\bin\Rscript.exe" --vanilla "C:\Users\liche\Desktop\HRBMP-database\scripts\start_fjs_archive_app.R"
~~~

The launcher opens your default browser automatically, including when started
with Rscript from PowerShell. Keep PowerShell and the browser page open.
If the browser does not open, visit http://127.0.0.1:8840 manually.
Press Ctrl+C in PowerShell to stop the app. After a code update, stop and
restart the R process, then refresh the browser.

In a fresh RStudio session, you can instead run:

~~~r
source("C:/Users/liche/Desktop/HRBMP-database/scripts/start_fjs_archive_app.R")
~~~

If another Shiny version is already loaded, use Session > Restart R or the
PowerShell command. The launcher detects conflicting package versions.

## Four steps

1. **Sample files.** Choose the ZIP download and expected part count, or choose
   existing sample folders. Click **Merge files & continue** or **Use these
   folders & continue**. On success, Step 2 opens automatically.
2. **Survey data.** Choose the local confidential survey CSV and data dictionary
   workbook, and name the batch. A full dataset or a matching subset can be
   used. **Prepare & check upload** extracts the matching rows, builds the
   upload package, and runs the dry run. On success, Step 3 opens automatically.
3. **Review.** Review the sample count, files, and QC report. Missing images or
   sheets need a researcher's assessment. Tick the review box and click
   **Continue to upload**.
4. **Upload.** Confirm the project URL, enter the secret/service-role key in the
   masked field, and click **Upload & verify**. Confirm the destination and
   counts. The completion screen opens only after publishing and verification
   succeed.

The interface has no example generator, Drive downloader, separate subset
export, manual dry-run task, or standalone verification task. Those tools
remain available as scripts. Technical output is collapsed under **Run details**.
An error keeps you on the current step and shows what needs attention.

Review lists unmatched representative photos that were retained locally and
excluded from the upload manifests. These are informational and do not prevent
continuing after review. Their original files remain unchanged. Other QC gaps,
such as absent PDFs, still need the researcher's assessment.

Each step after Samples has a Back button naming the previous step. Return to
any earlier step by clicking its completed entry in the left sidebar. Later
steps stay locked, and navigation is disabled while a task is running.
Correct the earlier inputs, then prepare and check again. Unchanged inputs reuse the
current package; changed inputs generate a new package and require new checks.
Returning from Upload clears the API key and any pending upload confirmation.

Browse dialogs refresh their listings every second and include Downloads and
Desktop shortcuts. Survey selection shows CSV files; dictionary selection
shows XLSX files. Sample selection chooses the folder containing the ZIPs or
sample folders. Incomplete browser downloads appear after their final file
extension is available.
In file-detail view, click Name, Size, Modified, or Created to sort; click the
same header again to reverse the order. Date columns initially show newest
first. The arrow shows the current direction, and the order and selected file
are retained when the listing refreshes. Headers also support Enter and Space.

## Resume without merging again

The app saves progress outside Git, without the API key. Reopening it resumes
a completed merge at Step 2. It also recognizes successful merge jobs created
by the older interface, so existing Batch5 folders can be reused.

A prepared package resumes at review with a fresh local dry run; review must
be confirmed again. An unchanged completed upload resumes at the completion
screen. **Start another upload** begins a new batch.

## Local data and credentials

The default work folder is **C:/Users/liche/Desktop/FJS_Archive_Work**.
Step 1's **Save location** section lets you choose another folder or drive.
Set FJS_WORK_ROOT before launch to change the initial folder. Packages, merged
files, subsets, progress, redacted logs, and temporary extraction stay outside
the code repository. Git repository output locations are rejected.

The full survey CSV is read in place and stays unchanged. Only matching sample
rows enter the package. Matching uses year and sample number, with task and
date checked when present. All matching taxon rows and original columns are
retained. A missing selected sample blocks preparation.

Uploads use private access. The key starts empty and is held in memory only.
It is passed to the publishing worker through the process environment, cleared
from the field when upload starts, and excluded from requests, saved progress,
receipts, and logs. Log lines are buffered and redacted before saving.

## What the checks cover

The automatic dry run validates the local package and planned operations. It
does not test remote permissions. Changing the project URL repeats the local
check before upload can proceed.

After uploading database rows and files, verification reads back sample and
asset records, compares recorded paths and SHA-256 values, and checks Storage
object existence and size. It does not download and independently hash remote
contents. The Supabase schema and bucket must already exist.

An upload failure can leave some records or files saved. Inspect Run details
before retrying. The retry option permits replacing existing Storage paths
when intended. Stopping a step keeps any partial output; a retry uses a new
preparation folder. Original downloaded ZIPs are retained.

## Clean-checkout dependencies and tests

Run this once from R:

~~~r
setwd("C:/Users/liche/Desktop/HRBMP-database")
source("scripts/install_fjs_archive_app.R")
~~~

The installer uses tools/shiny-library, ignored by Git. Use R 4.5 or later on
Windows. Python 3.11 or later needs pandas and openpyxl. The app locates the
bundled Python when available; set FJS_PYTHON to select another executable.
Set FJS_APP_PORT to choose another local port.

Tests use synthetic data and a loopback mock Supabase API, including actual
Shiny button handlers, automatic advancement, review gates, resuming completed
merges, key redaction, and the upload/verification round trip.

~~~powershell
$env:FJS_TEST_RSCRIPT = "C:\Program Files\R\R-4.5.2\bin\Rscript.exe"
python -m unittest discover -s tests -p test_fjs_archive_app.py -v
~~~
