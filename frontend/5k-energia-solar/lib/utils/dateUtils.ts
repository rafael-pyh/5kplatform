/**
 * Utilitários para formatação de datas
 */

export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';

  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateOnly(date: string | Date | undefined): string {
  if (!date) return 'N/A';

  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
