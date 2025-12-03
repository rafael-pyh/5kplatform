/**
 * Normaliza URLs de imagens (base64)
 * Todas as imagens agora vêm como base64 do backend
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  // Backend retorna base64 para todas as imagens:
  // data:image/png;base64,...
  return url || null;
}

/**
 * Normaliza uma pessoa com imagens base64
 * Todas as imagens agora são base64
 */
export function normalizePersonUrls<T extends { 
  photoBase64?: string | null; 
  qrCodeBase64?: string | null;
}>(
  person: T
): T {
  // Backend já retorna dados prontos para uso:
  // - photoBase64: data URL base64 da foto de perfil
  // - qrCodeBase64: data URL base64 do QR code
  return person;
}
