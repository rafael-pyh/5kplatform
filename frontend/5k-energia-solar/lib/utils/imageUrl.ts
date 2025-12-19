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
 * Verifica se uma string é uma data URL válida
 */
export function isDataUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  return str.startsWith('data:image/');
}

/**
 * Verifica se uma string é uma URL HTTP/HTTPS válida
 */
export function isHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * Valida se um QR code é válido para uso
 * Pode ser data URL base64 ou URL HTTP/HTTPS
 */
export function isValidQRCode(qrCode: string | null | undefined): boolean {
  if (!qrCode) return false;
  return isDataUrl(qrCode) || isHttpUrl(qrCode);
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
  // - qrCodeBase64: data URL base64 do QR code OU URL S3
  return person;
}
