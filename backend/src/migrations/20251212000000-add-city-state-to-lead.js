module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add city column to Lead table
      await queryInterface.addColumn(
        'Lead',
        'city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Add state column to Lead table
      await queryInterface.addColumn(
        'Lead',
        'state',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Columns city and state added to Lead table successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding columns city and state to Lead table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove city column from Lead table
      await queryInterface.removeColumn('Lead', 'city', { transaction });

      // Remove state column from Lead table
      await queryInterface.removeColumn('Lead', 'state', { transaction });

      await transaction.commit();
      console.log('✅ Columns city and state removed from Lead table successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing columns city and state from Lead table:', error);
      throw error;
    }
  },
};