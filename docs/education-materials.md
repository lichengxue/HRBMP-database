# Fish Tales and classroom activities

These pages are built from teaching materials supplied for the HRBMP portal.
The source presentations and Word documents are not required for a clean
checkout. Structured content and image provenance are in:

- `gui/data/fish_tales.json`
- `gui/data/education_activities.json`

Rebuild the static pages after editing those JSON files:

```powershell
python scripts/build_fish_tales.py
python scripts/build_education_activities.py
node --test tests/education.test.js tests/archive.test.js
```

The scripts use the Python standard library. They only replace their own
education pages, navigation entries, and asset references in `gui/index.html`.
These education resources ship in Beta 1.2.7.

## Species profiles

The supplied species-profile ZIP contains 16 completed one-slide profiles. A
separate Word list names additional planned species but has no profile content;
it is not used to invent additional pages. Each completed profile has a direct
link, common and scientific names, one original embedded image, appearance,
life history, diet, ecological role, monitoring information, and a fact.

Source archive, presentation and image SHA-256 hashes are retained in the JSON.
Original image bytes are unchanged. CSS reproduces the source slide's crop
where present. Explicit photo credits from 13 slides are retained. The three
slides without explicit credit captions (Atlantic Sturgeon, Shortnose Sturgeon,
Tessellated Darter) have no added caption, as requested for the local preview.
Any attribution already inside an image remains intact.

Empty range-map, graph, QR-code, and data-spotlight template slots are omitted.
Numerical biology statements are retained except for a verified correction:
Atlantic Sturgeon can reach 14 feet; NYSDEC also places Hudson spawning in
May–June. The web profile links to that primary reference and the JSON records
the original text and corrections.
`Ameriurus catus` is corrected to `Ameiurus catus`; the source spelling is also
retained. A run-on White Perch sentence is punctuated without changing its
reported length. The supplied Spottail Shiner scientific name is retained.

To reimport an authorized source ZIP:

```powershell
python scripts/build_fish_tales.py --import-zip "path/to/Species profiles.zip"
```

## Classroom activities

The 19-slide Hudson River Survey Design Challenge supplies five objectives,
budgets, sampling areas, gear, measurement costs, planning prompts and discussion
questions. Draft speaker notes and empty worksheet placeholders are not shown.
The website adds an interactive calculator, a plain-text plan download and a
print layout. Prices are classroom game costs, not current procurement quotes.

Charging units are explicit: field costs per station-visit; gear per deployment
or sample; environmental measurements and length/weight per station-visit;
habitat once per station; sex/maturity per specimen assessed. Gear repeats do
not multiply habitat or environmental costs. Stations are entered separately
for each area. Schedule visits are the total visits to every station; biannual
means twice per year. There is no automatic score for scientific survey quality.

The matching activity uses the five adult and five young-fish images from the
supplied Word worksheet. Letters A–E retain the worksheet order. Image choices
and students' observations can be compared side by side and printed. No answer
key was supplied, so automatic correctness grading is disabled. Do not infer or
publish a key from appearance alone; have the teaching team verify it first.

Student entries stay in the page; saving a plan creates a local text download.
The activities do not write to Supabase or alter archive records. Navigating
between portal tabs preserves entries during that page session; reloading
starts fresh.

To reimport authorized activity sources:

```powershell
python scripts/build_education_activities.py --survey-deck "path/to/challenge.pptx" --matching-document "path/to/activity.docx"
```

Reimporting replaces the JSON from the source documents; review local content
edits before doing so. All source filenames and SHA-256 hashes are in the JSON.

## Supplementary slides

The Supplementary Materials page previews the two supplied activity decks as
PDFs and offers PowerPoint and PDF downloads. PDFs preserve the complete slide
layouts (22 background slides and 19 challenge slides). PowerPoint downloads
are byte-for-byte copies of the authorized source files; their image-credit
notes remain available. Source file hashes and PDF hashes are recorded in
`gui/teaching-materials/manifest.json`. Speaker editing notes are not shown in
the PDF preview or activity pages. No web rendering service receives the files.

The exported PDFs, cover thumbnails and PowerPoint copies are checked in. A
clean checkout can serve them directly. To regenerate them on Windows with
Microsoft PowerPoint and Poppler installed:

```powershell
./scripts/export_teaching_slides.ps1 -BackgroundDeck "path/to/background.pptx" -ChallengeDeck "path/to/challenge.pptx" -PdfRenderer "path/to/pdftoppm.exe"
python scripts/build_education_activities.py
```
