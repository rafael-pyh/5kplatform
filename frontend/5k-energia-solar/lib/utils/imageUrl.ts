/**
 * Normaliza URLs de imagens
 * QR codes agora são base64, fotos continuam com URLs do backend
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  // Backend retorna URLs completas para fotos:
  // https://api.exemplo.com/api/files/photos/xxx.png
  // QR codes vêm como base64: data:image/png;base64,...
  return url || null;
}

/**
 * Normaliza uma pessoa com URLs de imagens
 * QR codes agora vêm como qrCodeBase64, não mais qrCodeUrl
 */
export function normalizePersonUrls<T extends { 
  photoUrl?: string | null; 
  qrCodeUrl?: string | null;
  qrCodeBase64?: string | null;
}>(
  person: T
): T {
  // Backend já retorna dados prontos para uso:
  // - photoUrl: URL completa para foto de perfil
  // - qrCodeBase64: data URL base64 do QR code
  return person;
}
