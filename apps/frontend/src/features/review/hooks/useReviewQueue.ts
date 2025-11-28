import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { fetchReviewQueue } from "../api/reviewApi";
import type { ReviewQueueParams } from "../types";

export function useReviewQueue(params: ReviewQueueParams = {}) {
  const user = useSelector((state: RootState) => state.auth.user);

  return useQuery({
    queryKey: ["reviews", "queue", params],
    queryFn: () => {
      if (!user?.uid) throw new Error("User not authenticated");
      return fetchReviewQueue(user.uid, params);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.uid,
  });
}
