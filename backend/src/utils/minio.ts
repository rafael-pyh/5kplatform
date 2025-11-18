import { Client } from "minio";
import { env } from "../config/env";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
});

export const ensureBucket = async () => {
  const bucket = "uploads";
  try {
    const exists = await minioClient.bucketExists(bucket);
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
  
  // Retorna URL completa do MinIO
  return `${env.MINIO_PUBLIC_URL}/uploads/${fileName}`;
};