'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Verificar se coluna já existe antes de adicionar
      const table = await queryInterface.describeTable('Person', { transaction });
      
      if (!table.commissionType) {
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
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover coluna se existir
      const table = await queryInterface.describeTable('Person', { transaction });
      
      if (table.commissionType) {
        await queryInterface.removeColumn('Person', 'commissionType', { transaction });
      }
    });
  }
};
