const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
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
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Senha: admin123");
    } else {
      console.log("ℹ️  Usuário admin já existe:", adminEmail);
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Senha: admin123");
    }

    console.log("\n✅ Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
