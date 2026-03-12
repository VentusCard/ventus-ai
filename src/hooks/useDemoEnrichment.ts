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

function getHeaders() {
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
  };
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

  const startEnrichment = useCallback((customerA: DemoCustomer, customerB: DemoCustomer) => {
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers = getHeaders();

      // Track whether phase2 already started (from whichever classification finishes first)
      let classifiedResults: EnrichedTransaction[][] = [];
      let phase2Started = false;

      const maybeStartPhase2 = () => {
        // Need both classifications to start lifestyle signals
        if (classifiedResults.length < 2 || phase2Started) return;
        phase2Started = true;

        const allClassified = [...classifiedResults[0], ...classifiedResults[1]];

        // Mark input lines solid + analytics ready
        setInputReady(true);
        setNodeReadiness(prev => ({ ...prev, analytics: "ready" }));
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle analysis...");

        // Fire lifestyle signals (needs classified txns)
        const spendingSummary = buildSpendingSummary(allClassified);
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
            transactions: allClassified.slice(0, 75),
            spending_summary: spendingSummary,
          }),
        }).then(r => r.ok ? r.json() : Promise.reject(new Error(`lifestyle: ${r.status}`)));

        lifestylePromise
          .then(data => {
            console.log("[Phase2] Lifestyle signals:", data);
            setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
          })
          .catch(err => {
            console.warn("[Phase2] Lifestyle failed:", err);
            setNodeReadiness(prev => ({ ...prev, wealth: "ready", engagement: "ready" }));
          })
          .finally(() => {
            setPhase2Processing(false);
            setPhase2Status("All enrichment complete");
          });
      };

      const onClassified = (classified: EnrichedTransaction[]) => {
        classifiedResults.push(classified);
        maybeStartPhase2();
      };

      // === FIRE EVERYTHING IN PARALLEL ===

      // 1. Classify + travel for A (travel runs after classify inside useSSEEnrichment)
      //    onClassified fires RIGHT AFTER classification, before travel starts
      enrichA.startEnrichment(txnsA, customerA.zip, onClassified);

      // 2. Classify + travel for B
      enrichB.startEnrichment(txnsB, customerB.zip, onClassified);

      // 3. Deal personalization — NO dependency on classification, fire at t=0
      const deals = customerA.deals.map((d, i) => ({
        id: `deal_${i}`, m: d.brand, c: d.tag, r: d.offer,
      }));
      const profile = {
        pillars: customerA.topPillars.map(p => ({ name: p.name, spend: p.spend, pct: p.pct })),
        signals: [],
      };
      const ctx = {
        demo: {
          occ: customerA.profile.demographics.occupation,
          fam: customerA.profile.demographics.familyStatus,
          inc: customerA.profile.aum,
          tier: customerA.profile.segment,
        },
      };

      if (deals.length > 0) {
        fetch(`${supabaseUrl}/functions/v1/deal-personalization`, {
          method: "POST",
          headers,
          body: JSON.stringify({ deals, profile, ctx, txCount: txnsA.length + txnsB.length }),
        })
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`deals: ${r.status}`)))
          .then(data => {
            console.log("[Phase2] Deals:", data);
            setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
          })
          .catch(err => {
            console.warn("[Phase2] Deals failed:", err);
            setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
          });
      } else {
        setNodeReadiness(prev => ({ ...prev, rewards: "ready" }));
      }

      // 4. Travel node becomes ready when useSSEEnrichment completes (promise resolves)
      Promise.all([
        enrichA.startEnrichment(txnsA, customerA.zip, onClassified),
        enrichB.startEnrichment(txnsB, customerB.zip, onClassified),
      ]).then(() => {
        setNodeReadiness(prev => ({ ...prev, travel: "ready" }));
      });

    } catch (err: any) {
      toast.error(err.message);
    }
  }, [enrichA, enrichB, nodeReadiness]);

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
