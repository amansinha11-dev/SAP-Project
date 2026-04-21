$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logOut = Join-Path $projectDir "backend-startup.out.log"
$logErr = Join-Path $projectDir "backend-startup.err.log"

Set-Location $projectDir

if (-not (Test-Path ".\mvnw.cmd")) {
  Write-Host "mvnw.cmd not found in $projectDir"
  exit 1
}

$portLine = netstat -ano | Select-String ":9090" | Select-Object -First 1
if ($portLine) {
  Write-Host "Port 9090 already in use. Stop the existing process first, then retry."
  exit 1
}

$jdkHome = if ($env:JAVA_HOME) { $env:JAVA_HOME } else { "" }
if ([string]::IsNullOrWhiteSpace($jdkHome)) {
  Write-Host "JAVA_HOME is not set. Please install JDK 17+ and set JAVA_HOME."
  exit 1
}

$env:JAVA_HOME = $jdkHome
$env:Path = "$jdkHome\bin;$env:Path"

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "Starting backend on http://localhost:9090 ..."

if (Test-Path $logOut) {
  Remove-Item $logOut -Force
}

if (Test-Path $logErr) {
  Remove-Item $logErr -Force
}

$staleSecurityClass = Join-Path $projectDir "target\classes\com\pharmacy\SecurityConfig.class"
if (Test-Path $staleSecurityClass) {
  Remove-Item $staleSecurityClass -Force
}

$proc = Start-Process -FilePath ".\mvnw.cmd" `
  -ArgumentList "clean spring-boot:run" `
  -WorkingDirectory $projectDir `
  -NoNewWindow `
  -PassThru `
  -RedirectStandardOutput $logOut `
  -RedirectStandardError $logErr

for ($i = 1; $i -le 60; $i++) {
  $listener = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
  if ($listener) {
    Write-Host "Backend is running on http://localhost:9090"
    Write-Host "Process ID: $($listener[0].OwningProcess)"
    Write-Host "Startup logs:"
    Write-Host "  OUT: $logOut"
    Write-Host "  ERR: $logErr"
    exit 0
  }

  if ($proc.HasExited) {
    break
  }

  Start-Sleep -Seconds 2
}

if (-not $proc.HasExited) {
  Stop-Process -Id $proc.Id -Force
}

Write-Host "Backend failed to start. Last log lines (OUT):"
if (Test-Path $logOut) {
  Get-Content $logOut -Tail 80
} else {
  Write-Host "No stdout log was created."
}

Write-Host "Backend failed to start. Last log lines (ERR):"
if (Test-Path $logErr) {
  Get-Content $logErr -Tail 80
} else {
  Write-Host "No stderr log was created."
}

exit 1
