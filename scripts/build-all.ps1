# scripts/build-all.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Building Full Fashion AI Monorepo      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Build .NET Backend
Write-Host "`n[1/2] Building ASP.NET Core Solution..." -ForegroundColor Yellow
dotnet build backend/FashionAI.Backend/FashionAI.sln -c Debug
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Failed to build .NET solution!" -ForegroundColor Red
    exit 1
}

# 2. Build Angular Frontend
Write-Host "`n[2/2] Building Angular Frontend..." -ForegroundColor Yellow
npm --prefix frontend/fashion-ai-web run build:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Failed to build Angular frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "`n√ All Monorepo projects built successfully!" -ForegroundColor Green
