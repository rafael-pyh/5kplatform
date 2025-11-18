import "dotenv/config";

export const env = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "minio",
  MINIO_PORT: parseInt(process.env.MINIO_PORT || "9000"),
  MINIO_ROOT_USER: process.env.MINIO_ROOT_USER || "minio",
  MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD || "minio123",
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",
  MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL || "http://localhost:9000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};