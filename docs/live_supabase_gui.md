# Live Supabase GUI

The main GUI reads the full `fjs-archive` catalog from Supabase. It does not
substitute example records when Supabase is empty or unavailable. New uploads
appear on page load or when **Refresh availability** is clicked, without a Git push.

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

Open `http://127.0.0.1:8011/#biological-database`. The generated configuration is
ignored by Git. It uses the public configuration endpoint by default. For an
override, set `HRBMP_SUPABASE_PUBLISHABLE_KEY` in the terminal environment before
generating the file, or save a publishable key in **User Login** for that browser.

## Requests And Delivery

The **Biological Database** filters count records, images, supporting documents,
and other uploads by species, recorded life-stage coverage, program, location,
date, type, and availability. **Environmental Database** filters actual samples
by recorded variable, program, location, and date. Its table lists available
variables, not mean values or fabricated measurements. Both database pages keep
their interactive maps visible above the availability tables, with GIS layer
controls and Esri ArcGIS satellite imagery selected by default. Street, light,
and topographic basemaps remain available. Map layers use the same real catalog
filters as the tables; no map interaction grants access to private measurements.
There are no USGS, EPA, or NOAA database options: those sources are not connected.
Startup does not fetch example summary/GeoJSON data or generate substitute values.

Both pages allow individual selection or selection of all matching available
items, including matches on other result pages. Changing a filter resets the
selection to the new matching available items. **Request Selected Data** opens
the corresponding request form with the selection preserved. The forms
submit these exact selections to `hrbmp_data_requests`. Requests
include policy consent and a complete list of catalog IDs, rather than a
truncated preview or user-supplied Storage paths. The redundant archive/demo
page is removed; old `#data-archive` and `#demo` links redirect to Biological Database.

**Sampling Image Catalog** has a visible ArcGIS map and the same availability
selection workflow. Species, image type, program, region, sample, year, and upload
status filters apply to both the map and table. Sample and clustered markers show
available image-file counts; regional totals also count files, not biological
observations. Missing uploads are shown separately and cannot be requested.
Images without linked coordinates remain in the table and in the **Unmapped
Images** count; no location is invented. Map popups can filter the table to a
sample. **Request Selected Images** carries the exact selected image IDs into the
existing biological request form. Image previews and downloads are not made public.

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

## Admin Privacy

**Admin Request Review** is hidden by default. After sign-in, the GUI calls
`is_hrbmp_request_admin` before reading or showing the request queue. Membership
comes from enabled rows in `hrbmp_request_admins`, not a client-side email check.
Signing out, changing sessions, or failing an access check hides the panel and
clears its request records and report. An old in-flight response cannot reopen it.

Supabase request-table RLS also enforces admin membership, so unhiding HTML does
not grant access. The delivery function verifies the signed-in user and the same
allowlist, and rejects delivery if that check is unavailable instead of falling
back to environment email settings. Keep all three existing enabled admins unless
the project owner explicitly changes that membership. Project owners and holders
of privileged Supabase credentials still have backend access; this is not a
restriction on Supabase infrastructure administrators.

## Verify

```powershell
node --test tests/archive.test.js
```

Use Node 22.13+ or Node 24 for these tests. They exercise large catalogs,
invalid/error responses, privileged-key rejection, exact delivery selection,
the unauthenticated delivery boundary, environmental manifests, and fail-closed
admin visibility/session handling.

For a live check, refresh **Biological Database**, confirm the year/species/sample
filters contain the latest import, submit one request, and check that it
appears in **User Login > Admin Request Review**. Approve a controlled test
request and verify the emailed links before inviting external users.
