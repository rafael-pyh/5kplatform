import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("🔧 Criando Super Admin no banco de produção...");

  const adminEmail = "admin@5kenergia.com";
  const adminPassword = "admin123";

  try {
    // Verifica se já existe
    const existing = await prisma.person.findUnique({
      where: { email: adminEmail },
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      console.log("ℹ️  Admin encontrado. Atualizando...");
      
      const updated = await prisma.person.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: "SUPER_ADMIN",
          emailVerified: true,
          active: true,
        },
      });

      console.log("✅ Super Admin atualizado!");
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Senha:", adminPassword);
      console.log("👤 ID:", updated.id);
      console.log("🏷️  Role:", updated.role);
      console.log("✔️  Active:", updated.active);
      console.log("✔️  EmailVerified:", updated.emailVerified);
    } else {
      console.log("❌ Admin não encontrado no banco!");
      console.log("💡 Criando novo admin...");

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

      console.log("✅ Super Admin criado!");
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Senha:", adminPassword);
      console.log("👤 ID:", admin.id);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
