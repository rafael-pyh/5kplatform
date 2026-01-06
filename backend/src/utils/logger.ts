/**
 * Logger customizado que garante que os logs apareçam em produção
 */

const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

function formatLog(level: string, label: string, message: any, data?: any): string {
  const timestamp = getTimestamp();
  const baseLog = `[${timestamp}] [${level}] ${label}: ${
    typeof message === 'string' ? message : JSON.stringify(message)
  }`;

  if (data) {
    return `${baseLog} | ${JSON.stringify(data)}`;
  }
  return baseLog;
}

export const logger = {
  info: (label: string, message: any, data?: any) => {
    const log = formatLog('INFO', label, message, data);
    console.log(log);
    console.error(log); // Também envia para stderr para garantir captura
  },

  warn: (label: string, message: any, data?: any) => {
    const log = formatLog('WARN', label, message, data);
    console.warn(log);
  },

  error: (label: string, message: any, data?: any) => {
    const log = formatLog('ERROR', label, message, data);
    console.error(log);
  },

  debug: (label: string, message: any, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog('DEBUG', label, message, data);
      console.log(log);
    }
  },
};
