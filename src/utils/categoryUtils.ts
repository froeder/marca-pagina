/**
 * Mapeamento de categorias comuns do Google Books para Português amigável
 */
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'fiction': 'Ficção',
  'science fiction': 'Ficção Científica',
  'fantasy': 'Fantasia',
  'dystopian': 'Distopia',
  'romance': 'Romance',
  'thriller': 'Suspense & Thriller',
  'mystery': 'Mistério & Policial',
  'horror': 'Terror & Horror',
  'biography & autobiography': 'Biografia & Memórias',
  'biography': 'Biografia',
  'history': 'História',
  'philosophy': 'Filosofia',
  'psychology': 'Psicologia',
  'self-help': 'Desenvolvimento Pessoal',
  'business & economics': 'Negócios & Economia',
  'computers': 'Tecnologia & Programação',
  'science': 'Ciência',
  'social science': 'Ciências Sociais',
  'political science': 'Ciência Política',
  'art': 'Arte & Design',
  'poetry': 'Poesia',
  'drama': 'Teatro & Drama',
  'juvenile fiction': 'Ficção Juvenil',
  'young adult fiction': 'Jovem Adulto (YA)',
  'comics & graphic novels': 'Quadrinhos & Mangás',
  'education': 'Educação',
  'health & fitness': 'Saúde & Bem-estar',
  'religion': 'Religião & Espiritualidade',
  'cooking': 'Gastronomia & Culinária',
  'travel': 'Viagens & Turismo',
};

/**
 * Normaliza e traduz o nome de uma categoria
 */
export function normalizeCategoryName(rawCategory: string): string {
  if (!rawCategory) return 'Geral';

  // O Google muitas vezes retorna categorias compostas como "Fiction / Science Fiction / Space Opera"
  const mainPart = rawCategory.split('/')[0].trim().toLowerCase();
  
  if (CATEGORY_TRANSLATIONS[mainPart]) {
    return CATEGORY_TRANSLATIONS[mainPart];
  }

  // Tenta pelo texto completo
  const fullLower = rawCategory.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (fullLower.includes(key)) {
      return value;
    }
  }

  // Se não houver tradução, formata com a primeira letra maiúscula
  return rawCategory.split('/')[0].trim();
}

/**
 * Retorna o termo de busca ideal para consulta na Google Books API (ex: subject:{categoria})
 */
export function getSearchSubjectTerm(category: string): string {
  // Remove caracteres especiais que podem quebrar a query
  const clean = category.split('/')[0].trim();
  // Se contiver espaços, podemos colocar entre aspas ou usar a própria palavra
  return clean;
}

/**
 * Retorna uma paleta de cor temática para categorias
 */
export function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  const normalized = normalizeCategoryName(category).toLowerCase();
  
  if (normalized.includes('ficção') || normalized.includes('fantasia')) {
    return { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' };
  }
  if (normalized.includes('tecnologia') || normalized.includes('comput')) {
    return { bg: 'bg-cyan-50 text-cyan-700', text: 'text-cyan-700', border: 'border-cyan-200' };
  }
  if (normalized.includes('filosofia') || normalized.includes('história')) {
    return { bg: 'bg-amber-50 text-amber-800', text: 'text-amber-800', border: 'border-amber-200' };
  }
  if (normalized.includes('desenvolvimento') || normalized.includes('psicologia')) {
    return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (normalized.includes('negócios') || normalized.includes('economia')) {
    return { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' };
  }
  if (normalized.includes('biografia')) {
    return { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', border: 'border-orange-200' };
  }
  if (normalized.includes('ciência')) {
    return { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', border: 'border-teal-200' };
  }
  if (normalized.includes('terror') || normalized.includes('suspense')) {
    return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' };
  }
  
  return { bg: 'bg-stone-100 text-stone-700', text: 'text-stone-700', border: 'border-stone-200' };
}
