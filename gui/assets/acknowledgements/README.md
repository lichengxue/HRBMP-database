# Homepage acknowledgement graphics

Retrieved November 23, 2026. These official graphics are used for homepage
acknowledgements. Current Research and Previous Research remain free of logos.
The files retain their original colors and proportions and appear on white cards.
All marks remain the property of their respective organizations.

## Display and attribution

- Institutional Partners contains separate Stony Brook University and SoMAS
  logos. The SoMAS departmental lockup is the user's supplied 1184 × 360 PNG,
  copied unchanged. It matches the artwork displayed in the
  [official SoMAS website footer](https://you.stonybrook.edu/somas/), which serves
  a smaller 217 × 66 copy. The caption retains the school's current full name.
- Funding and Support shows clickable logos without captions. It recognizes
  funding and collaboration; these credits do not imply that every organization
  provided a grant. Normandeau is a supporting survey collaborator, and Hudson
  River Park, Billion Oyster Project, and Riverkeeper are supporting organizations
  added at the user's request.
- The Stony Brook University and President's Fast Impact Fund logos are omitted
  from Funding and Support at the user's request. Research funding details remain
  on the project pages; these acknowledgements do not imply that every
  organization funded this website.
- New York Sea Grant's color JPEG is the original embedded image from page 1 of
  its official 2024–2025 research call PDF (Image25.jpg, 340 × 239 pixels),
  extracted without cropping, recoloring, or resampling.

The FJS funding attribution remains NYSDEC in 2023–2024 and HRF/HREMP in 2025,
as described by [Normandeau](https://www.normandeau.com/legacy-project-leads-to-continued-surveying-on-the-hudson-river/).
Research-award evidence is documented in `docs/hrbmp_research_sources.md`.
Entergy's collection gift and seed support are confirmed in Stony Brook's
[2019 collection-gift announcement](https://news.stonybrook.edu/newsroom/extraordinary-natural-science-collection-gifted-to-somas/)
and SoMAS strategic plan. Medicine seed support is based on the user-approved
funded-project CV.

## Asset preparation

- Stony Brook University uses the unmodified primary horizontal 300-ppi PNG from
  its official digital logo ZIP: `300ppi/SBU horz_2clr_rgb_300ppi.png`.
- Hudson River Park uses the complete blue-and-green logo block, including its
  registered-mark symbol, from page 1 of the official sponsorship deck. The PDF
  crop box is `(12, 9, 606, 132)` points, rendered with
  `pdftoppm -cropbox -r 150 -singlefile -png`. Original shapes and colors are retained.
- Billion Oyster Project is the unchanged shield SVG linked by its official site.
- Riverkeeper is the complete 370 × 70 header SVG from its official homepage,
  copied without changing paths or colors.

## Original sources

| File | Organization / program | Category | Original image or document |
| --- | --- | --- | --- |
| stony-brook-university.png | Stony Brook University | institutional_partner | [Official primary digital logo ZIP](https://www.stonybrook.edu/marcom/_media/SBU_PrimaryUniversity_logo_DIGITAL.zip) |
| somas.png | SoMAS | institutional_partner | User-supplied high-resolution copy; [official website artwork](https://you.stonybrook.edu/somas/files/2015/12/SBUSoMAS-oi80w7.png) |
| hudson-river-foundation-color.svg | Hudson River Foundation | funding_or_support | [Source](https://hudsonriver.org/wp-content/uploads/2017/04/logo-hrf.svg) |
| nysdec.png | NYSDEC | funding_or_support | [Source](https://neiwpcc.org/wp-content/uploads/2020/07/NYSDEC.png) |
| noaa.svg | NOAA | funding_or_support | [Source](https://oceanservice.noaa.gov/bootstrap/img/noaa-logo-rgb-2022.svg) |
| new-york-sea-grant-color.jpg | New York Sea Grant | funding_or_support | [Source](https://nyseagrant.org/funding/PDFs/NYSGCall24-25-preprop.pdf) |
| stony-brook-medicine.png | Stony Brook Medicine | funding_or_support | [Source](https://www.stonybrookmedicine.edu/sites/default/files/sbm-suny-logo.png) |
| entergy.png | Entergy | funding_or_support | [Source](https://www.entergy.com/wp-content/uploads/2024/06/EntergyLogo_340x156.png) |
| normandeau-associates-color.jpg | Normandeau Associates | supporting_collaborator | [Source](https://www.normandeau.com/wp-content/uploads/2024/04/normandeau_logo-2018-2-color-PMS-1024x310.jpg) |
| hudson-river-park.png | Hudson River Park | supporting_organization | [Official sponsorship deck, page 1](https://hudsonriverpark.org/app/uploads/2022/02/HRPK_Sponsorship_Deck_2022.pdf) |
| billion-oyster-project.svg | Billion Oyster Project | supporting_organization | [Official website asset](https://cdn.prod.website-files.com/69ba366661973603c064ba8f/69e29b3d0024d90f8524bedd_bop-logo-shield.svg) |
| riverkeeper.svg | Riverkeeper | supporting_organization | [Official website header](https://www.riverkeeper.org/) |

## SHA-256 integrity hashes

Hashes describe the committed assets. Git may use different SVG line endings in
a Windows working copy.

```text
5f53606e9d6970c2f714b5bb38bce06632bc5a99221dc907627b4a20b0ffdd34  billion-oyster-project.svg
eb3a835040104fcd44956381eba60e45b0a08112491f313b386ce41157a92a53  entergy.png
c67b9474dcfae3e026f9912d9ab9e67fbd02800982e716a11bf1c71db1027f54  hudson-river-foundation-color.svg
d003c4d480bc059130441b770600a46c7907bd2a2f9f4fe32eff11e70d1f7b75  hudson-river-park.png
3b4e5a15c45fd4aa1fc32d567e0210d2edc527dbe7c514c64c07a604aaa3649d  new-york-sea-grant-color.jpg
f0e507707816ef64f2e26b424492f826e09f5a44c80c41e5620e1290a95aa254  noaa.svg
d1c18ae1ba1da86c4258155014e85ab59207c97632f21f2aaac791cdcd6aa7b0  normandeau-associates-color.jpg
3075d18731ffd721bcd21712ad93423e42b43ed5d4553738c86635780fe24485  nysdec.png
ed1999b2c8a3013d4bf03a4c1f0ff9833080058520b748e6ecad34d406e41071  riverkeeper.svg
1222aae054e6b1bd29f705aa47869e64f6fbab8d7076a6917afbd9e4869cec3a  somas.png
ece85e63e9bb09fedf5fc149ba13d72f7665e48baba88f17c60f3616c9b8d75c  stony-brook-medicine.png
e54cb34d9162f4228f05dc3a40746d0d8091450ddb105200736819c6a8689217  stony-brook-university.png
```
