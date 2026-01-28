'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Criar ENUM para PaymentProofFileType se não existir
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "PaymentProofFileType" AS ENUM ('image', 'pdf');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar tabela PaymentProof
    await queryInterface.createTable('PaymentProof', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Order',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileType: {
        type: Sequelize.TEXT, // Usar TEXT e converter para ENUM via raw SQL
        defaultValue: 'image',
        allowNull: false,
      },
      originalFileName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Alterar coluna fileType para usar o ENUM criado
    await queryInterface.sequelize.query(`
      ALTER TABLE "PaymentProof" 
      ALTER COLUMN "fileType" TYPE "PaymentProofFileType" USING "fileType"::"PaymentProofFileType";
    `);

    // Add indexes for performance
    await queryInterface.addIndex('PaymentProof', ['orderId']);
    await queryInterface.addIndex('PaymentProof', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('PaymentProof');
    
    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "PaymentProofFileType";
    `);
  }
};
