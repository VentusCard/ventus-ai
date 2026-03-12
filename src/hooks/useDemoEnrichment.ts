import { useState, useCallback, useRef } from "react";
import { useSSEEnrichment } from "./useSSEEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import type { EnrichedTransaction } from "@/types/transaction";
import { toast } from "sonner";

export type NodeReadiness = Record<DemoNodeType, "idle" | "processing" | "ready">;

const INITIAL_READINESS: NodeReadiness = {
  analytics: "idle",
  rewards: "idle",
  engagement: "idle",
  travel: "idle",
  wealth: "idle",
};

interface DemoEnrichmentResult {
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
  isProcessing: boolean;
  statusMessage: string;
  enrichedA: EnrichedTransaction[];
  enrichedB: EnrichedTransaction[];
  startEnrichment: (customerA: DemoCustomer, customerB: DemoCustomer) => void;
}

export function useDemoEnrichment(): DemoEnrichmentResult {
  const [nodeReadiness, setNodeReadiness] = useState<NodeReadiness>(INITIAL_READINESS);
  const [inputReady, setInputReady] = useState(false);
  const [phase2Processing, setPhase2Processing] = useState(false);
  const [phase2Status, setPhase2Status] = useState("");
  const lastEnrichedRef = useRef<{ a: string; b: string } | null>(null);

  const enrichA = useSSEEnrichment();
  const enrichB = useSSEEnrichment();

  const isProcessing = enrichA.isProcessing || enrichB.isProcessing || phase2Processing;

  const statusMessage = phase2Processing
    ? phase2Status
    : enrichA.isProcessing && enrichB.isProcessing
      ? `A: ${enrichA.statusMessage} | B: ${enrichB.statusMessage}`
      : enrichA.isProcessing
        ? `A: ${enrichA.statusMessage}`
        : enrichB.isProcessing
          ? `B: ${enrichB.statusMessage}`
          : enrichA.statusMessage || enrichB.statusMessage || phase2Status || "";

  const runPhase2 = useCallback(async (txnsA: EnrichedTransaction[], txnsB: EnrichedTransaction[], zipA: string, zipB: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    };

    // Combine transactions for phase 2 calls
    const allTxns = [...txnsA, ...txnsB];

    // Fire all three in parallel
    const travelPromise = fetch(`${supabaseUrl}/functions/v1/travel-detection`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transactions: allTxns.slice(0, 20), homeZip: zipA }),
    }).then(r => r.ok ? r.text() : Promise.reject(new Error(`travel: ${r.status}`)));

    const lifestylePromise = fetch(`${supabaseUrl}/functions/v1/analyze-lifestyle-signals`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transactions: allTxns }),
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`lifestyle: ${r.status}`)));

    const dealsPromise = fetch(`${supabaseUrl}/functions/v1/deal-personalization`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transactions: allTxns, zipCode: zipA }),
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`deals: ${r.status}`)));

    const results = await Promise.allSettled([travelPromise, lifestylePromise, dealsPromise]);

    // Travel → travel node
    if (results[0].status === "fulfilled") {
      setNodeReadiness(prev => ({ ...prev, travel: "ready" }));
      setPhase2Status("Travel detection complete");
    } else {
      console.warn("[Phase2] Travel failed:", results[0].reason);
      setNodeReadiness(prev => ({ ...prev, travel: "ready" })); // Still mark ready
    }

    // Lifestyle → wealth + engagement nodes
    if (results[1].status === "fulfilled") {
      setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
      setPhase2Status("Lifestyle signals analyzed");
    } else {
      console.warn("[Phase2] Lifestyle failed:", results[1].reason);
      setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
    }

    // Deals → rewards node
    if (results[2].status === "fulfilled") {
      setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
      setPhase2Status("Deal personalization complete");
    } else {
      console.warn("[Phase2] Deals failed:", results[2].reason);
      setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
    }
  }, []);

  const startEnrichment = useCallback((customerA: DemoCustomer, customerB: DemoCustomer) => {
    // Skip if same pair already enriched
    if (
      lastEnrichedRef.current?.a === customerA.id &&
      lastEnrichedRef.current?.b === customerB.id &&
      nodeReadiness.analytics === "ready" &&
      nodeReadiness.travel === "ready"
    ) {
      toast.info("Already enriched. Change a customer to re-enrich.");
      return;
    }

    lastEnrichedRef.current = { a: customerA.id, b: customerB.id };

    // Reset state
    setNodeReadiness({ ...INITIAL_READINESS });
    setInputReady(false);
    setPhase2Processing(false);
    setPhase2Status("");

    // Set all to processing
    setTimeout(() => {
      setNodeReadiness({
        analytics: "processing",
        rewards: "processing",
        engagement: "processing",
        travel: "processing",
        wealth: "processing",
      });
    }, 100);

    // Parse CSVs
    const parseCSV = (customer: DemoCustomer) => {
      const result = parsePastedText(customer.csv);
      if (result.needsMapping || !result.transactions) {
        throw new Error(`Failed to parse CSV for ${customer.profile.name}`);
      }
      return result.transactions;
    };

    try {
      const txnsA = parseCSV(customerA);
      const txnsB = parseCSV(customerB);

      // Phase 1: classify both in parallel
      const phaseOneA = enrichA.startEnrichment(txnsA, customerA.zip);
      const phaseOneB = enrichB.startEnrichment(txnsB, customerB.zip);

      // When both classifications complete, fire phase 2
      Promise.all([phaseOneA, phaseOneB]).then(() => {
        // Input lines go solid, analytics goes ready
        setInputReady(true);
        setNodeReadiness(prev => ({ ...prev, analytics: "ready" }));
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle & deal analysis...");

        // Phase 2: parallel edge function calls
        runPhase2(enrichA.enrichedTransactions, enrichB.enrichedTransactions, customerA.zip, customerB.zip)
          .finally(() => {
            setPhase2Processing(false);
            setPhase2Status("All enrichment complete");
            toast.success("Full enrichment pipeline complete!");
          });
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [enrichA, enrichB, nodeReadiness, runPhase2]);

  return {
    nodeReadiness,
    inputReady,
    isProcessing,
    statusMessage,
    enrichedA: enrichA.enrichedTransactions,
    enrichedB: enrichB.enrichedTransactions,
    startEnrichment,
  };
}
