#!/bin/sh
set -e

echo "📌 Entrypoint iniciado..."

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definida!"
  exit 1
fi

echo "✅ DATABASE_URL definida"

# Aguardar banco ficar acessível
echo "⏳ Aguardando banco de dados..."
max_attempts=30
attempt=0

DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:\/]+).*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')

echo "   Host: $DB_HOST"
echo "   Porta: $DB_PORT"

until nc -z -w3 "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "   Tentativa $attempt/$max_attempts - Aguardando 2s..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Timeout: Banco não respondeu"
  exit 1
fi

echo "✅ Banco de dados disponível!"

# Verificar se arquivo de config existe
if [ ! -f "config/database.js" ]; then
  echo "❌ Configuração do Sequelize não encontrada em config/database.js"
  exit 1
fi

echo "✅ Configuração do Sequelize encontrada"

# Verificar se há migrations pendentes
echo "🔍 Verificando status das migrations..."
if command -v npx >/dev/null 2>&1; then
  PENDING=$(npx sequelize-cli db:migrate:status 2>&1 | grep -c "down" || echo "0")
  echo "   Migrations pendentes: $PENDING"
fi

# Executar migrations do Sequelize
echo "🔄 Executando migrations do Sequelize..."
if command -v npx >/dev/null 2>&1; then
  if npx sequelize-cli db:migrate; then
    echo "✅ Migrations aplicadas com sucesso!"
  else
    echo "⚠️ Aviso: Erro ao executar migrations, mas continuando..."
  fi
else
  echo "❌ npx não disponível!"
  exit 1
fi

# Executar seeds (opcional, pode falhar sem problemas)
echo "🌱 Executando seeds..."
if command -v npx >/dev/null 2>&1; then
  npx sequelize-cli db:seed:all 2>&1 | grep -v "^$" || echo "⚠️ Seeds falharam ou não existem, continuando..."
fi

echo "🚀 Iniciando aplicação..."
exec npm start