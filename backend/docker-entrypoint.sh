#!/bin/sh
set -e

echo "📌 Entrypoint iniciado..."
echo "🔧 NODE_ENV: $NODE_ENV"

# Mostrar apenas parte inicial do DATABASE_URL por segurança (sintaxe POSIX)
if [ -n "$DATABASE_URL" ]; then
  DB_URL_SHORT=$(echo "$DATABASE_URL" | cut -c1-50)
  echo "🔧 DATABASE_URL: ${DB_URL_SHORT}..."
fi

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

# Executar migrations do Sequelize
echo "🔄 Executando migrations do Sequelize..."
echo "   NODE_ENV: $NODE_ENV"
echo "   DATABASE_URL presente: $([ -n "$DATABASE_URL" ] && echo 'SIM' || echo 'NÃO')"
echo "   Arquivos de migration encontrados: $(ls -1 src/migrations/*.js 2>/dev/null | wc -l)"

MIGRATION_ATTEMPTS=0
MIGRATION_MAX_ATTEMPTS=3
MIGRATION_SUCCESS=false

while [ $MIGRATION_ATTEMPTS -lt $MIGRATION_MAX_ATTEMPTS ]; do
  MIGRATION_ATTEMPTS=$((MIGRATION_ATTEMPTS + 1))
  echo ""
  echo "   === Tentativa $MIGRATION_ATTEMPTS/$MIGRATION_MAX_ATTEMPTS ==="
  
  # Mostrar status antes da migration
  echo "   📊 Status das migrations ANTES:"
  npx sequelize-cli db:migrate:status 2>&1 | tail -10 || echo "   (Não foi possível obter status)"
  
  # Tentar migration
  echo "   🔄 Executando: npx sequelize-cli db:migrate"
  if npx sequelize-cli db:migrate 2>&1; then
    echo "✅ Migrations aplicadas com sucesso!"
    MIGRATION_SUCCESS=true
    
    # Mostrar status depois da migration
    echo "   📊 Status das migrations DEPOIS:"
    npx sequelize-cli db:migrate:status 2>&1 | tail -5 || echo "   (Não foi possível obter status)"
    break
  else
    MIGRATION_ERROR=$?
    echo "⚠️  Tentativa $MIGRATION_ATTEMPTS falhou (Código: $MIGRATION_ERROR)"
    if [ $MIGRATION_ATTEMPTS -lt $MIGRATION_MAX_ATTEMPTS ]; then
      echo "   Aguardando 5s antes de tentar novamente..."
      sleep 5
    fi
  fi
done

if [ "$MIGRATION_SUCCESS" != "true" ]; then
  echo ""
  echo "❌ AVISO: Migrations falharam após $MIGRATION_MAX_ATTEMPTS tentativas"
  echo "🔧 Tentando fallback SQL direto..."
  echo ""
  
  if [ ! -f "create-credit-tables.sql" ]; then
    echo "❌ ERRO CRÍTICO: Arquivo SQL fallback (create-credit-tables.sql) não encontrado!"
    ls -la | grep -i credit || echo "   Nenhum arquivo com 'credit' encontrado"
    exit 1
  fi
  
  echo "📋 Executando SQL fallback..."
  if psql "$DATABASE_URL" -f create-credit-tables.sql 2>&1; then
    echo "✅ Tabelas de crédito criadas via SQL fallback!"
    MIGRATION_SUCCESS=true
  else
    PSQL_ERROR=$?
    echo "⚠️  SQL fallback retornou código $PSQL_ERROR"
    echo "   Isso é normal se algumas tabelas/FKs já existem ou não podem ser criadas"
    echo "   Continuando mesmo assim..."
    MIGRATION_SUCCESS=true  # Considerar como sucesso mesmo que falhe
  fi
fi

# Verificação pós-migration
echo ""
echo "🔍 Verificando se as tabelas foram criadas..."
if command -v psql >/dev/null 2>&1; then
  echo "   Consultando information_schema..."
  
  TABLE_COUNT=$(psql "$DATABASE_URL" -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('CreditWallet', 'CreditTransaction', 'WithdrawalRequest', 'PaymentProof', 'Order');" 2>&1 | xargs || echo "0")
  
  echo "   Tabelas encontradas: $TABLE_COUNT/5"
  
  if [ "$TABLE_COUNT" = "5" ]; then
    echo "✅ Tabelas críticas confirmadas!"
    
    # Verificar especificamente a tabela Order e coluna kitId
    echo ""
    echo "🔍 Verificando tabela Order e coluna kitId..."
    KITID_NULLABLE=$(psql "$DATABASE_URL" -tc "SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Order' AND column_name = 'kitId';" 2>&1 | xargs || echo "UNKNOWN")
    
    if [ "$KITID_NULLABLE" = "YES" ]; then
      echo "✅ Coluna kitId da tabela Order está corretamente configurada como nullable!"
    else
      echo "❌ PROBLEMA: Coluna kitId da tabela Order não está nullable (atual: $KITID_NULLABLE)"
      echo "   Tentando corrigir manualmente..."
      
      if psql "$DATABASE_URL" -c 'ALTER TABLE "Order" ALTER COLUMN "kitId" DROP NOT NULL;' 2>&1; then
        echo "✅ Coluna kitId corrigida para nullable!"
      else
        echo "❌ Falha ao corrigir coluna kitId"
      fi
    fi
    
    # Listar as tabelas como confirmação extra
    echo ""
    echo "📊 Estrutura das tabelas:"
    echo "   Order:"
    psql "$DATABASE_URL" -tc "\d+ \"Order\"" 2>&1 | head -5 || echo "     (Não foi possível listar)"
  else
    echo "⚠️  AVISO: Nem todas as tabelas críticas foram criadas!"
    echo ""
    echo "   Tabelas existentes no banco:"
    psql "$DATABASE_URL" -tc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1 | head -20
    exit 1
  fi
else
  echo "⚠️  psql não disponível, pulando verificação de tabelas"
fi

# Executar seeds (opcional)
echo ""
echo "🌱 Verificando seeds..."
if [ -d "src/seeders" ] && [ "$(ls -A src/seeders 2>/dev/null)" ]; then
  echo "   Executando seeders..."
  npx sequelize-cli db:seed:all 2>&1 || echo "⚠️  Seeds falharam ou não existem, continuando..."
else
  echo "   Nenhum seeder encontrado"
fi

echo ""
echo "🚀 Iniciando aplicação..."
echo "================================"
exec npm start