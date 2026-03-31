import { useState, useCallback } from 'react';
import { Transaction, EnrichedTransaction } from '@/types/transaction';
import { toast } from 'sonner';
import { preFilterTravelCandidates } from '@/lib/travelPreFilter';

interface UseSSEEnrichmentReturn {
  enrichedTransactions: EnrichedTransaction[];
  isProcessing: boolean;
  statusMessage: string;
  currentPhase: "idle" | "classification" | "travel" | "complete";
  error: string | null;
  startEnrichment: (transactions: Transaction[], homeZip?: string, onClassified?: (classified: EnrichedTransaction[]) => void, options?: { suppressToasts?: boolean }) => Promise<EnrichedTransaction[]>;
  resetEnrichment: () => void;
  restoreEnrichedTransactions: (transactions: EnrichedTransaction[]) => void;
}

// Constants for resilience
const FETCH_TIMEOUT_MS = 120000; // 120 seconds
const RETRY_DELAY_MS = 2000; // 2 seconds
const MAX_RETRIES = 1;

// Helper: Check if error is retryable (network issues)
const isRetryableError = (err: any): boolean => {
  return err.name === 'TypeError' || // Failed to fetch
         err.name === 'AbortError' ||
         err.message?.includes('network') ||
         err.message?.includes('Failed to fetch');
};

