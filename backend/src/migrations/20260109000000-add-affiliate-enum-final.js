'use strict';

/**
 * Migration: Adiciona AFFILIATE ao enum PersonRole (Abordagem SQL Pura Simples)
 * 
 * Esta migration executa SQL puro para adicionar AFFILIATE de forma simples e robusta
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Iniciando migration para adicionar AFFILIATE ao enum PersonRole...');

      // Usar rawAttribute para executar SQL puro
      await queryInterface.sequelize.query(`
        BEGIN;
        
        -- Criar novo tipo enum com todos os valores
        CREATE TYPE "PersonRole_new" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN', 'AFFILIATE');
        
        -- Converter a coluna existente para o novo tipo
        ALTER TABLE "Person" 
        ALTER COLUMN "role" TYPE "PersonRole_new" USING "role"::text::"PersonRole_new";
        
        -- Descartar o tipo antigo
        DROP TYPE "PersonRole";
        
        -- Renomear o novo tipo para o nome original
        ALTER TYPE "PersonRole_new" RENAME TO "PersonRole";
        
        COMMIT;
      `);

      console.log('✅ AFFILIATE adicionado ao enum PersonRole com sucesso!');

      // Verificar e adicionar colunas faltantes
      const columns = await queryInterface.describeTable('Person');

      if (!columns.registration_type) {
        console.log('📝 Adicionando coluna registration_type...');
        await queryInterface.addColumn('Person', 'registration_type', {
          type: Sequelize.STRING(10),
          defaultValue: 'ADMIN',
          allowNull: false
        });
        console.log('✅ Coluna registration_type adicionada');
      }

      if (!columns.created_by) {
        console.log('📝 Adicionando coluna created_by...');
        await queryInterface.addColumn('Person', 'created_by', {
          type: Sequelize.UUID,
          allowNull: true
        });
        console.log('✅ Coluna created_by adicionada');
      }

      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro na migration:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Revertendo migration...');

      // Reverter enum
      await queryInterface.sequelize.query(`
        BEGIN;
        
        CREATE TYPE "PersonRole_old" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');
        
        ALTER TABLE "Person" 
        ALTER COLUMN "role" TYPE "PersonRole_old" USING "role"::text::"PersonRole_old";
        
        DROP TYPE "PersonRole";
        
        ALTER TYPE "PersonRole_old" RENAME TO "PersonRole";
        
        COMMIT;
      `);

      // Remover colunas
      const columns = await queryInterface.describeTable('Person');
      
      if (columns.created_by) {
        await queryInterface.removeColumn('Person', 'created_by');
      }

      if (columns.registration_type) {
        await queryInterface.removeColumn('Person', 'registration_type');
      }

      console.log('✅ Downgrade concluído!');
    } catch (error) {
      console.error('❌ Erro no downgrade:', error.message);
      throw error;
    }
  }
};
