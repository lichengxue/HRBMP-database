# FJS Photo Folder And Filename Conventions

Source protocol:

```text
data/raw/protocols/Fish_Photo_Protocol.docx
```

The source `.docx` is kept in `data/raw/` because it includes operational
contact information. The tracked documentation here records only the archive
folder and filename conventions.

The protocol says to make one folder for each sample under the correct task
code and sampling year, then move each sample's photos and matching data sheets
into that sample folder.

## Folder Tree

```text
Task/
  Task_Year/
    Task_YearMonthDay_Sample#/
      Task_YearMonthDay_Sample#_J01.JPG
      Task_YearMonthDay_Sample#_J01_Taxon_LifeStage_Fish#_FishOrientation.JPG
      Task_YearMonthDay_Sample#_LW1.pdf
      Task_YearMonthDay_Sample#_SC1.pdf
```

For the current local archive, the outer `Task/Task_Year/` folders are not
present; the sample folders are directly under:

```text
data/raw/fjs_2017_sample1591_1592/
```

Example:

```text
98_20171023_1591/
  98_20171023_1591_J01.JPG
  98_20171023_1591_J01_001_04_01_01.JPG
  98_20171023_1591_J01_001_04_01_02.JPG
  98_20171023_1591_LW1.pdf
  98_20171023_1591_SC1.pdf
```

## Filename Segments

Example fish image:

```text
98_20171023_1591_J01_001_04_01_02.JPG
```

Meaning:

```text
98        = task code
20171023  = sampling date as YYYYMMDD
1591      = sample number
J01       = jar number/code
001       = three-digit taxon code
04        = two-digit life-stage code
01        = representative fish/specimen number
02        = fish photo orientation code
```

The protocol notes that taxon codes should always be three digits. For example,
taxon code `1` becomes `001`.

## Asset Types

Sample jar label image:

```text
Task_YearMonthDay_Sample#_Jar#.JPG
98_20171023_1591_J01.JPG
```

Representative fish image:

```text
Task_YearMonthDay_Sample#_Jar#_Taxon_LifeStage_Fish#_FishOrientation.JPG
98_20171023_1591_J01_001_04_01_02.JPG
```

Lab datasheet PDF:

```text
Task_YearMonthDay_Sample#_LW1.pdf
98_20171023_1591_LW1.pdf
```

Field datasheet PDF:

```text
Task_YearMonthDay_Sample#_SC1.pdf
98_20171023_1591_SC1.pdf
```

The protocol identifies `LW1` as the lab sheet and `SC1` as the field sheet.

## Representative Specimen Rule

The protocol says to remove the first specimen observed from each species in the
sample jar. This means the archive should have one representative specimen per
sample and species/taxon.

Multiple JPG files can still exist for that one representative specimen because
different orientation photos may be required.

Known orientation names from the protocol text:

```text
01 = left side
02 = right side
03 = top down
04 = bottom up
```

The complete list of required orientations by taxon is referenced by the
protocol as a separate spreadsheet named `FIF Required Photo Orientations by
Taxon Code`.
