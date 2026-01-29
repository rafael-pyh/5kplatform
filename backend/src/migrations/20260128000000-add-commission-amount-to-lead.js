'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Lead', 'commissionAmount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Valor da comissão associada ao lead',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Lead', 'commissionAmount');
  },
};
