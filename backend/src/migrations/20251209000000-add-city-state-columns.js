module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Adicionar coluna city
      await queryInterface.addColumn(
        'Person',
        'city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Adicionar coluna state
      await queryInterface.addColumn(
        'Person',
        'state',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Colunas city e state adicionadas com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao adicionar colunas city e state:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remover coluna city
      await queryInterface.removeColumn('Person', 'city', { transaction });

      // Remover coluna state
      await queryInterface.removeColumn('Person', 'state', { transaction });

      await transaction.commit();
      console.log('✅ Colunas city e state removidas com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao remover colunas city e state:', error);
      throw error;
    }
  },
};