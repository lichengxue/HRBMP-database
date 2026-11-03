# FJS Archive Workflow from PowerShell

For a local interface around these steps, use the
[FJS Archive Workbench Shiny app](../archive_app/README.md).

Download, prepare, review, and publish from the same PowerShell window. Local
preparation does not connect to Supabase. Publishing uses the existing archive
tables and `fjs-archive` Storage bucket; those must already be set up.

## 1. Set up the terminal

Use a Git checkout, R, and Python 3.11 or later with `pandas` and `openpyxl`.
For a standard Python installation, install the dependencies once:

```powershell
python -m pip install pandas openpyxl
```

Set full executable paths and choose a new output folder for each batch:

```powershell
cd "$HOME\Desktop\HRBMP-database"
$Python = (Get-Command python -ErrorAction Stop).Source
$Rscript = "C:\Program Files\R\R-4.5.2\bin\Rscript.exe"
$WorkRoot = "$HOME/Desktop/FJS_Archive_Work"
$Batch = "$WorkRoot/packages/FJS_2018_terminal_batch"
$SupabaseUrl = "https://vnqulddrlhkftcqpekpl.supabase.co"
& $Python --version
& $Rscript --version
```

If Python is not on PATH, assign its full executable path to `$Python` instead.
On this Codex workstation the bundled Python also has the required packages:

```powershell
$Python = "$HOME\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
```

Use `git pull --ff-only` from a clean working tree for later code updates. There
is no need to download and extract a GitHub source ZIP for every batch.

## Unzip and merge automatically from R

To add merging at the start of your own R code, source the native R helper and
call it once with the folder containing the ZIPs. It uses only packages included
with R; no Python, extra R packages, or PowerShell script is needed.

```r
repo <- "C:/Users/liche/Desktop/HRBMP-database"
source(file.path(repo, "scripts/merge_fjs_sample_zips.R"))

merged_folder <- merge_fjs_sample_zips(
  zip_dir = "C:/Users/liche/Downloads", # Change to your temporary download folder.
  output_dir = file.path(Sys.getenv("USERPROFILE"), "Desktop/FJS_Archive_Work/merged/FJS_Batch5_R_merged"),
  zip_pattern = "^Batch5_Named_Photos-.*\\.zip$",
  expected_parts = 3
)
```

This automatically finds parts `001`, `002`, and `003` of the same download. It
rejects missing/mixed parts and uses a separate R temporary folder for
extraction. Original ZIPs are retained. The permanent output has one folder per
sample ID, with outer download wrappers removed and any asset subfolders
flattened. All file extensions inside the sample folders are included; hidden
files and files outside sample ID folders are counted as ignored. Identical
duplicate filenames are kept once; different contents stop the run before any
output is created. Saved files are checked against their extracted MD5
checksums. The function removes its extraction folder on success or error.

The output folder must be new. Use the returned `merged_folder` path as the raw
input for the rest of your R workflow. Review `merge_summary.txt` and
`source_merge_log.csv` in that folder for counts and provenance. If disk/copy
errors interrupt final copying, partial output is retained for diagnosis.

The same R helper also runs directly from PowerShell:

```powershell
& $Rscript "$PWD/scripts/merge_fjs_sample_zips.R" `
  --zip-dir "$HOME/Downloads" `
  --zip-pattern "^Batch5_Named_Photos-.*\.zip$" `
  --expected-parts 3 `
  --output-root "$WorkRoot/merged/FJS_Batch5_R_merged"
```

## Only unzip and merge sample folders with Python

If you only need a combined folder, use `--merge-only`. No metadata CSV, data
dictionary, R, or Google connection is required. Set `$ZipFolder` to the local
folder containing all the downloaded ZIP parts, and choose a new output folder:

```powershell
$ZipFolder = "C:/path/to/temporary_folder_with_zips"
& $Python "$PWD/scripts/prepare_fjs_terminal_batch.py" `
  --zip-dir $ZipFolder `
  --output-root "$WorkRoot/merged/FJS_Batch4_2018_merged" `
  --merge-only
if ($LASTEXITCODE -ne 0) { throw "ZIP merge failed. Review the error above." }
```

ZIPs are read from that folder (not its subfolders). The command temporarily
extracts the sample contents, removes outer download wrappers, and combines
files under their sample IDs. All file extensions inside sample ID folders are
included; hidden metadata and files outside sample ID folders are ignored and
counted. Asset subfolders are flattened within each sample; filename conflicts
stop the merge before the output folder is created. Identical duplicates are
kept once. Nested ZIPs are not recursively unpacked. Original ZIPs are retained.

The result contains sample folders, `source_merge_log.csv`, and
`merge_summary.txt`. Check the summary's sample/file counts and ignored-entry
count. Use the merged output as `--raw-root` for later archive preparation.
If final copying fails, a partial output may remain; choose a new output path
when retrying. An existing output folder is never overwritten.

## 2. Prepare downloaded ZIPs

Select only this batch's ZIPs with a dedicated folder or a filename pattern.
Replace these example input filenames with your batch's paths:

```powershell
& $Python scripts/prepare_fjs_terminal_batch.py `
  --zip-dir "$HOME/Downloads" `
  --zip-pattern "98_20180703_*.zip" `
  --metadata-csv "$HOME/Downloads/FJS_2018_10sample.csv" `
  --data-dictionary "$HOME/Desktop/FJS_data_dictionary.xlsx" `
  --output-root $Batch `
  --batch-name "FJS_2018_terminal_batch" `
  --rscript $Rscript
if ($LASTEXITCODE -ne 0) { throw "Batch preparation failed. Review the error above." }
```