// Helper: Safe JSON parse
const safeJsonParse = (str: string): any | null => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// Helper: Fetch with timeout and retry
const fetchWithResilience = async (
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === 'AbortError') {
        lastError = new Error('Request timed out after 60 seconds. Try with fewer transactions.');
      } else if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        lastError = new Error('Network connection failed. Check your internet and try again.');
      }

      // Retry only for retryable errors
      if (attempt < maxRetries && isRetryableError(err)) {
        console.log(`[SSE] Retry attempt ${attempt + 1} in ${RETRY_DELAY_MS}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Unknown fetch error');
};

export const useSSEEnrichment = (): UseSSEEnrichmentReturn => {
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentPhase, setCurrentPhase] = useState<"idle" | "classification" | "travel" | "complete">("idle");
  const [error, setError] = useState<string | null>(null);

  const callClassifyTransactions = useCallback(async (transactions: Transaction[], suppressToasts = false): Promise<EnrichedTransaction[]> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `${supabaseUrl}/functions/v1/classify-transactions`;

    const response = await fetchWithResilience(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      },
      body: JSON.stringify({ transactions })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limits exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to your Lovable AI workspace.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Null check for response.body
    if (!response.body) {
      throw new Error('Empty response from server. Please retry.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let classifiedTransactions: EnrichedTransaction[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        const eventMatch = line.match(/^event: (.+)$/m);
        const dataMatch = line.match(/^data: (.+)$/m);

        if (!eventMatch || !dataMatch) continue;

        const event = eventMatch[1];
        
        // Safe JSON parsing
        const data = safeJsonParse(dataMatch[1]);
        if (!data) {
          console.warn('[Classification] Malformed SSE event, skipping:', line.substring(0, 100));
          continue;
        }

        switch (event) {
          case 'status':
            setStatusMessage(data.message);
            console.log('[Classification Status]', data.message);
            break;

          case 'batch_complete':
            const { batchNum, totalBatches, count } = data;
            setStatusMessage(`Classifying batch ${batchNum}/${totalBatches}... (${count} transactions)`);
            console.log('[Classification Batch]', `${batchNum}/${totalBatches}`, count, 'transactions');
            break;

          case 'done':
            classifiedTransactions = data.enriched_transactions;
            setEnrichedTransactions(classifiedTransactions);
            setStatusMessage(`Classification complete! ${classifiedTransactions.length} transactions classified.`);
            if (!suppressToasts) toast.success(`${classifiedTransactions.length} transactions classified!`);
            console.log('[Classification Done]', classifiedTransactions.length, 'transactions');
            break;

          case 'error':
            throw new Error(data.message);
        }
      }
    }

    return classifiedTransactions;
  }, []);

  const callEnrichTransactions = useCallback(async (classifiedTransactions: EnrichedTransaction[], homeZip: string, suppressToasts = false) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `${supabaseUrl}/functions/v1/travel-detection`;

    // Pre-filter: only send travel candidates to AI
    const { homeZone, travelCandidates, stats } = preFilterTravelCandidates(
      classifiedTransactions,
      homeZip
    );

    console.log(`[Pre-filter] Reduced payload by ${stats.reduction}%: ${stats.home} home → ${stats.candidates} candidates`);
    setStatusMessage(`Pre-filtered: ${stats.candidates} travel candidates (${stats.reduction}% reduction)`);

    // If no candidates, skip AI call entirely
    if (travelCandidates.length === 0) {
      console.log('[Travel Detection] No travel candidates found, skipping AI call');
      setEnrichedTransactions(classifiedTransactions);
      setStatusMessage('Classification complete (no travel detected)');
      setCurrentPhase('complete');
      setIsProcessing(false);
      if (!suppressToasts) toast.success(`${classifiedTransactions.length} transactions classified!`);
      return;
    }

    const response = await fetchWithResilience(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      },
      body: JSON.stringify({ 
        transactions: travelCandidates.map(c => c.transaction),
        homeZip 
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limits exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to your Lovable AI workspace.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Null check for response.body
    if (!response.body) {
      throw new Error('Empty response from server. Please retry.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        const eventMatch = line.match(/^event: (.+)$/m);
        const dataMatch = line.match(/^data: (.+)$/m);

        if (!eventMatch || !dataMatch) continue;

        const event = eventMatch[1];
        
        // Safe JSON parsing
        const data = safeJsonParse(dataMatch[1]);
        if (!data) {
          console.warn('[Travel] Malformed SSE event, skipping:', line.substring(0, 100));
          continue;
        }

        switch (event) {
          case 'status':
            setStatusMessage(data.message);
            console.log('[Travel Status]', data.message);
            break;

          case 'travel_updates':
            setEnrichedTransactions(prev => {
              // Merge: home zone unchanged + enriched travel candidates
              const homeZone = prev.filter(tx => 
                !travelCandidates.some(c => c.transaction.transaction_id === tx.transaction_id)
              );
              
              const updated = [...prev];
              data.travel_updates.forEach((travelUpdate: any) => {
                const idx = updated.findIndex(t => t.transaction_id === travelUpdate.transaction_id);
                if (idx !== -1) {
                  // Store original pillar — DO NOT overwrite pillar/category/subcategories
                  const originalPillar = updated[idx].pillar;
                  
                  // Set trip_label (e.g. "260301:260315 Banff Trip") — original classification preserved
                  updated[idx].trip_label = travelUpdate.trip_label || null;
                  
                  // Add travel_context object with proper structure
                  updated[idx].travel_context = {
                    is_travel_related: travelUpdate.is_travel_related || false,
                    travel_period_start: travelUpdate.travel_period_start || null,
                    travel_period_end: travelUpdate.travel_period_end || null,
                    travel_destination: travelUpdate.travel_destination || null,
                    original_pillar: travelUpdate.original_pillar || originalPillar,
                    reclassification_reason: travelUpdate.reclassification_reason || null,
                  };
                }
              });
              return updated;
            });
            
            // Only show success toast if actual travel patterns were detected
            const travelCount = data.travel_updates.filter((u: any) => u.is_travel_related === true).length;
            if (travelCount > 0) {
              setStatusMessage(`${travelCount} travel pattern${travelCount > 1 ? 's' : ''} detected!`);
              if (!suppressToasts) toast.success(`${travelCount} travel pattern${travelCount > 1 ? 's' : ''} detected!`);
              console.log('[Travel Updates]', travelCount, 'travel patterns detected');
            } else {
              setStatusMessage('No travel patterns detected');
              console.log('[Travel Updates]', 'No travel patterns detected');
            }
            break;

          case 'done':
            setStatusMessage('Enrichment complete');
            setCurrentPhase('complete');
            setIsProcessing(false);
            console.log('[Travel Done]', data.message);
            break;

          case 'error':
            throw new Error(data.message);
        }
      }
    }
  }, []);

  const startEnrichment = useCallback(async (
    transactions: Transaction[],
    homeZip?: string,
    onClassified?: (classified: EnrichedTransaction[]) => void,
    options?: { suppressToasts?: boolean },
  ): Promise<EnrichedTransaction[]> => {
    const suppressToasts = options?.suppressToasts ?? false;
    setIsProcessing(true);
    setError(null);
    setEnrichedTransactions([]);
    setCurrentPhase("classification");

    try {
      // Step 1: Classify transactions with flash-lite
      console.log('[Enrichment] Starting classification...');
      const classifiedTransactions = await callClassifyTransactions(transactions, suppressToasts);

      // Fire callback immediately so callers can start parallel work
      onClassified?.(classifiedTransactions);

      // Step 2: Check if we have a valid home ZIP before running travel detection
      const hasValidHomeZip = homeZip && homeZip.trim() !== "" && homeZip.trim() !== "N/A";
      
      if (hasValidHomeZip) {
        // Add travel detection with ZIP-first pre-filtering
        console.log('[Enrichment] Starting ZIP-first travel detection...');
        setCurrentPhase("travel");
        setStatusMessage('Pre-filtering travel candidates...');
        await callEnrichTransactions(classifiedTransactions, homeZip!, suppressToasts);
      } else {
        // Skip travel detection if no valid home ZIP
        console.log('[Enrichment] Skipping travel detection (no home ZIP provided)');
        setStatusMessage('Classification complete (travel analysis skipped - no home ZIP provided)');
        setCurrentPhase('complete');
        setIsProcessing(false);
        if (!suppressToasts) toast.success(`${classifiedTransactions.length} transactions classified!`);
      }

      return classifiedTransactions;
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
      setCurrentPhase('idle');
      if (!suppressToasts) toast.error(`Enrichment failed: ${err.message}`);
      console.error('[Enrichment Error]', err);
      return [];
    }
  }, [callClassifyTransactions, callEnrichTransactions]);

  const resetEnrichment = useCallback(() => {
    setEnrichedTransactions([]);
    setIsProcessing(false);
    setStatusMessage('');
    setCurrentPhase('idle');
    setError(null);
  }, []);

  const restoreEnrichedTransactions = useCallback((transactions: EnrichedTransaction[]) => {
    setEnrichedTransactions(transactions);
    setCurrentPhase('complete');
    setStatusMessage(`Restored ${transactions.length} transactions`);
    console.log(`[Restoration] Restored ${transactions.length} enriched transactions`);
  }, []);

  return {
    enrichedTransactions,
    isProcessing,
    statusMessage,
    currentPhase,
    error,
    startEnrichment,
    resetEnrichment,
    restoreEnrichedTransactions
  };
};
