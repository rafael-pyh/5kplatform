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

# Executar migrations do Sequelize
echo "🔄 Executando migrations do Sequelize..."
npx sequelize-cli db:migrate || {
  echo "❌ Erro ao executar migrations!"
  exit 1
}
echo "✅ Migrations aplicadas!"

# Executar seeds (opcional, pode falhar sem problemas)
echo "🌱 Executando seeds..."
npx sequelize-cli db:seed:all || echo "⚠️ Seeds falharam ou não existem, continuando..."

echo "🚀 Iniciando aplicação..."
exec npm start