'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela Product
    await queryInterface.createTable('Product', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdByUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sku: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
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
    await queryInterface.addIndex('Product', ['createdByUserId']);
    await queryInterface.addIndex('Product', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Product');
  }
};