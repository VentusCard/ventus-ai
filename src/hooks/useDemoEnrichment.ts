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

/**
 * Build a spending summary from enriched transactions for the lifestyle signals edge function.
 */
function buildSpendingSummary(txns: EnrichedTransaction[]) {
  const total = txns.reduce((s, t) => s + (t.amount || 0), 0);
  const catMap: Record<string, number> = {};
  for (const t of txns) {
    const cat = t.pillar || "Unknown";
    catMap[cat] = (catMap[cat] || 0) + (t.amount || 0);
  }
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  return { total_spend: Math.round(total), top_categories: topCategories };
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

  const runPhase2 = useCallback(async (
    txnsA: EnrichedTransaction[],
    txnsB: EnrichedTransaction[],
    customerA: DemoCustomer,
    customerB: DemoCustomer,
  ) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    };

    const allTxns = [...txnsA, ...txnsB];
    const spendingSummary = buildSpendingSummary(allTxns);

    // 1. Lifestyle signals — expects { client, transactions, spending_summary }
    const lifestylePromise = fetch(`${supabaseUrl}/functions/v1/analyze-lifestyle-signals`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        client: {
          name: customerA.profile.name,
          age: customerA.profile.demographics.age,
          occupation: customerA.profile.demographics.occupation,
          family_status: customerA.profile.demographics.familyStatus,
        },
        transactions: allTxns.slice(0, 75),
        spending_summary: spendingSummary,
      }),
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`lifestyle: ${r.status}`)));

    // 2. Deal personalization — expects { deals, profile, ctx }
    const profile = {
      pillars: customerA.topPillars.map(p => ({ name: p.name, spend: p.spend, pct: p.pct })),
      signals: allTxns.slice(0, 20).map(t => t.normalized_merchant || t.merchant_name),
    };
    const deals = customerA.deals.map((d, i) => ({
      id: `deal_${i}`,
      m: d.brand,
      c: d.tag,
      r: d.offer,
    }));
    const ctx = {
      demo: {
        occ: customerA.profile.demographics.occupation,
        fam: customerA.profile.demographics.familyStatus,
        inc: customerA.profile.aum,
        tier: customerA.profile.segment,
      },
    };

    const dealsPromise = deals.length > 0
      ? fetch(`${supabaseUrl}/functions/v1/deal-personalization`, {
          method: "POST",
          headers,
          body: JSON.stringify({ deals, profile, ctx, txCount: allTxns.length }),
        }).then(r => r.ok ? r.json() : Promise.reject(new Error(`deals: ${r.status}`)))
      : Promise.resolve({ recs: [] });

    const results = await Promise.allSettled([lifestylePromise, dealsPromise]);

    // Travel is already handled by useSSEEnrichment phase 1+2, mark ready
    setNodeReadiness(prev => ({ ...prev, travel: "ready" }));

    // Lifestyle → wealth + engagement nodes
    if (results[0].status === "fulfilled") {
      console.log("[Phase2] Lifestyle signals:", results[0].value);
      setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
      setPhase2Status("Lifestyle signals analyzed");
    } else {
      console.warn("[Phase2] Lifestyle failed:", results[0].reason);
      setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
    }

    // Deals → rewards node
    if (results[1].status === "fulfilled") {
      console.log("[Phase2] Deals:", results[1].value);
      setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
      setPhase2Status("Deal personalization complete");
    } else {
      console.warn("[Phase2] Deals failed:", results[1].reason);
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

      // Phase 1: classify + travel for both in parallel (returns classified txns)
      const phaseOneA = enrichA.startEnrichment(txnsA, customerA.zip);
      const phaseOneB = enrichB.startEnrichment(txnsB, customerB.zip);

      // When both complete, use RETURNED values (not stale state)
      Promise.all([phaseOneA, phaseOneB]).then(([classifiedA, classifiedB]) => {
        // Input lines go solid, analytics goes ready
        setInputReady(true);
        setNodeReadiness(prev => ({ ...prev, analytics: "ready" }));
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle & deal analysis...");

        // Phase 2: use the returned classified transactions directly
        runPhase2(classifiedA, classifiedB, customerA, customerB)
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
