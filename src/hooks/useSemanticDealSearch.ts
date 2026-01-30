import { useState } from "react";

interface Deal {
  id: string;
  merchantName: string;
  category?: string;
  subcategory?: string;
  dealTitle?: string;
  rewardValue?: string;
}

/**
 * Hook for semantic deal search functionality
 * Provides search state and methods for filtering deals
 */
export const useSemanticDealSearch = (_deals?: Deal[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matchingDealIds, setMatchingDealIds] = useState<string[]>([]);
  const [searchReasoning, setSearchReasoning] = useState<string | null>(null);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simple local filtering based on query
    if (_deals && query.trim()) {
      const lowerQuery = query.toLowerCase();
      const matches = _deals.filter(deal => 
        deal.merchantName?.toLowerCase().includes(lowerQuery) ||
        deal.category?.toLowerCase().includes(lowerQuery) ||
        deal.dealTitle?.toLowerCase().includes(lowerQuery)
      ).map(d => d.id);
      setMatchingDealIds(matches);
      setSearchReasoning(matches.length > 0 ? `Found ${matches.length} matching deals` : null);
    } else {
      setMatchingDealIds([]);
      setSearchReasoning(null);
    }
    
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setMatchingDealIds([]);
    setSearchReasoning(null);
  };

  return {
    searchQuery,
    isSearching,
    handleSearchChange,
    clearSearch,
    matchingDealIds,
    searchReasoning,
    results: [],
    searchDeals: async (_query: string) => [],
    isLoading: false,
    error: null,
  };
};

export default useSemanticDealSearch;
