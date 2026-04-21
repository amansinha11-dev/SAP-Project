$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $projectDir "database\setup.sql"
$mysqlsh = "C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe"

if (-not (Test-Path $mysqlsh)) {
  Write-Host "mysqlsh not found at: $mysqlsh"
  exit 1
}

if (-not (Test-Path $sqlFile)) {
  Write-Host "SQL setup file not found: $sqlFile"
  exit 1
}

Set-Location $projectDir

Write-Host "Running database setup using mysqlsh..."
Write-Host "You will be prompted for MySQL admin password."
& $mysqlsh --sql -u root -p -f $sqlFile
