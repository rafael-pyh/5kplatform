-- Migration: 20251121190000_init
-- Baseline migration generated to match prisma/schema.prisma models
-- Review before applying to production. Backup production DB first.

-- Enums
CREATE TYPE IF NOT EXISTS person_role AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE IF NOT EXISTS lead_status AS ENUM ('BOUGHT', 'CANCELLED', 'NEGOTIATION');

-- Table: person
CREATE TABLE IF NOT EXISTS person (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  pix_key TEXT,
  photo_url TEXT,
  qr_code TEXT NOT NULL UNIQUE,
  qr_code_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  scan_count INTEGER NOT NULL DEFAULT 0,
  role person_role NOT NULL DEFAULT 'SELLER',
  password TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT UNIQUE,
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: lead
CREATE TABLE IF NOT EXISTS lead (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  energy_bill TEXT,
  roof_photo TEXT,
  status lead_status NOT NULL DEFAULT 'NEGOTIATION',
  owner_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_lead_owner FOREIGN KEY (owner_id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lead_owner_id ON lead(owner_id);
CREATE INDEX IF NOT EXISTS idx_lead_status ON lead(status);

-- Table: qrcode_scan
CREATE TABLE IF NOT EXISTS qrcode_scan (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_qrcode_person FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qrcode_person_id ON qrcode_scan(person_id);

-- Trigger to update updated_at on update
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_person ON person;
CREATE TRIGGER trg_set_updated_at_person
BEFORE UPDATE ON person
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_set_updated_at_lead ON lead;
CREATE TRIGGER trg_set_updated_at_lead
BEFORE UPDATE ON lead
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- End of migration
