# Image EXIF Metadata SQL Archive

This workflow adds supplemental FJS image-file metadata to the local SQLite database.
It is meant to answer practical archive questions such as:

- What image files are available?
- Which FJS sample does an image belong to?
- What are the image dimensions and file type?
- Does the image carry camera, capture-time, orientation, or GPS metadata?
- Which metadata fields need review before public release?

The workflow is intentionally read-only for image files. It reads image metadata
and stores a copy in SQLite; it does not rewrite or clean the original images.

## Tools Used

The R script uses SQLite plus Phil Harvey's ExifTool.

- `RSQLite` lets R write the extracted metadata into the local SQLite database.
- ExifTool reads the metadata from the image files.
- ExifTool can read many metadata formats, including EXIF, GPS, IPTC, XMP,
  JFIF, ICC profiles, and camera maker notes.

References:

- https://exiftool.org/
- https://exiftool.org/exiftool_pod2.html

## First-Time Setup

Install the only R package you need to install directly:

```r
install.packages("RSQLite")
```

`RSQLite` installs its database helper dependency automatically.

Install ExifTool from https://exiftool.org/. On Windows, if the downloaded file
is named `exiftool(-k).exe`, rename it to `exiftool.exe`.

The script will automatically find `exiftool.exe` if it is on your Windows path
or placed anywhere under this repository's `tools` folder.

If ExifTool is not on your Windows path, pass its location:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --exiftool C:/path/to/exiftool.exe
```

For example:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --exiftool C:/Users/liche/Downloads/exiftool.exe
```

## Default Scan

From the repository root:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R
```

By default, this scans only the FJS storage-upload-ready sample image folders:

- `data/processed/FJS_storage_upload_ready/storage_upload_ready/samples`
- `data/processed/FJS_2017_sample/storage_upload_ready/samples`

GUI photo-gallery images are not scanned by default. To include the reviewed
GUI gallery originals intentionally:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --include-gui-gallery
```

The `gui/assets/photo_gallery/web` copies are still skipped because they may be
derivative web copies with stripped metadata. To include those too:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --include-gui-gallery --include-web-gallery
```

To preview what will be scanned:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --dry-run
```

If `Rscript` is not on your Windows path, use the installed executable directly:

```powershell
& 'C:\Program Files\R\R-4.5.2\bin\Rscript.exe' scripts/05_archive_image_exif_metadata.R --dry-run
```

The script resolves the default scan folders from the project root, so it can
also be run from another folder by passing the full script path.

To include PDF metadata along with image metadata:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --include-pdf
```

## Troubleshooting

If you see `No scan roots exist`, R was not able to find the default image
folders. Use one of these checks:

```r
getwd()
dir.exists("C:/Users/liche/Desktop/HRBMP-database/data/processed/FJS_storage_upload_ready/storage_upload_ready/samples")
```

You can also point the script at a folder manually:

```powershell
Rscript scripts/05_archive_image_exif_metadata.R --root C:/Users/liche/Desktop/HRBMP-database/data/processed/FJS_storage_upload_ready/storage_upload_ready/samples --dry-run
```

## Tables Created

The workflow adds three SQLite objects:

- `image_metadata_runs`: one row per extraction run.
- `image_file_metadata`: one searchable summary row per image/file.
- `image_metadata_tags`: one tag/value row per extracted metadata field.

It also adds:

- `public_image_file_metadata`: a view that only exposes rows marked `public`.

## Release Review

Rows are written with `access_level_id = 'internal'` by default. This is
intentional. EXIF metadata can include GPS coordinates, camera/device details,
timestamps, author names, and other provenance fields. Review rows before
changing access to `public`.