The metadata can be the full **processed** survey CSV or an existing subset.
The command selects all taxon/count rows matching the downloaded samples using
`TASK.CODE`, `DATE` (or `SAMPLE.DATE`), and `SAMPLE.NUMBER`. An unformatted survey
workbook is not supported. A sample folder with no matching metadata stops the
batch before package creation.

The command:

1. Creates a unique folder in the Windows temporary directory.
2. Reads all selected ZIPs and merges JPG/JPEG/PDF files into one folder per
   sample ID, such as `98_20180703_0066`. Download wrappers and asset subfolders
   are removed; sample IDs and asset filenames are preserved.
3. Skips duplicate filenames only when their SHA-256 checksums match. Same-name
   files with different contents stop the batch, including names that differ
   only in capitalization. Neither conflicting version is chosen for publishing.
4. Saves the selected metadata and runs the existing R preparation workflow.
5. Verifies the saved asset copies against their checksums and points the upload
   manifests at those permanent copies.
6. Removes temporary files, including on failure. Original downloads are retained.

Complete `.zip` archives are supported, including separate Google Drive download
parts with overlapping sample folders. Nested ZIPs and binary multipart archives
such as `.z01` are not unpacked. Files outside sample ID folders and formats
other than JPG/JPEG/PDF are ignored and counted. Review counts and QC before
publishing to catch missing inputs.

The output folder must be new to prevent mixing old files into a new batch. If
preparation fails after package creation, partial output is kept for diagnosis;
choose a new output path when retrying.

```text
~/Desktop/FJS_Archive_Work/packages/FJS_2018_terminal_batch/
  source_metadata/processed_counts_by_sample_taxon.csv
  storage_upload_ready/samples/<sample_id>/<asset_kind>/<file>
  storage_upload_ready/upload_ready_manifest.csv
  storage_upload_ready/upload_ready_copy_log.csv
  supabase_import/fjs_assets.csv
  supabase_import/asset_manifest_qc.txt
  ...other database import CSVs...
  source_merge_log.csv
  workflow_run_summary.txt
```

Both upload manifests reference the permanent `storage_upload_ready` copies.
Keep the package at the same location until publishing finishes. Temporary paths
in the summary, import-batch record, and copy log are provenance only.
Keep generated data outside the Git checkout. These examples use Desktop/FJS_Archive_Work; choose another drive by changing $WorkRoot.

## 3. Review and dry-run

```powershell
Get-Content "$Batch/workflow_run_summary.txt"
Get-Content "$Batch/supabase_import/asset_manifest_qc.txt"
Import-Csv "$Batch/source_merge_log.csv" | Group-Object status | Select-Object Name,Count

& $Rscript scripts/publish_fjs_supabase_archive_workflow.R `
  --supabase-url $SupabaseUrl `
  --output-root $Batch `
  --python $Python
