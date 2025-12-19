import { s3Client } from './src/utils/minio';
import { ListBucketsCommand, CreateBucketCommand, BucketExists, HeadBucketCommand, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';

/**
 * Script para testar a conexão com S3
 * Execute com: npm run test:s3 (adicione este script ao package.json)
 */

async function testS3Connection() {
  try {
    console.log('🔍 Testando conexão com S3...\n');

    // Testa conexão básica
    console.log('1️⃣  Conectando ao S3...');
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    console.log('✅ Conectado com sucesso!');
    console.log('   Buckets existentes:', buckets.Buckets?.map((b) => b.Name).join(', ') || 'nenhum\n');

    // Testa criação de bucket (pode falhar se já existe - isso é ok)
    const bucketName = `test-bucket-${Date.now()}`;
    console.log(`2️⃣  Testando criação de bucket "${bucketName}"...`);

    try {
      const createCommand = new CreateBucketCommand({ Bucket: bucketName });
      await s3Client.send(createCommand);
      console.log(`✅ Bucket "${bucketName}" criado com sucesso!\n`);
    } catch (error: any) {
      if (error.name === 'BucketAlreadyExists') {
        console.log(`✅ Bucket "${bucketName}" já existe!\n`);
      } else {
        throw error;
      }
    }

    // Testa upload de arquivo
    console.log('3️⃣  Testando upload de arquivo...');
    const testContent = Buffer.from('teste de conteúdo');
    const fileName = `test-${Date.now()}.txt`;

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log(`✅ Arquivo "${fileName}" enviado com sucesso!\n`);

    // Testa listagem de objetos
    console.log('4️⃣  Listando objetos no bucket...');
    const listObjCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    
    const objects = await s3Client.send(listObjCommand);
    const objectNames = objects.Contents?.map((obj) => obj.Key) || [];
    
    console.log(`✅ ${objectNames.length} objeto(s) encontrado(s):`);
    objectNames.forEach((obj) => console.log(`   - ${obj}`));
    console.log();

      // Testa download
      console.log('5️⃣  Testando download de arquivo...');
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });
      
      const response = await s3Client.send(getCommand);
      const chunks: Uint8Array[] = [];

      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      const downloadedContent = Buffer.concat(chunks);

      console.log(`✅ Arquivo baixado com sucesso!`);
      console.log(`   Conteúdo: ${downloadedContent.toString()}\n`);

      // Testa deleção
      console.log('6️⃣  Testando deleção de arquivo...');
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });
      
      await s3Client.send(deleteCommand);
      console.log(`✅ Arquivo deletado com sucesso!\n`);

      // Testa deleção de bucket (pode falhar se houver objetos - isso é ok)
      console.log('7️⃣  Testando deleção de bucket...');
      try {
        const deleteBucketCommand = new DeleteBucketCommand({
          Bucket: bucketName,
        });
        
        await s3Client.send(deleteBucketCommand);
        console.log(`✅ Bucket "${bucketName}" deletado com sucesso!\n`);
      } catch (error: any) {
        console.log(`⚠️  Bucket não pôde ser deletado (pode haver objetos restantes): ${error.message}\n`);
      }

      console.log('━'.repeat(50));
      console.log('✨ Todos os testes passaram com sucesso!');
      console.log('━'.repeat(50));
      process.exit(0);
    } catch (error: any) {
      throw error;
    }
  } catch (error: any) {
    console.error('\n❌ Erro durante os testes:');
    console.error(error.message);
    console.error('\nVerifique:');
    console.error('- Se S3 está acessível (endpoint, credenciais)');
    console.error('- Se as variáveis de ambiente estão corretas (.env)');
    console.error('- Se os buckets existem no S3\n');
    process.exit(1);
  }
}

testS3Connection();
