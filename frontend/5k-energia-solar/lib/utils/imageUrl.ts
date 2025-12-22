/**
 * Normaliza URLs de imagens (base64)
 * Todas as imagens agora vêm como URLs S3 do backend
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  // Backend retorna URLs S3:
  // https://f005.backblazeb2.com/file/5k-storage/...
  return url || null;
}

/**
 * Verifica se uma string é uma URL HTTP/HTTPS válida (S3)
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Valida se um QR code é válido para uso
 * QR codes agora são salvos APENAS como URLs S3 HTTP/HTTPS
 */
export function isValidQRCode(qrCode: string | null | undefined): boolean {
  if (!qrCode) return false;
  return isValidUrl(qrCode);
}

/**
 * Normaliza uma pessoa com URLs S3
 * QR codes agora são URLs S3 públicas
 */
export function normalizePersonUrls<T extends { 
  photoBase64?: string | null; 
  qrCodeUrl?: string | null;
}>(
  person: T
): T {
  // Backend retorna dados prontos para uso:
  // - photoBase64: data URL base64 da foto de perfil (opcional, compatibilidade)
  // - qrCodeUrl: URL S3 pública do QR code
  return person;
}

/**
 * Converte uma URL S3/B2 para usar o proxy de imagem
 * 
 * Isso resolve problemas de CORS quando imagens são usadas em Canvas
 * 
 * Antes: https://f005.backblazeb2.com/file/5k-storage/qrcodes/...
 * Depois: /api/image-proxy?url=https://f005.backblazeb2.com/file/5k-storage/qrcodes/...
 */
export function proxyImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Se já é uma URL de proxy, retorna como está
  if (imageUrl.includes('/api/image-proxy')) {
    return imageUrl;
  }
  
  // Se é uma URL S3/B2, converte para proxy
  if (imageUrl.includes('backblazeb2.com') || imageUrl.includes('amazonaws.com')) {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    console.log('[proxyImageUrl] Convertendo para proxy:', proxyUrl);
    return proxyUrl;
  }
  
  // Se é data URL, retorna como está (não precisa proxy)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Fallback: retorna URL original
  return imageUrl;
}
