import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteVocab } from "../services/vocab.service";
import type { Vocab } from "../types";

interface DeleteVocabDialogProps {
  vocab: Vocab | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export function DeleteVocabDialog({ vocab, open, onOpenChange }: DeleteVocabDialogProps) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const mutation = useMutation({
    mutationFn: (id: string) => {
      if (!user?.uid) throw new Error("User not authenticated");
      return deleteVocab(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabs"] });
      onOpenChange(false);
    },
  });

  const handleDelete = () => {
    if (vocab) {
      mutation.mutate(vocab.id);
    }
  };

  if (!vocab) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Vocabulary
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete "
              <span className="font-semibold text-foreground">{vocab.word}</span>"?
            </div>
            <div className="text-sm">
              This action cannot be undone. This will permanently delete the vocabulary word and all
              its associated data.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.isError && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <div className="text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Failed to delete vocabulary"}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
