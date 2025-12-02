'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash da senha admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Verificar se já existe um admin
    const existingAdmin = await queryInterface.rawSelect('Person', {
      where: { email: 'admin@5kenergia.com' },
    }, ['id']);

    if (existingAdmin) {
      console.log('✅ Admin já existe, pulando seed...');
      return;
    }

    // Criar admin padrão
    await queryInterface.bulkInsert('Person', [
      {
        id: require('crypto').randomUUID(),
        name: 'Super Admin',
        email: 'admin@5kenergia.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        qrCode: `ADMIN-${Date.now()}`,
        emailVerified: true,
        active: true,
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: admin@5kenergia.com');
    console.log('🔑 Senha: admin123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Person', {
      email: 'admin@5kenergia.com',
    }, {});
  }
};
