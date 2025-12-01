#!/bin/sh
set -e

echo "📌 Entrypoint iniciado..."

# Aguardar banco ficar acessível (com timeout)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Aguardando banco de dados..."
  max_attempts=30
  attempt=0
  
  DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
  
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
fi

# Gerar Prisma Client
echo "🔄 Gerando Prisma Client..."
npx prisma generate

# Aplicar migrations REAL
echo "📦 Executando migrations..."
npx prisma migrate deploy || {
  echo "❌ Erro ao rodar migrations!"
  exit 1
}
echo "✅ Migrations aplicadas com sucesso!"

# Seed
echo "🌱 Executando seed..."
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️ Seed falhou, continuando..."
else
  echo "⚠️ Seed não encontrado"
fi

echo "🚀 Iniciando aplicação..."
exec npm start
