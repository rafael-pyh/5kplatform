'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar coluna commissionType
      await queryInterface.addColumn(
        'Person',
        'commissionType',
        {
          type: Sequelize.ENUM('FIXED', 'PERCENTAGE'),
          allowNull: true,
          defaultValue: 'PERCENTAGE',
          comment: 'Tipo de comissão: valor fixo ou porcentagem',
        },
        { transaction }
      );

      // Adicionar coluna fixedAmount
      await queryInterface.addColumn(
        'Person',
        'fixedAmount',
        {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          comment: 'Valor fixo da comissão em reais',
        },
        { transaction }
      );

      // Adicionar coluna percentage
      await queryInterface.addColumn(
        'Person',
        'percentage',
        {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
          comment: 'Porcentagem da comissão (ex: 10.00 para 10%)',
        },
        { transaction }
      );
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover colunas
      await queryInterface.removeColumn('Person', 'percentage', { transaction });
      await queryInterface.removeColumn('Person', 'fixedAmount', { transaction });
      await queryInterface.removeColumn('Person', 'commissionType', { transaction });
    });
  }
};
