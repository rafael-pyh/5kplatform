'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar se a coluna já é nullable
    const [results] = await queryInterface.sequelize.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'Order' 
        AND column_name = 'kitId'
    `);

    if (results && results.is_nullable === 'YES') {
      console.log('Coluna kitId já é nullable, pulando migration...');
      return;
    }

    // Fazer backup dos dados existentes se necessário
    console.log('Aplicando migration: tornando kitId nullable...');
    
    // Usar SQL direto para maior controle
    await queryInterface.sequelize.query('ALTER TABLE "Order" ALTER COLUMN "kitId" DROP NOT NULL;');
    
    console.log('Migration aplicada com sucesso!');
  },

  async down (queryInterface, Sequelize) {
    // Verificar se há registros com kitId null antes de tentar SET NOT NULL
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM "Order" 
      WHERE "kitId" IS NULL
    `);

    if (results && parseInt(results.null_count) > 0) {
      throw new Error(`Não é possível tornar kitId NOT NULL: existem ${results.null_count} registros com kitId null`);
    }

    await queryInterface.sequelize.query('ALTER TABLE "Order" ALTER COLUMN "kitId" SET NOT NULL;');
  }
};
