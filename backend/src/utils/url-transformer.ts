/**
 * Transformações de Person não são mais necessárias
 * Todas as imagens agora são base64 direto do banco
 */
export const transformPersonUrls = <T extends any>(person: T): T => {
  // Apenas retorna o objeto sem transformações
  // Base64 já vem do banco de dados
  return person;
};

/**
 * Transformações de lista de pessoas
 */
export const transformPersonsUrls = <T extends any>(persons: T[]): T[] => {
  // Apenas retorna o array sem transformações
  return persons;
};
