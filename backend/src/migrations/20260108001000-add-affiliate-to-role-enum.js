'use strict';

/**
 * Migration: Garante que AFFILIATE existe no enum PersonRole
 * 
 * Esta migration é robusta e funciona mesmo se AFFILIATE já foi adicionado
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Verificar se o enum já possui AFFILIATE
      const result = await queryInterface.sequelize.query(
        `SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PersonRole')`,
        { transaction }
      );

      const hasAffiliate = result[0].some(row => row.enumlabel === 'AFFILIATE');

      if (hasAffiliate) {
        console.log('✅ AFFILIATE já existe no enum PersonRole, pulando...');
      } else {
        // Adicionar AFFILIATE ao enum
        await queryInterface.sequelize.query(
          `ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE'`,
          { transaction }
        );
        console.log('✅ AFFILIATE adicionado ao enum PersonRole');
      }

      // Garantir que registration_type existe
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
        console.log('✅ Coluna registration_type adicionada');
      } else {
        console.log('✅ Coluna registration_type já existe');
      }

      // Garantir que created_by existe
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
        console.log('✅ Coluna created_by adicionada');
      } else {
        console.log('✅ Coluna created_by já existe');
      }

      await transaction.commit();
      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Downgrade: Remover as colunas (não podemos remover valores do enum em PostgreSQL)
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
