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
 * Constrói a URL completa adicionando a chave se existente e configurando hl=pt-BR por padrão
 */
function buildUrl(endpoint: string, params: Record<string, string | number>): string {
  const url = new URL(endpoint);
  
  // Define o idioma de interface/metadados como pt-BR por padrão
  if (!params.hl) {
    url.searchParams.append('hl', 'pt-BR');
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
 * Busca livros por texto livre utilizando langRestrict=pt-BR
 * Endpoint: https://www.googleapis.com/books/v1/volumes?q={texto}&langRestrict=pt-BR&hl=pt-BR&key=SUA_API_KEY
 */
export async function searchBooks(
  query: string,
  maxResults = 20,
  startIndex = 0,
  langRestrict = 'pt-BR'
): Promise<{ items: GoogleBookItem[]; totalItems: number }> {
  if (!query.trim()) {
    return { items: [], totalItems: 0 };
  }

  const url = buildUrl(BASE_URL, {
    q: query.trim(),
    langRestrict,
    hl: 'pt-BR',
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
    const items = (data.items || []).map(sanitizeBookItem);

    return {
      items,
      totalItems: data.totalItems || 0,
    };
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
}

/**
 * Busca livros por assunto / categoria utilizando langRestrict=pt-BR e hl=pt-BR
 * Endpoint: https://www.googleapis.com/books/v1/volumes?q=subject:{categoria_principal}&langRestrict=pt-BR&hl=pt-BR&key=SUA_API_KEY
 */
export async function searchBooksBySubject(
  subject: string,
  maxResults = 20,
  startIndex = 0,
  langRestrict = 'pt-BR'
): Promise<{ items: GoogleBookItem[]; totalItems: number }> {
  if (!subject.trim()) {
    return { items: [], totalItems: 0 };
  }

  // Prepara o termo do assunto
  const formattedSubject = subject.includes(' ') ? `"${subject.trim()}"` : subject.trim();
  const query = `subject:${formattedSubject}`;

  const url = buildUrl(BASE_URL, {
    q: query,
    langRestrict,
    hl: 'pt-BR',
    maxResults,
    startIndex,
    orderBy: 'relevance',
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Se falhar com subject específico, tenta buscar a query normal com o termo
      const fallbackUrl = buildUrl(BASE_URL, {
        q: subject.trim(),
        langRestrict,
        hl: 'pt-BR',
        maxResults,
        startIndex,
      });
      const fbRes = await fetch(fallbackUrl);
      if (!fbRes.ok) {
        throw new Error(`Erro na requisição por assunto: ${response.status}`);
      }
      const fbData: GoogleBooksResponse = await fbRes.json();
      return {
        items: (fbData.items || []).map(sanitizeBookItem),
        totalItems: fbData.totalItems || 0,
      };
    }

    const data: GoogleBooksResponse = await response.json();
    let items = (data.items || []).map(sanitizeBookItem);

    // Se o retorno com subject: for vazio ou muito pequeno, tenta fallback de texto simples
    if (items.length === 0) {
      const fallbackUrl = buildUrl(BASE_URL, {
        q: subject.trim(),
        langRestrict,
        hl: 'pt-BR',
        maxResults,
        startIndex,
      });
      const fbRes = await fetch(fallbackUrl);
      if (fbRes.ok) {
        const fbData: GoogleBooksResponse = await fbRes.json();
        items = (fbData.items || []).map(sanitizeBookItem);
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
