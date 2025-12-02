import app from "./app";
import "dotenv/config";
import { ensureBucket } from "./utils/minio";
import sequelize from "./database/sequelize";

// Função para inicializar o servidor
async function startServer() {
  try {
    // Testa conexão com o banco de dados
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sincroniza modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }

    // Inicializa bucket do MinIO
    await ensureBucket();
    console.log('✅ MinIO bucket ready');

    // Inicia o servidor
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 API rodando na porta ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();