-- Script para recriar a tabela Person com o schema correto

-- 1. Dropar tabelas dependentes primeiro (se existirem)
DROP TABLE IF EXISTS "QRCodeScan" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;

-- 2. Dropar a tabela Person
DROP TABLE IF EXISTS "Person" CASCADE;

-- 3. Recriar ENUM (se não existir)
DO $$ BEGIN
    CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadStatus" AS ENUM ('BOUGHT', 'CANCELLED', 'NEGOTIATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Criar tabela Person corretamente
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "pixKey" TEXT,
    "photoUrl" TEXT,
    "qrCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "role" "PersonRole" NOT NULL DEFAULT 'SELLER',
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- 5. Criar índices únicos
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
CREATE UNIQUE INDEX "Person_qrCode_key" ON "Person"("qrCode");
CREATE UNIQUE INDEX "Person_verificationToken_key" ON "Person"("verificationToken");

-- 6. Criar tabela Lead
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "energyBill" TEXT,
    "roofPhoto" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEGOTIATION',
    "ownerId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- 7. Criar índices para Lead
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- 8. Criar foreign key
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Criar tabela QRCodeScan
CREATE TABLE "QRCodeScan" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodeScan_pkey" PRIMARY KEY ("id")
);

-- 10. Criar índice e foreign key para QRCodeScan
CREATE INDEX "QRCodeScan_personId_idx" ON "QRCodeScan"("personId");
ALTER TABLE "QRCodeScan" ADD CONSTRAINT "QRCodeScan_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. Criar função para gerar CUID (compatible with Prisma)
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    counter_part TEXT;
    random_part TEXT;
BEGIN
    timestamp_part := LPAD(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT), 8, '0');
    counter_part := LPAD(TO_HEX((RANDOM() * 1048576)::INTEGER), 5, '0');
    random_part := LPAD(TO_HEX((RANDOM() * 1099511627776)::BIGINT), 10, '0');
    RETURN 'c' || timestamp_part || counter_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar o Super Admin
INSERT INTO "Person" (
    "id",
    "name",
    "email",
    "password",
    "role",
    "qrCode",
    "active",
    "emailVerified",
    "updatedAt"
) VALUES (
    generate_cuid(),
    'Super Admin',
    'admin@5kenergia.com',
    '$2a$10$rQZ8YX0mRZ0qKf6vL.ZJF.YHJZGqZJxZ8L8nZ0qKf6vL.ZJF.YHJZ', -- Hash de 'admin123'
    'SUPER_ADMIN',
    'ADMIN-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    true,
    true,
    NOW()
);

-- 13. Verificar se foi criado
SELECT id, name, email, role, active, "emailVerified" FROM "Person" WHERE email = 'admin@5kenergia.com';
