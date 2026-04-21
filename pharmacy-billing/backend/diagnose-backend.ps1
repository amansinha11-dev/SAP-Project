$ErrorActionPreference = 'Stop'

$ports = @(9090, 8081, 8080)

Write-Host "=== LISTENERS ==="
foreach ($p in $ports) {
  $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $pid = $conn[0].OwningProcess
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    Write-Host "Port $p -> PID $pid $($proc.ProcessName)"
    if ($proc.Path) {
      Write-Host "Path: $($proc.Path)"
    }
  } else {
    Write-Host "Port $p -> no listener"
  }
}

Write-Host ""
Write-Host "=== URL CHECKS ==="
$urls = @(
  "http://localhost:9090/",
  "http://localhost:9090/api/health",
  "http://localhost:8081/api/health",
  "http://localhost:8080/api/health"
)

foreach ($url in $urls) {
  try {
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    Write-Host "[$($res.StatusCode)] $url"
    if ($res.Content) {
      Write-Host $res.Content
    }
  }
  catch {
    Write-Host "[FAILED] $url"
    if ($_.Exception.Response) {
      try {
        $resp = $_.Exception.Response
        Write-Host "Status: $([int]$resp.StatusCode)"
      } catch {
        Write-Host $_.Exception.Message
      }
    } else {
      Write-Host $_.Exception.Message
    }
  }

  Write-Host "-----"
}
