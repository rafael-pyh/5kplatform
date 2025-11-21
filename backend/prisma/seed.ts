import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar SUPER_ADMIN na tabela Person
  const adminEmail = "admin@5kenergia.com";
  const existingAdmin = await prisma.person.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await prisma.person.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        qrCode: `ADMIN-${Date.now()}`,
        emailVerified: true,
        active: true,
      },
    });

    console.log("✅ Super Admin criado:", admin.email);
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Senha: admin123");
  } else {
    // Atualizar admin existente para garantir que tem senha e role
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.person.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        emailVerified: true,
        active: true,
      },
    });
    
    console.log("ℹ️  Super Admin atualizado:", adminEmail);
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Senha: admin123");
  }

  // Criar alguns vendedores de exemplo (opcional)
  const personEmail = "vendedor@exemplo.com";
  const existingPerson = await prisma.person.findFirst({
    where: { email: personEmail },
  });

  if (!existingPerson) {
    const person = await prisma.person.create({
      data: {
        name: "João Vendedor",
        email: personEmail,
        phone: "(11) 99999-9999",
        pixKey: "joao@exemplo.com",
        qrCode: `QR-${Date.now()}-EXAMPLE`,
      },
    });

    console.log("✅ Vendedor de exemplo criado:", person.name);
  } else {
    console.log("ℹ️  Vendedor de exemplo já existe");
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });