import "dotenv/config";

/**
 * Configuração de Variáveis de Ambiente
 * 
 * Separação clara entre:
 * - URLs internas (Railway): server-side only
 * - URLs públicas (Frontend): browser-accessible
 */

export const env = {
  // ==================== SERVER CONFIG ====================
  PORT: parseInt(process.env.PORT || '4000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // ==================== DATABASE ====================
  DATABASE_URL: process.env.DATABASE_URL || "",
  
  // ==================== CACHE ====================
  CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  CACHE_TTL_MS: parseInt(process.env.CACHE_TTL_MS || '300000'), // 5 minutos padrão
  
  // ==================== JWT ====================
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secure-jwt-secret-change-this-in-production-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // ==================== URLS - INTERNAL (Server-side only) ====================
  /**
   * URL interna do serviço no Railway
   * Exemplo: https://5kplatform-api.railway.internal
   * Usa para: chamadas backend-to-backend, webhooks, jobs
   * NUNCA exponha via NEXT_PUBLIC_*
   */
  INTERNAL_API_URL: process.env.INTERNAL_API_URL || process.env.API_URL || 'http://localhost:4000',
  
  // ==================== URLS - PUBLIC (Frontend-accessible) ====================
  /**
   * URL pública da API
   * Exemplo: https://5kplatform-api.railway.app ou https://api.5kenergiasolar.com.br
   * Usa para: endpoints chamados pelo frontend/browser
   * Pode ser NEXT_PUBLIC_API_URL no frontend
   */
  PUBLIC_API_URL: process.env.PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000',
  
  /**
   * URL do Frontend
   * Exemplo: https://5kplatform.vercel.app ou https://5kenergiasolar.com.br
   * Usa para: CORS, redirects, links em emails
   */
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // ==================== STORAGE (S3/MinIO/Backblaze) ====================
  S3_ENDPOINT: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin123',
  S3_BUCKET: process.env.S3_BUCKET || process.env.MINIO_BUCKET || 'images',
  S3_QRCODE_BUCKET: process.env.S3_QRCODE_BUCKET || process.env.MINIO_QRCODE_BUCKET || 'qrcodes',
  S3_URL: process.env.S3_URL || process.env.MINIO_URL || 'http://localhost:9000',
  S3_USE_SSL: process.env.S3_USE_SSL === 'true' || process.env.MINIO_USE_SSL === 'true' || false,
  
  // ==================== EMAIL ====================
  // App Password (SMTP) - Recomendado
  EMAIL_USER: process.env.EMAIL_USER || process.env.GMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587'),
  
  // Gmail OAuth2 (alternativa para produção)
  GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || "",
  GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || "",
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || "",
  GMAIL_USER: process.env.GMAIL_USER || "",
  
  // ==================== LOGGING ====================
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_SQL: process.env.LOG_SQL === 'true' || false,
  
  // ==================== HELPERS ====================
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Validações de Configuração
 * Garante que variáveis críticas estão definidas em produção
 */
export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const inProduction = env.isProduction;

  if (inProduction) {
    required.push('PUBLIC_API_URL', 'FRONTEND_URL', 'INTERNAL_API_URL');
  }

  const missing = required.filter((key) => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    console.error(`❌ [CONFIG] Missing required environment variables: ${missing.join(', ')}`);
    if (inProduction) {
      process.exit(1);
    }
  }

  console.log('✅ [CONFIG] Environment variables validated');
}