'use strict';

/**
 * Migration: Adiciona valor AFFILIATE ao enum PersonRole se ainda não existe
 * 
 * Esta é uma migração corretiva para garantir que AFFILIATE está disponível no enum
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Verificar se AFFILIATE já existe no enum
      const result = await queryInterface.sequelize.query(
        `SELECT e.enumlabel FROM pg_enum e
         JOIN pg_type t ON e.enumtypid = t.oid
         WHERE t.typname = 'PersonRole' AND e.enumlabel = 'AFFILIATE'`,
        { transaction }
      );

      if (result[0].length === 0) {
        // AFFILIATE não existe, adicionar
        await queryInterface.sequelize.query(
          `ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE'`,
          { transaction }
        );
        console.log('✅ Valor AFFILIATE adicionado ao enum PersonRole');
      } else {
        console.log('✅ AFFILIATE já existe no enum PersonRole');
      }

      await transaction.commit();
      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Down não remove valores de enum (PostgreSQL não permite)
    // Esta migration é segura para reverter sem impacto
    console.log('⚠️ Down: Nenhuma ação necessária (enums não podem ter valores removidos em PostgreSQL)');
  }
};
