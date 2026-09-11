export type ReadingStatus = 'lido' | 'lendo' | 'quero_ler';

export interface VolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: VolumeInfo;
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookItem[];
}

export interface SavedBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
  description: string;
  categories: string[];
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  status: ReadingStatus;
  userRating?: number;
  userNotes?: string;
  dateAdded: string;
  dateFinished?: string;
  favorite?: boolean;
  previewLink?: string;
  infoLink?: string;
}

export interface CategoryStat {
  name: string;
  displayName: string;
  count: number;
  percentage: number;
}

export interface PatternDiscoveryResult {
  hasReadBooks: boolean;
  totalReadBooks: number;
  topCategories: CategoryStat[];
  primaryCategory: string | null;
  recommendedBooks: GoogleBookItem[];
}
