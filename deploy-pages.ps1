#!/usr/bin/env pwsh
# Builds the app for GitHub Pages, syncs dist/ into docs/, and commits + pushes to main.
# Pages is configured (Settings -> Pages) to serve from main:/docs, since Actions workflows
# are disabled for this repo (billing). This script is the manual replacement for that workflow.

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
Set-Location $repoRoot

Write-Host "==> Checking working tree..." -ForegroundColor Cyan
$dirty = git status --porcelain | Where-Object { $_ -notmatch '^\?\? docs/' -and $_ -notmatch '^ M docs/' }
if ($dirty) {
    Write-Host "Working tree has uncommitted changes outside docs/ — these will be committed together with the build:" -ForegroundColor Yellow
    git status --short
}

Write-Host "==> Building (GITHUB_ACTIONS=true for correct /gap-tool/ base path)..." -ForegroundColor Cyan
$env:GITHUB_ACTIONS = "true"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "==> Syncing dist/ into docs/..." -ForegroundColor Cyan
if (Test-Path "$repoRoot\docs") {
    Get-ChildItem "$repoRoot\docs" -Force | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Path "$repoRoot\docs" | Out-Null
}
Copy-Item "$repoRoot\dist\*" "$repoRoot\docs" -Recurse -Force
New-Item -ItemType File -Path "$repoRoot\docs\.nojekyll" -Force | Out-Null

Write-Host "==> Staging changes..." -ForegroundColor Cyan
git add -A

$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "No changes to deploy — working tree already matches this build." -ForegroundColor Yellow
    exit 0
}

$commitMessage = "Deploy build to GitHub Pages"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed." -ForegroundColor Red
    exit 1
}

Write-Host "==> Pushing to origin main..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed." -ForegroundColor Red
    exit 1
}

Write-Host "==> Done. Site will update at https://elliotttmiller.github.io/gap-tool/" -ForegroundColor Green
