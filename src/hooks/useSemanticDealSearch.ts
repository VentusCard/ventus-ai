import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSemanticDealSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matchingDealIds, setMatchingDealIds] = useState<string[]>([]);
  const [searchReasoning, setSearchReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setMatchingDealIds([]);
      setSearchReasoning(null);
      setIsSearching(false);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/semantic-deal-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Search failed (${response.status})`);
      }

      const data = await response.json();

      if (data?.error) {
        setError(data.error);
        setMatchingDealIds([]);
        setSearchReasoning(null);
      } else {
        setMatchingDealIds(data?.matchingDealIds ?? []);
        setSearchReasoning(data?.reasoning ?? null);
      }
    } catch (e: any) {
      if (e.name === "AbortError") return; // Cancelled — ignore
      console.error("Semantic search error:", e);
      setError(e instanceof Error ? e.message : "Search failed");
      setMatchingDealIds([]);
      setSearchReasoning(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      if (abortRef.current) abortRef.current.abort();
      setMatchingDealIds([]);
      setSearchReasoning(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 700);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setMatchingDealIds([]);
    setSearchReasoning(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return {
    searchQuery,
    isSearching,
    handleSearchChange,
    clearSearch,
    matchingDealIds,
    searchReasoning,
    error,
    results: [],
    searchDeals: async (_query: string) => [],
    isLoading: isSearching,
  };
};

export default useSemanticDealSearch;
