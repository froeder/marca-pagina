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
  'classics': 'Clássicos',
  'literary': 'Literatura',
  'literature': 'Literatura',
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
  const normalized = normalizeCategoryName(category);
  if (normalized && normalized !== 'Geral') {
    return normalized;
  }
  // Remove caracteres especiais que podem quebrar a query
  const clean = category.split('/')[0].trim();
  return clean;
}

/**
 * Retorna uma paleta de cor temática para categorias
 */
export function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  const normalized = normalizeCategoryName(category).toLowerCase();
  
  if (normalized.includes('ficção') || normalized.includes('fantasia')) {
    return { bg: 'bg-[#F7EBE5] text-[#8C381B]', text: 'text-[#8C381B]', border: 'border-[#ECD5C8]' };
  }
  if (normalized.includes('tecnologia') || normalized.includes('comput')) {
    return { bg: 'bg-[#EDEBE8] text-[#4A423B]', text: 'text-[#4A423B]', border: 'border-[#DDD8D1]' };
  }
  if (normalized.includes('filosofia') || normalized.includes('história')) {
    return { bg: 'bg-[#FAF1DF] text-[#87581B]', text: 'text-[#87581B]', border: 'border-[#EEDDBF]' };
  }
  if (normalized.includes('desenvolvimento') || normalized.includes('psicologia')) {
    return { bg: 'bg-[#F0F4EC] text-[#4B6B38]', text: 'text-[#4B6B38]', border: 'border-[#DCE5D3]' };
  }
  if (normalized.includes('negócios') || normalized.includes('economia')) {
    return { bg: 'bg-[#F4ECE3] text-[#784B20]', text: 'text-[#784B20]', border: 'border-[#E5D7C7]' };
  }
  if (normalized.includes('biografia')) {
    return { bg: 'bg-[#FDF0E2] text-[#9A551E]', text: 'text-[#9A551E]', border: 'border-[#F6DCBF]' };
  }
  if (normalized.includes('ciência')) {
    return { bg: 'bg-[#EDF4F1] text-[#346554]', text: 'text-[#346554]', border: 'border-[#D4E5DF]' };
  }
  if (normalized.includes('terror') || normalized.includes('suspense')) {
    return { bg: 'bg-[#F9ECEC] text-[#8A3333]', text: 'text-[#8A3333]', border: 'border-[#F0D0D0]' };
  }
  
  return { bg: 'bg-[#F4ECE1] text-[#5F442A]', text: 'text-[#5F442A]', border: 'border-[#E6D7C3]' };
}
