# GUI Notes

The GUI is a **static HTML/CSS/JavaScript prototype** modeled after the
SPASAM-MSE website structure. It has a homepage and tabbed sections for:

- Program Description
- Biological Database
- Environmental Database
- Sampling Image Catalog
- Educational Materials
- Photo Gallery
- Issue Report
- User Login
- Team / Contact
- News

The page reads `gui/data/example_summary.json`, plus map-ready GeoJSON files:

- `gui/data/biological_availability.geojson`
- `gui/data/environmental_availability.geojson`

These files are exported from SQLite by `scripts/03_export_gui_data.R`.

## Current GUI behavior

- Displays repository-level counts, export metadata, institutional partner
  logos, and collaborator logos on the home page.
- Displays Beta Version 1.2.4. Version Updates presents a dated release with
  three major-change highlights and expandable earlier updates. HRBMP News
  remains a separate page with official source links.
- Uses one green uppercase title on each biological, environmental, and
  sampling-image availability page.
- Organizes Program Description navigation into a Program Overview plus the
  six HRBMP survey subtabs listed on the official HRBMP surveys page.
- Organizes Biological Database and Environmental Database navigation into
  Data Availability and Data Request subtabs.
- Shows Leaflet-based Hudson River biological and environmental GIS maps.
- Supports zooming, panning, popups, marker clustering, layer toggles, and map
  legends.
- Filters biological map layers by species, life stage, monitoring program,
  year, month, and day ranges. Monitoring program options include Long River
  Survey, Fall Juvenile Survey, and Beach Seine Survey. The species selector
  lists the 13 key species first, then the broader Hudson River species list. If
  no day range is selected, the map shows the full selected month range.
- Provides biological record totals by HRBMP region for the selected species,
  life stage, program, and date filters.
- Provides Biological Database and Environmental Database data request forms
  that record the current screening summary for the data management team and
  link to the official HRBMP Data Sharing Policy PDF. Requesters must
  acknowledge that they have read the policy before the form can proceed.
- Filters environmental map layers by year, month, and day ranges plus selected
  covariate. Environmental database tabs separate HRBMP, USGS, EPA, and NOAA
  variables. If no day range is selected, the map shows the full selected month
  range.
- Displays environmental summaries, annual abundance bars, and taxa total bars.
- Provides a species-first sampling image catalog with 13 key species in the
  main grid, followed by an All Species browser. Each species opens a detail
  view with pseudo distribution, availability, and placeholder life-stage image
  records for Egg, Yolk-sac larvae, Post-yolk-sac larvae, Young of the year,
  Yearling, and Adult stages. Life-stage controls update the Hudson River
  distribution bar, data availability, and image archive in the biologically
  ordered stage sequence.
- Provides ribbon dropdown menus under Educational Materials and Photo Gallery.
  Each dropdown item opens its own page route for HRBMP history, current
  research, K-12 curriculum, classroom materials, outreach activities, Hudson
  River photos, field sampling photos, sample warehouse photos, and lab sample
  processing photos. Current Research includes nested Ongoing Projects and
  Publications pages; Ongoing Projects is blank for now, and Publications
  contains linked citation records. The K-12 Curriculum page
  organizes Hudson River lessons by K-2, grades 3-5, grades 6-8, grades 9-12,
  and teacher resources. Field
  sampling photos are grouped into people-with-fish, fish, and cruise/vessel
  sections with compact thumbnails. The K-12 Curriculum menu includes nested
  grade-band choices that open the matching curriculum section. Lab sample
  processing photos are grouped into sample processing, digital archive, and
  sample handling / safety sections.
- Provides a combined team/contact structure with component leads, supporting
  team members, survey equipment organization responsibilities, and lab sample
  processing responsibilities.
- Provides a static Issue Report tab for comments, issues, questions, and
  feedback.
- Provides a static User Login tab for future restricted access, including user
  name, password, forgot user name, and forgot password interface elements.

## Spatial Structure

Each biological, environmental, and sampling-image page has an HRBMP River
Regions panel: a horizontal, equal-width schematic from Battery (downstream) to
Albany (upstream), separate from its interactive GIS map. All three use the same
13 region names, codes, numbers, river-mile ranges, and layout.

