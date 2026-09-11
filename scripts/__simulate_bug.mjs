// Simulação isolada da lógica de addOrUpdateFromGoogleBook do storageService.ts
// para comprovar o cenário de perda de dados ao alterar o status de um livro já salvo.
const existing = {
  id: 'abc',
  title: 'Dom Casmurro',
  authors: ['Machado de Assis'],
  thumbnail: '',
  description: '',
  categories: ['Fiction'],
  status: 'lido',
  userRating: 5,
  userNotes: 'Obra-prima',
  dateAdded: '2026-01-10T10:00:00.000Z',
  dateFinished: '2026-01-20T18:30:00.000Z',
  favorite: true,
};

const googleBook = {
  id: 'abc',
  volumeInfo: {
    title: 'Dom Casmurro',
    authors: ['Machado de Assis'],
    imageLinks: {},
  },
};

// status='lendo', rating/notes undefined (é como SearchPage/DiscoverPage chamam)
function addOrUpdateFromGoogleBook(googleBook, status = 'quero_ler', rating, notes) {
  const thumbnail = googleBook.volumeInfo.imageLinks?.thumbnail || '';
  const bookData = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title || 'Sem título',
    authors: googleBook.volumeInfo.authors || ['Autor desconhecido'],
    thumbnail,
    description: googleBook.volumeInfo.description || '',
    categories: googleBook.volumeInfo.categories || ['Fiction'],
    status,
    userRating: rating,
    userNotes: notes,
    dateAdded: existing.dateAdded,
    dateFinished: status === 'lido' ? new Date().toISOString() : undefined,
    favorite: existing.favorite,
  };
  return { ...existing, ...bookData };
}

const result = addOrUpdateFromGoogleBook(googleBook, 'lendo');
console.log('Após marcar livro salvo como "lendo" vindo da busca:');
console.log('  userRating antes :', existing.userRating, '-> depois:', result.userRating, '(apagado:', result.userRating === undefined, ')');
console.log('  userNotes antes  :', JSON.stringify(existing.userNotes), '-> depois:', result.userNotes, '(apagado:', result.userNotes === undefined, ')');
console.log('  dateFinished antes:', existing.dateFinished, '-> depois:', result.dateFinished, '(apagado:', result.dateFinished === undefined, ')');