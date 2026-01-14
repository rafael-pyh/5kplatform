import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Person } from '../models/Person';
import { Lead } from '../models/Lead';
import { QRCodeScan } from '../models/QRCodeScan';
import { Creative } from '../models/Creative';
import { WhatsappTemplate } from '../models/WhatsappTemplate';

/**
 * Singleton Pattern para Sequelize
 * Garante apenas uma única instância de conexão com o banco de dados
 * Utiliza pool de conexões otimizado para Railway/PostgreSQL
 */

let sequelizeInstance: Sequelize | null = null;

/**
 * Inicializa e retorna a instância única do Sequelize
 */
function initializeSequelize(): Sequelize {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // Configuração do pool otimizada para Railway/Produção
  const poolConfig = {
    max: isProduction ? 10 : 5,           // Máximo de conexões simultâneas
    min: isProduction ? 2 : 0,            // Mínimo de conexões mantidas
    acquire: 30000,                        // Timeout de aquisição (30s)
    idle: 10000,                           // Tempo antes de fechar conexão inativa (10s)
    evict: 10000,                          // Tempo de verificação de conexões inativas
    handleDisconnects: true,               // Reconectar automaticamente em desconexões
  };

  // Configuração de logging otimizada
  const loggingConfig = isProduction
    ? false  // Desabilita logs em produção para reduzir CPU
    : (msg: string) => {
        // Log estruturado em desenvolvimento
        if (!msg.includes('Executing')) {
          console.log(`[SQL] ${msg}`);
        }
      };

  const models = [Person, Lead, QRCodeScan, Creative, WhatsappTemplate];

  if (databaseUrl) {
    // Usa DATABASE_URL (Railway, Heroku)
    sequelizeInstance = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      models,
      logging: loggingConfig,
      pool: poolConfig,
      dialectOptions: {
        ssl:
          databaseUrl.includes('localhost') || databaseUrl.includes('postgres:5432')
            ? false
            : {
                require: true,
                rejectUnauthorized: false,
              },
        // Configurações para produção no Railway
        statement_timeout: isProduction ? 30000 : undefined,
      },
      // Desabilita sincronização automática em produção
      define: {
        timestamps: true,
        underscored: true,
      },
    });
  } else {
    // Usa variáveis individuais (desenvolvimento local)
    sequelizeInstance = new Sequelize({
      database: process.env.DB_NAME || 'postgres',
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      models,
      logging: loggingConfig,
      pool: poolConfig,
      define: {
        timestamps: true,
        underscored: true,
      },
    });
  }

  return sequelizeInstance;
}

/**
 * Retorna a instância do Sequelize (cria se não existir)
 */
export function getSequelize(): Sequelize {
  if (!sequelizeInstance) {
    initializeSequelize();
  }
  return sequelizeInstance as Sequelize;
}

/**
 * Exporta a instância padrão
 */
const sequelize = getSequelize();

export default sequelize;