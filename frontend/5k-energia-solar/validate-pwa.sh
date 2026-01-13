#!/bin/bash

# 🚀 PWA Quick Start Script - 5K Energia Solar
# Execute este script para validar a instalação PWA

echo "🔍 Validando PWA Setup..."
echo "========================================"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pasta do projeto
PROJECT_DIR="."

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 - NÃO ENCONTRADO"
        return 1
    fi
}

# Função para verificar conteúdo
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 contém '$2'"
        return 0
    else
        echo -e "${RED}❌${NC} $1 não contém '$2'"
        return 1
    fi
}

echo ""
echo "1️⃣  Verificando arquivos de configuração PWA..."
echo "========================================"
check_file "public/manifest.json"
check_file "public/sw.js"
check_file "public/browserconfig.xml"
check_file "public/robots.txt"
check_file "public/sitemap.xml"

echo ""
echo "2️⃣  Verificando componentes React..."
echo "========================================"
check_file "components/ServiceWorkerRegister.tsx"
check_file "components/PWAInstallPrompt.tsx"
check_file "components/PWAExamples.tsx"

echo ""
echo "3️⃣  Verificando hooks..."
echo "========================================"
check_file "hooks/usePWA.ts"

echo ""
echo "4️⃣  Verificando integrações em layout.tsx..."
echo "========================================"
check_content "app/layout.tsx" "ServiceWorkerRegister"
check_content "app/layout.tsx" "PWAInstallPrompt"
check_content "app/layout.tsx" "apple-mobile-web-app-capable"
check_content "app/layout.tsx" "manifest.json"

echo ""
echo "5️⃣  Verificando next.config.ts..."
echo "========================================"
check_content "next.config.ts" "Service-Worker-Allowed"
check_content "next.config.ts" "headers"

echo ""
echo "6️⃣  Verificando documentação..."
echo "========================================"
check_file "PWA_SETUP.md"
check_file "PWA_TESTING_GUIDE.md"
check_file "PWA_SUMMARY.md"
check_file "PWA_PRODUCTION_GUIDE.md"
check_file "PWA_FILES_INVENTORY.md"

echo ""
echo "========================================"
echo "🎉 Validação Completa!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "1. Rodar: npm run dev"
echo "2. Abrir: http://localhost:3000"
echo "3. Validar: DevTools > Application > Service Workers"
echo "4. Ler: PWA_SETUP.md para entender como funciona"
echo ""
echo "Para testes em profundidade:"
echo "- Consulte: PWA_TESTING_GUIDE.md"
echo "- Deploy: PWA_PRODUCTION_GUIDE.md"
echo ""
