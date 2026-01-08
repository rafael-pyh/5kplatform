-- Script para adicionar AFFILIATE ao enum PersonRole em produção
-- Execute este script se as migrations não forem executadas automaticamente

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PersonRole') 
    AND enumlabel = 'AFFILIATE'
  ) THEN 
    ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE';
    RAISE NOTICE 'AFFILIATE adicionado ao enum PersonRole';
  ELSE
    RAISE NOTICE 'AFFILIATE já existe no enum PersonRole';
  END IF;
END $$;

-- Verificar e adicionar registration_type se não existir
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "registration_type" VARCHAR(10) DEFAULT 'ADMIN' NOT NULL;

-- Verificar e adicionar created_by se não existir
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "created_by" UUID REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS "idx_Person_role" ON "Person"("role");
CREATE INDEX IF NOT EXISTS "idx_Person_registration_type" ON "Person"("registration_type");

-- Confirmar mudanças
SELECT 'Migration completed successfully' AS status;
