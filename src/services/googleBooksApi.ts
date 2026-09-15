import type { GoogleBookItem, GoogleBooksResponse } from '../types/book';
import { sanitizeImageUrl } from '../utils/imageUtils';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Obtém a chave da API do Google Books configurada no localStorage ou nas variáveis de ambiente.
 */
export function getApiKey(): string {
  const localKey = localStorage.getItem('marca_pagina_api_key');
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  return (import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string) || '';
}

/**
 * Salva uma nova chave da API no localStorage
 */
export function setApiKey(key: string): void {
  localStorage.setItem('marca_pagina_api_key', key.trim());
}

/**
 * Constrói a URL completa adicionando a chave se existente e configurando hl=pt-BR e printType=books por padrão
 */
function buildUrl(endpoint: string, params: Record<string, string | number>): string {
  const url = new URL(endpoint);
  
  // Define o idioma de interface/metadados como pt-BR por padrão
  if (!params.hl) {
    url.searchParams.append('hl', 'pt-BR');
  }

  // Define tipo de impressão como books para evitar revistas/periódicos (ex: Trip, Placar)
  if (!params.printType) {
    url.searchParams.append('printType', 'books');
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const apiKey = getApiKey();
  if (apiKey) {
    url.searchParams.append('key', apiKey);
  }

  return url.toString();
}

/**
 * Sanitiza todos os itens de livros retornados da API
 */
function sanitizeBookItem(item: GoogleBookItem): GoogleBookItem {
  if (!item.volumeInfo) {
    return item;
  }

  const imageLinks = item.volumeInfo.imageLinks ? {
    ...item.volumeInfo.imageLinks,
    smallThumbnail: sanitizeImageUrl(item.volumeInfo.imageLinks.smallThumbnail),
    thumbnail: sanitizeImageUrl(item.volumeInfo.imageLinks.thumbnail),
    small: sanitizeImageUrl(item.volumeInfo.imageLinks.small),
    medium: sanitizeImageUrl(item.volumeInfo.imageLinks.medium),
    large: sanitizeImageUrl(item.volumeInfo.imageLinks.large),
    extraLarge: sanitizeImageUrl(item.volumeInfo.imageLinks.extraLarge),
  } : undefined;

  return {
    ...item,
    volumeInfo: {
      ...item.volumeInfo,
      imageLinks,
    },
  };
}

/**
 * Busca livros por texto livre utilizando langRestrict=pt
 * Endpoint: https://www.googleapis.com/books/v1/volumes?q={texto}&langRestrict=pt&hl=pt-BR&printType=books&key=SUA_API_KEY
 */
export async function searchBooks(
  query: string,
  maxResults = 20,
  startIndex = 0,
  langRestrict = 'pt'
): Promise<{ items: GoogleBookItem[]; totalItems: number }> {
  if (!query.trim()) {
    return { items: [], totalItems: 0 };
  }

  const url = buildUrl(BASE_URL, {
    q: query.trim(),
    langRestrict,
    hl: 'pt-BR',
    printType: 'books',
    maxResults,
    startIndex,
    orderBy: 'relevance',
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro na requisição: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();
    const items = (data.items || [])
      .map(sanitizeBookItem)
      .filter((item) => {
        // Se a busca solicitou português, descarta itens explicitamente em outro idioma (ex: 'en', 'es')
        if (langRestrict.startsWith('pt')) {
          const lang = (item.volumeInfo?.language || '').toLowerCase().trim();
          if (lang && !lang.startsWith('pt') && lang !== 'por') {
            return false;
          }
        }
        return true;
      });

    return {
      items,
      totalItems: data.totalItems || items.length,
    };
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
}

/**
 * Busca livros por assunto / categoria utilizando langRestrict=pt e hl=pt-BR
 * Endpoint: https://www.googleapis.com/books/v1/volumes?q=subject:{categoria_principal}&langRestrict=pt&hl=pt-BR&key=SUA_API_KEY
 */
export async function searchBooksBySubject(
  subject: string,
  maxResults = 20,
  startIndex = 0,
  langRestrict = 'pt'
): Promise<{ items: GoogleBookItem[]; totalItems: number }> {
  if (!subject.trim()) {
    return { items: [], totalItems: 0 };
  }

  // Prepara o termo do assunto
  const formattedSubject = subject.includes(' ') ? `"${subject.trim()}"` : subject.trim();
  const query = `subject:${formattedSubject}`;

  const isPt = langRestrict.startsWith('pt');
  const filterPt = (items: GoogleBookItem[]) => {
    if (!isPt) return items;
    return items.filter((item) => {
      const lang = (item.volumeInfo?.language || '').toLowerCase().trim();
      return lang.startsWith('pt') || lang === 'por';
    });
  };

  const url = buildUrl(BASE_URL, {
    q: query,
    langRestrict,
    hl: 'pt-BR',
    printType: 'books',
    maxResults,
    startIndex,
    orderBy: 'relevance',
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Se falhar com subject específico, tenta buscar a query normal com o termo
      const fallbackUrl = buildUrl(BASE_URL, {
        q: `livros ${subject.trim()}`,
        langRestrict,
        hl: 'pt-BR',
        printType: 'books',
        maxResults,
        startIndex,
      });
      const fbRes = await fetch(fallbackUrl);
      if (!fbRes.ok) {
        throw new Error(`Erro na requisição por assunto: ${response.status}`);
      }
      const fbData: GoogleBooksResponse = await fbRes.json();
      const rawFbItems = (fbData.items || []).map(sanitizeBookItem);
      const items = filterPt(rawFbItems);
      return {
        items,
        totalItems: items.length,
      };
    }

    const data: GoogleBooksResponse = await response.json();
    let rawItems = (data.items || []).map(sanitizeBookItem);
    let items = filterPt(rawItems);

    // Se o retorno com subject: for vazio ou insuficiente em português, tenta fallback com termo em texto
    if (items.length < 3) {
      const fallbackUrl = buildUrl(BASE_URL, {
        q: `livros ${subject.trim()}`,
        langRestrict,
        hl: 'pt-BR',
        printType: 'books',
        maxResults,
        startIndex,
      });
      const fbRes = await fetch(fallbackUrl);
      if (fbRes.ok) {
        const fbData: GoogleBooksResponse = await fbRes.json();
        const fbItems = filterPt((fbData.items || []).map(sanitizeBookItem));
        // Combina sem duplicar
        const existingIds = new Set(items.map((i) => i.id));
        fbItems.forEach((fbItem) => {
          if (!existingIds.has(fbItem.id)) {
            items.push(fbItem);
          }
        });
      }
    }

    return {
      items,
      totalItems: data.totalItems || items.length,
    };
  } catch (error) {
    console.error(`Erro ao buscar por assunto (${subject}):`, error);
    throw error;
  }
}

/**
 * Busca um livro pelo seu identificador único do Google Books
 */
export async function getBookById(id: string): Promise<GoogleBookItem> {
  const url = buildUrl(`${BASE_URL}/${encodeURIComponent(id)}`, {
    hl: 'pt-BR',
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Livro não encontrado: ${response.status}`);
  }
  const data: GoogleBookItem = await response.json();
  return sanitizeBookItem(data);
}
