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
  // Se S3_URL está configurado explicitamente, usa ele
  if (process.env.S3_URL && process.env.S3_URL !== S3_ENDPOINT) {
    return `${process.env.S3_URL}/${key}`;
  }
  
  // Detecta se é Backblaze B2
  if (S3_ENDPOINT.includes('backblazeb2.com')) {
    // Para B2, usa a URL S3 compatível
    // Exemplo: https://5k-storage.s3.us-east-005.backblazeb2.com/key
    return `https://${BUCKET_NAME}.s3.${S3_REGION}.backblazeb2.com/${key}`;
  }
  
  // Para AWS S3
  if (S3_ENDPOINT.includes('amazonaws.com') || S3_ENDPOINT === 'https://s3.amazonaws.com') {
    return `https://${BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
  }
  
  // Fallback: tenta construir com o endpoint
  const cleanEndpoint = S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${cleanEndpoint}/${BUCKET_NAME}/${key}`;
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
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Retorna a URL pública do arquivo
    const fileUrl = buildPublicUrl(objectName);
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
    // Garante que o bucket principal existe
    await createBucketIfNotExists(BUCKET_NAME);
    
    const objectName = `qrcodes/${qrCodeId}.png`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    // Retorna a URL pública do arquivo
    const fileUrl = buildPublicUrl(objectName);
    return fileUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload do QR Code para S3:', error);
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
