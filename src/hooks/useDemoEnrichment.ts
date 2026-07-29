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
  aiFinancialInsights: "idle",
  dealPersonalization: "idle",
};

const PERIPHERAL_NODES: DemoNodeType[] = ["engagement", "analytics", "rewards", "travel", "lifeEvents", "wealth", "outflow", "locational", "lifeEventIntel", "wmCopilot", "aiFinancialInsights", "dealPersonalization"];

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
  classification: ApiPayloadEntry | null;
  dealPersonalization: ApiPayloadEntry | null;
  localExperiences: ApiPayloadEntry | null;
  lifestyleSignals: ApiPayloadEntry | null;
}

interface DemoEnrichmentResult {
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
  isProcessing: boolean;
  statusMessage: string;
  enriched: EnrichedTransaction[];
  localExperiences: LocalExperiencesData;
  personalizedDeals: PersonalizedDealData | null;
  detectedEvents: DetectedLifeEventResult[];
  apiPayloads: ApiPayloads;
  tip: FinancialTip | null;
  riskFlags: { flags: any[]; summary: string } | null;
  startEnrichment: (customer: DemoCustomer) => void;
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
  const [personalizedDeals, setPersonalizedDeals] = useState<PersonalizedDealData | null>(null);
  const [detectedEvents, setDetectedEvents] = useState<DetectedLifeEventResult[]>([]);
  const [tip, setTip] = useState<FinancialTip | null>(null);
  const [riskFlags, setRiskFlags] = useState<{ flags: any[]; summary: string } | null>(null);
  const [apiPayloads, setApiPayloads] = useState<ApiPayloads>({
    classification: null,
    dealPersonalization: null,
    localExperiences: null,
    lifestyleSignals: null,
  });
  const pendingReadyRef = useRef<Partial<NodeReadiness>>({});
  const engineReadyRef = useRef(false);
  const pendingConsumerRef = useRef<Set<DemoNodeType>>(new Set());

  const CONSUMER_DEPS: Record<string, DemoNodeType[]> = {
    engagement: ["analytics", "outflow", "aiFinancialInsights"],
    rewards: ["dealPersonalization"],
    wealth: ["lifeEventIntel", "lifeEvents"],
  };
  const CONSUMER_NODES = new Set(Object.keys(CONSUMER_DEPS));

