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
    // URL que o QR code irá redirecionar (formulário público)
    const qrUrl = `${env.FRONTEND_URL}/lead/new?qr=${qrCode}`;

    // Gera a imagem do QR code como buffer PNG
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Faz upload do QR code para o Minio
    const qrCodeUrl = await uploadQRCodeToMinIO(qrBuffer, qrCode);

    return qrCodeUrl;
  } catch (error) {
    throw new Error("Falha ao gerar QR Code");
  }
};

// Nota: QR codes são salvos exclusivamente como URLs S3
// Removidos: generateQRCodeBase64, getQRCodeBase64ByCode