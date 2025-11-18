import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuário admin padrão
  const adminEmail = "admin@5kplatform.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrador",
        role: "SUPER_ADMIN",
      },
    });

    console.log("✅ Usuário admin criado:", admin.email);
  } else {
    console.log("ℹ️  Usuário admin já existe:", adminEmail);
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