'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('CreditTransaction', 'leadId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Lead',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('CreditTransaction', 'leadId');
  }
};
