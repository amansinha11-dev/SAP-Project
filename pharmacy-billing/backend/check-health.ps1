$ErrorActionPreference = 'Stop'

$urls = @(
  "http://localhost:9090/",
  "http://localhost:9090/api/health"
)

$logOut = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "backend-startup.out.log"
$logErr = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "backend-startup.err.log"

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
    Write-Host $_.Exception.Message

    $listener = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
      $pid = $listener[0].OwningProcess
      $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
      Write-Host "Port 9090 listener: PID $pid $($proc.ProcessName)"
    } else {
      Write-Host "Port 9090 listener: none"
    }

    if (Test-Path $logOut) {
      Write-Host "Last startup OUT log lines:"
      Get-Content $logOut -Tail 40
    }

    if (Test-Path $logErr) {
      Write-Host "Last startup ERR log lines:"
      Get-Content $logErr -Tail 40
    }
  }

  Write-Host "-----"
}
