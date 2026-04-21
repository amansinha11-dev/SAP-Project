[CmdletBinding()]
param(
  [switch]$FromElevation
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logPath = Join-Path $scriptDir 'reset-mysql-access-elevated.log'
$mysqldOutLog = Join-Path $scriptDir 'mysql-reset-temp.out.log'
$mysqldErrLog = Join-Path $scriptDir 'mysql-reset-temp.err.log'

$serviceName = 'MySQL80'
$mysqldPath = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe'
$mysqlshPath = 'C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe'
$defaultsFile = 'C:\ProgramData\MySQL\MySQL Server 8.0\my.ini'

$currentPrincipal = [Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host 'Requesting Administrator permission...'
  $selfPath = $MyInvocation.MyCommand.Path
  if (-not $selfPath) {
    throw 'Unable to determine script path for elevation.'
  }

  $elevationArguments = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $selfPath, '-FromElevation')
  try {
    $elevatedProcess = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $elevationArguments -PassThru -Wait
    if ($elevatedProcess.ExitCode -ne 0) {
      Write-Host "Elevated run failed with exit code $($elevatedProcess.ExitCode)."
      if (Test-Path $logPath) {
        Write-Host "Last lines from ${logPath}:"
        Get-Content $logPath -Tail 80
      } else {
        Write-Host 'No reset log was created. Ensure you clicked Yes on the UAC prompt.'
      }
    }
    exit $elevatedProcess.ExitCode
  }
  catch {
    throw 'Administrator permission is required. Run the script again and click Yes in the UAC prompt.'
  }
}

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}
if (Test-Path $mysqldOutLog) {
  Remove-Item $mysqldOutLog -Force
}
if (Test-Path $mysqldErrLog) {
  Remove-Item $mysqldErrLog -Force
}

Start-Transcript -Path $logPath -Force

if (-not (Test-Path $mysqldPath)) {
  throw "mysqld.exe not found at $mysqldPath"
}

if (-not (Test-Path $mysqlshPath)) {
  throw "mysqlsh.exe not found at $mysqlshPath"
}

$temporaryMySql = $null

try {
  Stop-Service -Name $serviceName -Force -ErrorAction Stop
  Write-Host "Stopped service: $serviceName"

  $startupArguments = @(
    "--defaults-file=$defaultsFile"
    '--console'
    '--skip-grant-tables'
    '--skip-networking=0'
  )

  $temporaryMySql = Start-Process -FilePath $mysqldPath -ArgumentList $startupArguments -PassThru -WindowStyle Hidden -RedirectStandardOutput $mysqldOutLog -RedirectStandardError $mysqldErrLog
  Write-Host "Started temporary MySQL instance. PID=$($temporaryMySql.Id)"

  $ready = $false
  for ($attempt = 1; $attempt -le 90; $attempt++) {
    & $mysqlshPath --sql --host localhost --port 3306 --user root --execute "SELECT 1;" *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }

  if (-not $ready) {
    throw "Temporary MySQL instance did not become ready. Check $mysqldErrLog"
  }

  $resetSql = @"
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pharmacy_user'@'localhost' IDENTIFIED BY 'Pharmacy@12345';
ALTER USER 'pharmacy_user'@'localhost' IDENTIFIED BY 'Pharmacy@12345';
GRANT ALL PRIVILEGES ON pharmacy_db.* TO 'pharmacy_user'@'localhost';
FLUSH PRIVILEGES;
"@

  & $mysqlshPath --sql --host localhost --port 3306 --user root --execute $resetSql
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to apply user reset SQL.'
  }

  Write-Host 'Database user reset SQL applied.'
}
finally {
  if ($temporaryMySql -and -not $temporaryMySql.HasExited) {
    Stop-Process -Id $temporaryMySql.Id -Force -ErrorAction SilentlyContinue
    Write-Host 'Stopped temporary MySQL instance.'
  }

  $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
  if ($svc -and $svc.Status -ne 'Running') {
    Start-Service -Name $serviceName -ErrorAction Stop
    Write-Host "Started service: $serviceName"
  }

  Stop-Transcript
}

& $mysqlshPath --sql --host localhost --port 3306 --user pharmacy_user "--password=Pharmacy@12345" --database pharmacy_db --execute "SELECT 1 AS db_ok;"
if ($LASTEXITCODE -ne 0) {
  throw 'Verification failed: pharmacy_user still cannot run SELECT 1.'
}

Write-Host 'SUCCESS: Database connection for pharmacy_user is working.'
