import 'reflect-metadata';
import sequelize from "./src/database/sequelize";
import { Person, PersonRole } from "./src/models/Person";
import bcrypt from "bcryptjs";

async function createAdmin() {
  console.log("🔧 Criando Super Admin no banco de produção...");

  const adminEmail = "admin@5kenergia.com";
  const adminPassword = "admin123";

  try {
    // Conectar ao banco
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco de dados");

    // Verifica se já existe
    const existing = await Person.findOne({
      where: { email: adminEmail },
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      console.log("ℹ️  Admin encontrado. Atualizando...");
      
      await existing.update({
        password: hashedPassword,
        role: PersonRole.SUPER_ADMIN,
        emailVerified: true,
        active: true,
      });

      console.log("✅ Super Admin atualizado!");
    } else {
      console.log("❌ Admin não encontrado no banco!");
      console.log("💡 Criando novo admin...");

      const admin = await Person.create({
        email: adminEmail,
        password: hashedPassword,
        name: "Super Admin",
        role: PersonRole.SUPER_ADMIN,
        qrCode: `ADMIN-${Date.now()}`,
        emailVerified: true,
        active: true,
      } as any);

      console.log("✅ Super Admin criado!");
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
