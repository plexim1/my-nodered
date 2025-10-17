Param(
    [string]$Target = "node18-win-x64",
    [string]$OutputName = "your-nodered.exe",
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

function Assert-Cmd($cmd) {
    $exists = $false
    try { & $cmd --version | Out-Null; $exists = $true } catch { $exists = $false }
    if (-not $exists) {
        throw "Required command '$cmd' not found on PATH. Please install it."
    }
}

Write-Host "==> Building Windows EXE using pkg" -ForegroundColor Cyan

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Assert-Cmd node
Assert-Cmd npm

if (-not $SkipInstall) {
    Write-Host "==> Installing dependencies (npm install)" -ForegroundColor Cyan
    npm install
}

if (-not (Test-Path "dist")) { New-Item -ItemType Directory -Path "dist" | Out-Null }

$outputPath = Join-Path (Resolve-Path "dist") $OutputName
Write-Host ("==> Packaging to {0} (target: {1})" -f $outputPath, $Target) -ForegroundColor Cyan

# Use npx to run local devDependency 'pkg'.
npx -y pkg "bin/cli.js" --targets $Target --compress Brotli --out-path dist --output $outputPath

Write-Host "==> Build complete" -ForegroundColor Green
Write-Host "Output: $outputPath"

Write-Host "Tip: Copy 'service\\your-nodered.xml' next to the EXE for WinSW service setup." -ForegroundColor DarkGray

