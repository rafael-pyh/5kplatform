'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona colunas de URL do MinIO na tabela Person (verifica se não existem)
    try {
      await queryInterface.addColumn('Person', 'photoUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL da foto de perfil no MinIO'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Coluna photoUrl já existe em Person');
    }

    try {
      await queryInterface.addColumn('Person', 'qrCodeUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL do QR code no MinIO'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Coluna qrCodeUrl já existe em Person');
    }

    // Adiciona colunas de URL do MinIO na tabela Lead (verifica se não existem)
    try {
      await queryInterface.addColumn('Lead', 'energyBillUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL da conta de energia no MinIO'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Coluna energyBillUrl já existe em Lead');
    }

    try {
      await queryInterface.addColumn('Lead', 'roofPhotoUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL da foto do telhado no MinIO'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Coluna roofPhotoUrl já existe em Lead');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove as colunas caso seja necessário fazer rollback
    try {
      await queryInterface.removeColumn('Person', 'photoUrl');
    } catch (error) {
      console.log('Coluna photoUrl não encontrada em Person');
    }

    try {
      await queryInterface.removeColumn('Person', 'qrCodeUrl');
    } catch (error) {
      console.log('Coluna qrCodeUrl não encontrada em Person');
    }

    try {
      await queryInterface.removeColumn('Lead', 'energyBillUrl');
    } catch (error) {
      console.log('Coluna energyBillUrl não encontrada em Lead');
    }

    try {
      await queryInterface.removeColumn('Lead', 'roofPhotoUrl');
    } catch (error) {
      console.log('Coluna roofPhotoUrl não encontrada em Lead');
    }
  }
};
