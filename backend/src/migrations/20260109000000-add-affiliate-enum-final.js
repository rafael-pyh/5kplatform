'use strict';

/**
 * Migration: Adiciona AFFILIATE ao enum PersonRole
 * 
 * Esta migration adiciona o valor AFFILIATE ao enum Person.role
 * Funciona tanto com enums criados via Sequelize quanto via SQL puro
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Iniciando migration para adicionar AFFILIATE ao enum PersonRole...');

      // Passo 1: Remover constraint de default se existir
      console.log('📝 Passo 1: Removendo constraint de default se existir...');
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE "Person" ALTER COLUMN "role" DROP DEFAULT;`
        );
        console.log('✅ Default removido');
      } catch (e) {
        console.log('ℹ️ Nenhum default para remover');
      }

      // Passo 2: Verificar se o tipo enum existe e adicionar AFFILIATE
      console.log('📝 Passo 2: Verificando e atualizando enum PersonRole...');
      
      // Remover qualquer tipo temporário anterior
      try {
        await queryInterface.sequelize.query(
          `DROP TYPE IF EXISTS "PersonRole_new" CASCADE;`
        );
      } catch (e) {
        // Ignorar erro se tipo não existir
      }

      // Criar novo tipo com AFFILIATE
      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole_new" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN', 'AFFILIATE');`
      );
      console.log('✅ Novo tipo enum criado com AFFILIATE');

      // Passo 3: Converter a coluna
      console.log('📝 Passo 3: Convertendo coluna role para novo tipo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole_new" USING "role"::text::"PersonRole_new";`
      );
      console.log('✅ Coluna convertida');

      // Passo 4: Descartar o tipo antigo
      console.log('📝 Passo 4: Descartando tipo enum antigo...');
      try {
        await queryInterface.sequelize.query(
          `DROP TYPE "PersonRole" CASCADE;`
        );
        console.log('✅ Tipo enum antigo descartado');
      } catch (e) {
        console.log('⚠️ Erro ao descartar tipo antigo (pode estar em uso):', e.message);
      }

      // Passo 5: Renomear o novo tipo
      console.log('📝 Passo 5: Renomeando tipo enum...');
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole_new" RENAME TO "PersonRole";`
      );
      console.log('✅ AFFILIATE adicionado ao enum PersonRole com sucesso!');

      // Passo 6: Restaurar default
      console.log('📝 Passo 6: Restaurando default da coluna...');
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" SET DEFAULT 'SELLER';`
      );
      console.log('✅ Default restaurado');

      // Passo 7: Verificar e adicionar colunas faltantes
      const columns = await queryInterface.describeTable('Person');

      if (!columns.registration_type) {
        console.log('📝 Passo 7a: Adicionando coluna registration_type...');
        await queryInterface.addColumn('Person', 'registration_type', {
          type: Sequelize.STRING(10),
          defaultValue: 'ADMIN',
          allowNull: false
        });
        console.log('✅ Coluna registration_type adicionada');
      } else {
        console.log('⏭️ Coluna registration_type já existe');
      }

      if (!columns.created_by) {
        console.log('📝 Passo 7b: Adicionando coluna created_by...');
        await queryInterface.addColumn('Person', 'created_by', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Person',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
        console.log('✅ Coluna created_by adicionada');
      } else {
        console.log('⏭️ Coluna created_by já existe');
      }

      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro na migration:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Revertendo migration...');

      // Passo 1: Remover colunas adicionadas
      const columns = await queryInterface.describeTable('Person');
      
      if (columns.created_by) {
        console.log('📝 Removendo coluna created_by...');
        await queryInterface.removeColumn('Person', 'created_by');
        console.log('✅ Coluna created_by removida');
      }

      if (columns.registration_type) {
        console.log('📝 Removendo coluna registration_type...');
        await queryInterface.removeColumn('Person', 'registration_type');
        console.log('✅ Coluna registration_type removida');
      }

      // Passo 2: Reverter enum (remover AFFILIATE)
      console.log('📝 Revertendo enum PersonRole...');
      
      // Criar novo tipo sem AFFILIATE
      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole_old" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN');`
      );
      console.log('✅ Tipo enum antigo criado');
      
      // Converter a coluna
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole_old" USING "role"::text::"PersonRole_old";`
      );
      console.log('✅ Coluna convertida');
      
      // Descartar o tipo novo
      await queryInterface.sequelize.query(
        `DROP TYPE "PersonRole" CASCADE;`
      );
      console.log('✅ Tipo enum novo descartado');
      
      // Renomear tipo antigo
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole_old" RENAME TO "PersonRole";`
      );
      console.log('✅ Tipo enum renomeado');

      console.log('✅ Downgrade concluído!');
    } catch (error) {
      console.error('❌ Erro no downgrade:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
};
