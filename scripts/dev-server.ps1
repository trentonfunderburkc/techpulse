# Astro dev -> http://127.0.0.1:4321 (used by scheduled task and start-now.ps1).
$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $ProjectRoot

try {
  $client = New-Object System.Net.Sockets.TcpClient
  $client.Connect('127.0.0.1', 4321)
  $client.Close()
  exit 0
} catch { }

$nodeDir = $null
foreach ($root in @(
    (Join-Path $env:USERPROFILE 'node-portable'),
    (Join-Path $env:LOCALAPPDATA 'node-portable')
  )) {
  $hit = Get-ChildItem -Path $root -Filter 'node.exe' -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($hit) {
    $nodeDir = $hit.DirectoryName
    break
  }
}
if (-not $nodeDir) {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) {
    $nodeDir = Split-Path -Parent $cmd.Source
  }
}
if (-not $nodeDir) {
  exit 1
}

$env:Path = "$nodeDir;$env:Path"
& npm run dev
