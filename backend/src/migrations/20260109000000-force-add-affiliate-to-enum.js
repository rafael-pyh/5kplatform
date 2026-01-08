'use strict';

/**
 * Migration: Força adição de AFFILIATE ao enum PersonRole
 * 
 * Esta migração recria o enum com todos os valores, garantindo que AFFILIATE seja adicionado
 * mesmo que a migration anterior tenha falhado.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Verificar se AFFILIATE já existe
      const checkResult = await queryInterface.sequelize.query(
        `SELECT enumlabel FROM pg_enum 
         WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PersonRole')`,
        { transaction }
      );

      const existingValues = checkResult[0].map(row => row.enumlabel);
      console.log('Valores atuais do enum PersonRole:', existingValues);

      if (existingValues.includes('AFFILIATE')) {
        console.log('✅ AFFILIATE já existe no enum PersonRole');
        await transaction.commit();
        return;
      }

      // AFFILIATE não existe, precisa ser adicionado
      // 1. Renomear a coluna role para role_old
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" RENAME COLUMN "role" TO "role_old"`,
        { transaction }
      );
      console.log('✅ Coluna role renomeada para role_old');

      // 2. Criar novo enum com todos os valores incluindo AFFILIATE
      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole_new" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN', 'AFFILIATE')`,
        { transaction }
      );
      console.log('✅ Novo enum PersonRole_new criado');

      // 3. Criar nova coluna role com o novo enum e preencher com dados da coluna antiga
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ADD COLUMN "role" "PersonRole_new" DEFAULT 'SELLER'`,
        { transaction }
      );
      console.log('✅ Nova coluna role criada');

      // 4. Copiar dados da coluna antiga para a nova
      await queryInterface.sequelize.query(
        `UPDATE "Person" SET "role" = "role_old"::"PersonRole_new"`,
        { transaction }
      );
      console.log('✅ Dados copiados para nova coluna');

      // 5. Remover a coluna antiga
      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" DROP COLUMN "role_old"`,
        { transaction }
      );
      console.log('✅ Coluna role_old removida');

      // 6. Dropar o enum antigo
      await queryInterface.sequelize.query(
        `DROP TYPE "PersonRole"`,
        { transaction }
      );
      console.log('✅ Enum PersonRole antigo removido');

      // 7. Renomear novo enum para PersonRole
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole_new" RENAME TO "PersonRole"`,
        { transaction }
      );
      console.log('✅ Novo enum renomeado para PersonRole');

      await transaction.commit();
      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⚠️ Down: Revertendo enum PersonRole (mantendo AFFILIATE removido)');
    // Não é possível remover simplesmente, então deixamos como está
  }
};
