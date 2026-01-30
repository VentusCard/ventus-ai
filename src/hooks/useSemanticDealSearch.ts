import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DealForSearch {
  id: string;
  merchantName: string;
  category: string;
  subcategory: string;
  dealTitle: string;
  rewardValue: string;
}

interface SemanticSearchResult {
  isSearching: boolean;
  searchQuery: string;
  handleSearchChange: (query: string) => void;
  clearSearch: () => void;
  matchingDealIds: string[];
  searchReasoning: string;
}

export function useSemanticDealSearch(deals: DealForSearch[]): SemanticSearchResult {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingDealIds, setMatchingDealIds] = useState<string[]>([]);
  const [searchReasoning, setSearchReasoning] = useState('');

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setMatchingDealIds([]);
    setSearchReasoning('');
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchingDealIds([]);
      setSearchReasoning('');
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    
    // Simple local search fallback
    const matching = deals.filter(deal => 
      deal.merchantName.toLowerCase().includes(searchLower) ||
      deal.dealTitle.toLowerCase().includes(searchLower) ||
      deal.category.toLowerCase().includes(searchLower) ||
      deal.subcategory.toLowerCase().includes(searchLower)
    );
    
    setMatchingDealIds(matching.map(d => d.id));
    setSearchReasoning(matching.length > 0 
      ? `Found ${matching.length} deals matching "${searchQuery}"`
      : `No deals found for "${searchQuery}"`
    );

    // Try semantic search via edge function
    setIsSearching(true);
    
    supabase.functions
      .invoke('semantic-deal-search', {
        body: { query: searchQuery, dealIds: deals.map(d => d.id) }
      })
      .then(({ data, error }) => {
        if (!error && data?.matchingIds) {
          setMatchingDealIds(data.matchingIds);
          setSearchReasoning(data.reasoning || '');
        }
      })
      .catch(console.error)
      .finally(() => setIsSearching(false));

  }, [searchQuery, deals]);

  return {
    isSearching,
    searchQuery,
    handleSearchChange,
    clearSearch,
    matchingDealIds,
    searchReasoning,
  };
}
