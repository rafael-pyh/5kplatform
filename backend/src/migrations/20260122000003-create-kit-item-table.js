'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela KitItem
    await queryInterface.createTable('KitItem', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Product',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

    // Criar índices
    await queryInterface.addIndex('KitItem', ['kitId']);
    await queryInterface.addIndex('KitItem', ['productId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('KitItem');
  }
};