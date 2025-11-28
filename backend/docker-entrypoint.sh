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

# Gerar Prisma Client
echo "🔄 Gerando Prisma Client..."
npx prisma generate || {
  echo "⚠️ Erro ao gerar Prisma Client"
  exit 1
}

# Verificar se as tabelas já existem
echo "🔍 Verificando estado do banco de dados..."
TABLE_CHECK=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'Person';
EOF
)
echo "   Resultado: $TABLE_CHECK"

# Sincronizar schema com banco de dados
echo "🔧 Sincronizando schema com banco de dados (db push)..."
set +e
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tee /tmp/db-push.log
DB_PUSH_EXIT=$?
set -e

if [ $DB_PUSH_EXIT -ne 0 ]; then
  echo "⚠️ DB push falhou. Analisando logs..."
  cat /tmp/db-push.log
  echo "❌ Erro ao sincronizar schema!"
  exit 1
fi

echo "✅ Schema sincronizado com sucesso!"

# Verificar se a tabela Person foi criada
echo "🔍 Verificando criação da tabela Person..."
npx prisma db execute --stdin <<EOF || echo "⚠️ Não foi possível verificar tabela Person"
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Person';
EOF

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
