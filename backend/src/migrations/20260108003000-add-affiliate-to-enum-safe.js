'use strict';

/**
 * Migration: Adiciona AFFILIATE ao enum PersonRole
 * Estratégia: Criar novo enum com todos os valores e substituir
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Passo 1: Criar novo enum com AFFILIATE
      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole_new" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN', 'AFFILIATE')`,
        { transaction }
      );

      // Passo 2: Converter coluna role para usar novo enum
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole_new" USING "role"::text::"PersonRole_new"`,
        { transaction }
      );

      // Passo 3: Remover enum antigo
      await queryInterface.sequelize.query(
        `DROP TYPE "PersonRole"`,
        { transaction }
      );

      // Passo 4: Renomear novo enum para o nome original
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole_new" RENAME TO "PersonRole"`,
        { transaction }
      );

      // Passo 5: Garantir que registration_type existe
      const columns = await queryInterface.describeTable('Person', { transaction });
      
      if (!columns.registration_type) {
        await queryInterface.addColumn(
          'Person',
          'registration_type',
          {
            type: Sequelize.ENUM('PUBLIC', 'ADMIN'),
            defaultValue: 'ADMIN',
            allowNull: false
          },
          { transaction }
        );
      }

      // Passo 6: Garantir que created_by existe
      if (!columns.created_by) {
        await queryInterface.addColumn(
          'Person',
          'created_by',
          {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: 'Person',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          { transaction }
        );
      }

      await transaction.commit();
      console.log('✅ Migration concluída: AFFILIATE adicionado ao enum PersonRole');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Criar enum antigo sem AFFILIATE
      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole_old" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN')`,
        { transaction }
      );

      // Converter coluna de volta
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole_old" USING "role"::text::"PersonRole_old"`,
        { transaction }
      );

      // Remover enum novo
      await queryInterface.sequelize.query(
        `DROP TYPE "PersonRole"`,
        { transaction }
      );

      // Renomear de volta
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole_old" RENAME TO "PersonRole"`,
        { transaction }
      );

      // Remover colunas adicionadas
      const columns = await queryInterface.describeTable('Person', { transaction });
      
      if (columns.created_by) {
        await queryInterface.removeColumn('Person', 'created_by', { transaction });
      }

      if (columns.registration_type) {
        await queryInterface.removeColumn('Person', 'registration_type', { transaction });
      }

      await transaction.commit();
      console.log('✅ Downgrade concluído');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro no downgrade:', error.message);
      throw error;
    }
  }
};
