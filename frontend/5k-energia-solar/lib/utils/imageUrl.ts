/**
 * Normaliza URLs de imagens
 * O backend agora retorna URLs completas via proxy, não é mais necessário processamento
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  // Backend já retorna URLs completas no formato:
  // https://api.exemplo.com/api/files/qrcodes/xxx.png
  return url || null;
}

/**
 * Normaliza uma pessoa com URLs de imagens
 * Mantido para compatibilidade, mas não faz mais transformações
 */
export function normalizePersonUrls<T extends { photoUrl?: string | null; qrCodeUrl?: string | null }>(
  person: T
): T {
  // Backend já retorna URLs prontas para uso
  return person;
}
