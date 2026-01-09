-- Criar tabela WhatsappTemplate
CREATE TABLE IF NOT EXISTS "WhatsappTemplate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para isActive
CREATE INDEX IF NOT EXISTS "idx_whatsapp_template_is_active" ON "WhatsappTemplate"("isActive");

-- Criar índice para createdAt
CREATE INDEX IF NOT EXISTS "idx_whatsapp_template_created_at" ON "WhatsappTemplate"("createdAt" DESC);
