'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela ProductImage
    await queryInterface.createTable('ProductImage', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      description: {
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
    await queryInterface.addIndex('ProductImage', ['productId']);
    await queryInterface.addIndex('ProductImage', ['order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductImage');
  }
};