if ($LASTEXITCODE -ne 0) { throw "Publish dry run failed." }
```

Expect `Mode: DRY RUN`. This lists planned table/file uploads and checks local
asset paths. It does **not** test remote credentials, schema, permissions, or
existing Storage objects. No key is needed for the dry run.

## 4. Publish

Enter the private Supabase secret/service-role key through a hidden terminal
prompt so its value is not a literal command in PowerShell history:

```powershell
$Secret = Read-Host "Supabase secret/service-role key" -AsSecureString
$Credential = [System.Net.NetworkCredential]::new("", $Secret)
$env:SUPABASE_SERVICE_ROLE_KEY = $Credential.Password
try {
  & $Rscript scripts/publish_fjs_supabase_archive_workflow.R `
    --supabase-url $SupabaseUrl `
    --output-root $Batch `
    --python $Python `
    --apply
  if ($LASTEXITCODE -ne 0) { throw "Publishing failed. Review the upload results before retrying." }
} finally {
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Variable Credential,Secret -ErrorAction SilentlyContinue
}
```

This upserts table rows in foreign-key order and uploads image/PDF objects.
Check the terminal results for table or Storage failures. Publishing is not
atomic: a network failure can leave a partial batch. For an intentional retry or
replacement, add `--upsert-storage` after reviewing the previous upload results;
this permits replacement at existing Storage paths.

The browser publishable key cannot do this job. Keep backend keys in your local
credential manager for reuse, never in scripts, CSVs, GitHub, documentation, or
chat. This workflow does not retrieve or rotate keys.

## Optional: download directly from Google Drive

For future batches, rclone can download the sample folders directly, avoiding
browser-generated ZIPs. Install it once and configure a remote named `gdrive`:

```powershell
winget install Rclone.Rclone
# Open a new PowerShell window if the installer changed PATH.
rclone config
```

Choose Google Drive, use the `drive.readonly` scope, and select your Shared Drive
if applicable. Initial OAuth setup and sign-in need a browser. Follow the current
[client ID setup instructions](https://rclone.org/drive/#making-your-own-client-id):
rclone's shared client ID is being retired during 2026, so use your own or an
organization-approved client. Keep rclone's token/config outside Git.

Target a folder directly using its ID: in a link of the form
`https://drive.google.com/drive/folders/FOLDER_ID?usp=drive_link`, copy the part
after `/folders/` and before `?`. This avoids having to find the folder's name
or path in Drive. Choose the folder containing this batch's sample folders and
use a new `$Batch` output path. The copy command downloads everything below the
selected folder, including subfolders.

```powershell
$FolderId = "REPLACE_WITH_FOLDER_ID_FROM_DRIVE_LINK"
$DriveBatch = "gdrive:"
$LocalInput = "$WorkRoot/downloads/FJS_2018_drive_input"
rclone lsd $DriveBatch --drive-root-folder-id $FolderId
if ($LASTEXITCODE -ne 0) { throw "Cannot list the source folder. Check the account and folder access." }
rclone copy $DriveBatch $LocalInput --drive-root-folder-id $FolderId --progress
if ($LASTEXITCODE -ne 0) { throw "Drive download failed. Retry before preparing the batch." }

& $Python scripts/prepare_fjs_terminal_batch.py `
  --raw-root $LocalInput `
  --metadata-csv "$HOME/Downloads/FJS_2018_10sample.csv" `
  --data-dictionary "$HOME/Desktop/FJS_data_dictionary.xlsx" `
  --output-root $Batch `
  --batch-name "FJS_2018_terminal_batch" `
  --rscript $Rscript
if ($LASTEXITCODE -ne 0) { throw "Batch preparation failed." }
```

Use this instead of the ZIP preparation command. The Google account connected
to `gdrive` must have access to the folder. The root-folder option does not
grant permissions. When browsing an unrooted remote by path instead, the
`--drive-shared-with-me` option can list ordinary folders in "Shared with me";
this differs from a Shared Drive selected during configuration. A local Google
Drive for desktop folder can also be passed as `--raw-root`.

`rclone copy` downloads the folder contents, including sample directories,
without ZIP packaging. Survey CSVs and dictionary files already in Drive can be
downloaded with `rclone copyto REMOTE_FILE LOCAL_FILE`. Continue with review and
publish above.

References: [Windows installation](https://rclone.org/install/#windows-installation),
[Google Drive configuration](https://rclone.org/drive/),
[copy behavior](https://rclone.org/commands/rclone_copy/).

### Download a selected list of samples

To download specific sample folders, save a local CSV with `sample_id` and
`drive_folder_id` columns outside the repository, for example under $WorkRoot/selections/. Each ID is the `id` parameter in a
Google Drive `open?id=FOLDER_ID` link, or the value after `/folders/` in a folder
link. Keep real selections in this Git-ignored directory.

```powershell
& $Python "$PWD/scripts/download_fjs_drive_samples.py" `
  --selection-csv "$WorkRoot/selections/my_sample_selection.csv" `
  --destination "$WorkRoot/downloads/my_selected_samples" `
  --preview
```

Use the Python entry point when PowerShell blocks `.ps1` files with "running
scripts is disabled". It launches rclone directly and does not change the
PowerShell execution policy. It uses a portable executable at
`tools/rclone/rclone.exe` if available, or rclone on PATH. To configure a
portable copy, run `& "$PWD/tools/rclone/rclone.exe" config` once and create
the `gdrive` connection. Its account configuration stays outside the repository.

After reviewing the preview, run the same command without `--preview` to
download. The connected `gdrive` account must have access. Every folder is
targeted by its own ID and copied into `<destination>/<sample_id>/`, so parent
folder names are not needed. If rclone is installed outside PATH, pass
`--rclone "C:/path/to/rclone.exe"`. A failed transfer stops the command; rerun it
after resolving the error. Keep the destination dedicated to that selection.
Pass the destination as `--raw-root` to the batch preparation command above.

The [original unpacked-folder workflow](fjs_automatic_supabase_workflow.md) is
still available. It does not merge ZIPs, subset metadata, or redirect source
paths; keep its original raw files available until publishing finishes.
