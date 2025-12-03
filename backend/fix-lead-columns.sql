-- Migration: Change energyBill and roofPhoto columns from VARCHAR(255) to TEXT
-- Date: 2025-12-03
-- Reason: Store base64 encoded images which exceed 255 characters

ALTER TABLE "Lead" 
  ALTER COLUMN "energyBill" TYPE TEXT,
  ALTER COLUMN "roofPhoto" TYPE TEXT;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'Lead' 
  AND column_name IN ('energyBill', 'roofPhoto');
