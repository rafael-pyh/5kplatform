import { s3Client } from '../utils/minio';
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadBucketCommand,
  CreateBucketCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.S3_BUCKET || 'images';
const QRCODE_BUCKET_NAME = process.env.S3_QRCODE_BUCKET || 'qrcodes';
const S3_URL = process.env.S3_URL || process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';

/**
 * Verifica se um bucket existe
 */
const bucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NoSuchBucket') {
      return false;
    }
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
    console.error(`Erro ao criar bucket '${bucketName}':`, error.message);
    throw error;
  }
};

/**
 * Inicializa os buckets do S3 se não existirem
 */
export const initializeMinIOBucket = async () => {
  try {
    console.log('🔄 Verificando e criando buckets do S3...\n');
    
    // Cria buckets se não existirem
    await createBucketIfNotExists(BUCKET_NAME);
    await createBucketIfNotExists(QRCODE_BUCKET_NAME);
    
    console.log(`\n✅ S3 está configurado e pronto para uso`);
    console.log(`📁 Bucket de imagens: ${BUCKET_NAME}`);
    console.log(`📁 Bucket de QR codes: ${QRCODE_BUCKET_NAME}`);
  } catch (error) {
    console.error('Erro ao inicializar S3:', error);
    throw error;
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
    const fileUrl = `${S3_URL}/${BUCKET_NAME}/${objectName}`;
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
 * Faz upload de QR Code (imagem) para o bucket específico de QR codes
 */
export const uploadQRCodeToMinIO = async (
  buffer: Buffer,
  qrCodeId: string
): Promise<string> => {
  try {
    // Garante que o bucket de QR codes existe
    await createBucketIfNotExists(QRCODE_BUCKET_NAME);
    
    const objectName = `qrcodes/${qrCodeId}.png`;

    const command = new PutObjectCommand({
      Bucket: QRCODE_BUCKET_NAME,
      Key: objectName,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    // Retorna a URL pública do arquivo
    const fileUrl = `${S3_URL}/${QRCODE_BUCKET_NAME}/${objectName}`;
    return fileUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload do QR Code para S3:', error);
    throw new Error(`Erro ao fazer upload do QR Code: ${error.message}`);
  }
};

/**
 * Deleta QR Code do bucket específico
 */
export const deleteQRCodeFromMinIO = async (objectName: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: QRCODE_BUCKET_NAME,
      Key: objectName,
    });

    await s3Client.send(command);
    console.log(`QR Code deletado: ${objectName}`);
  } catch (error: any) {
    console.error('Erro ao deletar QR Code do S3:', error);
    throw new Error(`Erro ao deletar QR Code: ${error.message}`);
  }
};
