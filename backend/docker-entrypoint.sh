#!/bin/sh
set -e

echo "📌 Entrypoint iniciado..."

# Aguardar banco ficar acessível (com timeout)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Aguardando banco de dados..."
  max_attempts=30
  attempt=0
  
  # Extrair host e porta do DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
  
  until nc -z -w3 "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $attempt -eq $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "   Tentativa $attempt/$max_attempts - Aguardando 2s..."
    sleep 2
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Timeout: Banco não respondeu após $max_attempts tentativas"
    exit 1
  fi
  
  echo "✅ Banco de dados disponível!"
fi

# Gerar Prisma Client (primeira vez)
echo "🔄 Gerando Prisma Client..."
npx prisma generate || {
  echo "⚠️ Erro ao gerar Prisma Client"
  exit 1
}

# Sincronizar schema com banco de dados
echo "🔧 Sincronizando schema com banco de dados (db push)..."
echo "   DATABASE_URL: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
npx prisma db push --skip-generate --accept-data-loss 2>&1 || {
  echo "❌ Erro ao sincronizar schema! Verifique se DATABASE_URL está correta."
  exit 1
}
echo "✅ Schema sincronizado com sucesso!"

# Regenerar Prisma Client após db push (importante!)
echo "🔄 Regenerando Prisma Client após sincronização..."
npx prisma generate || {
  echo "⚠️ Erro ao regenerar Prisma Client"
  exit 1
}

# Executar seed para criar super admin
echo "🌱 Executando seed..."
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️ Seed falhou, mas continuando..."
elif [ -f "prisma/seed.js" ]; then
  node prisma/seed.js || echo "⚠️ Seed falhou, mas continuando..."
else
  echo "⚠️ Arquivo seed.js não encontrado - pulando seed"
fi

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
exec npm start
