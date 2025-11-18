/**
 * Normaliza URLs de imagens do MinIO
 * Converte caminhos relativos em URLs absolutas
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Se já é uma URL completa, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Se é um caminho relativo, adiciona o domínio do MinIO
  const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  
  // Remove barra inicial se existir para evitar dupla barra
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  return `${MINIO_URL}/${cleanPath}`;
}

/**
 * Normaliza uma pessoa com URLs de imagens corretas
 */
export function normalizePersonUrls<T extends { photoUrl?: string | null; qrCodeUrl?: string | null }>(
  person: T
): T {
  return {
    ...person,
    photoUrl: normalizeImageUrl(person.photoUrl),
    qrCodeUrl: normalizeImageUrl(person.qrCodeUrl),
  };
}
