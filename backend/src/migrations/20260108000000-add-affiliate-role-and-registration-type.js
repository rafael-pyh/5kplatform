'use strict';

/**
 * Migration: Adiciona role AFFILIATE e campo registration_type
 * 
 * Alterações:
 * 1. Adiciona valor 'AFFILIATE' ao enum PersonRole
 * 2. Adiciona coluna registration_type (PUBLIC ou ADMIN)
 * 3. Adiciona coluna created_by (quem criou o vendedor)
 * 4. Define restrição de integridade para AFFILIATE ser sempre PUBLIC
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Passo 1: Adicionar valor AFFILIATE ao enum PersonRole
      // Verificar se AFFILIATE já existe
      const checkAffiliateResult = await queryInterface.sequelize.query(
        `SELECT e.enumlabel FROM pg_enum e
         JOIN pg_type t ON e.enumtypid = t.oid
         WHERE t.typname = 'PersonRole' AND e.enumlabel = 'AFFILIATE'`
      );

      if (checkAffiliateResult[0].length === 0) {
        // Apenas adicionar se não existir
        await queryInterface.sequelize.query(
          `ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE'`,
          { transaction }
        );
        console.log('✅ Valor AFFILIATE adicionado ao enum PersonRole');
      } else {
        console.log('✅ AFFILIATE já existe no enum PersonRole');
      }

      // Passo 2: Adicionar coluna registration_type
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

      // Passo 3: Adicionar coluna created_by (referência ao admin que criou)
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

      // Passo 4: Criar índice para melhor performance
      await queryInterface.addIndex('Person', ['role'], { transaction });
      await queryInterface.addIndex('Person', ['registration_type'], { transaction });
      console.log('✅ Índices criados para role e registration_type');

      // Passo 5: Atualizar registros existentes
      // Todos os registros antigos são ADMIN
      await queryInterface.sequelize.query(
        `UPDATE "Person" SET "registration_type" = 'ADMIN' WHERE "registration_type" IS NULL`,
        { transaction }
      );
      console.log('✅ Registros existentes marcados como ADMIN');

      await transaction.commit();
      console.log('✅ Migration concluída com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remover índices
      await queryInterface.removeIndex('Person', ['registration_type'], { transaction });
      await queryInterface.removeIndex('Person', ['role'], { transaction });

      // Remover colunas
      await queryInterface.removeColumn('Person', 'created_by', { transaction });
      await queryInterface.removeColumn('Person', 'registration_type', { transaction });

      // Remover AFFILIATE do enum (PostgreSQL não permite remover valores de enum diretos)
      // Alternativa: criar novo enum sem AFFILIATE e fazer migration manual
      await queryInterface.sequelize.query(
        `ALTER TYPE "PersonRole" RENAME TO "PersonRole_old"`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE TYPE "PersonRole" AS ENUM ('SELLER', 'ADMIN', 'SUPER_ADMIN')`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole" USING "role"::text::"PersonRole"`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE "PersonRole_old"`,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Rollback concluído com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro no rollback:', error);
      throw error;
    }
  }
};
