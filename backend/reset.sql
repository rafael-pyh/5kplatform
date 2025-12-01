-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('BOUGHT', 'CANCELLED', 'NEGOTIATION');

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "QRCodeScan" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodeScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Person_qrCode_key" ON "Person"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Person_verificationToken_key" ON "Person"("verificationToken");

-- CreateIndex
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "QRCodeScan_personId_idx" ON "QRCodeScan"("personId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeScan" ADD CONSTRAINT "QRCodeScan_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

