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

# Verificar se schema existe
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ Schema Prisma não encontrado em prisma/schema.prisma"
  exit 1
fi

echo "✅ Schema encontrado"

# Verificar se Prisma Client já existe
echo "🔍 Verificando Prisma Client..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "✅ Prisma Client encontrado!"
else
  echo "⚠️ Prisma Client não encontrado, gerando..."
  npx prisma generate || {
    echo "❌ Erro ao gerar Prisma Client!"
    exit 1
  }
fi

# Executar migrations
echo "🔄 Executando migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "❌ Erro ao executar migrations!"
  echo "Tentando criar o banco de dados..."
  DATABASE_URL="$DATABASE_URL" npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss || {
    echo "❌ Erro ao criar estrutura do banco!"
    exit 1
  }
}
echo "✅ Migrations aplicadas!"

# Executar seed (opcional, pode falhar sem problemas)
echo "🌱 Executando seed..."
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️ Seed falhou, continuando..."
elif [ -f "prisma/seed.js" ]; then
  node prisma/seed.js || echo "⚠️ Seed falhou, continuando..."
else
  echo "⚠️ Arquivo de seed não encontrado, pulando..."
fi

echo "🚀 Iniciando aplicação..."
exec npm start