  const setNodeReady = useCallback((updates: Partial<NodeReadiness>) => {
    const { engine: engineUpdate, ...peripheralUpdates } = updates;

    if (engineUpdate === "ready") {
      engineReadyRef.current = true;
      const flushed = { ...pendingReadyRef.current };
      pendingReadyRef.current = {};
      setNodeReadiness(prev => {
        const next = { ...prev, engine: "ready" as const, ...flushed, ...peripheralUpdates };
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

    const bankUpdates: Partial<NodeReadiness> = {};
    const consumerUpdates: DemoNodeType[] = [];

    for (const [key, val] of Object.entries(peripheralUpdates)) {
      if (val === "ready" && CONSUMER_NODES.has(key)) {
        consumerUpdates.push(key as DemoNodeType);
      } else {
        bankUpdates[key as DemoNodeType] = val;
      }
    }

    setNodeReadiness(prev => {
      const next = { ...prev, ...bankUpdates };

      const immediateFlush: DemoNodeType[] = [];
      for (const cn of consumerUpdates) {
        if (CONSUMER_DEPS[cn]?.every(dep => next[dep] === "ready")) {
          immediateFlush.push(cn);
        } else {
          pendingConsumerRef.current.add(cn);
        }
      }

      for (const cn of pendingConsumerRef.current) {
        if (CONSUMER_DEPS[cn]?.every(dep => next[dep] === "ready")) {
          immediateFlush.push(cn);
          pendingConsumerRef.current.delete(cn);
        }
      }

      if (immediateFlush.length > 0) {
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

  const lastEnrichedRef = useRef<string | null>(null);

  const enrich = useSSEEnrichment();

  const isProcessing = enrich.isProcessing || phase2Processing;

  const statusMessage = phase2Processing
    ? phase2Status
    : enrich.isProcessing
      ? enrich.statusMessage
      : enrich.statusMessage || phase2Status || "";

  const startEnrichment = useCallback((customer: DemoCustomer) => {
    if (!customer) return;

    if (
      lastEnrichedRef.current === customer.id &&
      nodeReadiness.analytics === "ready" &&
      nodeReadiness.dealPersonalization === "ready"
    ) {
      // Suppressed toast on demo
      return;
    }

    lastEnrichedRef.current = customer.id;

    // Reset state
    setNodeReadiness({ ...INITIAL_READINESS });
    setInputReady(false);
    setPhase2Processing(false);
    setPhase2Status("");
    setLocalExperiences({});
    setPersonalizedDeals(null);
    setDetectedEvents([]);
    setTip(null);
    setRiskFlags(null);
    setApiPayloads({
      classification: null,
      dealPersonalization: null,
      localExperiences: null,
      lifestyleSignals: null,
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
        aiFinancialInsights: "processing",
        dealPersonalization: "processing",
      });
    }, 100);

    const parseCSV = (c: DemoCustomer) => {
      const result = parsePastedText(c.csv);
      if (result.needsMapping || !result.transactions) {
        throw new Error(`Failed to parse CSV for ${c.profile.name}`);
      }
      return result.transactions;
    };

    try {
      const txns = parseCSV(customer);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers = getHeaders();

      let phase2Started = false;

      const maybeStartPhase2 = (classified: EnrichedTransaction[]) => {
        if (phase2Started) return;
        phase2Started = true;

        setInputReady(true);
        setNodeReady({ engine: "ready", analytics: "ready", outflow: "ready", aiFinancialInsights: "ready", profiling: "ready", predictive: "ready", phase: "ready" });
        setPhase2Processing(true);
        setPhase2Status("Running lifestyle analysis...");

        // Fire deal personalization
        const fireRewardsPersonalization = async () => {
          try {
            const profile = deriveCustomerProfile(classified);
            const deals = getRelevantDeals(profile, 11);
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
            setApiPayloads(prev => ({ ...prev, dealPersonalization: { request: payload, response: data } }));
            const map: Record<string, { msg: string; cta: string }> = {};
            (data?.recs || []).forEach((r: any) => { map[r.id] = { msg: r.msg, cta: r.cta }; });
            setPersonalizedDeals({ deals, personalized: map });
          } catch (err) {
            console.warn("[Phase2] Deal personalization failed:", err);
          }
          setNodeReady({ rewards: "ready", dealPersonalization: "ready", travel: "ready", locational: "ready" });
        };

        fireRewardsPersonalization();

        // Fire lifestyle signals
        const fireLifestyle = async () => {
          const summary = buildSpendingSummary(classified);
          const requestPayload = {
            client: {
              name: customer.profile.name,
              age: customer.profile.demographics.age,
              occupation: customer.profile.demographics.occupation,
              family_status: customer.profile.demographics.familyStatus,
            },
            transactions: classified,
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
            setApiPayloads(prev => ({ ...prev, lifestyleSignals: { request: requestPayload, response: data } }));
            const events: DetectedLifeEventResult[] = (data?.detected_events ?? []).slice(0, 3);
            setDetectedEvents(events);
          } catch (err) {
            console.warn(`[Phase2] Lifestyle failed:`, err);
            setDetectedEvents([]);
          }
        };

        // Fire coaching tips
        const fireCoachingTips = async () => {
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
              body: JSON.stringify({ transactions: classified, customer: customerContext }),
            });
            if (!res.ok) return;
            const data = await res.json();
            setTip(data);
          } catch (e) {
            console.warn(`[Phase2] Tip generation failed:`, e);
          }
        };

        // Fire risk detection
        const fireRiskDetection = async () => {
          try {
            const res = await fetch(`${supabaseUrl}/functions/v1/detect-risk-transactions`, {
              method: "POST",
              headers,
              body: JSON.stringify({ transactions: classified }),
            });
            if (!res.ok) return;
            const data = await res.json();
            setRiskFlags(data);
          } catch (e) {
            console.warn(`[Phase2] Risk detection failed:`, e);
          }
        };

        // Run lifestyle + tips + risk in parallel
        const lifestylePromise = fireLifestyle();
        const tipsPromise = fireCoachingTips();
        const riskPromise = fireRiskDetection();

        lifestylePromise
          .then(() => {
            setNodeReady({ wealth: "ready", lifeEvents: "ready", lifeEventIntel: "ready", wmCopilot: "ready" });
          })
          .catch(() => {
            setNodeReady({ wealth: "ready", lifeEvents: "ready", lifeEventIntel: "ready", wmCopilot: "ready" });
          });

        Promise.all([lifestylePromise, tipsPromise, riskPromise])
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

      const onClassified = (classified: EnrichedTransaction[]) => {
        setApiPayloads(prev => ({ ...prev, classification: { request: { transactions: (txns?.length ?? 0) + " transactions" }, response: { enriched_count: classified.length, sample: classified.slice(0, 3) } } }));
        maybeStartPhase2(classified);
      };

      // === FIRE EVERYTHING IN PARALLEL ===

      // 1. Classify + travel-detection (readiness already set via dealPersonalization)
      enrich.startEnrichment(txns, customer.zip, onClassified, { suppressToasts: true });

      // 2. Local experiences
      const CATEGORIES = ["dining", "entertainment", "shopping"];
      const fetchLocalExperiences = async () => {
        const trip = customer.trips[0];
        if (!trip) return [];

        const city = trip.destination.split(",")[0].trim();
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
          return [{ destination: city, deals: allDeals }];
        } catch (err) {
          console.warn(`[LocalExp] Failed for ${city}:`, err);
          return [];
        }
      };

      fetchLocalExperiences()
        .then((results) => {
          const expData: LocalExperiencesData = {};
          expData[customer.id] = results;
          setLocalExperiences(expData);
          setApiPayloads(prev => ({ ...prev, localExperiences: { request: { city: customer.trips[0]?.destination.split(",")[0].trim(), categories: CATEGORIES }, response: results } }));
        })
        .catch(() => {});

    } catch (err: any) {
      console.error('[Demo Enrichment Error]', err.message);
    }
  }, [enrich, nodeReadiness, setNodeReady]);

  return {
    nodeReadiness,
    inputReady,
    isProcessing,
    statusMessage,
    enriched: enrich.enrichedTransactions,
    localExperiences,
    personalizedDeals,
    detectedEvents,
    apiPayloads,
    tip,
    riskFlags,
    startEnrichment,
  };
}
