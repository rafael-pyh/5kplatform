'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primeiro, garantir que o enum existe com todos os valores
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Tentar adicionar PRODUCT_PURCHASE se não existir
        ALTER TYPE "CreditTransactionType" ADD VALUE IF NOT EXISTS 'PRODUCT_PURCHASE';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Alterar a coluna type para usar o enum
    await queryInterface.changeColumn('CreditTransaction', 'type', {
      type: Sequelize.ENUM('COMMISSION', 'KIT_PURCHASE', 'PRODUCT_PURCHASE', 'WITHDRAW_REQUEST', 'ADJUSTMENT'),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverter para TEXT
    await queryInterface.changeColumn('CreditTransaction', 'type', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  }
};
