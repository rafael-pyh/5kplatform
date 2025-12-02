#!/bin/sh
set -e

echo "📌 Entrypoint iniciado..."

# Aguardar banco ficar acessível
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

# Verificar se Prisma Client já existe (foi copiado do builder)
echo "🔍 Verificando Prisma Client..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "✅ Prisma Client encontrado (copiado do builder)!"
else
  echo "⚠️ Prisma Client não encontrado, gerando..."
  npx prisma generate || {
    echo "❌ Erro ao gerar Prisma Client!"
    exit 1
  }
fi

# Executar migrations (use deploy para produção)
echo "🔄 Executando migrations..."
npx prisma migrate deploy || {
  echo "❌ Erro ao executar migrations!"
  exit 1
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