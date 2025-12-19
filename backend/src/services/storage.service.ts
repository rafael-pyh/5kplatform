import { s3Client } from '../utils/minio';
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadBucketCommand,
  CreateBucketCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.S3_BUCKET || '5k-storage';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

/**
 * Constrói a URL pública do arquivo baseado no endpoint e bucket
 */
const buildPublicUrl = (key: string): string => {
  console.log(`[buildPublicUrl] Construindo URL para key: ${key}`);
  console.log(`[buildPublicUrl] S3_ENDPOINT: ${S3_ENDPOINT}`);
  console.log(`[buildPublicUrl] S3_REGION: ${S3_REGION}`);
  console.log(`[buildPublicUrl] S3_URL: ${process.env.S3_URL}`);
  console.log(`[buildPublicUrl] BUCKET_NAME: ${BUCKET_NAME}`);
  
  // Se S3_URL está configurado explicitamente, usa ele direto
  if (process.env.S3_URL && process.env.S3_URL.includes('backblazeb2.com')) {
    // S3_URL já é a URL pública de arquivo do B2
    // Exemplo: https://f005.backblazeb2.com/file/5k-storage
    const baseUrl = process.env.S3_URL.replace(/\/$/, '').replace(/\/file\/.*$/, '');
    const url = `${baseUrl}/file/${BUCKET_NAME}/${key}`;
    console.log(`[buildPublicUrl] URL final (com S3_URL): ${url}`);
    return url;
  }
  
  // Detecta se é Backblaze B2
  if (S3_ENDPOINT.includes('backblazeb2.com')) {
    // Para B2, extrai número do region para determinar o número do f
    // Exemplo: us-east-005 -> f005
    const regionMatch = S3_REGION.match(/(\d+)$/);
    const regionNumber = regionMatch ? regionMatch[1] : '005';
    const fileHost = `f${regionNumber}.backblazeb2.com`;
    const url = `https://${fileHost}/file/${BUCKET_NAME}/${key}`;
    console.log(`[buildPublicUrl] URL final (B2): ${url}`);
    return url;
  }
  
  // Para AWS S3
  if (S3_ENDPOINT.includes('amazonaws.com') || S3_ENDPOINT === 'https://s3.amazonaws.com') {
    const url = `https://${BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
    console.log(`[buildPublicUrl] URL final (AWS): ${url}`);
    return url;
  }
  
  // Fallback: tenta construir com o endpoint
  const cleanEndpoint = S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanEndpoint}/${BUCKET_NAME}/${key}`;
  console.log(`[buildPublicUrl] URL final (fallback): ${url}`);
  return url;
};

/**
 * Verifica se um bucket existe
 */
const bucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    // Se o bucket não existe, retorna false (404 = NotFound)
    if (error.$metadata?.httpStatusCode === 404 || error.name === 'NoSuchBucket' || error.Code === 'NotFound') {
      return false;
    }
    // Para outros erros, relança a exceção
    throw error;
  }
};

/**
 * Cria um bucket se não existir
 */
const createBucketIfNotExists = async (bucketName: string): Promise<void> => {
  try {
    const exists = await bucketExists(bucketName);
    
    if (!exists) {
      const command = new CreateBucketCommand({ Bucket: bucketName });
      await s3Client.send(command);
      console.log(`✅ Bucket '${bucketName}' criado com sucesso`);
    } else {
      console.log(`✅ Bucket '${bucketName}' já existe`);
    }
  } catch (error: any) {
    console.warn(`⚠️  Não foi possível criar bucket '${bucketName}': ${error.message}`);
    console.warn(`   Verifique se o bucket existe e se as permissões estão corretas`);
    // Não relança o erro - permite que a app continue
    // O bucket pode já existir ou as permissões podem estar limitadas
  }
};

/**
 * Inicializa o bucket do S3 se não existir
 */
export const initializeMinIOBucket = async () => {
  try {
    console.log('🔄 Verificando bucket do S3...\n');
    
    // Cria o bucket principal se não existir
    await createBucketIfNotExists(BUCKET_NAME);
    
    console.log(`\n✅ S3 está configurado e pronto para uso`);
    console.log(`📁 Bucket principal: ${BUCKET_NAME}`);
    console.log(`   ├─ /uploads/* (imagens e documentos)`);
    console.log(`   └─ /qrcodes/* (QR codes)`);
  } catch (error) {
    console.warn('⚠️  Erro ao inicializar S3:', error);
    // Não relança - continua mesmo que a criação de buckets falhe
  }
};

