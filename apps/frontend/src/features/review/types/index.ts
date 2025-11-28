export type ReviewResult = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface VocabCard {
  id: string; // Changed from number
  word: string;
  meaningVi: string;
  explanationEn?: string;
  notes?: string;
  tags: string[];
  dueAt: Date; // Changed from string
  intervalDays: number;
  ease: number;
  repetitions: number;
  lapses: number;
  lastResult?: ReviewResult;
  lastReviewedAt?: Date; // Changed from string
  addedAt?: Date; // Changed from string
  isSuspended?: boolean;
}

export interface ReviewQueueResponse {
  items: VocabCard[];
  count: number; // Changed from dueBefore
}

export interface SubmitReviewBody {
  result: ReviewResult;
  durationSec?: number;
  notes?: string;
}

export interface SubmitReviewResponse {
  vocab: VocabCard; // Changed from updated
  review: {
    id: string; // Changed from number
    result: ReviewResult;
    reviewedAt: Date; // Changed from string
  };
}

export interface ReviewQueueParams {
  dueBefore?: string;
  take?: number;
}