Counts cover the full loaded catalog, independent of map filters. Biological
totals represent sample-taxon records, not fish abundance. Environmental totals
count samples with recorded environmental data, not individual measurements.
Image totals count available public fish photos, including photos with a known
region but no map coordinates; files awaiting upload, internal files, and
mismatched uploads are excluded. Until the catalog loads, a dash is shown instead
of zero. The diagrams scroll horizontally on smaller screens. Each has its own
accessible title and description listing every region and count.

The test map data are organized around the 13 HRBMP longitudinal river regions.
The HRBMP source material describes these as numbered regions based on river
mile. The interface displays the region number first, followed by a readable
place label and river-mile range:

- Region 0 - Battery (BT), River Mile 0-11
- Region 1 - Yonkers (YK), River Mile 12-23
- Region 2 - Tappan Zee (TZ), River Mile 24-33
- Region 3 - Croton-Haverstraw (CH), River Mile 34-38
- Region 4 - Indian Point (IP), River Mile 39-46
- Region 5 - West Point (WP), River Mile 47-55
- Region 6 - Cornwall (CW), River Mile 56-61
- Region 7 - Poughkeepsie (PK), River Mile 62-76
- Region 8 - Hyde Park (HP), River Mile 77-85
- Region 9 - Kingston (KG), River Mile 86-93
- Region 10 - Saugerties (SG), River Mile 94-106
- Region 11 - Catskill (CS), River Mile 107-124
- Region 12 - Albany (AL), River Mile 125-152

The biological availability GeoJSON currently includes 100 test records spread
across the 13 regions so each region has a different sample count. The points
are generated from river-mile positions along an approximate Hudson River
centerline. The HRBMP region layer is drawn as boundary guide lines and labels,
with biological records shown as regional total circles. Regenerate the test
layer with:

```bash
node scripts/generate_gui_test_points.js
```

## Current limitations

- No live database connection.
- No backend/API.
- No backend authentication yet.
- Leaflet and marker clustering load from public CDNs in the current prototype.
  Local vendored copies can be added later for fully offline use.
- Current records are demonstration records for interface review only.

## Future options

- Split each tab into a separate HTML page before publishing, if desired.
- Upgrade to ArcGIS Maps SDK later if the project needs ArcGIS Online,
  Enterprise, hosted FeatureLayers, or official institutional basemaps.
- Add real station coordinates, official HRBMP data, and an image metadata table.
- Host directly with GitHub Pages for easy sharing.


## Saved availability and large result sets

The portal saves only public availability metadata in IndexedDB and the four
snapshot totals in localStorage, scoped to the Supabase project. Catalog data is
reused for one hour; older results appear immediately while a live update runs.
Refresh data or Update totals bypasses the cache. Storage failures fall back to
live loading, and failed updates retain the saved result set and its timestamp.
Credentials, admin requests, private measurements, storage paths, download URLs,
and file contents are excluded from this cache.

Search filters the complete matching result set. Users can select every matching
available item across all pages, or select a single preview page. Previews support
25, 50, or 100 rows and a direct page jump. Selection and request counts always
refer to all matching items, not just the currently displayed page.

The end-user interface shows count records, representative fish photos, and
environmental data only when metadata_linked is explicitly true. Mismatched or
unverified metadata never enter public lists, maps, filters, request selections,
or browser caches, even if an upload already has a public scientific category.
The public availability menus omit the metadata-pending category. Jar labels,
field/lab sheets, and unclassified uploads are excluded before caching, mapping, grouping, and request selection. The archive
and uploader retain these files. This display policy does not delete files or
change Storage permissions. Storage folder placeholders are omitted as well.

Availability tables have no repeated section/group subheaders or explanatory
selection paragraphs. Compact Select all, Select page, and Clear buttons control
selection; the request button retains the selected-item count.

A valid fish-photo filename is classified as other when its sample and taxon
code have no matching processed sample-taxon row. This indicates an unmatched
metadata link, not zero abundance or confirmed species identification. Review
the source records and images before assigning metadata.
