-- Script para adicionar AFFILIATE ao enum PersonRole em produção
-- Execute este script se as migrations não forem executadas automaticamente

BEGIN;

-- Criar novo tipo enum com todos os valores
CREATE TYPE "PersonRole_new" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN', 'AFFILIATE');

-- Converter a coluna existente para o novo tipo
ALTER TABLE "Person" 
ALTER COLUMN "role" TYPE "PersonRole_new" USING "role"::text::"PersonRole_new";

-- Descartar o tipo antigo
DROP TYPE "PersonRole";

-- Renomear o novo tipo para o nome original
ALTER TYPE "PersonRole_new" RENAME TO "PersonRole";

-- Adicionar colunas faltantes se necessário
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "registration_type" VARCHAR(10) DEFAULT 'ADMIN' NOT NULL;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "created_by" UUID REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS "idx_Person_role" ON "Person"("role");
CREATE INDEX IF NOT EXISTS "idx_Person_registration_type" ON "Person"("registration_type");

COMMIT;

-- Confirmar mudanças
SELECT 'Migration completed successfully' AS status;

