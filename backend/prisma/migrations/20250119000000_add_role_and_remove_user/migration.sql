-- CreateEnum (se não existir)
DO $$ BEGIN
  CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable (adicionar coluna role se não existir)
DO $$ BEGIN
  ALTER TABLE "Person" ADD COLUMN "role" "PersonRole" NOT NULL DEFAULT 'SELLER';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- DropTable (se existir)
DROP TABLE IF EXISTS "User";

-- DropEnum (se existir)
DROP TYPE IF EXISTS "UserRole";
