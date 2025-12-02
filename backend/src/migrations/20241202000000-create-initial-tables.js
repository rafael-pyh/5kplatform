'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar ENUM types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "LeadStatus" AS ENUM ('BOUGHT', 'CANCELLED', 'NEGOTIATION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar tabela Person
    await queryInterface.createTable('Person', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pixKey: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      photoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      qrCode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      qrCodeUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      scanCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('SELLER', 'ADMIN', 'SUPER_ADMIN'),
        defaultValue: 'SELLER',
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      verificationToken: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      tokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela Lead
    await queryInterface.createTable('Lead', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      energyBill: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      roofPhoto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('BOUGHT', 'CANCELLED', 'NEGOTIATION'),
        defaultValue: 'NEGOTIATION',
        allowNull: false,
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela QRCodeScan
    await queryInterface.createTable('QRCodeScan', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      personId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      scannedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar índices
    await queryInterface.addIndex('Lead', ['ownerId']);
    await queryInterface.addIndex('Lead', ['status']);
    await queryInterface.addIndex('QRCodeScan', ['personId']);
  },

  async down(queryInterface, Sequelize) {
    // Remover tabelas
    await queryInterface.dropTable('QRCodeScan');
    await queryInterface.dropTable('Lead');
    await queryInterface.dropTable('Person');

    // Remover ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "PersonRole";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "LeadStatus";');
  }
};
