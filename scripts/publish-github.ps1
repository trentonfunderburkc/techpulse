# Publish project to GitHub from PowerShell. Requires Git: https://git-scm.com/download/win
#
# A) Empty repo already created on github.com (no README):
#    .\scripts\publish-github.ps1 -RemoteUrl "https://github.com/USER/REPO.git"
#
# B) Create repo and push (needs GitHub CLI):
#    winget install GitHub.cli
#    gh auth login
#    .\scripts\publish-github.ps1 -CreateRepoName "techpulse"
#
param(
  [string] $RemoteUrl,
  [string] $CreateRepoName,
  [switch] $PrivateRepo
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-GitInstalled {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git not found. Install from https://git-scm.com/download/win and restart PowerShell.'
  }
}

if ($CreateRepoName) {
  Test-GitInstalled
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'gh not found. Run: winget install GitHub.cli then: gh auth login'
  }
  $vis = if ($PrivateRepo) { '--private' } else { '--public' }
  Write-Host "Creating GitHub repo $CreateRepoName and pushing..."
  gh repo create $CreateRepoName $vis --source=. --remote=origin --push
  Write-Host 'Done.'
  exit 0
}

if (-not $RemoteUrl) {
  Write-Host @'
Usage:

  .\scripts\publish-github.ps1 -RemoteUrl "https://github.com/USER/REPO.git"

Or with GitHub CLI (after gh auth login):

  .\scripts\publish-github.ps1 -CreateRepoName "repo-name"

Private repo: add -PrivateRepo
'@
  exit 1
}

Test-GitInstalled

if (-not (Test-Path -LiteralPath (Join-Path $Root '.git'))) {
  Write-Host 'git init...'
  git init
}

git add -A
$pending = git status --porcelain
if ($pending) {
  git commit -m 'Initial commit: TechPulse'
  Write-Host 'Commit created.'
} else {
  Write-Host 'Nothing to commit (already clean).'
}

git branch -M main 2>$null | Out-Null

$remotes = @(git remote 2>$null)
$hasOrigin = $remotes -contains 'origin'

if (-not $hasOrigin) {
  git remote add origin $RemoteUrl
  Write-Host 'Added remote origin.'
} else {
  git remote set-url origin $RemoteUrl
  Write-Host 'Updated remote origin URL.'
}

Write-Host 'Pushing to origin main...'
git push -u origin main
Write-Host 'Done. Open your repo on github.com'
