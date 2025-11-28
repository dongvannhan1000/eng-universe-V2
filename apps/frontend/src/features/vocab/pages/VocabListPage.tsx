"use client";

import type React from "react";
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  selectFilters,
  setQ,
  // setTags,
  setFrom,
  setTo,
  setPage,
  resetFilters,
  hydrateFromUrl,
  setIncludeSuspended,
} from "../slices/filtersSlice";
import { useVocabs } from "../hooks/useVocabs";
import { VocabToolbar } from "../components/VocabToolbar";
import { VocabularyList } from "../components/VocabularyList";
import { Pagination } from "../../../components/Pagination";
import { AddVocabDialog } from "../components/AddVocabDialog";
import { CaptureModeToggle } from "../components/CaptureModeToggle";

import type { RootState } from "@/app/store";
import { motion } from "framer-motion";

export const VocabListPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useSelector(selectFilters);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const { data, isLoading, error } = useVocabs(filters);

  // Hydrate filters from URL on mount
  useEffect(() => {
    const urlParams = {
      q: searchParams.get("q") || "",
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
      from: searchParams.get("from") || null,
      to: searchParams.get("to") || null,
      page: Number.parseInt(searchParams.get("page") || "1", 10),
      limit: Number.parseInt(searchParams.get("limit") || "20", 10),
      includeSuspended: searchParams.get("includeSuspended") === "true",
    };

    dispatch(hydrateFromUrl(urlParams));
  }, [dispatch, searchParams]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit !== 20) params.set("limit", filters.limit.toString());
    if (filters.includeSuspended) params.set("includeSuspended", "true");
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setQ(query));
    },
    [dispatch],
  );

  // const handleTagsChange = useCallback(
  //   (tags: string[]) => {
  //     dispatch(setTags(tags));
  //   },
  //   [dispatch],
  // );

  const handleFromDateChange = useCallback(
    (date: string | null) => {
      dispatch(setFrom(date));
    },
    [dispatch],
  );

  const handleToDateChange = useCallback(
    (date: string | null) => {
      dispatch(setTo(date));
    },
    [dispatch],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch],
  );

  const handleIncludeSuspendedChange = useCallback(
    (includeSuspended: boolean) => {
      dispatch(setIncludeSuspended(includeSuspended));
    },
    [dispatch],
  );

  const handleClearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Pagination - use new structure
  const currentPage = data ? data.page : 1;
  const totalPages = data ? data.totalPages : 0;
  const isEmpty = data && data.data.length === 0;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
            <p className="text-muted-foreground">
              Failed to load vocabularies. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
    >
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Constellation</h1>
              <p className="text-muted-foreground">
                Curate your galaxy of words — each star a memory.
              </p>
            </div>
            <div className="flex gap-3">
              <CaptureModeToggle />
              {/* Add mới từ vựng */}
              {isAuthenticated && <AddVocabDialog />}
            </div>
          </div>
        </header>

        <VocabToolbar
          searchQuery={filters.q}
          selectedTags={filters.tags}
          fromDate={filters.from}
          toDate={filters.to}
          includeSuspended={filters.includeSuspended}
          onSearchChange={handleSearchChange}
          onIncludeSuspendedChange={handleIncludeSuspendedChange}
          // onTagsChange={handleTagsChange}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
          onClearFilters={handleClearFilters}
        />

        {data && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{data.data.length}</span> of{" "}
              <span className="font-medium">{data.total}</span> vocabularies
              {filters.page > 1 && ` (page ${filters.page})`}
            </p>
          </div>
        )}

        <VocabularyList vocabs={data?.data || []} isLoading={isLoading} isEmpty={isEmpty} />

        {data && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
