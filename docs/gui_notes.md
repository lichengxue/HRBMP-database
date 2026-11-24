# GUI Notes

The GUI is a **static HTML/CSS/JavaScript prototype** modeled after the
SPASAM-MSE website structure. It has a homepage and tabbed sections for:

- Program Description
- Biological Database
- Environmental Database
- Sampling Image Catalog
- Research (Current Research, Previous Research, and Publications)
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

- Displays repository-level counts, export metadata, and institutional partner
  logos on the home page. Funding and Support has a separate homepage grid of
  clickable official logos on white cards, without captions. It includes
  Normandeau Associates, Hudson River Park, Billion Oyster Project, and
  Riverkeeper among the supporting organizations; there is no
  separate Collaborators section. Stony Brook University and the Fast Impact
  Fund are omitted from the funding grid. Agency logos do not appear on either
  research page. All acknowledgement images are local files with source and
  integrity records in `gui/assets/acknowledgements/README.md`.
- Displays Beta Version 1.2.7. Version Updates presents a dated release with
  three major-change highlights and expandable earlier updates. HRBMP News
  remains a separate page with official source links.
- Fish Tales has 16 complete species profiles and a search by common or
  scientific name. Classroom Activities includes survey design with a live
  budget, fish life-stage matching, plan downloads, and print layouts.
- Supplementary Materials previews the two supplied survey teaching decks
  as PDFs and provides original PowerPoint and PDF downloads.
- Uses one green uppercase title on each biological, environmental, and
  sampling-image availability page.
- Organizes Program Description navigation into a Program Overview plus the
  six HRBMP survey subtabs listed on the official HRBMP surveys page.
- Omits the unused SQLite metadata catalog, empty dataset/variable tables,
  zero metadata counters, and local Metadata JSON link from the public Program
  Overview. Live availability continues to use the Supabase archive.
- Organizes Biological Database and Environmental Database navigation into
  Data Availability and Data Request subtabs.
- Shows Leaflet-based Hudson River biological and environmental GIS maps.
- Omits Awaiting Upload and Unmapped Images summary counters from the sampling
  image catalog. The environmental map omits the explanatory sidebar paragraph
  and caption strip below the map; map popups retain record details.
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
- Photo Gallery opens a Fish Species collection with one reviewed left-side
  specimen photo for each of 20 species, common and scientific names, concise
  biology, and direct species-reference links. The page has no subtitle.
  The full frame is retained and each
  web copy uses EXIF Orientation 1. Other views are not substituted for missing
  left-side photographs. Image selection and provenance are documented in
  `gui/assets/photo_gallery/species/README.md` and its adjacent manifest.
- Provides ribbon dropdown menus under Educational Materials and Photo Gallery.
  Each dropdown item opens its own page route for HRBMP history, K-12
  curriculum, classroom materials, outreach activities, Hudson River photos,
  field sampling photos, sample warehouse photos, and lab sample processing
  photos. A separate Research menu opens Current Research, Previous Research, and Publications.
  Current Research and Previous Research have separate page routes; each
  orders dated projects newest first, and uses official titles, funding agencies, PI/co-PI roles, and concise objectives. The FJS heading
  identifies the 2023 restart; its funding text distinguishes NYSDEC in 2023–2024
  from HRF/HREMP support reported for 2025. No contract-partner field is shown;
  the microplastics project is labeled only by its known 2025 seed award.
  Publications includes 14 verified HRBMP papers and one separately labeled
  monitoring-framework paper, grouped beneath descending year headings and
  ordered newest first within each year. The old Ongoing Projects URL redirects to
  Current Research. Sources, dates, and inclusion rules are documented in
  `docs/hrbmp_research_sources.md`. The K-12 Curriculum page
  organizes Hudson River lessons by K-2, grades 3-5, grades 6-8, grades 9-12,
  and teacher resources. Field
  sampling photos are grouped into people-with-fish, fish, and cruise/vessel
  sections with compact thumbnails. The K-12 Curriculum menu includes nested
  grade-band choices that open the matching curriculum section. Lab sample
  processing photos are grouped into sample processing, digital archive, and
  sample handling / safety sections.
- Provides a combined team/contact structure with component leads, supporting
  team members, survey equipment organization responsibilities, and lab sample
  processing responsibilities. Ethan Li's Lab Sample Processing entry uses the
  supplied lab photo stored at `gui/assets/team/ethan-li-lab.png`. The Contact
  button on Dr. Chengxue Li's Database Development Lead card opens an email draft
  to the existing database contact address, `chengxue.li@stonybrook.edu`.
- Provides a static Issue Report tab for comments, issues, questions, and
  feedback.
- Provides a static User Login tab for future restricted access, including user
  name, password, forgot user name, and forgot password interface elements.

## Spatial Structure

Each biological, environmental, and sampling-image page has an HRBMP River
Regions panel: a horizontal, equal-width schematic from Battery (downstream) to
Albany (upstream), separate from its interactive GIS map. All three use the same
13 region names, codes, numbers, river-mile ranges, and layout.
Regions are a count-based availability heatmap: darker teal means more records
or available images, and gray represents zero. Up to five equal-interval count
ranges are calculated separately for each page and displayed in its legend.
The exact counts remain visible; unloaded counts are dashes and have no legend.

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
The homepage omits routine cache messages; loading and update failures still
appear when needed.
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
The public availability menus omit Metadata pending and Awaiting upload options. Jar labels,
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
