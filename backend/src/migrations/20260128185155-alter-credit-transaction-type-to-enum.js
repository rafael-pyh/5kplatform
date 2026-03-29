'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Usar SQL direto para adicionar o valor ao enum e alterar a coluna
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Verificar se o enum existe
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionType') THEN
          -- Verificar se PRODUCT_PURCHASE já existe
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'CreditTransactionType' AND e.enumlabel = 'PRODUCT_PURCHASE'
          ) THEN
            -- Adicionar PRODUCT_PURCHASE ao enum
            ALTER TYPE "CreditTransactionType" ADD VALUE 'PRODUCT_PURCHASE';
          END IF;
        ELSE
          -- Criar o enum se não existir
          CREATE TYPE "CreditTransactionType" AS ENUM ('COMMISSION', 'KIT_PURCHASE', 'PRODUCT_PURCHASE', 'WITHDRAW_REQUEST', 'ADJUSTMENT');
        END IF;
      END
      $$;
    `);

    // Alterar a coluna para usar o enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "CreditTransaction" ALTER COLUMN "type" TYPE "CreditTransactionType" USING "type"::"CreditTransactionType";
    `);
  },

  async down (queryInterface, Sequelize) {
    // Reverter para TEXT
    await queryInterface.sequelize.query(`
      ALTER TABLE "CreditTransaction" ALTER COLUMN "type" TYPE TEXT;
    `);
  }
};
