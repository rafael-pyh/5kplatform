-- Fallback SQL para criar as tabelas de crédito se as migrations falharem
-- Este arquivo é um backup para garantir que as tabelas sejam criadas
-- Executar com: psql $DATABASE_URL -f create-credit-tables.sql

\set ON_ERROR_STOP on

BEGIN;

-- Criar ENUM para CreditTransactionType se não existir
DO $enum_block$ BEGIN
    CREATE TYPE "CreditTransactionType" AS ENUM ('COMMISSION', 'KIT_PURCHASE', 'WITHDRAW_REQUEST', 'ADJUSTMENT');
    RAISE NOTICE 'ENUM CreditTransactionType criado';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ENUM CreditTransactionType já existe, pulando...';
END $enum_block$;

-- Criar tabela CreditWallet se não existir
CREATE TABLE IF NOT EXISTS "CreditWallet" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "personId" UUID NOT NULL UNIQUE,
    "balance" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "lastTransactionAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_creditwallet_person FOREIGN KEY ("personId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS "IDX_CreditWallet_personId" ON "CreditWallet"("personId");

-- Criar tabela CreditTransaction se não existir
CREATE TABLE IF NOT EXISTS "CreditTransaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "personId" UUID NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" DECIMAL(15, 2) NOT NULL,
    "description" TEXT,
    "orderId" UUID,
    "withdrawalRequestId" UUID,
    "adjustedByUserId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_credittransaction_person FOREIGN KEY ("personId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_credittransaction_order FOREIGN KEY ("orderId") 
        REFERENCES "Order"(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_credittransaction_withdrawal FOREIGN KEY ("withdrawalRequestId") 
        REFERENCES "WithdrawalRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_credittransaction_adjusted_by FOREIGN KEY ("adjustedByUserId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_personId" ON "CreditTransaction"("personId");
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_orderId" ON "CreditTransaction"("orderId");
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_withdrawalRequestId" ON "CreditTransaction"("withdrawalRequestId");
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_adjustedByUserId" ON "CreditTransaction"("adjustedByUserId");
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_createdAt" ON "CreditTransaction"("createdAt");

-- Verificar tabelas foram criadas
DO $verify_block$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CreditWallet') THEN
        RAISE NOTICE '✅ Tabela CreditWallet verificada';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela CreditWallet não foi criada!';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CreditTransaction') THEN
        RAISE NOTICE '✅ Tabela CreditTransaction verificada';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela CreditTransaction não foi criada!';
    END IF;
END $verify_block$;

COMMIT;

\echo '✅ Script de fallback executado com sucesso!'
