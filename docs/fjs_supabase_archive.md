# FJS Supabase Archive Workflow

This workflow archives Fall Juvenile Survey processed metadata together with
sample jar label images, representative fish images, field sheets, and lab
sheets.

## Storage Model

Use three places for three different jobs:

- **GitHub repository**: schema, scripts, documentation, GUI code, and small
  reproducible examples.
- **Supabase PostgreSQL**: searchable metadata, sample records, count records,
  file checksums, file paths, and access rules.
- **Supabase Storage**: the JPG and PDF files themselves.

Do not store JPG/PDF binary files directly inside PostgreSQL. The database
should store the Supabase Storage object path, checksum, file size, MIME type,
sample ID, and taxon/species link.

## Local Folder Layout

The original fish photo protocol is stored at:

```text
data/raw/protocols/Fish_Photo_Protocol.docx
```

The filename/tree interpretation is summarized at:

```text
docs/fjs_photo_filename_conventions.md
```

The raw bundle was moved here:

```text
data/raw/FJS_2017_sample/
```

The processed metadata CSV should use a role-based name:

```text
data/raw/FJS_2017_sample/processed_counts_by_sample_taxon.csv
```

The filename does not need `FJS` or `2017` because the program/task code,
sample date, and year are already columns in the CSV.

This folder is ignored by Git, so real source files are not accidentally pushed
to GitHub.

The generated import files are written here:

```text
data/processed/FJS_2017_sample/supabase_import/
```

That folder is also ignored by Git because it is derived from the raw source
bundle.

## PostgreSQL/Supabase Schema

The migration is:

```text
supabase/migrations/20260721130000_create_fjs_archive.sql
```

It creates:

- `fjs_samples`: one row per FJS sample.
- `fjs_taxa`: taxon/species lookup records.
- `fjs_sample_taxa`: processed counts by sample and species.
- `fjs_representative_specimens`: one representative specimen per sample and
  species.
- `fjs_assets`: image/PDF archive catalog rows linked to samples and, when
  relevant, species. Fish image filenames are parsed into jar code, taxon code,
  life-stage code, representative specimen number, and orientation code.
- `fjs_variable_dictionary`: metadata dictionary variables.
- `fjs_variable_code_options`: coded-value definitions from the dictionary.
- `fjs_archive_catalog`: convenience view joining samples, counts, taxa, and
  assets.
- Supabase Storage bucket `fjs-archive`.

The schema enforces the important rule:

```text
one representative specimen per sample + taxon/species
```

Multiple photo files can point to the same representative specimen. This allows
two views of the same fish without treating them as two representatives.

## Create The Supabase Database Objects

Option A: Supabase SQL Editor

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open `supabase/migrations/20260721130000_create_fjs_archive.sql`.
4. Run the SQL.

Option B: Supabase CLI

If this repo is linked to the Supabase project through the CLI:

```bash
supabase db push
```

Do not commit Supabase access tokens, service-role keys, database passwords, or
`.env` files.

## Generate Import Files

From the repository root:

```bash
python scripts/build_fjs_archive_manifest.py
```

The script writes normalized import CSVs and a QC report to:

```text
data/processed/FJS_2017_sample/supabase_import/
```

Import the CSVs in this order:

1. `fjs_import_batches.csv`
2. `fjs_samples.csv`
3. `fjs_taxa.csv`
4. `fjs_sample_taxa.csv`
5. `fjs_representative_specimens.csv`
6. `fjs_assets.csv`
7. `fjs_variable_dictionary.csv`
8. `fjs_variable_code_options.csv`

In Supabase, use **Table Editor > Import data from CSV** for each table. Empty
CSV values should be imported as `NULL`.

## Upload JPG/PDF Files

### No-Key Dashboard Upload

For a small demo batch, use the local R helper to prepare an upload-ready folder.
This does not connect to Supabase and does not need any API key.

From the repository root:

```bash
Rscript scripts/prepare_fjs_storage_upload.R 98_20171023_1592
```

The script copies the files into:

```text
data/processed/FJS_2017_sample/storage_upload_ready/samples/98_20171023_1592/
```

Then in Supabase:

1. Open **Storage**.
2. Open the bucket `fjs-archive`.
3. Create or open a folder named `samples`.
4. Upload the prepared sample folder, such as `98_20171023_1592`.

