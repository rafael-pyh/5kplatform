"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add approvalStatus column to Person table
    await queryInterface.addColumn("Person", "approvalStatus", {
      type: Sequelize.ENUM("approved", "pending", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove approvalStatus column from Person table
    await queryInterface.removeColumn("Person", "approvalStatus");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_Person_approvalStatus";`
    );
  },
};