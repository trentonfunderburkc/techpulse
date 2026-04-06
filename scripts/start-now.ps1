# Start Astro dev in a hidden PowerShell window if port 4321 is free.
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ps1 = Join-Path $PSScriptRoot 'dev-server.ps1'

try {
  $c = New-Object System.Net.Sockets.TcpClient
  $c.Connect('127.0.0.1', 4321)
  $c.Close()
  Write-Host 'Already running: http://127.0.0.1:4321'
  exit 0
} catch { }

Start-Process -FilePath 'powershell.exe' -ArgumentList @(
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', $ps1
) -WorkingDirectory $ProjectRoot

Write-Host 'Starting server... Open http://127.0.0.1:4321 in a few seconds.'
