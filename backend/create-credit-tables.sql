-- Fallback SQL para criar as tabelas de crédito se as migrations falharem
-- Este arquivo é um backup para garantir que as tabelas sejam criadas
-- Executar com: psql $DATABASE_URL -f create-credit-tables.sql

\set ON_ERROR_STOP on

BEGIN;

-- Criar ENUM para WithdrawalStatus se não existir
DO $enum_withdrawal_block$ BEGIN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');
    RAISE NOTICE 'ENUM WithdrawalStatus criado';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ENUM WithdrawalStatus já existe, pulando...';
END $enum_withdrawal_block$;

-- Criar tabela WithdrawalRequest se não existir
CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "personId" UUID NOT NULL,
    "amount" DECIMAL(15, 2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountInfo" TEXT,
    "notes" TEXT,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP,
    "rejectedByUserId" UUID,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_withdrawalrequest_person FOREIGN KEY ("personId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_withdrawalrequest_approved_by FOREIGN KEY ("approvedByUserId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_withdrawalrequest_rejected_by FOREIGN KEY ("rejectedByUserId") 
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Criar índices para WithdrawalRequest
CREATE INDEX IF NOT EXISTS "IDX_WithdrawalRequest_personId" ON "WithdrawalRequest"("personId");
CREATE INDEX IF NOT EXISTS "IDX_WithdrawalRequest_status" ON "WithdrawalRequest"("status");
CREATE INDEX IF NOT EXISTS "IDX_WithdrawalRequest_approvedByUserId" ON "WithdrawalRequest"("approvedByUserId");
CREATE INDEX IF NOT EXISTS "IDX_WithdrawalRequest_rejectedByUserId" ON "WithdrawalRequest"("rejectedByUserId");
CREATE INDEX IF NOT EXISTS "IDX_WithdrawalRequest_createdAt" ON "WithdrawalRequest"("createdAt");

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
-- Nota: Esta tabela usa foreign keys opcionais que podem não existir em todos os ambientes
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
        REFERENCES "Person"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_personId" ON "CreditTransaction"("personId");
CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_createdAt" ON "CreditTransaction"("createdAt");

-- Adicionar foreign keys opcionais se as tabelas existirem
-- Isso evita falhas se as tabelas não foram criadas ainda

-- FK para Order se a tabela existir
DO $fk_order$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Order') THEN
        BEGIN
            ALTER TABLE "CreditTransaction" 
            ADD CONSTRAINT fk_credittransaction_order 
            FOREIGN KEY ("orderId") REFERENCES "Order"(id) 
            ON UPDATE CASCADE ON DELETE SET NULL;
            RAISE NOTICE 'FK para Order criada';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'FK para Order já existe, pulando...';
        END;
    ELSE
        RAISE NOTICE 'Tabela Order não existe, FK não será criada';
    END IF;
END $fk_order$;

-- FK para WithdrawalRequest se a tabela existir
DO $fk_withdrawal$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'WithdrawalRequest') THEN
        BEGIN
            ALTER TABLE "CreditTransaction" 
            ADD CONSTRAINT fk_credittransaction_withdrawal 
            FOREIGN KEY ("withdrawalRequestId") REFERENCES "WithdrawalRequest"(id) 
            ON UPDATE CASCADE ON DELETE SET NULL;
            RAISE NOTICE 'FK para WithdrawalRequest criada';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'FK para WithdrawalRequest já existe, pulando...';
        END;
    ELSE
        RAISE NOTICE 'Tabela WithdrawalRequest não existe, FK não será criada';
    END IF;
END $fk_withdrawal$;

-- FK para adjustedByUserId se ainda não existir
DO $fk_adjusted_by$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CreditTransaction') THEN
        BEGIN
            ALTER TABLE "CreditTransaction" 
            ADD CONSTRAINT fk_credittransaction_adjusted_by 
            FOREIGN KEY ("adjustedByUserId") REFERENCES "Person"(id) 
            ON UPDATE CASCADE ON DELETE SET NULL;
            RAISE NOTICE 'FK para adjustedByUserId criada';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'FK para adjustedByUserId já existe, pulando...';
        END;
    END IF;
END $fk_adjusted_by$;

-- Criar índices adicionais se as colunas forem necessárias
DO $extra_indexes$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CreditTransaction' AND column_name = 'orderId') THEN
        CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_orderId" ON "CreditTransaction"("orderId");
        RAISE NOTICE 'Índice para orderId criado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CreditTransaction' AND column_name = 'withdrawalRequestId') THEN
        CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_withdrawalRequestId" ON "CreditTransaction"("withdrawalRequestId");
        RAISE NOTICE 'Índice para withdrawalRequestId criado';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CreditTransaction' AND column_name = 'adjustedByUserId') THEN
        CREATE INDEX IF NOT EXISTS "IDX_CreditTransaction_adjustedByUserId" ON "CreditTransaction"("adjustedByUserId");
        RAISE NOTICE 'Índice para adjustedByUserId criado';
    END IF;
END $extra_indexes$;

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
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'WithdrawalRequest') THEN
        RAISE NOTICE '✅ Tabela WithdrawalRequest verificada';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela WithdrawalRequest não foi criada!';
    END IF;
END $verify_block$;

COMMIT;

\echo '✅ Script de fallback executado com sucesso!'
