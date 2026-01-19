module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar coluna CPF (nullable)
      await queryInterface.addColumn(
        'Person',
        'cpf',
        {
          type: Sequelize.STRING(11),
          allowNull: true,
          unique: true,
          comment: 'CPF do usuário (somente números)',
        },
        { transaction }
      );

      // Adicionar coluna data de nascimento (nullable)
      await queryInterface.addColumn(
        'Person',
        'birthDate',
        {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'birthDate',
          comment: 'Data de nascimento do usuário',
        },
        { transaction }
      );

      // Criar índices para melhor performance
      await queryInterface.addIndex(
        'Person',
        ['cpf'],
        {
          name: 'idx_Person_cpf',
          transaction,
        }
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover índices
      await queryInterface.removeIndex(
        'Person',
        'idx_Person_cpf',
        { transaction }
      );

      // Remover colunas
      await queryInterface.removeColumn('Person', 'birthDate', { transaction });
      await queryInterface.removeColumn('Person', 'cpf', { transaction });
    });
  },
};
