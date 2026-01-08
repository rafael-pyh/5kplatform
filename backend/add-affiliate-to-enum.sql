-- Script para adicionar AFFILIATE ao enum PersonRole em produção
-- Execute este script diretamente no banco se a migration falhar

-- Verificar se AFFILIATE já existe
DO $$
BEGIN
  -- Tentar adicionar AFFILIATE
  ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE';
  RAISE NOTICE 'AFFILIATE adicionado com sucesso';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%already exists%' THEN
    RAISE NOTICE 'AFFILIATE já existe no enum';
  ELSE
    RAISE EXCEPTION 'Erro ao adicionar AFFILIATE: %', SQLERRM;
  END IF;
END $$;
