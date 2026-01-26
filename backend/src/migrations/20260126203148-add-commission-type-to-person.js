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
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover coluna
      await queryInterface.removeColumn('Person', 'commissionType', { transaction });
    });
  }
};
