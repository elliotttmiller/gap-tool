#!/usr/bin/env pwsh
# Builds the GitHub Pages target directly into docs/ and commits + pushes that
# deployment output to main. The production/Northstar artifact is intentionally
# separate and remains available through `npm run build:northstar` or `npm run build`.

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
Set-Location $repoRoot

Write-Host "==> Checking working tree..." -ForegroundColor Cyan
$dirtyOutsideDocs = git status --porcelain | Where-Object { $_ -notmatch '^.. docs/' }
if ($dirtyOutsideDocs) {
    Write-Host "Working tree has uncommitted changes outside docs/. Commit or stash them before deploying Pages." -ForegroundColor Red
    git status --short
    exit 1
}

Write-Host "==> Building GitHub Pages target (/gap-tool/) directly into docs/..." -ForegroundColor Cyan
npm run build:pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub Pages build failed." -ForegroundColor Red
    exit 1
}

Write-Host "==> Staging docs/ deployment output..." -ForegroundColor Cyan
git add -A -- docs

$staged = git diff --cached --name-only -- docs
if (-not $staged) {
    Write-Host "No Pages changes to deploy — docs/ already matches this build." -ForegroundColor Yellow
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
