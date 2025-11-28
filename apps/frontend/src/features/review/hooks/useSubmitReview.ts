import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { submitReview } from "../api/reviewApi";
import type { SubmitReviewBody } from "../types";

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  return useMutation({
    mutationFn: ({ vocabId, body }: { vocabId: string; body: SubmitReviewBody }) => {
      if (!user?.uid) throw new Error("User not authenticated");
      return submitReview(user.uid, vocabId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "queue"] });
    },
  });
}
