import { getPublicUrl } from "../utils/minio";
import { getQRCodeBase64ByCode } from "../utils/qr";

/**
 * Transforma URLs de arquivos do MinIO para URLs do backend (proxy)
 * E gera QR code como base64
 */
export const transformPersonUrls = async <T extends { 
  photoUrl?: string | null; 
  qrCodeUrl?: string | null;
  qrCode?: string;
  id?: string;
}>(
  person: T
): Promise<T & { qrCodeBase64?: string }> => {
  const result: any = {
    ...person,
    photoUrl: person.photoUrl ? getPublicUrl(person.photoUrl) : null,
  };

  // Gera QR code como base64 se tiver o código
  if (person.qrCode) {
    try {
      result.qrCodeBase64 = await getQRCodeBase64ByCode(person.qrCode);
    } catch (error) {
      console.error("Erro ao gerar QR Code base64:", error);
      result.qrCodeBase64 = null;
    }
  }

  // Remove qrCodeUrl pois não é mais necessário
  delete result.qrCodeUrl;

  return result;
};

/**
 * Transforma URLs de uma lista de pessoas
 */
export const transformPersonsUrls = async <T extends { 
  photoUrl?: string | null; 
  qrCodeUrl?: string | null;
  qrCode?: string;
  id?: string;
}>(
  persons: T[]
): Promise<Array<T & { qrCodeBase64?: string }>> => {
  return Promise.all(persons.map(person => transformPersonUrls(person)));
};
