import QRCode from "qrcode";
import { env } from "../config/env";
import { uploadQRCodeToMinIO } from "../services/storage.service";

// Gera um código único para o QR
export const generateQRCode = (): string => {
  return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Gera QR Code como imagem e salva no Minio, retornando a URL
 */
export const generateQRCodeAndUpload = async (
  qrCode: string
): Promise<string> => {
  try {
    console.log(`[generateQRCodeAndUpload] Gerando QR code para: ${qrCode}`);
    
    // URL que o QR code irá redirecionar (formulário público)
    const qrUrl = `${env.FRONTEND_URL}/lead/new?qr=${qrCode}`;
    console.log(`[generateQRCodeAndUpload] QR URL: ${qrUrl}`);

    // Gera a imagem do QR code como buffer PNG
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    console.log(`[generateQRCodeAndUpload] Buffer gerado: ${qrBuffer.length} bytes`);

    // Faz upload do QR code para o Minio
    console.log(`[generateQRCodeAndUpload] Iniciando upload para S3...`);
    const qrCodeUrl = await uploadQRCodeToMinIO(qrBuffer, qrCode);
    console.log(`[generateQRCodeAndUpload] URL retornada: ${qrCodeUrl}`);

    return qrCodeUrl;
  } catch (error) {
    console.error("[generateQRCodeAndUpload] Erro ao gerar e fazer upload do QR Code:", error);
    throw new Error("Falha ao gerar QR Code");
  }
};

// Gera QR Code como base64 (para compatibilidade, se necessário)
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