'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar ENUM para OrderStatus
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar tabela Order
    await queryInterface.createTable('Order', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      orderCode: {
        type: Sequelize.STRING,
        unique: true,
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
      kitId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Kit',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'),
        defaultValue: 'PENDING_PAYMENT',
        allowNull: false,
      },
      usesCredit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rejectionReason: {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar índices
    await queryInterface.addIndex('Order', ['personId']);
    await queryInterface.addIndex('Order', ['kitId']);
    await queryInterface.addIndex('Order', ['status']);
    await queryInterface.addIndex('Order', ['orderCode'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Order');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "OrderStatus";');
  }
};