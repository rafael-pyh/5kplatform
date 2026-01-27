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

# Verificar se há migrations pendentes
echo "🔍 Verificando status das migrations..."
if command -v npx >/dev/null 2>&1; then
  echo "=== Status das Migrations ===" 
  npx sequelize-cli db:migrate:status 2>&1 || true
  echo "=============================="
else
  echo "❌ npx não disponível!"
  exit 1
fi

# Executar migrations do Sequelize com retry
echo "🔄 Executando migrations do Sequelize..."
MIGRATION_ATTEMPTS=0
MIGRATION_MAX_ATTEMPTS=3
MIGRATION_SUCCESS=false

while [ $MIGRATION_ATTEMPTS -lt $MIGRATION_MAX_ATTEMPTS ]; do
  MIGRATION_ATTEMPTS=$((MIGRATION_ATTEMPTS + 1))
  echo "   Tentativa $MIGRATION_ATTEMPTS/$MIGRATION_MAX_ATTEMPTS..."
  
  if npx sequelize-cli db:migrate --debug 2>&1; then
    echo "✅ Migrations aplicadas com sucesso!"
    MIGRATION_SUCCESS=true
    break
  else
    MIGRATION_ERROR=$?
    echo "❌ Erro ao executar migrations (Código: $MIGRATION_ERROR)"
    if [ $MIGRATION_ATTEMPTS -lt $MIGRATION_MAX_ATTEMPTS ]; then
      echo "   Aguardando 5s antes de tentar novamente..."
      sleep 5
    fi
  fi
done

if [ "$MIGRATION_SUCCESS" != "true" ]; then
  echo "❌ ERRO: Migrations falharam após $MIGRATION_MAX_ATTEMPTS tentativas!"
  echo "🔧 Tentando executar SQL fallback como último recurso..."
  
  if [ -f "create-credit-tables.sql" ]; then
    if psql "$DATABASE_URL" -f create-credit-tables.sql 2>&1; then
      echo "✅ Tabelas criadas via SQL fallback!"
      MIGRATION_SUCCESS=true
    else
      echo "❌ ERRO CRÍTICO: Ambas migrations e SQL fallback falharam!"
      exit 1
    fi
  else
    echo "❌ ERRO CRÍTICO: Arquivo SQL fallback não encontrado!"
    exit 1
  fi
fi

# Verificar se as tabelas foram criadas
echo "🔍 Verificando se as tabelas críticas foram criadas..."
if command -v psql >/dev/null 2>&1; then
  # Extrair credenciais do DATABASE_URL
  DB_CONNECTION_STRING=$(echo $DATABASE_URL | sed 's|postgresql://||')
  TABLES_EXIST=$(psql "$DATABASE_URL" -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('CreditWallet', 'CreditTransaction') AND table_schema = 'public';" 2>&1 | xargs || echo "0")
  
  if [ "$TABLES_EXIST" = "2" ]; then
    echo "✅ Tabelas críticas (CreditWallet, CreditTransaction) existem!"
  else
    echo "⚠️  Aviso: Nem todas as tabelas críticas existem. Encontradas: $TABLES_EXIST/2"
    echo "   Isso pode indicar que as migrations não foram completadas."
  fi
else
  echo "⚠️  psql não disponível, pulando verificação de tabelas"
fi

# Executar seeds (opcional, pode falhar sem problemas)
echo "🌱 Executando seeds..."
if command -v npx >/dev/null 2>&1; then
  npx sequelize-cli db:seed:all 2>&1 | grep -v "^$" || echo "⚠️  Seeds falharam ou não existem, continuando..."
fi

echo "🚀 Iniciando aplicação..."
exec npm start