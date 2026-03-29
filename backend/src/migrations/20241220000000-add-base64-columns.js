/**
 * Migration: Adiciona colunas para base64 e remove dependência do MinIO
 * 
 * Adiciona:
 * - photoBase64: TEXT (para armazenar foto de perfil em base64)
 * - qrCodeBase64: TEXT (para armazenar QR code em base64)
 * 
 * Mantém as colunas antigas temporariamente para migração gradual:
 * - photoUrl: STRING
 * - qrCodeUrl: STRING
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Adiciona coluna photoBase64
      await queryInterface.addColumn(
        'Person',
        'photoBase64',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      // Adiciona coluna qrCodeBase64
      await queryInterface.addColumn(
        'Person',
        'qrCodeBase64',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Colunas base64 adicionadas com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao adicionar colunas base64:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove coluna photoBase64
      await queryInterface.removeColumn('Person', 'photoBase64', { transaction });

      // Remove coluna qrCodeBase64
      await queryInterface.removeColumn('Person', 'qrCodeBase64', { transaction });

      await transaction.commit();
      console.log('✅ Colunas base64 removidas com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao remover colunas base64:', error);
      throw error;
    }
  },
};
