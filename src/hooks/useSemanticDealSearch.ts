import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Deal {
  id: string;
  merchantName: string;
  category?: string;
  subcategory?: string;
  dealTitle?: string;
  rewardValue?: string;
}

export const useSemanticDealSearch = (deals?: Deal[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matchingDealIds, setMatchingDealIds] = useState<string[]>([]);
  const [searchReasoning, setSearchReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string, currentDeals: Deal[]) => {
    if (!query.trim() || query.length < 2) {
      setMatchingDealIds([]);
      setSearchReasoning(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("semantic-deal-search", {
        body: {
          query,
          deals: currentDeals.map(d => ({
            id: d.id,
            merchantName: d.merchantName,
            category: d.category ?? "",
            subcategory: d.subcategory ?? "",
            dealTitle: d.dealTitle ?? "",
            rewardValue: d.rewardValue ?? "",
          })),
        },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error);
        setMatchingDealIds([]);
        setSearchReasoning(null);
      } else {
        setMatchingDealIds(data?.matchingDealIds ?? []);
        setSearchReasoning(data?.reasoning ?? null);
      }
    } catch (e) {
      console.error("Semantic search error:", e);
      setError(e instanceof Error ? e.message : "Search failed");
      // Fallback to local keyword search
      const lowerQuery = query.toLowerCase();
      const matches = currentDeals
        .filter(d =>
          d.merchantName?.toLowerCase().includes(lowerQuery) ||
          d.category?.toLowerCase().includes(lowerQuery) ||
          d.dealTitle?.toLowerCase().includes(lowerQuery)
        )
        .map(d => d.id);
      setMatchingDealIds(matches);
      setSearchReasoning(matches.length > 0 ? `Keyword fallback: ${matches.length} matches` : null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setMatchingDealIds([]);
      setSearchReasoning(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      if (deals) performSearch(query, deals);
    }, 500);
  }, [deals, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setMatchingDealIds([]);
    setSearchReasoning(null);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
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
