import { useState, useCallback, useRef } from "react";
import { useSSEEnrichment } from "./useSSEEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import type { EnrichedTransaction } from "@/types/transaction";
import { toast } from "sonner";
import { deriveCustomerProfile, getRelevantDeals, type BankDeal, type DerivedCustomerProfile } from "@/lib/dealSelectionUtils";

export type NodeReadiness = Record<DemoNodeType, "idle" | "processing" | "ready">;

export interface LocalExperienceDeal {
  type: string;
  merchantExample: string;
}

export interface LocalExperiencesData {
  [customerId: string]: { destination: string; deals: LocalExperienceDeal[] }[];
}

const INITIAL_READINESS: NodeReadiness = {
  engagement: "idle",
  analytics: "idle",
  rewards: "idle",
  travel: "idle",
  lifeEvents: "idle",
  wealth: "idle",
  engine: "idle",
};

const PERIPHERAL_NODES: DemoNodeType[] = ["engagement", "analytics", "rewards", "travel", "lifeEvents", "wealth"];

export interface PersonalizedDealData {
  deals: BankDeal[];
  personalized: Record<string, { msg: string; cta: string }>;
}

interface DemoEnrichmentResult {
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
  isProcessing: boolean;
  statusMessage: string;
  enrichedA: EnrichedTransaction[];
  enrichedB: EnrichedTransaction[];
  localExperiences: LocalExperiencesData;
  personalizedDealsA: PersonalizedDealData | null;
  personalizedDealsB: PersonalizedDealData | null;
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
  const [localExperiences, setLocalExperiences] = useState<LocalExperiencesData>({});
  const [personalizedDealsA, setPersonalizedDealsA] = useState<PersonalizedDealData | null>(null);
  const [personalizedDealsB, setPersonalizedDealsB] = useState<PersonalizedDealData | null>(null);
  const pendingReadyRef = useRef<Partial<NodeReadiness>>({});
  const engineReadyRef = useRef(false);

  // Helper: gate peripheral updates behind engine readiness
  const setNodeReady = useCallback((updates: Partial<NodeReadiness>) => {
    // Filter out engine from peripheral gating logic
    const { engine: engineUpdate, ...peripheralUpdates } = updates;

    if (engineUpdate === "ready") {
      // Engine is becoming ready — flush all pending peripheral updates too
      engineReadyRef.current = true;
      const flushed = { ...pendingReadyRef.current };
      pendingReadyRef.current = {};
      setNodeReadiness(prev => ({ ...prev, engine: "ready", ...flushed, ...peripheralUpdates }));
      return;
    }

    if (!engineReadyRef.current && Object.keys(peripheralUpdates).length > 0) {
      // Engine not ready yet — queue peripheral updates
      pendingReadyRef.current = { ...pendingReadyRef.current, ...peripheralUpdates };
      return;
    }

    // Engine already ready — apply immediately
    setNodeReadiness(prev => ({ ...prev, ...updates }));
  }, []);
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
    setLocalExperiences({});
    setPersonalizedDealsA(null);
    setPersonalizedDealsB(null);
    engineReadyRef.current = false;
    pendingReadyRef.current = {};

    // Engine ready is now set in maybeStartPhase2 when classifications complete

