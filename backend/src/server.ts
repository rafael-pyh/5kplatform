import "dotenv/config";
import app from "./app";
import { getSequelize } from "./database/sequelize";
import { validateEnv } from "./config/env";

// Força stdout unbuffered para logs em tempo real
if ((process.stdout as any)._handle) {
  (process.stdout as any)._handle.setBlocking(true);
}

/**
 * Função para inicializar o servidor com otimizações
 * - Validação de env vars
 * - Conexão ao banco (singleton)
 * - Error handlers globais
 */
async function startServer() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     INICIANDO SERVIDOR DA API        ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    // Valida variáveis de ambiente
    validateEnv();
    
    // Obtém instância singleton do Sequelize
    console.log('[SERVER] Conectando ao banco de dados...');
    const sequelize = getSequelize();
    
    // Testa conexão com o banco de dados
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
    const server = app.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════╗');
      console.log(`║  🚀 API rodando na porta ${PORT}          ║`);
      console.log(`║  📝 Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(21 - (process.env.NODE_ENV || 'development').length)}║`);
      console.log('╚════════════════════════════════════════╝\n');
    });

    // ==================== GLOBAL ERROR HANDLERS ====================
    
    // Tratamento de conexões não tratadas
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ [UNHANDLED REJECTION]', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ [UNCAUGHT EXCEPTION]', error);
      // Permite que o aplicação termine gracefully
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n🛑 [SERVER] Recebido sinal de shutdown, encerrando gracefully...');
      
      server.close(async () => {
        console.log('✅ [SERVER] HTTP server fechado');
        
        try {
          const sequelize = getSequelize();
          await sequelize.close();
          console.log('✅ [SERVER] Database connection fechada');
        } catch (err) {
          console.error('❌ [SERVER] Erro ao fechar database:', err);
        }
        
        process.exit(0);
      });

      // Force shutdown após 10 segundos
      setTimeout(() => {
        console.error('❌ [SERVER] Forçando shutdown após timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('\n❌ [SERVER] ERRO CRÍTICO:', error);
    console.error(error);
    process.exit(1);
  }
}

startServer();