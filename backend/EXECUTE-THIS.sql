CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "LeadStatus" AS ENUM ('BOUGHT', 'CANCELLED', 'NEGOTIATION');

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

CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
CREATE UNIQUE INDEX "Person_qrCode_key" ON "Person"("qrCode");
CREATE UNIQUE INDEX "Person_verificationToken_key" ON "Person"("verificationToken");

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

CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "QRCodeScan" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QRCodeScan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QRCodeScan_personId_idx" ON "QRCodeScan"("personId");

ALTER TABLE "QRCodeScan" ADD CONSTRAINT "QRCodeScan_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    counter_part TEXT;
    random_part TEXT;
BEGIN
    timestamp_part := LPAD(TO_HEX((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT), 10, '0');
    counter_part := LPAD(TO_HEX((RANDOM() * 1048576)::INTEGER), 5, '0');
    random_part := LPAD(TO_HEX((RANDOM() * 1099511627776)::BIGINT), 10, '0');
    RETURN 'c' || SUBSTRING(timestamp_part || counter_part || random_part, 1, 25);
END;
$$ LANGUAGE plpgsql;

INSERT INTO "Person" ("id", "name", "email", "password", "role", "qrCode", "active", "emailVerified", "createdAt", "updatedAt") VALUES (generate_cuid(), 'Super Admin', 'admin@5kenergia.com', '$2a$10$DwxyEMPgZ99AApyVQ5kNRu.QC1ZkU/dCc9yytxDbCcHs/XEeX5zrK', 'SUPER_ADMIN', 'ADMIN-' || EXTRACT(EPOCH FROM NOW())::TEXT, true, true, NOW(), NOW());

CREATE TABLE IF NOT EXISTS "_prisma_migrations" ("id" TEXT NOT NULL, "checksum" TEXT NOT NULL, "finished_at" TIMESTAMP(3), "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" TIMESTAMP(3), "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "applied_steps_count" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id"));
