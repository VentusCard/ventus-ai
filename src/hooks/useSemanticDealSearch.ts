import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Deal {
  id: string;
  merchantName: string;
  category: string;
  subcategory: string;
  dealTitle: string;
  rewardValue: string;
}

interface SearchResult {
  matchingDealIds: string[];
  reasoning: string;
}

export function useSemanticDealSearch(allDeals: Deal[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // Prepare a simplified deal list for the API
      const dealsForSearch = allDeals.map(d => ({
        id: d.id,
        merchantName: d.merchantName,
        category: d.category,
        subcategory: d.subcategory,
        dealTitle: d.dealTitle,
        rewardValue: d.rewardValue,
      }));

      const { data, error } = await supabase.functions.invoke('semantic-deal-search', {
        body: { query, deals: dealsForSearch }
      });

      if (error) {
        console.error('Semantic search error:', error);
        toast.error('Search failed. Please try again.');
        setSearchResults(null);
      } else if (data?.matchingDealIds) {
        setSearchResults(data as SearchResult);
      } else {
        setSearchResults({ matchingDealIds: [], reasoning: 'No matches found' });
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed. Please try again.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [allDeals]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If empty, clear results immediately
    if (!query || query.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 400);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    searchQuery,
    isSearching,
    searchResults,
    handleSearchChange,
    clearSearch,
    matchingDealIds: searchResults?.matchingDealIds || null,
    searchReasoning: searchResults?.reasoning || null,
  };
}
