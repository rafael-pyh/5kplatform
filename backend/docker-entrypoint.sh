#!/bin/sh
set -e

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

# Aplicar migrations
echo "📦 Executando: prisma migrate deploy..."
npx prisma migrate deploy || {
  echo "❌ Erro ao rodar migrations!"
  exit 1
}

echo "✅ Migrations aplicadas com sucesso!"

# Iniciar servidor
echo "🚀 Iniciando aplicação..."
exec npm start