    // Set all to processing
    setTimeout(() => {
      setNodeReadiness({
        engagement: "processing",
        analytics: "processing",
        rewards: "processing",
        travel: "processing",
        lifeEvents: "processing",
        wealth: "processing",
        engine: "processing",
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

        const classifiedA = classifiedResults[0];
        const classifiedB = classifiedResults[1];
        const allClassified = [...classifiedA, ...classifiedB];

        // Mark input lines solid + analytics & engine ready
        setInputReady(true);
        setNodeReady({ engine: "ready", analytics: "ready" });
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle analysis...");

        // Fire deal personalization from enriched data
        const fireRewardsPersonalization = async () => {
          try {
            const profileA = deriveCustomerProfile(classifiedA);
            const profileB = deriveCustomerProfile(classifiedB);
            const dealsSelA = getRelevantDeals(profileA, 10);
            const dealsSelB = getRelevantDeals(profileB, 10);

            const personalize = async (deals: BankDeal[], profile: DerivedCustomerProfile, customer: DemoCustomer) => {
              const payload = {
                deals: deals.map(d => ({ id: d.id, m: d.merchantName, c: d.merchantCategory, r: d.rewardValue })),
                profile: {
                  pillars: profile.topPillars.map(p => ({ name: p.pillar, spend: Math.round(p.annualSpend), pct: Math.round((p.annualSpend / (profile.totalSpend || 1)) * 100) })),
                  signals: profile.lifestyleSignals,
                },
                ctx: {
                  demo: {
                    occ: customer.profile.demographics.occupation,
                    fam: customer.profile.demographics.familyStatus,
                    inc: customer.profile.aum,
                    tier: customer.profile.segment,
                  },
                  persona: { traits: profile.lifestyleSignals, interests: profile.topPillars.map(p => p.pillar) },
                },
                txCount: profile.topPillars.reduce((s, p) => s + p.transactionCount, 0),
              };
              const res = await fetch(`${supabaseUrl}/functions/v1/deal-personalization`, { method: "POST", headers, body: JSON.stringify(payload) });
              if (!res.ok) throw new Error(`deals: ${res.status}`);
              const data = await res.json();
              const map: Record<string, { msg: string; cta: string }> = {};
              (data?.recs || []).forEach((r: any) => { map[r.id] = { msg: r.msg, cta: r.cta }; });
              return { deals, personalized: map } as PersonalizedDealData;
            };

            const [resultA, resultB] = await Promise.all([
              personalize(dealsSelA, profileA, customerA),
              personalize(dealsSelB, profileB, customerB),
            ]);
            setPersonalizedDealsA(resultA);
            setPersonalizedDealsB(resultB);
          } catch (err) {
            console.warn("[Phase2] Deal personalization failed:", err);
          }
          setNodeReady({ rewards: "ready" });
        };

        fireRewardsPersonalization();

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
            setNodeReady({ wealth: "ready", engagement: "ready", lifeEvents: "ready" });
          })
          .catch(err => {
            console.warn("[Phase2] Lifestyle failed:", err);
            setNodeReady({ wealth: "ready", engagement: "ready", lifeEvents: "ready" });
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

      // 1. Classify only (no travel-detection) — pass undefined for homeZip
      const promiseA = enrichA.startEnrichment(txnsA, undefined, onClassified);
      const promiseB = enrichB.startEnrichment(txnsB, undefined, onClassified);

      // 2. Deal personalization — now handled inside maybeStartPhase2 after classification

      // 3. Local experiences — fire at t=0 for each customer's first trip destination
      const CATEGORIES = ["dining", "entertainment", "shopping"];
      const fetchLocalExperiences = async (customer: DemoCustomer) => {
        const trip = customer.trips[0];
        if (!trip) return { customerId: customer.id, results: [] };

        const city = trip.destination.split(",")[0].trim();
        const results: { destination: string; deals: LocalExperienceDeal[] }[] = [];

        try {
          const responses = await Promise.all(
            CATEGORIES.map(cat =>
              fetch(`${supabaseUrl}/functions/v1/local-experiences`, {
                method: "POST",
                headers,
                body: JSON.stringify({ city, category: cat }),
              }).then(r => r.ok ? r.json() : { deals: [] })
            )
          );
          const allDeals = responses.flatMap(r => r.deals || []);
          results.push({ destination: city, deals: allDeals });
        } catch (err) {
          console.warn(`[LocalExp] Failed for ${city}:`, err);
        }
        return { customerId: customer.id, results };
      };

      Promise.all([fetchLocalExperiences(customerA), fetchLocalExperiences(customerB)])
        .then(([resA, resB]) => {
          setLocalExperiences({
            [resA.customerId]: resA.results,
            [resB.customerId]: resB.results,
          });
          setNodeReady({ travel: "ready" });
        })
        .catch(() => {
          setNodeReady({ travel: "ready" });
        });

    } catch (err: any) {
      toast.error(err.message);
    }
  }, [enrichA, enrichB, nodeReadiness, setNodeReady]);

  return {
    nodeReadiness,
    inputReady,
    isProcessing,
    statusMessage,
    enrichedA: enrichA.enrichedTransactions,
    enrichedB: enrichB.enrichedTransactions,
    localExperiences,
    startEnrichment,
  };
}
