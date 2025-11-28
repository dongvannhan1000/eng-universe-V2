import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { qk } from "./queryKeys";
import { listVocabs, type ListVocabParams } from "../services/vocab.service";

export function useVocabs(filters: ListVocabParams) {
  const user = useSelector((state: RootState) => state.auth.user);

  return useQuery({
    queryKey: qk.vocabs(filters),
    queryFn: () => {
      if (!user?.uid) throw new Error("User not authenticated");
      return listVocabs(user.uid, filters);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!user?.uid,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
}
