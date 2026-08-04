# FJS Automatic Supabase Archive Workflow

This workflow prepares a Fall Juvenile Survey archive package from:

- a processed abundance/count metadata CSV, and
- local sample folders containing jar label images, representative fish images, field sheet PDFs, and lab sheet PDFs.

It can also publish the prepared package to Supabase when a private Supabase secret/service-role key is set in the local terminal.

Do not commit Supabase secret keys, database passwords, or API secrets.

## 1. Prepare The Local Package

Run from the repository root:

```powershell
cd C:\Users\liche\Desktop\HRBMP-database

& "C:\Program Files\R\R-4.5.2\bin\Rscript.exe" scripts\run_fjs_supabase_archive_workflow.R `
  --raw-root "C:/Users/liche/Desktop/supa_data" `
  --metadata-csv "C:/Users/liche/Downloads/FJS_2018_10sample.csv" `
  --output-root "data/processed/FJS_storage_upload_ready" `
  --batch-name "FJS_2018_10sample" `
  --access-level private
```

This creates:

```text
data/processed/FJS_storage_upload_ready/
  source_metadata/
  storage_upload_ready/
  supabase_import/
  workflow_run_summary.txt
```

The main database import files are in:

```text
data/processed/FJS_storage_upload_ready/supabase_import
```

The Storage upload folder is:

```text
data/processed/FJS_storage_upload_ready/storage_upload_ready/samples
```

Always review:

```text
data/processed/FJS_storage_upload_ready/supabase_import/asset_manifest_qc.txt
```

## 2. Dry-Run The Supabase Publish Step

Dry-run mode does not write to Supabase. It checks the generated package and prints what would be uploaded.

```powershell
& "C:\Program Files\R\R-4.5.2\bin\Rscript.exe" scripts\publish_fjs_supabase_archive_workflow.R `
  --supabase-url "https://vnqulddrlhkftcqpekpl.supabase.co" `
  --output-root "data/processed/FJS_storage_upload_ready"
```

## 3. Publish To Supabase

Only do this after the dry run looks correct.

Set the secret key only in the current PowerShell session:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "paste-your-real-secret-or-service-role-key-here"
```

Then publish:

```powershell
& "C:\Program Files\R\R-4.5.2\bin\Rscript.exe" scripts\publish_fjs_supabase_archive_workflow.R `
  --supabase-url "https://vnqulddrlhkftcqpekpl.supabase.co" `
  --output-root "data/processed/FJS_storage_upload_ready" `
  --apply `
  --upsert-storage
```

The publish workflow:

1. upserts the Supabase database tables in foreign-key order;
2. uploads image/PDF files to the `fjs-archive` Storage bucket using the paths in `fjs_assets.csv`.

## Important Notes

- The publishable browser key is not enough for this workflow.
- Use a private Supabase secret/service-role key only in the local terminal.
- Do not paste the secret key into GitHub, scripts, CSVs, documentation, or chat.
- GitHub cannot see files stored only on `C:\Users\liche\Desktop\supa_data`; this workflow is meant to run locally unless the raw files are moved to a cloud location or a server workflow.