Do not rename the prepared folders or files. The folder path must match
`fjs_assets.storage_object_path`, for example:

```text
samples/98_20171023_1592/jar_label_image/98_20171023_1592_J01.JPG
```

To prepare every asset in `fjs_assets.csv`:

```bash
Rscript scripts/prepare_fjs_storage_upload.R all
```

Then upload the prepared `samples` folder into the root of the `fjs-archive`
bucket.

### API Upload

For larger batches, API upload is less manual. The uploader reads
`fjs_assets.csv` and sends each local file to the exact Supabase Storage object
path recorded in the database. This method requires a backend-only Supabase key.

First, get a backend-only Supabase key from **Project Settings > API Keys**. Use
a secret key or legacy service-role key. Do not commit this key and do not put it
in browser code.

In PowerShell:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "paste-secret-or-service-role-key-here"
```

Preview the upload plan:

```powershell
python scripts/upload_fjs_storage_assets.py `
  --supabase-url "https://vnqulddrlhkftcqpekpl.supabase.co"
```

Upload the files:

```powershell
python scripts/upload_fjs_storage_assets.py `
  --supabase-url "https://vnqulddrlhkftcqpekpl.supabase.co" `
  --apply
```

If you need to replace files already uploaded at the same paths, add
`--upsert`.

Fully manual upload is still possible, but should only be used for small
corrections.
Upload the files listed in:

```text
data/processed/FJS_2017_sample/supabase_import/fjs_assets.csv
```

For each row, upload `local_source_path` into Supabase Storage bucket
`fjs-archive` using exactly the matching `storage_object_path`.

Example:

```text
local_source_path:
data/raw/FJS_2017_sample/98_20171023_1591/98_20171023_1591_J01.JPG

storage_object_path:
samples/98_20171023_1591/jar_label_image/98_20171023_1591_J01.JPG
```

## Access Level

Generated imports default to:

```text
private
```

That is intentional. Private rows/files are visible only through privileged
database access or a service role. To expose selected public records through
the GUI later, update the relevant rows in all three FJS tables. The default
public GUI release includes processed abundance/count data and representative
fish images only. Jar labels, field sheets, and lab sheets stay private by
default.

Use this commented example in the Supabase SQL Editor:

```text
supabase/example_update_fjs_access_level.sql
```

Use `restricted` for records that should require an authenticated Supabase user.

## GUI Demo Request Tab

The static GUI includes a **Demo** tab for public FJS archive requests.

The tab can:

- Read public rows from `fjs_archive_catalog` through the Supabase REST API.
- Filter by survey program, species, year, HRBMP region, sample, and data type.
- Download a manifest CSV for the matching request items.
- Submit a request row to Supabase for admin review, after the request-queue
  migration is installed.

Run this migration in Supabase SQL Editor before testing request submission:

```text
supabase/migrations/20260721170000_create_hrbmp_data_requests.sql
```

It creates:

```text
public.hrbmp_data_requests
```

Public users can insert new request records but cannot read the request queue.
Admins can review submitted requests from the Supabase dashboard.

The GUI does not commit the Supabase publishable key. In the Demo tab, paste the
project publishable key into the browser-only key field and click **Save Key**.

The current demo does not yet send automated emails or create ZIP packages.
That production step should be implemented with a backend component such as a
Supabase Edge Function, because GitHub Pages cannot safely hold email-service
credentials or service-role database credentials.

## QC Result For Current Bundle

The current two-sample bundle has:

- 2 samples.
- 4 positive sample/species count records.
- 12 archive assets.
- Jar label, field sheet, and lab sheet present for both samples.
- Missing representative image group for sample `98_20171023_1591`, taxon `2`,
  `BAY ANCHOVY`.

This means the database can be created and imported, but the physical archive is
not yet complete for sample `98_20171023_1591`.

## Supabase Free Tier Note

As of this workflow, the sample bundle is about 55 MB total, with each JPG/PDF
well below 50 MB. It fits the current Supabase free storage limits, but the full
FJS archive may not. Check Supabase's current pricing and file-limit pages
before uploading a larger archive:

- https://supabase.com/pricing
- https://supabase.com/docs/guides/storage/uploads/file-limits
