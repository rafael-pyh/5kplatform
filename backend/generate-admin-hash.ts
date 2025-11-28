import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  
  console.log("\n=== HASH GERADO ===");
  console.log("Senha:", password);
  console.log("Hash:", hash);
  console.log("\n=== SQL PARA INSERIR ADMIN ===");
  console.log(`
INSERT INTO "Person" (
    "id",
    "name",
    "email",
    "password",
    "role",
    "qrCode",
    "active",
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'Super Admin',
    'admin@5kenergia.com',
    '${hash}',
    'SUPER_ADMIN',
    'ADMIN-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    true,
    true,
    NOW(),
    NOW()
);
  `);
  
  console.log("\n=== OU ATUALIZE USUÁRIO EXISTENTE ===");
  console.log(`
UPDATE "Person" 
SET 
    "password" = '${hash}',
    "role" = 'SUPER_ADMIN',
    "active" = true,
    "emailVerified" = true,
    "updatedAt" = NOW()
WHERE "email" = 'admin@5kenergia.com';
  `);
}

generateHash();
