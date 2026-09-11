/**
 * Sanitiza a URL da imagem de capa retornada pela Google Books API.
 * A API do Google retorna frequentemente http:// no thumbnail, causando erros de Mixed Content.
 * Esta função garante https:// e parâmetros de qualidade ideais.
 */
export function sanitizeImageUrl(url?: string): string {
  if (!url) {
    return '';
  }

  // Substitui http por https para evitar erro de mixed content
  let secureUrl = url.replace(/^http:\/\//i, 'https://');

  // Melhora a resolução se houver parâmetros de zoom comuns na Google Books API
  if (secureUrl.includes('&edge=curl')) {
    secureUrl = secureUrl.replace('&edge=curl', '');
  }

  return secureUrl;
}

/**
 * Gera um placeholder SVG elegante para livros sem capa disponível
 */
export function getBookCoverFallback(title: string, author?: string): string {
  const safeTitle = (title || 'Sem Título').substring(0, 30);
  const safeAuthor = (author || 'Autor Desconhecido').substring(0, 25);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3e2723;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a120b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="450" rx="8" fill="url(#grad)" />
      <rect x="15" y="15" width="270" height="420" rx="4" fill="none" stroke="#d2411e" stroke-width="2" stroke-opacity="0.4" />
      <line x1="30" y1="20" x2="30" y2="430" stroke="#f5f2eb" stroke-width="1" stroke-opacity="0.15" />
      <circle cx="150" cy="140" r="36" fill="#d2411e" fill-opacity="0.2" />
      <path d="M140 128 L150 120 L160 128 L160 152 L150 146 L140 152 Z" fill="#f1ab8e" />
      <text x="150" y="230" fill="#fbfaf8" font-family="serif" font-size="18" font-weight="bold" text-anchor="middle">
        ${escapeXml(safeTitle)}
      </text>
      <text x="150" y="270" fill="#cebca0" font-family="sans-serif" font-size="13" text-anchor="middle">
        ${escapeXml(safeAuthor)}
      </text>
      <text x="150" y="400" fill="#8c2b1a" font-family="sans-serif" font-size="10" letter-spacing="2" text-anchor="middle">
        MARCA-PÁGINA
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
