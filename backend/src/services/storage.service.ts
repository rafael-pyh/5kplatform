import { s3Client } from '../utils/minio';
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadBucketCommand,
  CreateBucketCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from 'sharp';

const BUCKET_NAME = process.env.S3_BUCKET || '5k-storage';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

/**
 * Constrói a URL pública do arquivo baseado no endpoint e bucket
 */
const buildPublicUrl = (key: string): string => {
  // PRIORIDADE MÁXIMA: S3_URL deve ser usado SEMPRE se configurado
  const s3Url = process.env.S3_URL;
  
  if (s3Url && s3Url.trim().length > 0) {
    const baseUrl = s3Url.replace(/\/$/, ''); // Remove trailing slash
    
    // Se já inclui /file/{bucket}, apenas concatenar a key
    if (baseUrl.includes('/file/')) {
      return `${baseUrl}/${key}`;
    } else {
      // Se é apenas a base, adicionar /file/{bucket}
      return `${baseUrl}/file/${BUCKET_NAME}/${key}`;
    }
  }
  
  // PRIORITY 2: Detecta se é Backblaze B2 via endpoint
  if (S3_ENDPOINT.includes('backblazeb2.com')) {
    const fileHost = 'f005.backblazeb2.com';
    return `https://${fileHost}/file/${BUCKET_NAME}/${key}`;
  }
  
  // PRIORITY 3: Para AWS S3
  if (S3_ENDPOINT.includes('amazonaws.com') || S3_ENDPOINT === 'https://s3.amazonaws.com') {
    return `https://${BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
  }
  
  // FALLBACK: tenta construir com o endpoint
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
    }
  } catch (error: any) {
    console.warn(`⚠️  Não foi possível criar bucket '${bucketName}': ${error.message}`);
    // Não relança o erro - permite que a app continue
    // O bucket pode já existir ou as permissões podem estar limitadas
  }
};

/**
 * Inicializa o bucket do S3 se não existir
 */
export const initializeMinIOBucket = async () => {
  try {
    // Cria o bucket principal se não existir
    await createBucketIfNotExists(BUCKET_NAME);
  } catch (error) {
    console.warn('⚠️  Erro ao inicializar S3:', error);
    // Não relança - continua mesmo que a criação de buckets falhe
  }
};

/**
 * Faz upload de arquivo para S3 com compressão de imagens
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
    
    // Detecta se é uma imagem
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const isImage = imageExtensions.includes(fileExtension);
    let fileBuffer = file.buffer;
    let contentType = file.mimetype;
    
    // Comprime imagem se for arquivo de imagem
    if (isImage) {
      try {
        let sharpInstance = sharp(file.buffer);
        
        // Auto-rotaciona baseado em EXIF metadata
        sharpInstance = sharpInstance.rotate();
        
        // Redimensiona para máximo de 1200x1200px
        sharpInstance = sharpInstance.resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        
        // Aplica compressão específica por tipo
        if (fileExtension === 'png') {
          // PNG: 8-bit color
          sharpInstance = sharpInstance.png({ 
            compressionLevel: 9,
            palette: true,
          });
        } else if (fileExtension === 'webp') {
          // WebP: quality 80
          sharpInstance = sharpInstance.webp({ quality: 80 });
        } else {
          // JPEG/JPG: quality 80
          sharpInstance = sharpInstance.jpeg({ quality: 80 });
        }
        
        fileBuffer = await sharpInstance.toBuffer();
      } catch (compressionError) {
        console.warn(`[uploadFileToMinIO] ⚠️  Erro ao comprimir imagem, usando original:`, compressionError);
        // Continua com o arquivo original se a compressão falhar
      }
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Retorna a URL pública do arquivo
    return buildPublicUrl(objectName);
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
  } catch (error: any) {
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
    return buildPublicUrl(objectName);
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Erro ao deletar QR Code do S3:', error);
    throw new Error(`Erro ao deletar QR Code: ${error.message}`);
  }
};
