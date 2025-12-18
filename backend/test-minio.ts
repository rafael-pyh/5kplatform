import minioClient from './src/utils/minio';

/**
 * Script para testar a conexão com MinIO
 * Execute com: npm run test-minio (adicione este script ao package.json)
 */

async function testMinIOConnection() {
  try {
    console.log('🔍 Testando conexão com MinIO...\n');

    // Testa conexão básica
    console.log('1️⃣  Conectando ao MinIO...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Conectado com sucesso!');
    console.log('   Buckets existentes:', buckets.map((b) => b.name).join(', ') || 'nenhum\n');

    // Testa criação de bucket
    const bucketName = 'test-bucket';
    console.log(`2️⃣  Testando criação de bucket "${bucketName}"...`);

    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket "${bucketName}" criado com sucesso!\n`);
    } else {
      console.log(`✅ Bucket "${bucketName}" já existe!\n`);
    }

    // Testa upload de arquivo
    console.log('3️⃣  Testando upload de arquivo...');
    const testContent = Buffer.from('teste de conteúdo');
    const fileName = `test-${Date.now()}.txt`;

    await minioClient.putObject(bucketName, fileName, testContent, testContent.length);
    console.log(`✅ Arquivo "${fileName}" enviado com sucesso!\n`);

    // Testa listagem de objetos
    console.log('4️⃣  Listando objetos no bucket...');
    const stream = minioClient.listObjects(bucketName, '', true);
    const objects: string[] = [];

    stream.on('data', (obj) => {
      if (obj.name) {
        objects.push(obj.name);
      }
    });

    stream.on('end', async () => {
      console.log(`✅ ${objects.length} objeto(s) encontrado(s):`);
      objects.forEach((obj) => console.log(`   - ${obj}`));
      console.log();

      // Testa download
      console.log('5️⃣  Testando download de arquivo...');
      const downloadedContent = await new Promise<Buffer>(async (resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = await minioClient.getObject(bucketName, fileName);

        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
        downloadStream.on('error', reject);
      });

      console.log(`✅ Arquivo baixado com sucesso!`);
      console.log(`   Conteúdo: ${downloadedContent.toString()}\n`);

      // Testa deleção
      console.log('6️⃣  Testando deleção de arquivo...');
      await minioClient.removeObject(bucketName, fileName);
      console.log(`✅ Arquivo deletado com sucesso!\n`);

      // Testa deleção de bucket
      console.log('7️⃣  Testando deleção de bucket...');
      await minioClient.removeBucket(bucketName);
      console.log(`✅ Bucket "${bucketName}" deletado com sucesso!\n`);

      console.log('━'.repeat(50));
      console.log('✨ Todos os testes passaram com sucesso!');
      console.log('━'.repeat(50));
      process.exit(0);
    });

    stream.on('error', (error) => {
      throw error;
    });
  } catch (error: any) {
    console.error('\n❌ Erro durante os testes:');
    console.error(error.message);
    console.error('\nVerifique:');
    console.error('- Se MinIO está rodando (docker ps)');
    console.error('- Se as variáveis de ambiente estão corretas (.env)');
    console.error('- Se o endpoint está acessível\n');
    process.exit(1);
  }
}

testMinIOConnection();
