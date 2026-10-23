$nodeHome = Join-Path $env:ProgramFiles "nodejs"
$nodeExecutable = Join-Path $nodeHome "node.exe"
$npmExecutable = Join-Path $nodeHome "npm.cmd"

if (-not (Test-Path $nodeExecutable)) {
  Write-Host "Node.js를 찾을 수 없습니다. Node.js LTS를 설치한 뒤 다시 실행하세요." -ForegroundColor Red
  exit 1
}

$env:Path = "$nodeHome;$env:Path"
Set-Location $PSScriptRoot

Write-Host "Oil Express 개발 서버를 시작합니다..." -ForegroundColor Cyan
& $npmExecutable run dev
