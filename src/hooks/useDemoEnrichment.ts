import { useState, useCallback, useRef } from "react";
import { useSSEEnrichment } from "./useSSEEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import type { EnrichedTransaction } from "@/types/transaction";
import type { FinancialTip } from "@/lib/wellnessIntelligenceEngine";
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
  profiling: "idle",
  predictive: "idle",
  phase: "idle",
  outflow: "idle",
  locational: "idle",
  lifeEventIntel: "idle",
  wmCopilot: "idle",
};

const PERIPHERAL_NODES: DemoNodeType[] = ["engagement", "analytics", "rewards", "travel", "lifeEvents", "wealth", "outflow", "locational", "lifeEventIntel", "wmCopilot"];

export interface DetectedLifeEventEvidence {
  merchant: string;
  amount: number;
  date: string;
  relevance: string;
}

export interface DetectedLifeEventResult {
  event_name: string;
  confidence: number;
  evidence: DetectedLifeEventEvidence[];
  talking_points: string[];
  financial_projection?: any;
}

export interface PersonalizedDealData {
  deals: BankDeal[];
  personalized: Record<string, { msg: string; cta: string }>;
}

export interface ApiPayloadEntry {
  request: any;
  response: any;
}

export interface ApiPayloads {
  classificationA: ApiPayloadEntry | null;
  classificationB: ApiPayloadEntry | null;
  dealPersonalizationA: ApiPayloadEntry | null;
  dealPersonalizationB: ApiPayloadEntry | null;
  localExperiencesA: ApiPayloadEntry | null;
  localExperiencesB: ApiPayloadEntry | null;
  lifestyleSignalsA: ApiPayloadEntry | null;
  lifestyleSignalsB: ApiPayloadEntry | null;
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
  detectedEventA: DetectedLifeEventResult[];
  detectedEventB: DetectedLifeEventResult[];
  apiPayloads: ApiPayloads;
  tipA: FinancialTip | null;
  tipB: FinancialTip | null;
  startEnrichment: (customerA: DemoCustomer | null, customerB: DemoCustomer | null) => void;
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
  const [detectedEventA, setDetectedEventA] = useState<DetectedLifeEventResult[]>([]);
  const [detectedEventB, setDetectedEventB] = useState<DetectedLifeEventResult[]>([]);
  const [tipA, setTipA] = useState<FinancialTip | null>(null);
  const [tipB, setTipB] = useState<FinancialTip | null>(null);
  const [apiPayloads, setApiPayloads] = useState<ApiPayloads>({
    classificationA: null, classificationB: null,
    dealPersonalizationA: null, dealPersonalizationB: null,
    localExperiencesA: null, localExperiencesB: null,
    lifestyleSignalsA: null, lifestyleSignalsB: null,
  });
  const pendingReadyRef = useRef<Partial<NodeReadiness>>({});
  const engineReadyRef = useRef(false);
  const pendingConsumerRef = useRef<Set<DemoNodeType>>(new Set());

  // Consumer nodes must wait for their bank-facing row partners
  const CONSUMER_DEPS: Record<string, DemoNodeType[]> = {
    engagement: ["analytics", "outflow"],
    rewards: ["travel", "locational"],
    wealth: ["lifeEventIntel", "lifeEvents"],
  };
  const CONSUMER_NODES = new Set(Object.keys(CONSUMER_DEPS));

