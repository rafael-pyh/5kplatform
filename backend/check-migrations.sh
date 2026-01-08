#!/bin/sh
# Script para verificar o status das migrations

echo "📋 Status das Migrations"
echo "========================"
echo ""

if [ ! -f "config/database.js" ]; then
  echo "❌ Configuração do Sequelize não encontrada!"
  exit 1
fi

if command -v npx >/dev/null 2>&1; then
  echo "🔍 Migrações aplicadas:"
  npx sequelize-cli db:migrate:status
else
  echo "❌ npx não disponível!"
  exit 1
fi

echo ""
echo "Para aplicar migrations pendentes, execute:"
echo "  npx sequelize-cli db:migrate"
echo ""
echo "Para listar apenas as migrations pendentes:"
echo "  npx sequelize-cli db:migrate:status | grep down"
