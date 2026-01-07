'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Creative', 'qrBoxCenterXRatio', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Posição X do QR code (0-1, relativo ao criativo)',
    });

    await queryInterface.addColumn('Creative', 'qrBoxCenterYRatio', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Posição Y do QR code (0-1, relativo ao criativo)',
    });

    await queryInterface.addColumn('Creative', 'qrBoxSizeRatio', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Tamanho do QR code em relação ao criativo (0-1)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Creative', 'qrBoxCenterXRatio');
    await queryInterface.removeColumn('Creative', 'qrBoxCenterYRatio');
    await queryInterface.removeColumn('Creative', 'qrBoxSizeRatio');
  },
};