  // Helper: gate peripheral updates behind engine readiness + consumer-node ordering
  const setNodeReady = useCallback((updates: Partial<NodeReadiness>) => {
    // Filter out engine from peripheral gating logic
    const { engine: engineUpdate, ...peripheralUpdates } = updates;

    if (engineUpdate === "ready") {
      engineReadyRef.current = true;
      const flushed = { ...pendingReadyRef.current };
      pendingReadyRef.current = {};
      // Apply engine + flushed + peripheral, then check consumer queue
      setNodeReadiness(prev => {
        const next = { ...prev, engine: "ready" as const, ...flushed, ...peripheralUpdates };
        // Flush any queued consumer nodes whose bank deps are now met
        const toFlush: DemoNodeType[] = [];
        for (const cn of pendingConsumerRef.current) {
          if (CONSUMER_DEPS[cn]?.every(dep => next[dep] === "ready")) {
            toFlush.push(cn);
          }
        }
        if (toFlush.length > 0) {
          toFlush.forEach(cn => pendingConsumerRef.current.delete(cn));
          setTimeout(() => {
            setNodeReadiness(p => {
              const u: Partial<NodeReadiness> = {};
              toFlush.forEach(cn => { u[cn] = "ready"; });
              return { ...p, ...u };
            });
          }, 300);
        }
        return next;
      });
      return;
    }

    if (!engineReadyRef.current && Object.keys(peripheralUpdates).length > 0) {
      pendingReadyRef.current = { ...pendingReadyRef.current, ...peripheralUpdates };
      return;
    }

    // Separate consumer vs bank updates
    const bankUpdates: Partial<NodeReadiness> = {};
    const consumerUpdates: DemoNodeType[] = [];

    for (const [key, val] of Object.entries(peripheralUpdates)) {
      if (val === "ready" && CONSUMER_NODES.has(key)) {
        consumerUpdates.push(key as DemoNodeType);
      } else {
        bankUpdates[key as DemoNodeType] = val;
      }
    }

    // Apply bank updates immediately, then check if consumer nodes can flush
    setNodeReadiness(prev => {
      const next = { ...prev, ...bankUpdates };

      // Check each consumer update against deps
      const immediateFlush: DemoNodeType[] = [];
      for (const cn of consumerUpdates) {
        if (CONSUMER_DEPS[cn]?.every(dep => next[dep] === "ready")) {
          immediateFlush.push(cn);
        } else {
          pendingConsumerRef.current.add(cn);
        }
      }

      // Also check any previously queued consumer nodes
      for (const cn of pendingConsumerRef.current) {
        if (CONSUMER_DEPS[cn]?.every(dep => next[dep] === "ready")) {
          immediateFlush.push(cn);
          pendingConsumerRef.current.delete(cn);
        }
      }

      if (immediateFlush.length > 0) {
        // Stagger consumer light-up by 300ms after bank nodes
        setTimeout(() => {
          setNodeReadiness(p => {
            const u: Partial<NodeReadiness> = {};
            immediateFlush.forEach(cn => { u[cn] = "ready"; });
            return { ...p, ...u };
          });
        }, 300);
      }

      return next;
    });
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

  const startEnrichment = useCallback((customerA: DemoCustomer | null, customerB: DemoCustomer | null) => {
    if (!customerA && !customerB) return;

    const idA = customerA?.id ?? "__none__";
    const idB = customerB?.id ?? "__none__";
    if (
      lastEnrichedRef.current?.a === idA &&
      lastEnrichedRef.current?.b === idB &&
      nodeReadiness.analytics === "ready" &&
      nodeReadiness.travel === "ready"
    ) {
      toast.info("Already enriched. Change a customer to re-enrich.");
      return;
    }

    lastEnrichedRef.current = { a: idA, b: idB };

    // Reset state
    setNodeReadiness({ ...INITIAL_READINESS });
    setInputReady(false);
    setPhase2Processing(false);
    setPhase2Status("");
    setLocalExperiences({});
    setPersonalizedDealsA(null);
    setPersonalizedDealsB(null);
    setDetectedEventA([]);
    setDetectedEventB([]);
    setTipA(null);
    setTipB(null);
    setApiPayloads({
      classificationA: null, classificationB: null,
      dealPersonalizationA: null, dealPersonalizationB: null,
      localExperiencesA: null, localExperiencesB: null,
      lifestyleSignalsA: null, lifestyleSignalsB: null,
    });
    engineReadyRef.current = false;
    pendingReadyRef.current = {};
    pendingConsumerRef.current = new Set();

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
        profiling: "processing",
        predictive: "processing",
        phase: "processing",
        outflow: "processing",
        locational: "processing",
        lifeEventIntel: "processing",
        wmCopilot: "processing",
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
      const txnsA = customerA ? parseCSV(customerA) : null;
      const txnsB = customerB ? parseCSV(customerB) : null;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers = getHeaders();

      const hasA = !!customerA && !!txnsA;
      const hasB = !!customerB && !!txnsB;

      // Track whether phase2 already started
      let classifiedResults: { a?: EnrichedTransaction[]; b?: EnrichedTransaction[] } = {};
      // If a customer is missing, pre-fill their classification as done
      if (!hasA) classifiedResults.a = [];
      if (!hasB) classifiedResults.b = [];
      let phase2Started = false;

      const maybeStartPhase2 = () => {
        if (!classifiedResults.a || !classifiedResults.b || phase2Started) return;
        phase2Started = true;

        const classifiedA = classifiedResults.a;
        const classifiedB = classifiedResults.b;

        setInputReady(true);
        setNodeReady({ engine: "ready", analytics: "ready", outflow: "ready", profiling: "ready", predictive: "ready", phase: "ready" });
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle analysis...");

        // Fire deal personalization
        const fireRewardsPersonalization = async () => {
          try {
            const results: [PersonalizedDealData | null, PersonalizedDealData | null] = [null, null];
            const personalize = async (customer: DemoCustomer, classified: EnrichedTransaction[], label: "A" | "B") => {
              const profile = deriveCustomerProfile(classified);
              const deals = getRelevantDeals(profile, 10);
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
              setApiPayloads(prev => ({ ...prev, [`dealPersonalization${label}`]: { request: payload, response: data } }));
              const map: Record<string, { msg: string; cta: string }> = {};
              (data?.recs || []).forEach((r: any) => { map[r.id] = { msg: r.msg, cta: r.cta }; });
              return { deals, personalized: map } as PersonalizedDealData;
            };

            const promises: Promise<void>[] = [];
            if (hasA && customerA) promises.push(personalize(customerA, classifiedA, "A").then(r => { results[0] = r; }));
            if (hasB && customerB) promises.push(personalize(customerB, classifiedB, "B").then(r => { results[1] = r; }));
            await Promise.all(promises);
            setPersonalizedDealsA(results[0]);
            setPersonalizedDealsB(results[1]);
          } catch (err) {
            console.warn("[Phase2] Deal personalization failed:", err);
          }
          setNodeReady({ rewards: "ready" });
        };

        fireRewardsPersonalization();

        // Fire lifestyle signals
        const fireLifestyleForCustomer = async (
          customer: DemoCustomer,
          txns: EnrichedTransaction[],
          setResult: (r: DetectedLifeEventResult[]) => void,
          label: "A" | "B",
        ) => {
          const summary = buildSpendingSummary(txns);
          const requestPayload = {
            client: {
              name: customer.profile.name,
              age: customer.profile.demographics.age,
              occupation: customer.profile.demographics.occupation,
              family_status: customer.profile.demographics.familyStatus,
            },
            transactions: txns,
            spending_summary: summary,
          };
          try {
            const res = await fetch(`${supabaseUrl}/functions/v1/analyze-lifestyle-signals`, {
              method: "POST",
              headers,
              body: JSON.stringify(requestPayload),
            });
            if (!res.ok) throw new Error(`lifestyle: ${res.status}`);
            const data = await res.json();
            setApiPayloads(prev => ({ ...prev, [`lifestyleSignals${label}`]: { request: requestPayload, response: data } }));
            console.log(`[Phase2] Lifestyle signals for ${customer.profile.name}:`, data);
            const events: DetectedLifeEventResult[] = (data?.detected_events ?? []).slice(0, 3);
            setResult(events);
          } catch (err) {
            console.warn(`[Phase2] Lifestyle failed for ${customer.profile.name}:`, err);
            setResult([]);
          }
        };

        // Fire coaching tips
        const fireCoachingTips = async () => {
          const fetchTipFor = async (customer: DemoCustomer, txns: EnrichedTransaction[]): Promise<FinancialTip | null> => {
            try {
              const customerContext = {
                name: customer.profile.name,
                lifestyleType: customer.lifestyleType,
                segment: customer.profile.segment,
                demographics: customer.profile.demographics,
                holdings: customer.profile.holdings,
              };
              const res = await fetch(`${supabaseUrl}/functions/v1/generate-financial-tip`, {
                method: "POST",
                headers,
                body: JSON.stringify({ transactions: txns, customer: customerContext }),
              });
              if (!res.ok) return null;
              return await res.json();
            } catch (e) {
              console.warn(`[Phase2] Tip generation failed for ${customer.profile.name}:`, e);
              return null;
            }
          };
          const promises: Promise<void>[] = [];
          if (hasA && customerA) promises.push(fetchTipFor(customerA, classifiedA).then(t => setTipA(t)));
          if (hasB && customerB) promises.push(fetchTipFor(customerB, classifiedB).then(t => setTipB(t)));
          await Promise.all(promises);
        };

        // Run lifestyle + tips in parallel
        const lifestylePromises: Promise<void>[] = [];
        if (hasA && customerA) lifestylePromises.push(fireLifestyleForCustomer(customerA, classifiedA, setDetectedEventA, "A"));
        if (hasB && customerB) lifestylePromises.push(fireLifestyleForCustomer(customerB, classifiedB, setDetectedEventB, "B"));
        const lifestylePromise = Promise.all(lifestylePromises);
        const tipsPromise = fireCoachingTips();

        lifestylePromise
          .then(() => {
             setNodeReady({ wealth: "ready", lifeEvents: "ready", lifeEventIntel: "ready", wmCopilot: "ready" });
           })
           .catch(() => {
             setNodeReady({ wealth: "ready", lifeEvents: "ready", lifeEventIntel: "ready", wmCopilot: "ready" });
          });

        Promise.all([lifestylePromise, tipsPromise])
          .then(() => {
            setNodeReady({ engagement: "ready" });
          })
          .catch(() => {
            setNodeReady({ engagement: "ready" });
          })
          .finally(() => {
            setPhase2Processing(false);
            setPhase2Status("All enrichment complete");
          });
      };

      const onClassifiedA = (classified: EnrichedTransaction[]) => {
        classifiedResults.a = classified;
        setApiPayloads(prev => ({ ...prev, classificationA: { request: { transactions: (txnsA?.length ?? 0) + " transactions" }, response: { enriched_count: classified.length, sample: classified.slice(0, 3) } } }));
        maybeStartPhase2();
      };
      const onClassifiedB = (classified: EnrichedTransaction[]) => {
        classifiedResults.b = classified;
        setApiPayloads(prev => ({ ...prev, classificationB: { request: { transactions: (txnsB?.length ?? 0) + " transactions" }, response: { enriched_count: classified.length, sample: classified.slice(0, 3) } } }));
        maybeStartPhase2();
      };

      // === FIRE EVERYTHING IN PARALLEL ===

      // Track travel readiness
      let localExperiencesDone = false;
      let travelDetectionDone = false;
      const maybeSetTravelReady = () => {
        if (localExperiencesDone && travelDetectionDone) {
          setNodeReady({ travel: "ready", locational: "ready" });
        }
      };

      // 1. Classify + travel-detection
      const classifyPromises: Promise<any>[] = [];
      if (hasA && txnsA && customerA) classifyPromises.push(enrichA.startEnrichment(txnsA, customerA.zip, onClassifiedA));
      if (hasB && txnsB && customerB) classifyPromises.push(enrichB.startEnrichment(txnsB, customerB.zip, onClassifiedB));

      // If no classifications needed (shouldn't happen but safety), trigger phase2
      if (classifyPromises.length === 0) {
        travelDetectionDone = true;
        maybeStartPhase2();
      }

      Promise.all(classifyPromises)
        .then(() => {
          console.log("[Travel Detection] Complete");
          travelDetectionDone = true;
          maybeSetTravelReady();
        })
        .catch(() => {
          travelDetectionDone = true;
          maybeSetTravelReady();
        });

      // 3. Local experiences
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

      const localExpPromises: Promise<{ customerId: string; results: { destination: string; deals: LocalExperienceDeal[] }[] }>[] = [];
      if (customerA) localExpPromises.push(fetchLocalExperiences(customerA));
      if (customerB) localExpPromises.push(fetchLocalExperiences(customerB));

      if (localExpPromises.length === 0) {
        localExperiencesDone = true;
        maybeSetTravelReady();
      } else {
        Promise.all(localExpPromises)
          .then((results) => {
            const expData: LocalExperiencesData = {};
            results.forEach(r => { expData[r.customerId] = r.results; });
            setLocalExperiences(expData);
            const payloadUpdates: Partial<ApiPayloads> = {};
            if (customerA) payloadUpdates.localExperiencesA = { request: { city: customerA.trips[0]?.destination.split(",")[0].trim(), categories: CATEGORIES }, response: results.find(r => r.customerId === customerA.id)?.results ?? [] };
            if (customerB) payloadUpdates.localExperiencesB = { request: { city: customerB.trips[0]?.destination.split(",")[0].trim(), categories: CATEGORIES }, response: results.find(r => r.customerId === customerB.id)?.results ?? [] };
            setApiPayloads(prev => ({ ...prev, ...payloadUpdates }));
            localExperiencesDone = true;
            maybeSetTravelReady();
          })
          .catch(() => {
            localExperiencesDone = true;
            maybeSetTravelReady();
          });
      }

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
    personalizedDealsA,
    personalizedDealsB,
    detectedEventA,
    detectedEventB,
    apiPayloads,
    tipA,
    tipB,
    startEnrichment,
  };
}
