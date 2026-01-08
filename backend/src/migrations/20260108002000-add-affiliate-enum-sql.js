'use strict';

/**
 * Migration: Adiciona AFFILIATE ao enum PersonRole (Abordagem SQL pura)
 * 
 * Esta migration usa SQL puro para adicionar AFFILIATE ao enum de forma robusta
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Usar SQL puro para adicionar o valor ao enum
      await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PersonRole') 
            AND enumlabel = 'AFFILIATE'
          ) THEN 
            ALTER TYPE "PersonRole" ADD VALUE 'AFFILIATE';
            RAISE NOTICE 'AFFILIATE adicionado ao enum PersonRole';
          ELSE
            RAISE NOTICE 'AFFILIATE já existe no enum PersonRole';
          END IF;
        END $$;
      `);

      console.log('✅ AFFILIATE verificado/adicionado ao enum PersonRole');

      // Verificar registration_type
      const columns = await queryInterface.describeTable('Person');
      
      if (!columns.registration_type) {
        await queryInterface.addColumn(
          'Person',
          'registration_type',
          {
            type: Sequelize.ENUM('PUBLIC', 'ADMIN'),
            defaultValue: 'ADMIN',
            allowNull: false
          }
        );
        console.log('✅ Coluna registration_type adicionada');
      }

      // Verificar created_by
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
          }
        );
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
      const columns = await queryInterface.describeTable('Person');
      
      if (columns.created_by) {
        await queryInterface.removeColumn('Person', 'created_by');
      }

      if (columns.registration_type) {
        await queryInterface.removeColumn('Person', 'registration_type');
      }

      console.log('✅ Downgrade concluído');
    } catch (error) {
      console.error('❌ Erro no downgrade:', error.message);
      throw error;
    }
  }
};
