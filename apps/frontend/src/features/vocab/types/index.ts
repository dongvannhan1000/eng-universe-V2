type ReviewResult = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface Vocab {
  id: string; // Changed from number to string for Firestore
  userId: string; // Changed from number to string
  word: string;
  meaningVi: string;
  explanationEn?: string; // Changed from string | null
  notes?: string; // Changed from string | null
  tags: string[];
  addedAt: Date; // Changed from string
  lastReviewedAt?: Date; // Changed from string | null
  isSuspended: boolean;
  dueAt: Date; // Changed from string
  intervalDays: number;
  ease: number;
  repetitions: number;
  lapses: number;
  lastResult?: ReviewResult; // Changed from ReviewResult | null
}

export interface CreateVocabInput {
  word: string;
  meaningVi: string;
  tags: string[]; // Required, not optional
  explanationEn?: string;
  notes?: string;
}

export interface VocabListParams {
  q?: string;
  tags?: string[];
  from?: string | null;
  to?: string | null;
  page?: number;
  limit?: number;
  includeSuspended?: boolean; // Added for Firebase service
}

export interface PaginatedVocab {
  data: Vocab[]; // Changed from items
  total: number;
  page: number; // Changed from skip
  limit: number; // Changed from take
  totalPages: number; // Added
}
