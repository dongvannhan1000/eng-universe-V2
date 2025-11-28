"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createVocab } from "../services/vocab.service";
import { useSelector } from "react-redux";
import { selectCaptureMode } from "../slices/captureModeSlice";
import type { CreateVocabInput } from "../types";

import type { RootState } from "@/app/store";

export function AddVocabDialog() {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();
  const captureMode = useSelector(selectCaptureMode);
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<CreateVocabInput>({
    word: "",
    meaningVi: "",
    tags: [],
    explanationEn: "",
    notes: "",
    // timecodeSec: undefined,
    // captureBatchId: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && captureMode.enabled && captureMode.defaultTags.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tags: [...captureMode.defaultTags],
      }));
    }
  }, [open, captureMode.enabled, captureMode.defaultTags]);

  const mutation = useMutation({
    mutationFn: (data: CreateVocabInput) => {
      if (!user?.uid) throw new Error("User not authenticated");
      return createVocab(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabs"] });
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      word: "",
      meaningVi: "",
      tags: [],
      explanationEn: "",
      notes: "",
      // timecodeSec: undefined,
      // captureBatchId: "",
    });
    setTagInput("");
    setErrors({});
    setShowAdvanced(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = "Word is required";
    }

    if (!formData.meaningVi.trim()) {
      newErrors.meaningVi = "Vietnamese meaning is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateVocabInput = {
      word: formData.word.toLowerCase().trim(),
      meaningVi: formData.meaningVi.trim(),
      tags: formData.tags,
      ...(formData.explanationEn?.trim() && { explanationEn: formData.explanationEn.trim() }),
      ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
      // ...(formData.timecodeSec && { timecodeSec: formData.timecodeSec }),
      // ...(formData.captureBatchId?.trim() && { captureBatchId: formData.captureBatchId.trim() }),
    };

    mutation.mutate(submitData);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
      setErrors({ ...errors, tags: "" });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="size-4" />
          Add New Word
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vocabulary</DialogTitle>
          <DialogDescription>
            Add a new English word to your personal vocabulary collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">
                Word <span className="text-destructive">*</span>
              </Label>
              <Input
                id="word"
                value={formData.word}
                onChange={(e) => {
                  setFormData({ ...formData, word: e.target.value });
                  setErrors({ ...errors, word: "" });
                }}
                placeholder="e.g., serendipity"
                className={errors.word ? "border-destructive" : ""}
              />
              {errors.word && <p className="text-sm text-destructive">{errors.word}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meaningVi">
                Meaning (Vietnamese) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="meaningVi"
                value={formData.meaningVi}
                onChange={(e) => {
                  setFormData({ ...formData, meaningVi: e.target.value });
                  setErrors({ ...errors, meaningVi: "" });
                }}
                placeholder="Nghĩa tiếng Việt của từ..."
                rows={2}
                className={errors.meaningVi ? "border-destructive" : ""}
              />
              {errors.meaningVi && <p className="text-sm text-destructive">{errors.meaningVi}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags / Topics <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., education, business"
                  className={errors.tags ? "border-destructive" : ""}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {errors.tags && <p className="text-sm text-destructive">{errors.tags}</p>}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Fields Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="explanationEn">Explanation (English)</Label>
                <Textarea
                  id="explanationEn"
                  value={formData.explanationEn}
                  onChange={(e) => setFormData({ ...formData, explanationEn: e.target.value })}
                  placeholder="Detailed explanation from Oxford/Cambridge..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Personal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Examples, mnemonics, collocations..."
                  rows={2}
                />
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timecodeSec">Timecode (seconds)</Label>
                  <Input
                    id="timecodeSec"
                    type="number"
                    min="0"
                    value={formData.timecodeSec || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timecodeSec: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="captureBatchId">Batch ID</Label>
                  <Input
                    id="captureBatchId"
                    value={formData.captureBatchId}
                    onChange={(e) => setFormData({ ...formData, captureBatchId: e.target.value })}
                    placeholder="e.g., TedTalk #1"
                  />
                </div>
              </div> */}
            </div>
          )}

          {mutation.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to add vocabulary"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Vocabulary"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
