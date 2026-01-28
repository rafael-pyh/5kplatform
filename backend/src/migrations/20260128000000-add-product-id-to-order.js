'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna productId à tabela Order
    await queryInterface.addColumn('Order', 'productId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Product',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Tornar kitId opcional
    await queryInterface.changeColumn('Order', 'kitId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Kit',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna productId
    await queryInterface.removeColumn('Order', 'productId');

    // Tornar kitId obrigatório novamente
    await queryInterface.changeColumn('Order', 'kitId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Kit',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};