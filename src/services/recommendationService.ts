import type { CategoryStat, GoogleBookItem, PatternDiscoveryResult } from '../types/book';
import { getReadBooks, getSavedBooks } from './storageService';
import { searchBooks } from './googleBooksApi';
import { normalizeCategoryName, getRecommendationSearchQuery } from '../utils/categoryUtils';

/**
 * Analisa os livros marcados como 'lido' e calcula a frequência de categorias
 */
export function analyzeReadingPatterns(): {
  totalRead: number;
  categories: CategoryStat[];
  primaryCategory: string | null;
  rawPrimaryCategory: string | null;
} {
  const readBooks = getReadBooks();
  
  if (readBooks.length === 0) {
    return {
      totalRead: 0,
      categories: [],
      primaryCategory: null,
      rawPrimaryCategory: null,
    };
  }

  const categoryCounts: Record<string, { count: number; rawCategory: string }> = {};
  let totalCategoryOccurrences = 0;

  readBooks.forEach((book) => {
    if (book.categories && book.categories.length > 0) {
      book.categories.forEach((cat) => {
        const normalized = normalizeCategoryName(cat);
        if (!categoryCounts[normalized]) {
          categoryCounts[normalized] = { count: 0, rawCategory: cat };
        }
        categoryCounts[normalized].count += 1;
        totalCategoryOccurrences += 1;
      });
    } else {
      const def = 'Ficção';
      if (!categoryCounts[def]) {
        categoryCounts[def] = { count: 0, rawCategory: 'Fiction' };
      }
      categoryCounts[def].count += 1;
      totalCategoryOccurrences += 1;
    }
  });

  const sortedCategories: CategoryStat[] = Object.entries(categoryCounts)
    .map(([displayName, data]) => ({
      name: data.rawCategory,
      displayName,
      count: data.count,
      percentage: Math.round((data.count / (totalCategoryOccurrences || 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  return {
    totalRead: readBooks.length,
    categories: sortedCategories,
    primaryCategory: topCategory ? topCategory.displayName : null,
    rawPrimaryCategory: topCategory ? topCategory.name : null,
  };
}

/**
 * Busca livros recomendados com base no padrão descoberto utilizando termos em Português
 * e validação estrita de idioma (igual ocorre na busca principal).
 */
export async function discoverBooksByPattern(selectedCategory?: string): Promise<PatternDiscoveryResult> {
  const pattern = analyzeReadingPatterns();
  const savedBooks = getSavedBooks();
  const savedIds = new Set(savedBooks.map((b) => b.id));
  const savedTitles = new Set(
    savedBooks.map((b) => (b.title || '').toLowerCase().trim())
  );

  const categoryToSearch =
    selectedCategory || pattern.primaryCategory || pattern.rawPrimaryCategory || 'Clássicos';
  const recomQuery = getRecommendationSearchQuery(categoryToSearch);

  try {
    // Busca na Google Books API usando texto livre e langRestrict=pt (mesmo motor de relevância da busca)
    const { items } = await searchBooks(recomQuery, 35, 0, 'pt');

    // Filtra livros que o usuário já salvou e garante resultados estritamente em português (pt-BR / pt / por)
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    let filteredRecommendations = (items || []).filter((item: GoogleBookItem) => {
      const id = item.id;
      const titleLower = (item.volumeInfo?.title || '').toLowerCase().trim();
      const lang = (item.volumeInfo?.language || '').toLowerCase().trim();

      // Idioma estritamente em português
      const isPortuguese = lang.startsWith('pt') || lang === 'por';
      const isSaved = savedIds.has(id) || savedTitles.has(titleLower);
      const isDuplicate = seenIds.has(id) || (titleLower && seenTitles.has(titleLower));

      if (isPortuguese && !isSaved && !isDuplicate) {
        seenIds.add(id);
        if (titleLower) seenTitles.add(titleLower);
        return true;
      }
      return false;
    });

    // Se o número de recomendações for baixo (< 4), busca fallback com query alternativa em português
    if (filteredRecommendations.length < 4) {
      const fallbackQuery = `livros de ${normalizeCategoryName(categoryToSearch)}`;
      const fbResponse = await searchBooks(fallbackQuery, 25, 0, 'pt');
      
      (fbResponse.items || []).forEach((item: GoogleBookItem) => {
        const id = item.id;
        const titleLower = (item.volumeInfo?.title || '').toLowerCase().trim();
        const lang = (item.volumeInfo?.language || '').toLowerCase().trim();
        const isPortuguese = lang.startsWith('pt') || lang === 'por';
        const isSaved = savedIds.has(id) || savedTitles.has(titleLower);
        const isDuplicate = seenIds.has(id) || (titleLower && seenTitles.has(titleLower));

        if (isPortuguese && !isSaved && !isDuplicate) {
          seenIds.add(id);
          if (titleLower) seenTitles.add(titleLower);
          filteredRecommendations.push(item);
        }
      });
    }

    return {
      hasReadBooks: pattern.totalRead > 0,
      totalReadBooks: pattern.totalRead,
      topCategories: pattern.categories,
      primaryCategory: pattern.primaryCategory || normalizeCategoryName(categoryToSearch),
      recommendedBooks: filteredRecommendations,
    };
  } catch (error) {
    console.error('Erro na descoberta por padrões:', error);
    return {
      hasReadBooks: pattern.totalRead > 0,
      totalReadBooks: pattern.totalRead,
      topCategories: pattern.categories,
      primaryCategory: pattern.primaryCategory,
      recommendedBooks: [],
    };
  }
}

