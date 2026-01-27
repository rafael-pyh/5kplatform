'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Criar ENUM type primeiro
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "CreditTransactionType" AS ENUM ('COMMISSION', 'KIT_PURCHASE', 'WITHDRAW_REQUEST', 'ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar tabela
    await queryInterface.createTable('CreditTransaction', {
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
      type: {
        type: Sequelize.TEXT, // Usar TEXT e converter para ENUM via raw SQL
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Order',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      withdrawalRequestId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'WithdrawalRequest',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      adjustedByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Alterar coluna tipo para usar o ENUM criado
    await queryInterface.sequelize.query(`
      ALTER TABLE "CreditTransaction" 
      ALTER COLUMN "type" TYPE "CreditTransactionType" USING "type"::"CreditTransactionType";
    `);

    // Add indexes for performance
    await queryInterface.addIndex('CreditTransaction', ['personId']);
    await queryInterface.addIndex('CreditTransaction', ['orderId']);
    await queryInterface.addIndex('CreditTransaction', ['withdrawalRequestId']);
    await queryInterface.addIndex('CreditTransaction', ['adjustedByUserId']);
    await queryInterface.addIndex('CreditTransaction', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('CreditTransaction');
    
    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "CreditTransactionType";
    `);
  }
};
