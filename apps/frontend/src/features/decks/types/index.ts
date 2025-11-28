export interface Deck {
  id: string; // Changed from number
  slug: string;
  title: string;
  description?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  items?: DeckItem[]; // Made optional since items are fetched separately
}

export interface DeckItem {
  id: string; // Changed from number
  deckId: string; // Changed from number
  headword: string;
  pos?: string;
  definition?: string;
  tags: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckListParams {
  q?: string;
  tags?: string[];
  cefr?: string;
}

export interface PaginatedDeckItem {
  data: DeckItem[]; // Changed from items
  total: number;
  page: number;
  limit: number;
}