/**
 * Faz upload de arquivo para S3
 */
export const uploadFileToMinIO = async (
  file: Express.Multer.File,
  fileName: string,
  folderName: string = 'uploads'
): Promise<string> => {
  try {
    // Garante que o bucket existe
    await createBucketIfNotExists(BUCKET_NAME);
    
    const objectName = `${folderName}/${Date.now()}-${fileName}`;
    console.log(`[uploadFileToMinIO] Iniciando upload: ${fileName}`);
    console.log(`[uploadFileToMinIO] Pasta: ${folderName}`);
    console.log(`[uploadFileToMinIO] Nome do objeto: ${objectName}`);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    console.log(`[uploadFileToMinIO] Upload concluído para: ${objectName}`);

    // Retorna a URL pública do arquivo
    const fileUrl = buildPublicUrl(objectName);
    console.log(`[uploadFileToMinIO] URL final retornada: ${fileUrl}`);
    return fileUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload para S3:', error);
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
  }
};

/**
 * Faz download de arquivo do S3 e retorna como Base64
 */
export const downloadFileAsBase64 = async (objectName: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
    });

    const response = await s3Client.send(command);
    const chunks: Uint8Array[] = [];

    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const base64Data = buffer.toString('base64');
    const ext = objectName.split('.').pop() || 'bin';
    const mimeType = getMimeType(ext);

    return `data:${mimeType};base64,${base64Data}`;
  } catch (error: any) {
    console.error('Erro ao baixar arquivo do S3:', error);
    throw new Error(`Erro ao recuperar arquivo: ${error.message}`);
  }
};

/**
 * Deleta arquivo do S3
 */
export const deleteFileFromMinIO = async (objectName: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
    });

    await s3Client.send(command);
    console.log(`Arquivo deletado: ${objectName}`);
  } catch (error: any) {
    console.error('Erro ao deletar arquivo do S3:', error);
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
};

/**
 * Gera URL presigned para download privado
 */
export const generatePresignedUrl = async (
  objectName: string,
  expirySeconds: number = 86400
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirySeconds,
    });
    
    return url;
  } catch (error: any) {
    console.error('Erro ao gerar URL presigned:', error);
    throw new Error(`Erro ao gerar URL presigned: ${error.message}`);
  }
};

/**
 * Obtém tipo MIME baseado na extensão do arquivo
 */
const getMimeType = (ext: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};

/**
 * Faz upload de QR Code (imagem) para a pasta qrcodes do bucket principal
 */
export const uploadQRCodeToMinIO = async (
  buffer: Buffer,
  qrCodeId: string
): Promise<string> => {
  try {
    console.log(`[uploadQRCodeToMinIO] Iniciando upload de QR code: ${qrCodeId}`);
    
    // Garante que o bucket principal existe
    await createBucketIfNotExists(BUCKET_NAME);
    
    const objectName = `qrcodes/${qrCodeId}.png`;
    console.log(`[uploadQRCodeToMinIO] Object name: ${objectName}`);
    console.log(`[uploadQRCodeToMinIO] Buffer size: ${buffer.length} bytes`);
    console.log(`[uploadQRCodeToMinIO] Bucket: ${BUCKET_NAME}`);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);
    console.log(`[uploadQRCodeToMinIO] Upload concluído com sucesso`);

    // Retorna a URL pública do arquivo
    const fileUrl = buildPublicUrl(objectName);
    console.log(`[uploadQRCodeToMinIO] URL final retornada: ${fileUrl}`);
    return fileUrl;
  } catch (error: any) {
    console.error('[uploadQRCodeToMinIO] Erro ao fazer upload do QR Code para S3:', error);
    throw new Error(`Erro ao fazer upload do QR Code: ${error.message}`);
  }
};

/**
 * Deleta QR Code da pasta qrcodes do bucket principal
 */
export const deleteQRCodeFromMinIO = async (objectName: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
    });

    await s3Client.send(command);
    console.log(`QR Code deletado: ${objectName}`);
  } catch (error: any) {
    console.error('Erro ao deletar QR Code do S3:', error);
    throw new Error(`Erro ao deletar QR Code: ${error.message}`);
  }
};
