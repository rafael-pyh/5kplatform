/**
 * Script para configurar CORS no Backblaze B2
 * Execução: npx ts-node setup-b2-cors.ts
 * 
 * Isso precisa ser executado uma vez para permitir requests CORS do frontend
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
}

interface B2CorsRule {
  corsRuleName: string;
  allowedOrigins: string[];
  allowedHttpMethods: string[];
  allowedHttpHeaders?: string[];
  exposeHttpHeaders?: string[];
  maxAgeSeconds?: number;
}

async function setupB2CORS() {
  try {
    const B2_KEY_ID = process.env.S3_ACCESS_KEY;
    const B2_APPLICATION_KEY = process.env.S3_SECRET_KEY;
    const BUCKET_NAME = process.env.S3_BUCKET || '5k-storage';

    if (!B2_KEY_ID || !B2_APPLICATION_KEY) {
      console.error('❌ S3_ACCESS_KEY e S3_SECRET_KEY não estão configuradas');
      process.exit(1);
    }

    console.log('🔐 Autenticando com Backblaze B2...');

    // Step 1: Autenticar
    const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');
    const authResponse = await axios.post<B2AuthResponse>(
      'https://api001.backblazeb2.com/b2api/v1/b2_authorize_account',
      { accountId: B2_KEY_ID.split(':')[0] }, // Tenta usar accountId do key
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      }
    );

    const { authorizationToken, apiUrl, accountId } = authResponse.data;
    console.log('✅ Autenticado com sucesso');
    console.log(`   Account ID: ${accountId}`);

    // Step 2: Obter ID do bucket
    console.log(`\n🔍 Procurando bucket: ${BUCKET_NAME}`);
    const listBucketsResponse = await axios.post(
      `${apiUrl}/b2api/v1/b2_list_buckets`,
      { accountId },
      {
        headers: {
          'Authorization': authorizationToken,
        },
      }
    );

    const bucket = listBucketsResponse.data.buckets.find((b: any) => b.bucketName === BUCKET_NAME);
    if (!bucket) {
      console.error(`❌ Bucket ${BUCKET_NAME} não encontrado`);
      process.exit(1);
    }

    const bucketId = bucket.bucketId;
    console.log(`✅ Bucket encontrado: ${bucketId}`);

    // Step 3: Configurar CORS
    console.log('\n📝 Configurando CORS rule...');

    const corsRules: B2CorsRule[] = [
      {
        corsRuleName: '5k-platform-frontend',
        allowedOrigins: [
          'https://5kplatform.vercel.app',
          'https://www.5kplatform.vercel.app',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
        ],
        allowedHttpMethods: ['GET', 'HEAD', 'OPTIONS'],
        allowedHttpHeaders: ['*'],
        exposeHttpHeaders: ['Content-Length', 'Content-Type', 'ETag'],
        maxAgeSeconds: 3600,
      },
    ];

    const updateBucketResponse = await axios.post(
      `${apiUrl}/b2api/v1/b2_update_bucket`,
      {
        accountId,
        bucketId,
        bucketType: bucket.bucketType,
        corsRules,
      },
      {
        headers: {
          'Authorization': authorizationToken,
        },
      }
    );

    console.log('✅ CORS configurado com sucesso!');
    console.log('\n📋 CORS Rules:');
    updateBucketResponse.data.corsRules.forEach((rule: B2CorsRule) => {
      console.log(`  - ${rule.corsRuleName}`);
      console.log(`    Origins: ${rule.allowedOrigins.join(', ')}`);
      console.log(`    Methods: ${rule.allowedHttpMethods.join(', ')}`);
    });

    console.log('\n✨ Backblaze B2 está pronto para servir arquivos com CORS!');
  } catch (error: any) {
    console.error('❌ Erro ao configurar CORS:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupB2CORS();
}

export { setupB2CORS };
