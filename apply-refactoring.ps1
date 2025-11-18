# Script para aplicar a refatoração do frontend
# Execute este script no PowerShell

Write-Host "🚀 Aplicando refatoração do frontend..." -ForegroundColor Green
Write-Host ""

$frontendPath = "C:\Users\enert\Documents\workana\5kplatform\frontend\5k-energia-solar"

# Backup dos arquivos originais
Write-Host "📦 Criando backup dos arquivos originais..." -ForegroundColor Yellow
$backupPath = "$frontendPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Página de vendedores
Write-Host "  - Backup: app/dashboard/sellers/page.tsx" -ForegroundColor Cyan
Copy-Item "$frontendPath\app\dashboard\sellers\page.tsx" "$backupPath\sellers-page.tsx"

# Página de dashboard
Write-Host "  - Backup: app/dashboard/page.tsx" -ForegroundColor Cyan
Copy-Item "$frontendPath\app\dashboard\page.tsx" "$backupPath\dashboard-page.tsx"

# QRCodeModal
Write-Host "  - Backup: components/QRCodeModal.tsx" -ForegroundColor Cyan
Copy-Item "$frontendPath\components\QRCodeModal.tsx" "$backupPath\QRCodeModal.tsx"

Write-Host ""
Write-Host "✅ Backup criado em: $backupPath" -ForegroundColor Green
Write-Host ""

# Aplicar refatoração
Write-Host "🔄 Aplicando arquivos refatorados..." -ForegroundColor Yellow

# Página de vendedores
if (Test-Path "$frontendPath\app\dashboard\sellers\page.refactored.tsx") {
    Write-Host "  - Aplicando: sellers/page.tsx" -ForegroundColor Cyan
    Copy-Item "$frontendPath\app\dashboard\sellers\page.refactored.tsx" "$frontendPath\app\dashboard\sellers\page.tsx" -Force
    Remove-Item "$frontendPath\app\dashboard\sellers\page.refactored.tsx"
} else {
    Write-Host "  ⚠️  Arquivo não encontrado: page.refactored.tsx" -ForegroundColor Red
}

# Página de dashboard
if (Test-Path "$frontendPath\app\dashboard\page.refactored.tsx") {
    Write-Host "  - Aplicando: dashboard/page.tsx" -ForegroundColor Cyan
    Copy-Item "$frontendPath\app\dashboard\page.refactored.tsx" "$frontendPath\app\dashboard\page.tsx" -Force
    Remove-Item "$frontendPath\app\dashboard\page.refactored.tsx"
} else {
    Write-Host "  ⚠️  Arquivo não encontrado: page.refactored.tsx" -ForegroundColor Red
}

# QRCodeModal (opcional)
Write-Host ""
$applyModal = Read-Host "Deseja aplicar o QRCodeModal otimizado? (s/n)"
if ($applyModal -eq "s" -or $applyModal -eq "S") {
    if (Test-Path "$frontendPath\components\QRCodeModal.optimized.tsx") {
        Write-Host "  - Aplicando: QRCodeModal.tsx" -ForegroundColor Cyan
        Copy-Item "$frontendPath\components\QRCodeModal.optimized.tsx" "$frontendPath\components\QRCodeModal.tsx" -Force
        Remove-Item "$frontendPath\components\QRCodeModal.optimized.tsx"
    } else {
        Write-Host "  ⚠️  Arquivo não encontrado: QRCodeModal.optimized.tsx" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Refatoração aplicada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o servidor de desenvolvimento: npm run dev" -ForegroundColor White
Write-Host "  2. Teste todas as funcionalidades" -ForegroundColor White
Write-Host "  3. Se houver problemas, restaure do backup: $backupPath" -ForegroundColor White
Write-Host ""
Write-Host "📚 Leia REFATORACAO_FRONTEND.md para mais detalhes" -ForegroundColor Cyan
Write-Host ""
