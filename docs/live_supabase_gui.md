# Live Supabase GUI

The main GUI reads the full `fjs-archive` catalog from Supabase. It does not
substitute example records when Supabase is empty or unavailable. New uploads
appear on page load or when **Refresh archive** is clicked, without a Git push.

## Enable The Live Catalog

Apply this migration in the linked project using the Supabase SQL Editor or CLI:

```text
supabase/migrations/20261009120000_create_live_archive_availability.sql
```

```powershell
supabase db push --dry-run
supabase db push
```

The migration publishes availability metadata for all records and files in the
FJS archive, including private records. The public response contains sample ID,
program, date, coordinates, region, species, original filename, data type,
upload status, and variable/life-stage coverage. It excludes storage paths,
download URLs, source measurements, abundance values, and applicant details.
Review that metadata scope before publishing it.

Source-table RLS and Storage access rules are unchanged. A private internal
view reads the inventory, and a narrowly defined public function returns only
the availability fields. A separate resolver returns source data only to the
backend `service_role`, after the delivery function verifies an admin.

The catalog includes:

- One abundance/count item per sample and taxon.
- One item per cataloged image/PDF, with **Awaiting upload** if its object is missing.
- Uploaded files without an `fjs_assets` row, with **Uploaded; metadata pending**.
- Environmental availability for samples with recorded measurements.

Files under `request-packages/` are excluded because they contain individual
request deliveries. A file keeps the same request identifier when its missing
metadata is imported later. Species/date/region filters become available as
the metadata are linked; unlinked files still appear in the full archive.

## Configure GitHub Pages

Deploy the browser configuration endpoint once:

```powershell
supabase functions deploy public-archive-config --no-verify-jwt --project-ref vnqulddrlhkftcqpekpl
```

It returns only a publishable/anon browser key from Supabase's managed
environment. It never reads or returns secret/service-role keys. The GUI can
then connect automatically without visitors entering settings or a key being
committed to Git.

Alternatively, in GitHub **Settings > Secrets and variables > Actions > Variables**,
set this optional repository variable to override automatic configuration:

```text
HRBMP_SUPABASE_PUBLISHABLE_KEY
```

Use the project **publishable** key from Supabase's API Keys settings. Never use
a secret/service-role key. Optionally set `HRBMP_SUPABASE_URL` when using a
different project; the default is the repository's existing FJS project.

The Pages workflow generates `gui/config.js` inside the deployment artifact.
When no key is configured there, the browser uses `public-archive-config`.

## Local Preview

Generate the local configuration, then:

```powershell
node scripts/build_gui_config.js
python -m http.server 8011 --bind 127.0.0.1 --directory gui
```

Open `http://127.0.0.1:8011/#data-archive`. The generated configuration is
ignored by Git. It uses the public configuration endpoint by default. For an
override, set `HRBMP_SUPABASE_PUBLISHABLE_KEY` in the terminal environment before
generating the file, or save a publishable key in **User Login** for that browser.

## Requests And Delivery

The **Data Archive** page filters all available files/records and lets users
select individual items. The main Biological and Environmental request forms
submit their actual screening selections to `hrbmp_data_requests`. Requests
include policy consent and a complete list of catalog IDs, rather than a
truncated preview or user-supplied Storage paths.

Deploy the updated delivery function:

```powershell
supabase functions deploy deliver-approved-request --no-verify-jwt --project-ref vnqulddrlhkftcqpekpl
```

This function performs its own Supabase Auth/admin check. After an admin clicks
**Approve & Email**, it resolves the exact requested IDs, prepares count and
environmental CSVs, and emails signed file links and a manifest. Missing or
removed items produce a review error instead of silently sending a partial
package. Large requests are resolved in batches without the old 5,000-row cap.

The existing admin allowlist, Auth users, and email provider secrets are still
required. See `hrbmp_request_delivery_automation.md` for their configuration.
The GUI does not issue downloads before approval.

## Verify

```powershell
node --test tests/archive.test.js
```

Use Node 22.13+ or Node 24 for these tests. They exercise large catalogs,
invalid/error responses, privileged-key rejection, exact delivery selection,
the unauthenticated delivery boundary, and environmental manifests.

For a live check, refresh **Data Archive**, confirm the year/species/sample
filters contain the latest import, submit one request, and check that it
appears in **User Login > Admin Request Review**. Approve a controlled test
request and verify the emailed links before inviting external users.
