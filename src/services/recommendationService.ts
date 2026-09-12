import type { CategoryStat, GoogleBookItem, PatternDiscoveryResult } from '../types/book';
import { getReadBooks, getSavedBooks } from './storageService';
import { searchBooksBySubject } from './googleBooksApi';
import { normalizeCategoryName, getSearchSubjectTerm } from '../utils/categoryUtils';

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
 * Busca livros recomendados com base no padrão descoberto
 */
export async function discoverBooksByPattern(selectedCategory?: string): Promise<PatternDiscoveryResult> {
  const pattern = analyzeReadingPatterns();
  const savedBooks = getSavedBooks();
  const savedIds = new Set(savedBooks.map((b) => b.id));
  const savedTitles = new Set(savedBooks.map((b) => b.title.toLowerCase().trim()));

  if (!pattern.primaryCategory && !selectedCategory) {
    return {
      hasReadBooks: false,
      totalReadBooks: 0,
      topCategories: [],
      primaryCategory: null,
      recommendedBooks: [],
    };
  }

  const categoryToSearch = selectedCategory || pattern.primaryCategory || pattern.rawPrimaryCategory || 'Ficção';
  const searchTerm = getSearchSubjectTerm(categoryToSearch);

  try {
    const { items } = await searchBooksBySubject(searchTerm, 30, 0, 'pt-BR');
    
    // Filtra livros que o usuário já salvou e garante resultados em português (pt-BR / pt)
    const filteredRecommendations = (items || []).filter((item: GoogleBookItem) => {
      const isSavedId = savedIds.has(item.id);
      const isSavedTitle = savedTitles.has((item.volumeInfo.title || '').toLowerCase().trim());
      const lang = (item.volumeInfo.language || '').toLowerCase().trim();
      const isPortuguese = !lang || lang.startsWith('pt') || lang === 'por';
      return !isSavedId && !isSavedTitle && isPortuguese;
    });

    return {
      hasReadBooks: pattern.totalRead > 0,
      totalReadBooks: pattern.totalRead,
      topCategories: pattern.categories,
      primaryCategory: pattern.primaryCategory,
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
