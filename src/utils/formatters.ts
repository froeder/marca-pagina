export function formatAuthors(authors?: string[]): string {
  if (!authors || authors.length === 0) return 'Autor desconhecido';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} e outros (${authors.length})`;
}

export function formatYear(dateString?: string): string {
  if (!dateString) return '';
  return dateString.substring(0, 4);
}

export function truncateText(text?: string, maxLength = 160): string {
  if (!text) return '';
  // Remove tags HTML se vierem da API
  const clean = text.replace(/<[^>]*>?/gm, '');
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}

export function getStatusLabel(status: 'lido' | 'lendo' | 'quero_ler'): string {
  switch (status) {
    case 'lido':
      return 'Lido';
    case 'lendo':
      return 'Lendo';
    case 'quero_ler':
      return 'Quero Ler';
  }
}
