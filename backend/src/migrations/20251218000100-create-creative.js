'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Creative', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'URL da imagem no MinIO',
      },
      type: {
        type: Sequelize.ENUM('PLACARD', 'BANNER', 'POSTER', 'SOCIAL_MEDIA', 'OTHER'),
        allowNull: false,
        defaultValue: 'PLACARD',
      },
      uploadedByUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Person',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      downloadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Tags separadas por vírgula',
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

    // Criar índices para melhor performance
    await queryInterface.addIndex('Creative', ['uploadedByUserId']);
    await queryInterface.addIndex('Creative', ['type']);
    await queryInterface.addIndex('Creative', ['active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Creative');
  },
};
