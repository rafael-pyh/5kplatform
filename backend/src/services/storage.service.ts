import minioClient from '../utils/minio';

const BUCKET_NAME = process.env.MINIO_BUCKET || 'images';
const QRCODE_BUCKET_NAME = process.env.MINIO_QRCODE_BUCKET || 'qrcodes';
const MINIO_URL = process.env.MINIO_URL || 'http://localhost:9000';

/**
 * Inicializa os buckets do MinIO se não existirem
 */
export const initializeMinIOBucket = async () => {
  try {
    // Inicializa bucket de imagens
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket '${BUCKET_NAME}' criado com sucesso`);
      
      // Define a política de acesso público para visualizar imagens
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: '*',
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`Política de acesso público configurada para '${BUCKET_NAME}'`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' já existe`);
    }

    // Inicializa bucket de QR codes
    const qrcodeBucketExists = await minioClient.bucketExists(QRCODE_BUCKET_NAME);
    
    if (!qrcodeBucketExists) {
      await minioClient.makeBucket(QRCODE_BUCKET_NAME, 'us-east-1');
      console.log(`Bucket '${QRCODE_BUCKET_NAME}' criado com sucesso`);
      
      // Define a política de acesso público para visualizar QR codes
      const qrcodePolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: '*',
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${QRCODE_BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(QRCODE_BUCKET_NAME, JSON.stringify(qrcodePolicy));
      console.log(`Política de acesso público configurada para '${QRCODE_BUCKET_NAME}'`);
    } else {
      console.log(`Bucket '${QRCODE_BUCKET_NAME}' já existe`);
    }
  } catch (error) {
    console.error('Erro ao inicializar buckets do MinIO:', error);
    throw error;
  }
};

/**
 * Faz upload de arquivo para MinIO
 */
export const uploadFileToMinIO = async (
  file: Express.Multer.File,
  fileName: string,
  folderName: string = 'uploads'
): Promise<string> => {
  try {
    const objectName = `${folderName}/${Date.now()}-${fileName}`;
    const fileSize = file.buffer.length;

    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      file.buffer,
      fileSize,
      {
        'Content-Type': file.mimetype,
      }
    );

    // Retorna a URL pública do arquivo
    const fileUrl = `${MINIO_URL}/${BUCKET_NAME}/${objectName}`;
    return fileUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload para MinIO:', error);
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
  }
};

/**
 * Faz download de arquivo do MinIO e retorna como Base64
 */
export const downloadFileAsBase64 = async (objectName: string): Promise<string> => {
  try {
    const buffer = await new Promise<Buffer>(async (resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = await minioClient.getObject(BUCKET_NAME, objectName);

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });

    const base64Data = buffer.toString('base64');
    const ext = objectName.split('.').pop() || 'bin';
    const mimeType = getMimeType(ext);

    return `data:${mimeType};base64,${base64Data}`;
  } catch (error: any) {
    console.error('Erro ao baixar arquivo do MinIO:', error);
    throw new Error(`Erro ao recuperar arquivo: ${error.message}`);
  }
};

/**
 * Deleta arquivo do MinIO
 */
export const deleteFileFromMinIO = async (objectName: string): Promise<void> => {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
    console.log(`Arquivo deletado: ${objectName}`);
  } catch (error: any) {
    console.error('Erro ao deletar arquivo do MinIO:', error);
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
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      objectName,
      expirySeconds
    );
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
    const objectName = `qrcodes/${qrCodeId}.png`;
    const fileSize = buffer.length;

    await minioClient.putObject(
      QRCODE_BUCKET_NAME,
      objectName,
      buffer,
      fileSize,
      {
        'Content-Type': 'image/png',
      }
    );

    // Retorna a URL pública do arquivo
    const fileUrl = `${MINIO_URL}/${QRCODE_BUCKET_NAME}/${objectName}`;
    return fileUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload do QR Code para MinIO:', error);
    throw new Error(`Erro ao fazer upload do QR Code: ${error.message}`);
  }
};

/**
 * Deleta QR Code do bucket específico
 */
export const deleteQRCodeFromMinIO = async (objectName: string): Promise<void> => {
  try {
    await minioClient.removeObject(QRCODE_BUCKET_NAME, objectName);
    console.log(`QR Code deletado: ${objectName}`);
  } catch (error: any) {
    console.error('Erro ao deletar QR Code do MinIO:', error);
    throw new Error(`Erro ao deletar QR Code: ${error.message}`);
  }
};
