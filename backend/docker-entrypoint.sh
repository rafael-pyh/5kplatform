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

# Verificar arquivos do Prisma antes de gerar
echo "🔍 Verificando arquivos do Prisma..."
echo "Schema existe?"
ls -la prisma/schema.prisma || echo "❌ Schema não encontrado!"
echo "Config existe?"
ls -la prisma.config.ts || echo "⚠️ Config não encontrado"

# Gerar Prisma Client
echo "🔄 Gerando Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma 2>&1 | tee /tmp/prisma-generate.log || {
  echo "❌ Erro ao gerar Prisma Client!"
  cat /tmp/prisma-generate.log
  exit 1
}
echo "✅ Prisma Client gerado!"

# Verificar se o Prisma Client foi gerado corretamente
echo "🔍 Verificando Prisma Client gerado..."
if [ -d "node_modules/.prisma" ]; then
  echo "Conteúdo de node_modules/.prisma:"
  ls -la node_modules/.prisma/
  if [ -d "node_modules/.prisma/client" ]; then
    echo "Conteúdo de node_modules/.prisma/client:"
    ls -la node_modules/.prisma/client/ | head -20
    echo "✅ Prisma Client verificado!"
  else
    echo "❌ Diretório client não existe!"
    exit 1
  fi
else
  echo "❌ Diretório .prisma não existe!"
  exit 1
fi

# Sincronizar schema com banco (db push para desenvolvimento)
echo "📦 Sincronizando schema com banco de dados..."
npx prisma db push --accept-data-loss || {
  echo "❌ Erro ao sincronizar schema!"
  exit 1
}
echo "✅ Schema sincronizado com sucesso!"

# Seed
echo "🌱 Executando seed..."
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️ Seed falhou, continuando..."
else
  echo "⚠️ Seed não encontrado"
fi

echo "🚀 Iniciando aplicação..."
exec npm start
