# Deploy Paintballer to free GitHub Pages
# Prerequisites: GitHub CLI logged in (run: gh auth login)

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;" + $env:Path

Set-Location $PSScriptRoot

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Log in to GitHub first:" -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
}

$repoName = "Paintballer"
$owner = (gh api user -q .login)

Write-Host "Creating/updating repo $owner/$repoName ..." -ForegroundColor Cyan

if (-not (git remote get-url origin 2>$null)) {
  gh repo create $repoName --public --source=. --remote=origin --push
} else {
  git push -u origin master 2>$null
  if ($LASTEXITCODE -ne 0) { git push -u origin main 2>$null }
  if ($LASTEXITCODE -ne 0) { git push -u origin HEAD }
}

gh api "repos/$owner/$repoName/pages" -X POST -f "build_type=legacy" -f "source[branch]=master" -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api "repos/$owner/$repoName/pages" -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
}

Start-Sleep -Seconds 5
$url = "https://$owner.github.io/$repoName/"
Write-Host ""
Write-Host "Paintballer is live at:" -ForegroundColor Green
Write-Host $url
Write-Host "(GitHub Pages may take 1-2 minutes on first deploy.)" -ForegroundColor DarkGray
