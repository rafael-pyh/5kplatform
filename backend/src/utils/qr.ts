import QRCode from "qrcode";
import { minioClient } from "./minio";
import { env } from "../config/env";
import { Readable } from "stream";

// Gera um código único para o QR
export const generateQRCode = (): string => {
  return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Gera QR Code como base64 (sem armazenar no MinIO)
export const generateQRCodeBase64 = async (
  qrCode: string
): Promise<string> => {
  try {
    // URL que o QR code irá redirecionar (formulário público)
    const qrUrl = `${env.FRONTEND_URL}/lead/new?qr=${qrCode}`;

    // Gera a imagem do QR code como data URL (base64)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    throw new Error("Falha ao gerar QR Code");
  }
};

// Gera a imagem do QR Code e faz upload para o MinIO
export const generateQRCodeImage = async (
  qrCode: string,
  personId: string
): Promise<string> => {
  try {
    // URL que o QR code irá redirecionar (formulário público)
    const qrUrl = `${env.FRONTEND_URL}/lead/new?qr=${qrCode}`;

    // Gera a imagem do QR code como buffer
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Nome do arquivo no MinIO
    const fileName = `qrcodes/${personId}-${qrCode}.png`;

    // Converte buffer para stream
    const stream = Readable.from(qrBuffer);

    // Faz upload para o MinIO
    await minioClient.putObject("uploads", fileName, stream, qrBuffer.length, {
      "Content-Type": "image/png",
    });

    // Retorna apenas o caminho do arquivo (será servido via backend)
    return fileName;
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    throw new Error("Falha ao gerar QR Code");
  }
};

// Gera QR Code base64 a partir de um código QR existente
export const getQRCodeBase64ByCode = async (
  qrCode: string
): Promise<string> => {
  try {
    const qrUrl = `${env.FRONTEND_URL}/lead/new?qr=${qrCode}`;
    
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    throw new Error("Falha ao gerar QR Code");
  }
};