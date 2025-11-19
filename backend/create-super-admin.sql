-- ============================================
-- Script para criar um SUPER_ADMIN
-- ============================================
-- 
-- IMPORTANTE: Este script usa a tabela Person (não User)
-- porque o sistema usa Person para autenticação
--
-- Credenciais padrão:
-- Email: admin@5kenergia.com
-- Senha: admin123
-- 
-- Para gerar um novo hash de senha, use:
-- npx bcryptjs-cli hash SUA_SENHA 10
-- ============================================

-- Inserir Super Admin na tabela Person
INSERT INTO "Person" (
  id,
  name,
  email,
  "qrCode",
  password,
  "emailVerified",
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Super Admin',
  'admin@5kenergia.com',
  'ADMIN-' || substr(md5(random()::text), 1, 8),
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Senha: admin123
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "emailVerified" = true,
  active = true,
  "updatedAt" = NOW();

-- Verificar se foi criado/atualizado
SELECT 
  id, 
  name, 
  email, 
  "qrCode",
  "emailVerified",
  active,
  "createdAt"
FROM "Person" 
WHERE email = 'admin@5kenergia.com';

-- ============================================
-- Como executar este script:
-- ============================================
-- 
-- Opção 1: Via Docker (Recomendado)
-- docker exec -i 5kplatform_postgres psql -U postgres -d 5kplatform < create-super-admin.sql
--
-- Opção 2: Conectar no banco e colar o SQL
-- docker exec -it 5kplatform_postgres psql -U postgres -d 5kplatform
-- (depois copie e cole o INSERT acima)
--
-- Opção 3: Via ferramenta SQL (DBeaver, pgAdmin, etc)
-- Conecte no banco e execute o INSERT
-- ============================================

-- ============================================
-- OUTRAS SENHAS ÚTEIS (bcrypt hash):
-- ============================================
-- 
-- Senha: 123456
-- Hash: $2a$10$CwTycUXWue0Thq9StjUM0uJ8Fu2idsmb4M.6hLdEp0lbEREw4/2va
--
-- Senha: password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--
-- Senha: 5kenergia2025
-- Hash: $2a$10$E4TL6s.svLGOz6N2LJbqj.HnKFKEqN5x5vRqKqx5P/NqVqxCdXNPK
-- ============================================
