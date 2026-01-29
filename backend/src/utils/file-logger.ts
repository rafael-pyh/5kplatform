import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const LOG_DIR = path.join('/tmp', '5k-platform-logs');
const STATS_LOG_FILE = path.join(LOG_DIR, 'stats.log');

// Criar diretório se não existir
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Erro ao criar diretório de logs:', e);
}

/**
 * Logger que escreve em arquivo para debugging em produção
 */
export const fileLogger = {
  logStats: (data: any) => {
    try {
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] ${JSON.stringify(data)}\n`;
      fs.appendFileSync(STATS_LOG_FILE, message);
    } catch (e) {
      console.error('Erro ao escrever log em arquivo:', e);
    }
  },

  logError: (context: string, error: any) => {
    try {
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] [ERROR] [${context}] ${JSON.stringify({
        message: error?.message,
        stack: error?.stack,
        ...error,
      })}\n`;
      fs.appendFileSync(STATS_LOG_FILE, message);
    } catch (e) {
      console.error('Erro ao escrever log de erro em arquivo:', e);
    }
  },

  readStatsLog: () => {
    try {
      if (!fs.existsSync(STATS_LOG_FILE)) {
        return 'Log file not found yet';
      }
      return fs.readFileSync(STATS_LOG_FILE, 'utf-8');
    } catch (e) {
      return `Error reading log file: ${e}`;
    }
  },

  getLogPath: () => STATS_LOG_FILE,
};
