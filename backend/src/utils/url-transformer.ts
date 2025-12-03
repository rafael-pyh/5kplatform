import { getPublicUrl } from "../utils/minio";

/**
 * Transforma URLs de arquivos do MinIO para URLs do backend (proxy)
 * Utilizado para objetos Person que possuem photoUrl e qrCodeUrl
 */
export const transformPersonUrls = <T extends { photoUrl?: string | null; qrCodeUrl?: string | null }>(
  person: T
): T => {
  return {
    ...person,
    photoUrl: person.photoUrl ? getPublicUrl(person.photoUrl) : null,
    qrCodeUrl: person.qrCodeUrl ? getPublicUrl(person.qrCodeUrl) : null,
  };
};

/**
 * Transforma URLs de uma lista de pessoas
 */
export const transformPersonsUrls = <T extends { photoUrl?: string | null; qrCodeUrl?: string | null }>(
  persons: T[]
): T[] => {
  return persons.map(person => transformPersonUrls(person));
};
