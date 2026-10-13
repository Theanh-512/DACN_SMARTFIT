# scripts/test-all.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Running Tests across Monorepo          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Test .NET Backend
Write-Host "`n[1/2] Running ASP.NET Core Unit Tests..." -ForegroundColor Yellow
dotnet test backend/FashionAI.Backend/FashionAI.sln --logger "console;verbosity=normal"
if ($LASTEXITCODE -ne 0) {
    Write-Host "X .NET tests failed!" -ForegroundColor Red
    exit 1
}

# 2. Test Angular Frontend
Write-Host "`n[2/2] Running Angular Unit Tests..." -ForegroundColor Yellow
npm --prefix frontend/fashion-ai-web test -- --watch=false --browsers=ChromeHeadless
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Angular tests failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n√ All tests passed successfully!" -ForegroundColor Green
