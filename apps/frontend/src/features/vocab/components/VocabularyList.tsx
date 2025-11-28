import React from "react";
import type { Vocab } from "../types";
import { VocabCard } from "./VocabCard";
import { VocabCardSkeleton } from "./VocabCardSkeleton";
import { toggleSuspendVocab } from "../services/vocab.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface VocabularyListProps {
  vocabs: Vocab[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export const VocabularyList = React.memo<VocabularyListProps>(
  ({ vocabs, isLoading = false, isEmpty = false }) => {
    const queryClient = useQueryClient();
    const user = useSelector((state: RootState) => state.auth.user);

    const toggleSuspendMutation = useMutation({
      mutationFn: (id: string) => {
        if (!user?.uid) throw new Error("User not authenticated");
        return toggleSuspendVocab(user.uid, id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vocabs"] });
      },
    });

    const handleSuspend = (vocab: Vocab) => {
      toggleSuspendMutation.mutate(vocab.id);
    };
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <VocabCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No vocabularies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more results.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabs.map((vocab) => (
          <VocabCard key={vocab.id} vocab={vocab} onSuspend={handleSuspend} />
        ))}
      </div>
    );
  },
);

VocabularyList.displayName = "VocabularyList";
