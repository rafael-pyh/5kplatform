'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "Order" ALTER COLUMN "kitId" DROP NOT NULL;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "Order" ALTER COLUMN "kitId" SET NOT NULL;');
  }
};
