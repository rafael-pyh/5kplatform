'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Person', 'rememberMeToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token para funcionalidade "Lembrar de mim"',
    });

    await queryInterface.addColumn('Person', 'rememberMeExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data de expiração do token "Lembrar de mim"',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Person', 'rememberMeToken');
    await queryInterface.removeColumn('Person', 'rememberMeExpiry');
  },
};
