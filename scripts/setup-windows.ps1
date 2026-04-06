# One-time: add portable Node to user PATH, register logon task to start Astro dev server.
# Run: powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

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
  Write-Host 'ERROR: node.exe not found under node-portable. Install Node or unpack portable to %USERPROFILE%\node-portable'
  exit 1
}

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$nodeDir*") {
  $newPath = if ($userPath) { "$userPath;$nodeDir" } else { $nodeDir }
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  $env:Path = "$nodeDir;$env:Path"
  Write-Host "Added to user PATH: $nodeDir"
} else {
  Write-Host 'Node directory already in user PATH.'
}

$taskName = 'TechPulseDevServer'
$ps1 = Join-Path $ProjectRoot 'scripts\dev-server.ps1'
$arg = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ps1`""

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $arg -WorkingDirectory $ProjectRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force |
  Out-Null

Write-Host "Scheduled task registered: $taskName (runs at logon)."
Write-Host 'Open: http://127.0.0.1:4321'
Write-Host 'To start server now without re-login: .\scripts\start-now.ps1'
