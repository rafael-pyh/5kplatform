import "dotenv/config";
import app from "./app";
import sequelize from "./database/sequelize";

// Força stdout unbuffered para logs em tempo real
if ((process.stdout as any)._handle) {
  (process.stdout as any)._handle.setBlocking(true);
}

// Função para inicializar o servidor
async function startServer() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     INICIANDO SERVIDOR DA API        ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    // Testa conexão com o banco de dados
    console.log('[SERVER] Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ [SERVER] Database connected successfully');

    // Sincroniza modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('[SERVER] Sincronizando modelos...');
      await sequelize.sync({ alter: false });
      console.log('✅ [SERVER] Database models synchronized');
    }

    // Inicia o servidor
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════╗');
      console.log(`║  🚀 API rodando na porta ${PORT}          ║`);
      console.log(`║  📝 Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(21 - (process.env.NODE_ENV || 'development').length)}║`);
      console.log('╚════════════════════════════════════════╝\n');
    });

  } catch (error) {
    console.error('\n❌ [SERVER] ERRO CRÍTICO:', error);
    console.error(error);
    process.exit(1);
  }
}

startServer();