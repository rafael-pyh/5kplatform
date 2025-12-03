'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Lead', 'energyBill', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('Lead', 'roofPhoto', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Lead', 'energyBill', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Lead', 'roofPhoto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
