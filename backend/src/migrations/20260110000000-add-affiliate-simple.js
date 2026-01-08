'use strict';

/**
 * Migration: Adiciona AFFILIATE ao enum PersonRole de forma segura
 * 
 * Esta migração simplesmente tenta adicionar AFFILIATE se não existir.
 * Se falhar por já existir, silencia o erro.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Tentar adicionar AFFILIATE ao enum
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole" ADD VALUE IF NOT EXISTS 'AFFILIATE'`
      );
      console.log('✅ AFFILIATE adicionado ao enum PersonRole');
    } catch (error) {
      // Se falhar com erro "IF NOT EXISTS não suportado", tenta sem
      if (error.message.includes('syntax error')) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE'`
          );
          console.log('✅ AFFILIATE adicionado ao enum PersonRole');
        } catch (addError) {
          // Se AFFILIATE já existe, ignora
          if (addError.message.includes('already exists')) {
            console.log('✅ AFFILIATE já existe no enum PersonRole');
          } else {
            throw addError;
          }
        }
      } else if (error.message.includes('already exists')) {
        console.log('✅ AFFILIATE já existe no enum PersonRole');
      } else {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⚠️ Down: Não removendo AFFILIATE (PostgreSQL não permite remover valores de enum)');
  }
};
