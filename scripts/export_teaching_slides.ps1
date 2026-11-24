<#
.SYNOPSIS
Copy the authorized classroom slide decks and export faithful PDF companions.
.DESCRIPTION
Requires Microsoft PowerPoint on Windows. Source files are read-only. It closes
only presentations opened by this script, leaving other user work open.
#>
param(
  [Parameter(Mandatory=$true)][string]$BackgroundDeck,
  [Parameter(Mandatory=$true)][string]$ChallengeDeck,
  [Parameter(Mandatory=$true)][string]$PdfRenderer
)
$ErrorActionPreference = 'Stop'
$taskRepository = Split-Path -Parent $PSScriptRoot
$taskDestination = Join-Path $taskRepository 'gui\teaching-materials'
[void](New-Item -ItemType Directory -Path $taskDestination -Force)
$taskSources = @(
  @{ Path = $BackgroundDeck; Name = 'survey-design-background'; Title = 'Survey Design Background'; Description = 'Sampling schemes, spatial and temporal coverage, biological and environmental measurements, and sampling gear.' },
  @{ Path = $ChallengeDeck; Name = 'hudson-river-survey-design-challenge'; Title = 'Hudson River Survey Design Challenge'; Description = 'Five management questions, survey choices, classroom budgets, planning worksheets, and discussion prompts.' }
)
$taskManifest = @()
$taskPowerPoint = New-Object -ComObject PowerPoint.Application
try {
  foreach ($taskSource in $taskSources) {
    $taskInput = (Resolve-Path -LiteralPath $taskSource.Path).Path
    $taskPptx = Join-Path $taskDestination ($taskSource.Name + '.pptx')
    $taskPdf = Join-Path $taskDestination ($taskSource.Name + '.pdf')
    Copy-Item -LiteralPath $taskInput -Destination $taskPptx -Force
    $taskPresentation = $null
    try {
      $taskPresentation = $taskPowerPoint.Presentations.Open($taskPptx, -1, 0, 0)
      $taskPresentation.SaveAs($taskPdf, 32)
      $taskSlides = $taskPresentation.Slides.Count
      $taskManifest += @{
        id = $taskSource.Name; title = $taskSource.Title; description = $taskSource.Description; slides = $taskSlides
        source_filename = [IO.Path]::GetFileName($taskInput)
        pptx = @{ path = "teaching-materials/$($taskSource.Name).pptx"; sha256 = (Get-FileHash -LiteralPath $taskPptx -Algorithm SHA256).Hash.ToLowerInvariant(); bytes = (Get-Item -LiteralPath $taskPptx).Length }
        pdf = @{ path = "teaching-materials/$($taskSource.Name).pdf"; sha256 = (Get-FileHash -LiteralPath $taskPdf -Algorithm SHA256).Hash.ToLowerInvariant(); bytes = (Get-Item -LiteralPath $taskPdf).Length }
        thumbnail = "teaching-materials/$($taskSource.Name).jpg"
      }
      & $PdfRenderer -f 1 -l 1 -singlefile -scale-to 1000 -jpeg $taskPdf (Join-Path $taskDestination $taskSource.Name)
      if ($LASTEXITCODE -ne 0) { throw 'Could not render the PDF cover.' }
      Write-Output "$($taskSource.Name): exported $taskSlides slides."
    } finally {
      if ($null -ne $taskPresentation) {
        $taskPresentation.Close()
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($taskPresentation)
      }
    }
  }
} finally {
  if ($taskPowerPoint.Presentations.Count -eq 0) { $taskPowerPoint.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($taskPowerPoint)
}
$taskJson = ConvertTo-Json -InputObject @($taskManifest) -Depth 5
[IO.File]::WriteAllText((Join-Path $taskDestination 'manifest.json'), $taskJson + "`n", (New-Object Text.UTF8Encoding($false)))
