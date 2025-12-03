import QRCode from "qrcode";
import { env } from "../config/env";

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