import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CityDeal {
  id: string;
  name: string;
  description: string;
  category: string;
  location?: string;
  type?: string;
  merchantExample?: string;
}

export const useCityDeals = (city?: string, category?: string) => {
  const [deals, setDeals] = useState<CityDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!city) {
      setDeals([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("local-experiences", {
        body: { city, category: category || "dining" },
      });

      if (fnError) throw fnError;

      const rawDeals = data?.deals || [];
      const mapped: CityDeal[] = rawDeals.map((d: any, i: number) => ({
        id: `${city}-${category}-${i}`,
        name: d.merchantExample || "Local venue",
        description: d.type || "Local deal",
        category: category || "dining",
        type: d.type,
        merchantExample: d.merchantExample,
      }));

      setDeals(mapped);
    } catch (err) {
      console.error("[useCityDeals] Error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [city, category]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    isLoading: loading,
    error,
    refetch: fetchDeals,
  };
};

export default useCityDeals;
