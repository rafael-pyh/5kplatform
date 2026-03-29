#!/bin/sh
set -e

echo "📌 Entrypoint DEV iniciado..."

# Wait for Postgres to be ready
host_from_url() {
  echo "$DATABASE_URL" | awk -F'[@:/?]' '{print $4}'
}

# If DATABASE_URL not set, default to postgres host
DB_HOST=${DB_HOST:-$(host_from_url)}
DB_HOST=${DB_HOST:-postgres}

# Wait loop
echo "⏳ Aguardando Postgres em ${DB_HOST}..."
RETRIES=30
until pg_isready -h "$DB_HOST" -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1 || [ $RETRIES -le 0 ]; do
  echo "   Postgres não pronto, tentando em 2s... ($RETRIES tentativas restantes)"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -le 0 ]; then
  echo "❌ Postgres não ficou disponível. Saindo."
  exit 1
fi

echo "✅ Postgres está pronto!"

# Verificar se há migrations pendentes
echo "🔍 Verificando status das migrations..."
if command -v npx >/dev/null 2>&1; then
  npx sequelize-cli db:migrate:status 2>&1 | head -20 || echo "   (Status não disponível)"
fi

# Run migrations for development
echo "🔄 Aplicando migrations..."
if command -v npx >/dev/null 2>&1; then
  if npx sequelize-cli db:migrate; then
    echo "✅ Migrations aplicadas com sucesso!"
  else
    echo "⚠️ Algumas migrations falharam, mas continuando..."
    # Tentar aplicar migrations específicas que podem ter falhado
    npx sequelize-cli db:migrate:status | grep down | awk '{print $1}' | while read -r migration; do
      echo "Tentando aplicar migration: $migration"
      if npx sequelize-cli db:migrate --name "$migration" 2>/dev/null; then
        echo "✅ Migration $migration aplicada com sucesso"
      else
        echo "❌ Migration $migration falhou, pulando..."
      fi
    done
  fi
else
  echo "❌ npx não disponível!"
  exit 1
fi

# Execute the provided command (npm run dev)
echo "🚀 Iniciando servidor de desenvolvimento..."
exec "$@"
