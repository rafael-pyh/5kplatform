-- Script para corrigir URLs antigas de QR codes e fotos
-- Remove /uploads/ das URLs que foram salvas no formato antigo

-- Verificar URLs atuais antes da correção
SELECT 
  id, 
  name, 
  "qrCodeUrl", 
  "photoUrl"
FROM persons 
WHERE 
  "qrCodeUrl" LIKE '%/uploads/%' 
  OR "photoUrl" LIKE '%/uploads/%'
  OR "qrCodeUrl" LIKE 'http%'
  OR "photoUrl" LIKE 'http%';

-- Corrigir qrCodeUrl removendo /uploads/ e URLs completas do MinIO
UPDATE persons 
SET "qrCodeUrl" = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE("qrCodeUrl", '^https?://[^/]+/api/files/', ''),
    '^https?://[^/]+/uploads/', 
    ''
  ),
  '^/?(uploads/|api/files/)', 
  ''
)
WHERE "qrCodeUrl" IS NOT NULL
  AND (
    "qrCodeUrl" LIKE '%/uploads/%' 
    OR "qrCodeUrl" LIKE '%/api/files/%'
    OR "qrCodeUrl" LIKE 'http%'
  );

-- Corrigir photoUrl removendo /uploads/ e URLs completas do MinIO
UPDATE persons 
SET "photoUrl" = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE("photoUrl", '^https?://[^/]+/api/files/', ''),
    '^https?://[^/]+/uploads/', 
    ''
  ),
  '^/?(uploads/|api/files/)', 
  ''
)
WHERE "photoUrl" IS NOT NULL
  AND (
    "photoUrl" LIKE '%/uploads/%' 
    OR "photoUrl" LIKE '%/api/files/%'
    OR "photoUrl" LIKE 'http%'
  );

-- Verificar resultado após a correção
SELECT 
  id, 
  name, 
  "qrCodeUrl", 
  "photoUrl"
FROM persons 
WHERE "qrCodeUrl" IS NOT NULL OR "photoUrl" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 20;
