"use client";

import { useState, useEffect } from "react";
import { useReviewQueue } from "../hooks/useReviewQueue";
import { useSubmitReview } from "../hooks/useSubmitReview";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewProgress } from "../components/ReviewProgress";
import { ReviewComplete } from "../components/ReviewComplete";
import { ReviewEmpty } from "../components/ReviewEmpty";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ReviewResult } from "../types";
import { motion } from "framer-motion";

export function ReviewQueuePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [sessionStartTime] = useState(() => Date.now());
  const [queueParams] = useState({ take: 50 });
  const [initialTotalCards, setInitialTotalCards] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useReviewQueue(queueParams);
  const submitReview = useSubmitReview();

  useEffect(() => {
    if (data?.items && initialTotalCards === null) {
      setInitialTotalCards(data.items.length);
    }
  }, [data?.items, initialTotalCards]);

  const remainingCards = data?.items.filter((card) => !completedCards.includes(card.id)) || [];
  const currentCard = remainingCards[currentIndex];
  const totalCards = initialTotalCards || 0;
  const completedCount = completedCards.length;

  const handleReview = async (result: ReviewResult, durationSec: number) => {
    if (!currentCard) return;

    try {
      await submitReview.mutateAsync({
        vocabId: currentCard.id,
        body: {
          result,
          durationSec,
        },
      });

      setCompletedCards((prev) => [...prev, currentCard.id]);
    } catch (err) {
      console.error("[v0] Failed to submit review:", err);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedCards([]);
    setInitialTotalCards(null);
    refetch();
  };

  const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="w-8 h-8" />
        <p className="text-muted-foreground">Loading your review queue...</p>
      </div>
    );
  }

  if (error) {
    console.error("Review load error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load review queue."}
          </AlertDescription>
        </Alert>
        <div className="w-full p-4 bg-muted rounded text-left overflow-auto">
          <code className="text-xs break-all">
            {JSON.stringify(error, null, 2)}
          </code>
        </div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ReviewEmpty />
      </div>
    );
  }

  if (remainingCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ReviewComplete count={completedCount} elapsedSec={elapsedSec} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        <ReviewProgress
          completed={completedCount}
          total={totalCards}
          remaining={remainingCards.length}
        />

        <div className="flex justify-center">
          <ReviewCard
            card={currentCard}
            onReview={handleReview}
            isSubmitting={submitReview.isPending}
          />
        </div>

        {submitReview.isError && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to submit review. Please try again.</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </motion.div>
  );
}
