'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Criar ENUM type primeiro
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar tabela
    await queryInterface.createTable('WithdrawalRequest', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
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
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.TEXT, // Usar TEXT e converter para ENUM via raw SQL
        defaultValue: 'PENDING',
        allowNull: false,
      },
      bankAccountInfo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approvedByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectedByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paidAt: {
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

    // Add indexes for performance
    await queryInterface.addIndex('WithdrawalRequest', ['personId']);
    await queryInterface.addIndex('WithdrawalRequest', ['status']);
    await queryInterface.addIndex('WithdrawalRequest', ['approvedByUserId']);
    await queryInterface.addIndex('WithdrawalRequest', ['rejectedByUserId']);
    await queryInterface.addIndex('WithdrawalRequest', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('WithdrawalRequest');
    
    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "WithdrawalStatus";
    `);
  }
};
