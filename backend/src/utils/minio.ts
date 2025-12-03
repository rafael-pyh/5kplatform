import { Client } from "minio";
import { env } from "../config/env";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL === true,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
});

export const ensureBucket = async () => {
  const bucket = "uploads";
  try {
    const exists = await minioClient.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await minioClient.makeBucket(bucket, "us-east-1");
      
      // Define política pública para leitura de arquivos
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    }
    console.log("✅ Bucket MinIO pronto:", bucket);
  } catch (error) {
    console.error("❌ Erro ao configurar bucket MinIO:", error);
  }
};

// Upload de arquivo genérico
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const fileName = `${folder}/${Date.now()}-${file.originalname}`;
  
  await minioClient.putObject(
    "uploads",
    fileName,
    file.buffer,
    file.size,
    {
      "Content-Type": file.mimetype,
    }
  );
  
  // Retorna caminho relativo que será servido pelo backend
  return fileName;
};

// Extrai o caminho do arquivo de uma URL
export const extractFilePathFromUrl = (url: string): string => {
  // Remove a URL base e mantém apenas o caminho do arquivo
  const urlObj = new URL(url);
  return urlObj.pathname.replace(/^\/uploads\//, '');
};

// Busca um arquivo do MinIO e retorna o stream
export const getFileStream = async (filePath: string) => {
  return await minioClient.getObject("uploads", filePath);
};

// Gera URL pública para acessar arquivo via backend (proxy)
export const getPublicUrl = (filePath: string): string => {
  // Remove possíveis barras iniciais
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  // Se API_URL não estiver definido, usa localhost para desenvolvimento
  const apiUrl = env.API_URL || `http://localhost:${env.PORT}`;
  
  return `${apiUrl}/api/files/${cleanPath}`;
};