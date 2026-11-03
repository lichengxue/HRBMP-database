<#
.SYNOPSIS
Download selected sample folders by Google Drive ID using a connected rclone remote.
.DESCRIPTION
SelectionCsv must contain sample_id and drive_folder_id columns. Keep real
selections under data/raw (ignored by Git). Preview lists the planned transfers
without downloading. This script does not publish anything to Supabase.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SelectionCsv,
    [Parameter(Mandatory = $true)]
    [string]$Destination,
    [string]$Remote = "gdrive:",
    [string]$Rclone = "rclone",
    [switch]$Preview
)

$ErrorActionPreference = "Stop"
$samples = @(Import-Csv -LiteralPath $SelectionCsv)
if ($samples.Count -eq 0) { throw "The selection CSV is empty." }
if ($Remote -notmatch '^[^:]+:$') { throw "Remote must be a connection name ending in ':', for example gdrive:." }
foreach ($sample in $samples) {
    if ($sample.sample_id -notmatch '^\d+_\d{8}_\d+$') {
        throw "Invalid sample_id in the selection CSV: $($sample.sample_id)"
    }
    if ($sample.drive_folder_id -notmatch '^[A-Za-z0-9_-]+$') {
        throw "Missing or invalid drive_folder_id for $($sample.sample_id)"
    }
}
if (@($samples.sample_id | Select-Object -Unique).Count -ne $samples.Count) {
    throw "Duplicate sample IDs in the selection CSV."
}
if (@($samples.drive_folder_id | Select-Object -Unique).Count -ne $samples.Count) {
    throw "A Drive folder ID is assigned to more than one sample."
}
$rcloneCommand = Get-Command $Rclone -ErrorAction SilentlyContinue
if ($null -eq $rcloneCommand) {
    throw "rclone is not available. Install it and run 'rclone config' to connect your Google account first."
}
$destinationRoot = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Destination)
Write-Host "Selected sample folders: $($samples.Count)"
Write-Host "Destination: $destinationRoot"

foreach ($sample in $samples) {
    $sampleDestination = Join-Path $destinationRoot $sample.sample_id
    $rcloneArguments = @(
        "copy", $Remote, $sampleDestination,
        "--drive-root-folder-id", $sample.drive_folder_id,
        "--progress"
    )
    if ($Preview) { $rcloneArguments += "--dry-run" }
    Write-Host "Sample: $($sample.sample_id)"
    & $rcloneCommand @rcloneArguments
    if ($LASTEXITCODE -ne 0) {
        throw "rclone failed for $($sample.sample_id) (exit $LASTEXITCODE). Fix the error and rerun; prior downloads are retained."
    }
}

if ($Preview) {
    Write-Host "Preview complete. No files were downloaded. Omit -Preview to download."
} else {
    Write-Host "Download complete. Sample folders are under $destinationRoot"
    Write-Host "Use this folder as --raw-root for prepare_fjs_terminal_batch.py."
}
