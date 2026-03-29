'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Person', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Token para redefinição de senha',
    });

    await queryInterface.addColumn('Person', 'resetPasswordExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data de expiração do token de redefinição de senha (24 horas)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Person', 'resetPasswordToken');
    await queryInterface.removeColumn('Person', 'resetPasswordExpiry');
  },
};
