#!/bin/sh

echo "📌 Entrypoint iniciado..."

# Aguardar banco ficar acessível
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Aguardando banco responder..."
  until nc -z -w3 "$(echo $DATABASE_URL | sed -E 's/.*@(.*):.*/\1/')" \
            "$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')" 2>/dev/null
  do
    echo "   Banco ainda indisponível... aguardando 2s"
    sleep 2
  done
  echo "✅ Banco disponível!"
fi

# Gerar Prisma Client (seguro rodar sempre)
echo "🔄 Executando: prisma generate..."
npx prisma generate || echo "⚠️ prisma generate falhou — continuando..."

# Verificar se há migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "📦 Migrations encontradas. Executando: prisma migrate deploy..."
  set +e
  npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log
  MIGRATE_EXIT_CODE=$?
  set -e
  
  if [ $MIGRATE_EXIT_CODE -ne 0 ]; then
    if grep -q "P3005" /tmp/migrate.log; then
      echo "⚠️ Database não vazio (P3005). Tentando baseline..."
      FIRST_MIGRATION=$(ls -1 prisma/migrations | head -1)
      npx prisma migrate resolve --applied "$FIRST_MIGRATION" || true
      npx prisma migrate deploy || {
        echo "❌ Erro ao rodar migrations após baseline!"
        exit 1
      }
    else
      echo "❌ Erro ao rodar migrations!"
      exit 1
    fi
  fi
  echo "✅ Migrations aplicadas!"
else
  echo "⚠️ Nenhuma migration encontrada em prisma/migrations"
  echo "🔧 Sincronizando schema com db push..."
  npx prisma db push --skip-generate --accept-data-loss || {
    echo "❌ Erro ao sincronizar schema!"
    exit 1
  }
  echo "✅ Schema sincronizado!"
fi

# Iniciar servidor
echo "🚀 Iniciando aplicação..."
exec npm start
