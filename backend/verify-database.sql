-- ============================================
-- QUERIES DE VERIFICAÇÃO DO BANCO
-- ============================================

-- 1. Listar todas as tabelas criadas
SELECT 
    schemaname, 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar ENUMs criados
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('PersonRole', 'LeadStatus')
ORDER BY t.typname, e.enumsortorder;

-- 3. Verificar Super Admin criado
SELECT 
    id, 
    name, 
    email, 
    role, 
    active, 
    "emailVerified",
    "createdAt"
FROM "Person" 
WHERE email = 'admin@5kenergia.com';

-- 4. Contar registros em cada tabela
SELECT 'Person' AS tabela, COUNT(*) AS total FROM "Person"
UNION ALL
SELECT 'Lead', COUNT(*) FROM "Lead"
UNION ALL
SELECT 'QRCodeScan', COUNT(*) FROM "QRCodeScan"
UNION ALL
SELECT '_prisma_migrations', COUNT(*) FROM "_prisma_migrations";

-- 5. Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Verificar foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 7. Verificar estrutura da tabela Person
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Person'
ORDER BY ordinal_position;
