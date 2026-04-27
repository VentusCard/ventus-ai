import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ExecDemoLeftPanel from "@/components/exec-demo/ExecDemoLeftPanel";
import ExecDemoIntelPanel, { type PersonaSynthesis, type PillarRollup, getColor } from "@/components/exec-demo/ExecDemoIntelPanel";
import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import type { CardActions } from "@/components/exec-demo/NextProductRationale";
import ExecDemoSelectionDialog from "@/components/exec-demo/ExecDemoSelectionDialog";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { getIntelligenceForCustomer, getCsvForCustomer, buildLocalProfile, csvToClassifyPayload, buildSignalMapFromClassified, type SignalEntry, type ExecPersona, type ExecIntelligence, type Transaction, type EnrichedTransaction } from "@/components/exec-demo/execDemoData";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import ContactFormDialog from "@/components/ContactFormDialog";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { supabase } from "@/integrations/supabase/client";

import type { SelectedSignal } from "@/components/exec-demo/NextConversationRationale";

type TabKey = "analytics" | "rewards" | "product" | "relationship";
type Phase = "idle" | "scroll" | "cardScan" | "cardCycle" | "hold";

const TAB_ORDER: TabKey[] = ["analytics", "rewards", "product", "relationship"];

const TIMINGS = {
  scroll: 9000,
  personaPause: 1500,
  cardScan: 1320,
  collectInterval: 320,
  collectBuffer: 640,
  cardReveal: 1000,
  hold: 999999,
};

export default function ExecDemoPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [processedIndices, setProcessedIndices] = useState<number[]>([]);
  const [revealedTabs, setRevealedTabs] = useState<TabKey[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [txPanelExpanded, setTxPanelExpanded] = useState(false);
  const [phoneCollapsed, setPhoneCollapsed] = useState(false);
  const [collectedIndices, setCollectedIndices] = useState<number[]>([]);
  const [currentCardColor, setCurrentCardColor] = useState("#60a5fa");
  const [contactOpen, setContactOpen] = useState(false);
  const [activePillFilter, setActivePillFilter] = useState<{ pillar: string; label: string; isCategory?: boolean } | null>(null);
  const [activeRollup, setActiveRollup] = useState<PillarRollup | null>(null);
  const [profile, setProfile] = useState<{ persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [aiTabTrigger, setAiTabTrigger] = useState(0);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<{ text: string; nonce: number; kind?: "lifestyle" | "lifeEvent" | "risk"; signalContext?: string } | null>(null);

  const handleOpenAIAssistant = useCallback(() => {
    setAiTabTrigger((n) => n + 1);
  }, []);

  const dispatchAIPrompt = useCallback((text: string, kind?: "lifestyle" | "lifeEvent" | "risk", signalContext?: string) => {
    setPendingAIPrompt({ text, nonce: Date.now(), kind, signalContext });
    setAiTabTrigger((n) => n + 1);
  }, []);

  const handleOpenWMCopilot = useCallback((firstName: string, signal: SelectedSignal | null) => {
    // Skip login — launch the Advisor Console directly with the full client profile pre-loaded.
    const demo = DEMO_CUSTOMERS[selectedIdx];
    const baseProfile: import("@/types/clientProfile").ClientProfileData | null = demo?.profile
      ? { ...demo.profile }
      : null;

    if (!baseProfile) {
      toast.error("No client profile available. Run the analysis first.");
      return;
    }

    if (signal) {
      const evt = { event: signal.label, date: new Date().toISOString().slice(0, 10) };
      baseProfile.milestones = [evt, ...(baseProfile.milestones || [])].slice(0, 6);
    }

    sessionStorage.setItem("wm_copilot_launch_client", JSON.stringify(baseProfile));
    window.open("/tepilot/advisor-console", "_blank");
  }, [selectedIdx]);
  const profileRef = useRef<{ persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } | null>(null);
  const [customCsv, setCustomCsv] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const classifiedRef = useRef<EnrichedTransaction[] | null>(null);
  const classifyAbortRef = useRef<AbortController | null>(null);
  const [personaSynthesis, setPersonaSynthesis] = useState<PersonaSynthesis | null>(null);
  const [generatedOffers, setGeneratedOffers] = useState<RollupOfferGroup[] | null>(null);
  const [offersLoading, setOffersLoading] = useState(false);
  const [detectedLifeEvents, setDetectedLifeEvents] = useState<LifeEvent[] | null>(null);
  const detectedLifeEventsRef = useRef<LifeEvent[] | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productCards, setProductCards] = useState<ProductCard[] | null>(null);
  const [productCardsLoading, setProductCardsLoading] = useState(false);
  const [activeTriggerPill, setActiveTriggerPill] = useState<{ label: string; indices: number[]; color: string; kind: "lifeEvent" | "risk" } | null>(null);
  const [productActions, setProductActions] = useState<CardActions[] | null>(null);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [riskFlags, setRiskFlags] = useState<{ flags: any[]; summary: string } | null>(null);
  const riskFlagsRef = useRef<{ flags: any[]; summary: string } | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [enrichedTxs, setEnrichedTxs] = useState<EnrichedTransaction[] | null>(null);
  const [synthesisTriggered, setSynthesisTriggered] = useState(false);
  const personaSynthesisRef = useRef<PersonaSynthesis | null>(null);
  const firePersonaSynthesisRef = useRef<(txs: EnrichedTransaction[]) => void>(() => {});
  const detectLifeEventsOnlyRef = useRef<() => Promise<LifeEvent[]>>(async () => []);
  const onClassifiedCallbackRef = useRef<((txs: EnrichedTransaction[]) => void) | null>(null);
  const offersInFlightRef = useRef<boolean>(false);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /** Fire classify-transactions SSE in background, then synthesize persona */
  const fireClassification = useCallback((csv: string) => {
    classifyAbortRef.current?.abort();
    classifiedRef.current = null;
    personaSynthesisRef.current = null;
    setPersonaSynthesis(null);
    setEnrichedTxs(null);

    const abort = new AbortController();
    classifyAbortRef.current = abort;

    const payload = csvToClassifyPayload(csv);
    if (payload.length === 0) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/classify-transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body: JSON.stringify({ transactions: payload }),
      signal: abort.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const block of events) {
            const eventMatch = block.match(/^event:\s*(.+)$/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);
            if (!eventMatch || !dataMatch) continue;

            if (eventMatch[1] === "done") {
              try {
                const parsed = JSON.parse(dataMatch[1]);
                const enriched: EnrichedTransaction[] = parsed.enriched_transactions || [];
                // Merge `source` from the raw transactions (matched by index/order) so
                // the enriched table can render the source chip per row.
                const rawTxs = profileRef.current?.transactions || [];
                const merged = enriched.map((etx, i) => {
                  const raw: any = rawTxs[i];
                  if (raw && raw.source && !(etx as any).source) {
                    return { ...etx, source: raw.source };
                  }
                  return etx;
                });
                classifiedRef.current = merged;
                setEnrichedTxs(merged);
                console.log(`[PRELOAD] Classification ready: ${classifiedRef.current?.length} transactions`);
                // Update signal map in-flight if animation already started
                onClassifiedCallbackRef.current?.(classifiedRef.current!);
                firePersonaSynthesisRef.current(classifiedRef.current!);
              } catch (e) {
                console.error("[PRELOAD] Failed to parse done event", e);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[PRELOAD] Classification failed:", err);
        }
      });
  }, []);

  /** Synthesize persona headline + insights from classified transactions */
  const firePersonaSynthesis = useCallback(async (enrichedTxs: EnrichedTransaction[]) => {
    // Group by pillar::category and collect merchants, tiers, subcategories
    const grouped = new Map<string, {
      pillar: string; label: string; count: number; totalSpend: number;
      frequency?: string; txIndices: number[];
      topMerchants: string[]; spendingTier: string; subcategories: string[];
      dates: string[];
    }>();
    for (const [txIdx, tx] of enrichedTxs.entries()) {
      const key = `${tx.pillar}::${tx.category}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalSpend += tx.amount;
        existing.txIndices.push(txIdx);
        if (tx.date) existing.dates.push(tx.date);
        if (tx.merchant_name && !existing.topMerchants.includes(tx.merchant_name))
          existing.topMerchants.push(tx.merchant_name);
        if (tx.subcategories) tx.subcategories.forEach(sc => {
          if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
        });
        // Keep highest tier
        const tierRank: Record<string, number> = { "Budget": 0, "Standard": 1, "Premium": 2 };
        if ((tierRank[tx.spending_tier] ?? 1) > (tierRank[existing.spendingTier] ?? 1)) {
          existing.spendingTier = tx.spending_tier;
        }
      } else {
        grouped.set(key, {
          pillar: tx.pillar, label: tx.category, count: 1, totalSpend: tx.amount,
          frequency: tx.purchase_frequency, txIndices: [txIdx],
          topMerchants: tx.merchant_name ? [tx.merchant_name] : [],
          spendingTier: tx.spending_tier || "Standard",
          subcategories: tx.subcategories ? [...tx.subcategories] : [],
          dates: tx.date ? [tx.date] : [],
        });
      }
    }
    const pillars = Array.from(grouped.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    // pillars[i].txIndices = the transaction indices for row i sent to AI

    // Detect life events FIRST so we can pass them to synthesize-persona for theme dedup.
    // This prevents behavioral rollups (e.g. "Aspiring Homeowner") from overlapping with
    // detected life events (e.g. "New Home Transition") at the source.
    let detectedEvents: LifeEvent[] = [];
    try {
      detectedEvents = await detectLifeEventsOnlyRef.current();
      console.log("[PRELOAD] Life events detected ahead of persona synthesis:", detectedEvents.length);
    } catch (e) {
      console.warn("[PRELOAD] Pre-synthesis life event detection failed (continuing without):", e);
    }

    try {
      const { data, error } = await supabase.functions.invoke("synthesize-persona", {
        body: {
          pillars,
          // Send the full enriched transaction list so the LLM can pick exact rows
          // (with their lifestyle subcategory tags) for lifestyle-prone rollups.
          transactions: enrichedTxs.map(t => ({
            merchant_name: t.merchant_name,
            normalized_merchant: (t as any).normalized_merchant,
            amount: t.amount,
            date: t.date,
            pillar: t.pillar,
            category: t.category,
            subcategories: t.subcategories,
            spending_tier: t.spending_tier,
          })),
          lifeEvents: detectedEvents.map(e => ({ event_name: e.event_name })),
        },
      });
      if (error) throw error;
      const synthesis: PersonaSynthesis = {
        pillarRollups: (data.pillar_rollups || []).map((r: any) => {
          const catIndices: number[] = r.category_indices || [];
          const txIndicesFromAI: number[] = Array.isArray(r.transaction_indices) ? r.transaction_indices : [];

          // Resolve contributing CATEGORY groups via index + fallback by name (used for downstream code
          // that still needs categoryIndices, e.g. coherence guards)
          const matchedGroupIndices = new Set<number>();
          for (const ci of catIndices) {
            if (ci >= 0 && ci < pillars.length) matchedGroupIndices.add(ci);
          }
          if (r.categories) {
            for (const catName of r.categories) {
              const idx = pillars.findIndex(
                (p, i) => !matchedGroupIndices.has(i) && p.pillar === r.pillar && p.label.toLowerCase() === catName.toLowerCase()
              );
              if (idx >= 0) matchedGroupIndices.add(idx);
            }
          }

          // PRIMARY membership source: per-transaction indices the LLM picked.
          // These come from the numbered transaction list (with lifestyle tags) the LLM saw.
          // Fallback: if the LLM returned no transaction_indices for this rollup
          // (e.g. utilities / subscriptions / financial — pillars we did NOT send txn-level for),
          // expand all transactions in the matched categories.
          const txIndicesSet = new Set<number>();
          if (txIndicesFromAI.length > 0) {
            for (const ti of txIndicesFromAI) {
              if (ti >= 0 && ti < enrichedTxs.length) txIndicesSet.add(ti);
            }
          } else {
            for (const gi of matchedGroupIndices) {
              for (const ti of pillars[gi].txIndices) txIndicesSet.add(ti);
            }
          }
          const txIndices = Array.from(txIndicesSet);

          // Re-derive categoryIndices from the actual selected transactions so the rollup-level
          // coherence guards (≥2 categories, life-stage rules, incompatible-theme rules)
          // operate on what's truly inside the pill — not what the LLM claimed.
          const derivedCatKeys = new Set<string>();
          for (const ti of txIndices) {
            const t = enrichedTxs[ti];
            if (t) derivedCatKeys.add(`${t.pillar}::${t.category}`);
          }
          const derivedCategoryIndices: number[] = [];
          derivedCatKeys.forEach(key => {
            const idx = pillars.findIndex(p => `${p.pillar}::${p.label}` === key);
            if (idx >= 0) derivedCategoryIndices.push(idx);
          });
          // Union with LLM-claimed categories so non-txn-level pillars (utilities etc.) still work
          for (const gi of matchedGroupIndices) {
            if (!derivedCategoryIndices.includes(gi)) derivedCategoryIndices.push(gi);
          }

          const totalCount = txIndices.length;
          const totalSpend = txIndices.reduce((s, ti) => s + (enrichedTxs[ti]?.amount || 0), 0);

          // Collect the resolved category labels for coherence validation
          const resolvedCategories = derivedCategoryIndices.map(gi => pillars[gi].label.toLowerCase());

          return {
            pillar: r.pillar,
            label: r.label,
            categories: r.categories || [],
            categoryIndices: derivedCategoryIndices,
            txIndices,
            totalCount,
            totalSpend,
            _resolvedCategories: resolvedCategories,
          };
        })
        .filter((r: any) => r.totalCount > 0)
        .filter((r: any) => {
          // Client-side coherence validation: reject nonsensical rollups
          const label = (r.label as string).toLowerCase();
          const cats = r._resolvedCategories as string[];

          // Rule 1: Reject rollups with only 1 matched category (not a real grouping)
          if (r.categoryIndices.length < 2) {
            console.log(`[ROLLUP-REJECT] "${r.label}" — only 1 category, not a real grouping`);
            return false;
          }

          // Rule 2: Reject life-stage labels without enough corroborating evidence
          const lifeStageKeywords = ["nursery", "nesting", "new parent", "baby", "suburban", "family setup", "expecting"];
          const isLifeStageLabel = lifeStageKeywords.some(kw => label.includes(kw));
          if (isLifeStageLabel) {
            const familyKeywords = ["baby", "kids", "child", "nursery", "pediatr", "daycare", "maternity", "infant", "toddler"];
            const familyCatCount = cats.filter(c => familyKeywords.some(fk => c.includes(fk))).length;
            if (familyCatCount < 2) {
              console.log(`[ROLLUP-REJECT] "${r.label}" — life-stage label with only ${familyCatCount} family categories`);
              return false;
            }
          }

          // Rule 3: Reject rollups that mix incompatible themes
          const incompatiblePairs: [string[], string[]][] = [
            [["gas", "fuel", "commut", "auto", "car wash"], ["nursery", "baby", "kids", "child", "toy"]],
            [["gas", "fuel", "commut", "auto"], ["streaming", "subscription", "netflix", "hulu", "spotify"]],
            [["grocery", "supermarket", "food"], ["streaming", "subscription", "software"]],
          ];
          for (const [groupA, groupB] of incompatiblePairs) {
            const hasA = cats.some(c => groupA.some(kw => c.includes(kw)));
            const hasB = cats.some(c => groupB.some(kw => c.includes(kw)));
            if (hasA && hasB) {
              console.log(`[ROLLUP-REJECT] "${r.label}" — incompatible themes detected`);
              return false;
            }
          }

          return true;
        })
        .map(({ _resolvedCategories, ...rest }: any) => rest),
      };
      personaSynthesisRef.current = synthesis;
      setPersonaSynthesis(synthesis);
      console.log("[PRELOAD] Persona synthesis ready:", synthesis.pillarRollups?.length, "rollups");
      // Fire life event detection (will reuse the events already detected pre-synthesis,
      // so it just hydrates UI state and triggers downstream cards/offers), risk in parallel.
      fireLifeEventDetection(synthesis, pillars, detectedEvents);
      fireRiskDetection();
    } catch (err) {
      console.error("[PRELOAD] Persona synthesis failed:", err);
    }
  }, []);

  /** Generate AI-powered deal recommendations from persona + pillars + optional life events */
  const fireNextOffers = useCallback(async (synthesis: PersonaSynthesis, pillars: any[], lifeEvents?: LifeEvent[]) => {
    // De-dupe: skip if a generation is already in flight (e.g., StrictMode double-invoke)
    if (offersInFlightRef.current) {
      console.log("[PRELOAD] Next-offers skipped — already in flight");
      return;
    }
    offersInFlightRef.current = true;
    setOffersLoading(true);
    setGeneratedOffers(null);
    try {
      const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
      const demographics = demoCustomer?.profile?.demographics || {};
      const body: any = {
        persona: {
          pillarRollups: synthesis.pillarRollups,
        },
        pillars: pillars.slice(0, 8).map(p => ({
          pillar: p.pillar,
          label: p.label,
          count: p.count,
          totalSpend: p.totalSpend,
          topMerchants: p.topMerchants,
          subcategories: p.subcategories,
        })),
        demographics,
      };
      if (lifeEvents && lifeEvents.length > 0) {
        body.lifeEvents = lifeEvents.map(e => ({
          event_name: e.event_name,
          confidence: e.confidence,
          evidence_merchants: (e.evidence || []).map(ev => ev.merchant).filter(Boolean),
        }));
      }
      const { data, error } = await supabase.functions.invoke("generate-next-offers", {
        body,
      });
      if (error) throw error;
      setGeneratedOffers(data.rollupOffers || []);
      console.log("[PRELOAD] Next-offers ready:", data.rollupOffers?.length, "groups");
    } catch (err) {
      console.error("[PRELOAD] Next-offers failed:", err);
    } finally {
      setOffersLoading(false);
      offersInFlightRef.current = false;
    }
  }, [selectedIdx]);

  /** Pure life-event detection — invokes the edge function and returns events.
   *  Used both pre-synthesis (to feed dedup hint into synthesize-persona) and
   *  reused by fireLifeEventDetection to avoid double API calls. */
  const detectLifeEventsOnly = useCallback(async (): Promise<LifeEvent[]> => {
    const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
    const demographics = demoCustomer?.profile?.demographics as Record<string, string> || {};
    const enrichedTxs = classifiedRef.current || [];
    if (enrichedTxs.length === 0) return [];

    const client = {
      name: demoCustomer?.profile?.name || "Customer",
      age: demographics.age || "Unknown",
      occupation: demographics.occupation || "Unknown",
      family_status: demographics.familyStatus || "Unknown",
    };

    const csvRows = (customCsv || getCsvForCustomer(selectedIdx)).split("\n").slice(1).filter(Boolean);
    const transactions = enrichedTxs.slice(0, 100).map((tx, i) => {
      const csvRow = csvRows[i]?.split(",") || [];
      return {
        merchant_name: tx.merchant_name,
        amount: tx.amount,
        date: csvRow[0] || "2025-01-01",
        pillar: tx.pillar,
        category: tx.category,
        subcategory: tx.subcategories?.[0] || "",
      };
    });

    const topCategories = [...new Set(enrichedTxs.map(tx => tx.category))].slice(0, 5);
    const totalSpend = enrichedTxs.reduce((s, tx) => s + tx.amount, 0);

    const { data, error } = await supabase.functions.invoke("analyze-lifestyle-signals", {
      body: {
        client,
        transactions,
        spending_summary: { total_spend: totalSpend, top_categories: topCategories },
      },
    });
    if (error) throw error;
    return (data.detected_events || []) as LifeEvent[];
  }, [selectedIdx, customCsv]);

  detectLifeEventsOnlyRef.current = detectLifeEventsOnly;

  /** Hydrate UI state with detected life events and trigger downstream product cards + offers.
   *  If `preDetectedEvents` is supplied, skip the API call and reuse them. */
  const fireLifeEventDetection = useCallback(async (
    synthesis?: PersonaSynthesis,
    pillars?: any[],
    preDetectedEvents?: LifeEvent[],
  ) => {
    setProductsLoading(true);
    setDetectedLifeEvents(null);
    try {
      const events: LifeEvent[] = preDetectedEvents ?? await detectLifeEventsOnly();
      setDetectedLifeEvents(events.slice(0, 3));
      detectedLifeEventsRef.current = events.slice(0, 3);
      console.log("[PRELOAD] Life events hydrated:", events.length, preDetectedEvents ? "(reused)" : "(fresh)");
      // Fire product cards generation with life events + persona data
      fireProductCards(events, personaSynthesisRef.current);
      // Fire offers with both pillars and detected life events in a single call
      const syn = synthesis || personaSynthesisRef.current;
      if (syn && pillars) {
        fireNextOffers(syn, pillars, events.length > 0 ? events : undefined);
      }
    } catch (err) {
      console.error("[PRELOAD] Life event detection failed:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [detectLifeEventsOnly]);


  /** Detect risk factors using detect-risk-transactions edge function (RAW csv evidence) */
  const fireRiskDetection = useCallback(async () => {
    setRiskLoading(true);
    setRiskFlags(null);
    riskFlagsRef.current = null;
    try {
      const csv = customCsv || getCsvForCustomer(selectedIdx);
      if (!csv) {
        setRiskLoading(false);
        return;
      }
      // Build raw payload from CSV — bypass enrichment so risk engine sees MCC, description, source, zips
      const rawTxs = csvToClassifyPayload(csv);
      const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
      const homeZip = (demoCustomer?.profile?.demographics as any)?.zip || (demoCustomer?.profile?.demographics as any)?.zip_code || "";
      const payload = rawTxs.slice(0, 100).map((t) => ({
        transaction_id: t.transaction_id,
        merchant_name: t.merchant_name,
        description: t.description || "",
        mcc: t.mcc || "",
        amount: t.amount,
        date: t.date,
        zip_code: t.zip_code || "",
        home_zip: homeZip,
        source: t.source || "",
      }));
      if (payload.length === 0) {
        setRiskLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke("detect-risk-transactions", {
        body: { transactions: payload },
      });
      if (error) throw error;
      setRiskFlags(data);
      riskFlagsRef.current = data;
      console.log("[PRELOAD] Risk detection ready:", data?.flags?.length, "flags");
      // If product cards already generated without risk awareness, regenerate so the
      // risk-card slot can be added (and downstream actions inherit risk context).
      if (data?.flags?.length > 0 && classifiedRef.current && personaSynthesisRef.current) {
        const events = (detectedLifeEventsRef.current || []) as LifeEvent[];
        fireProductCards(events, personaSynthesisRef.current);
      }
    } catch (err) {
      console.error("[PRELOAD] Risk detection failed:", err);
    } finally {
      setRiskLoading(false);
    }
  }, [selectedIdx, customCsv]);

  /** Generate consumer product cards from life events + persona rollups */
  const fireProductCards = useCallback(async (events: LifeEvent[], synthesis: PersonaSynthesis | null) => {
    setProductCardsLoading(true);
    setProductCards(null);
    try {
      const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
      const demographics = demoCustomer?.profile?.demographics || {};
      const enrichedTxs = classifiedRef.current || [];

      // Rebuild pillars summary for the function
      const grouped = new Map<string, any>();
      for (const tx of enrichedTxs) {
        const key = `${tx.pillar}::${tx.category}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.count += 1;
          existing.totalSpend += tx.amount;
          if (tx.subcategories) tx.subcategories.forEach((sc: string) => {
            if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
          });
        } else {
          grouped.set(key, {
            pillar: tx.pillar, label: tx.category, count: 1, totalSpend: tx.amount,
            subcategories: tx.subcategories ? [...tx.subcategories] : [],
          });
        }
      }
      const pillars = Array.from(grouped.values()).sort((a, b) => b.totalSpend - a.totalSpend);

      const { data, error } = await supabase.functions.invoke("generate-product-cards", {
        body: {
          life_events: events,
          persona_rollups: synthesis?.pillarRollups || [],
          pillars: pillars.slice(0, 8),
          demographics,
          risk_flags: riskFlagsRef.current?.flags || [],
        },
      });
      if (error) throw error;
      const cards = data.cards || [];
      setProductCards(cards);
      console.log("[PRELOAD] Product cards ready:", cards.length);
      // Fire action generation with full context
      if (cards.length > 0) {
        fireProductActions(cards, events, synthesis);
      }
    } catch (err) {
      console.error("[PRELOAD] Product cards failed:", err);
    } finally {
      setProductCardsLoading(false);
    }
  }, [selectedIdx]);

  /** Generate AI-powered engagement actions for each product card */
  const fireProductActions = useCallback(async (cards: ProductCard[], events: LifeEvent[], synthesis: PersonaSynthesis | null) => {
    setActionsLoading(true);
    setProductActions(null);
    try {
      const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
      const demographics = demoCustomer?.profile?.demographics || {};
      const enrichedTxs = classifiedRef.current || [];

      const grouped = new Map<string, any>();
      for (const tx of enrichedTxs) {
        const key = `${tx.pillar}::${tx.category}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.count += 1;
          existing.totalSpend += tx.amount;
        } else {
          grouped.set(key, { pillar: tx.pillar, label: tx.category, count: 1, totalSpend: tx.amount });
        }
      }
      const pillars = Array.from(grouped.values()).sort((a, b) => b.totalSpend - a.totalSpend);

      const { data, error } = await supabase.functions.invoke("generate-product-actions", {
        body: {
          product_cards: cards,
          persona_rollups: synthesis?.pillarRollups || [],
          life_events: events.slice(0, 3),
          demographics,
          pillars: pillars.slice(0, 6),
          risk_flags: riskFlagsRef.current?.flags || [],
        },
      });
      if (error) throw error;
      setProductActions(data.card_actions || []);
      console.log("[PRELOAD] Product actions ready:", data.card_actions?.length, "cards");
    } catch (err) {
      console.error("[PRELOAD] Product actions failed:", err);
    } finally {
      setActionsLoading(false);
    }
  }, [selectedIdx]);

  firePersonaSynthesisRef.current = firePersonaSynthesis;

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  // Fire classification for initial customer on mount
  useEffect(() => {
    fireClassification(getCsvForCustomer(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isRunning = phase !== "idle" && phase !== "hold";

  const handleSelectCustomer = useCallback(
    (idx: number) => {
      clearTimeouts();
      setSelectedIdx(idx);
      setPhase("idle");
      setProcessedIndices([]);
      setRevealedTabs([]);
      setActiveTab(null);
      setTxPanelExpanded(false);
      setCollectedIndices([]);
      setProfile(null);
      setActivePillFilter(null);
      setActiveRollup(null);
      setCustomCsv(null);
      setCustomName(null);
      setGeneratedOffers(null);
      setOffersLoading(false);
      setDetectedLifeEvents(null);
      setProductsLoading(false);
      setProductCards(null);
      setProductCardsLoading(false);
      setProductActions(null);
      setActionsLoading(false);
      setSynthesisTriggered(false);
      onClassifiedCallbackRef.current = null;
      // Preload classification in background
      fireClassification(getCsvForCustomer(idx));
    },
    [clearTimeouts, fireClassification]
  );

  const handleChangeCustomer = useCallback(() => {
    setSelectionDialogOpen(true);
  }, []);

  const handleLoadCustomCsv = useCallback((csv: string, name: string) => {
    clearTimeouts();
    setCustomCsv(csv);
    setCustomName(name);
    setPhase("idle");
    setProcessedIndices([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setTxPanelExpanded(false);
    setCollectedIndices([]);
    setActivePillFilter(null);
    setActiveRollup(null);
    setProfile(buildLocalProfile(csv, 0, name));
    // Preload classification for custom CSV
    fireClassification(csv);
  }, [clearTimeouts, fireClassification]);

  const revealStep = useCallback((idx: number, p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }, skipHighlight = false) => {
    const tabKey = TAB_ORDER[idx];
    const card = p.intelligence[tabKey];
    setActiveTab(tabKey);
    setCurrentCardColor(card.accent);
    if (!skipHighlight) {
      setCollectedIndices(card.txIndices);
    }
    setRevealedTabs(TAB_ORDER.slice(0, idx + 1));
    setStepIndex(idx);
  }, []);

  // Arrow key navigation — only works after user has selected an action tab
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "hold" || !activeTab) return;
      const p = profileRef.current;
      if (!p) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setStepIndex((prev) => {
          const next = Math.min(prev + 1, TAB_ORDER.length - 1);
          revealStep(next, p);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStepIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          revealStep(next, p);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, activeTab, revealStep]);

  const runAnimationWithProfile = useCallback((p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }) => {
    setPhase("scroll");
    setProcessedIndices([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setTxPanelExpanded(false);
    setCollectedIndices([]);
    profileRef.current = p;

    const txCount = p.transactions.length;
    const signalInterval = TIMINGS.scroll / (txCount + 1);

    for (let i = 0; i < txCount; i++) {
      const signal = p.persona.signalMap[i];
      if (signal) {
        schedule(() => {
          setProcessedIndices((prev) => [...prev, i]);
        }, (i + 1) * signalInterval);
      }
    }

    const elapsed = TIMINGS.scroll + TIMINGS.personaPause;

    schedule(() => {
      setPhase("hold");
      // Don't auto-select any tab — let user click an action button first
      setCurrentCardColor(p.intelligence.analytics.accent);
    }, elapsed);
  }, [schedule, revealStep]);

  const handleRunAnalysis = useCallback(async () => {
    if (isRunning) return;
    clearTimeouts();

    const csv = customCsv || getCsvForCustomer(selectedIdx);

    // 1. Build local profile — use AI-classified signals if preloaded, else MCC fallback
    const localProfile = buildLocalProfile(csv, selectedIdx, customName || undefined);

    if (classifiedRef.current && classifiedRef.current.length > 0) {
      // Override MCC signal map with AI-classified pillars
      const classifiedSignalMap = buildSignalMapFromClassified(classifiedRef.current, csv);
      localProfile.persona.signalMap = classifiedSignalMap;
      console.log("[PROCESS] Using preloaded AI classification for signals");
      onClassifiedCallbackRef.current = null; // Already have it
    } else {
      console.log("[PROCESS] AI classification not ready, using MCC fallback — will update when ready");
      // Register callback to upgrade signal map when classification arrives
      onClassifiedCallbackRef.current = (txs: EnrichedTransaction[]) => {
        const classifiedSignalMap = buildSignalMapFromClassified(txs, csv);
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            persona: { ...prev.persona, signalMap: classifiedSignalMap },
          };
        });
        console.log("[PROCESS] Signal map upgraded with AI classification");
        onClassifiedCallbackRef.current = null;
      };
    }

    setProfile(localProfile);

    // 2. Start animation immediately
    runAnimationWithProfile(localProfile);

  }, [isRunning, clearTimeouts, selectedIdx, customCsv, customName, runAnimationWithProfile]);

  const handleTabClick = useCallback((tab: TabKey) => {
    // Always clear pill selections when switching between the three "Next-..." tabs
    // so each tab starts fresh.
    setActiveTab((prev) => {
      if (prev !== tab) {
        setActivePillFilter(null);
        setActiveRollup(null);
        setActiveTriggerPill(null);
      }
      return tab;
    });
  }, []);

  const handlePillClick = useCallback((pillar: string, label: string, isCategory?: boolean) => {
    setActiveRollup(null);
    setActiveTriggerPill(null);
    setActivePillFilter((prev) =>
      prev && prev.pillar === pillar && prev.label === label && prev.isCategory === !!isCategory ? null : { pillar, label, isCategory: !!isCategory }
    );
  }, []);

  const handleRollupClick = useCallback((rollup: PillarRollup) => {
    setActivePillFilter(null);
    setActiveTriggerPill(null);
    setActiveRollup((prev) =>
      prev && prev.pillar === rollup.pillar && prev.label === rollup.label ? null : rollup
    );
  }, []);

  const handleTriggerPillClick = useCallback((label: string, txIndices: number[], color: string, kind: "lifeEvent" | "risk" = "lifeEvent") => {
    setActivePillFilter(null);
    setActiveRollup(null);
    setActiveTriggerPill((prev) =>
      prev && prev.label === label ? null : { label, indices: txIndices, color, kind }
    );
  }, []);

  const execProfile = profile || getIntelligenceForCustomer(selectedIdx);
  const demoCustomer = DEMO_CUSTOMERS[selectedIdx];

  // Derive processedSignals from indices + current signalMap (auto-syncs on AI upgrade)
  const processedSignals = useMemo(() =>
    processedIndices.map(i => execProfile.persona.signalMap[i]).filter(Boolean),
    [processedIndices, execProfile.persona.signalMap]
  );

  // Clear stale pill filter when signalMap changes (AI upgrade)
  const signalMapRef = useRef(execProfile.persona.signalMap);
  useEffect(() => {
    if (signalMapRef.current !== execProfile.persona.signalMap) {
      signalMapRef.current = execProfile.persona.signalMap;
      setActivePillFilter(null);
      setActiveRollup(null);
    }
  }, [execProfile.persona.signalMap]);

  // Derive filtered transaction indices from the active pill/rollup filter
  const filteredIndices = useMemo(() => {
    if (activeTriggerPill) {
      return activeTriggerPill.indices.length > 0 ? activeTriggerPill.indices : null;
    }
    const sm = execProfile.persona.signalMap;
    if (activeRollup) {
      if (activeRollup.txIndices && activeRollup.txIndices.length > 0) {
        return activeRollup.txIndices;
      }
      return Object.entries(sm)
        .filter(([, s]) => s.pillar === activeRollup.pillar)
        .map(([idx]) => Number(idx));
    }
    if (activePillFilter) {
      return Object.entries(sm)
        .filter(([, s]) => s.pillar === activePillFilter.pillar && (activePillFilter.isCategory ? s.category === activePillFilter.label : s.label === activePillFilter.label))
        .map(([idx]) => Number(idx));
    }
    return null;
  }, [activePillFilter, activeRollup, activeTriggerPill, execProfile.persona.signalMap]);

  return (
    <SimplePasswordGate bullets={["Semantic Enrichment", "Behavioral Intelligence", "Personalization Orchestration"]}>
    <div className="h-screen bg-slate-50 flex flex-col font-[Manrope,sans-serif] overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <img src={ventusLogo} alt="Ventus AI" className="h-7 w-auto" />
          <span className="text-[14px] font-semibold text-slate-700 hidden sm:inline">
            Semantic Enrichment - Behavioral Intelligence - Personalization Orchestration
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContactOpen(true)}
            className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Next Step →
          </button>
          <Link
            to="/"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main content — 3 columns with animated collapse */}
      {(() => {
        const phoneVisible = activeTab === "relationship" && aiTabTrigger > 0;
        return (
      <div className="flex-1 min-h-0 flex">
        {/* Col 1 — Transaction feed (collapses to sliver only when phone is shown) */}
        <div
          className="border-r border-slate-200 bg-white transition-all duration-500 ease-in-out relative"
          style={{
            width: phoneVisible ? (txPanelExpanded ? 400 : 40) : 400,
            minWidth: phoneVisible ? (txPanelExpanded ? 400 : 40) : 400,
            overflow: phoneVisible && !txPanelExpanded ? "visible" : "hidden",
          }}
        >
          {/* Sliver state — narrow strip with expand button */}
          {phoneVisible && !txPanelExpanded && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setTxPanelExpanded(true)}
            >
              <ChevronRight className="w-4 h-4 text-slate-400 mb-2" />
              <span className="text-[10px] text-slate-400 font-medium tracking-wider"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                Transactions
              </span>
            </div>
          )}
          {/* Full panel — with optional collapse button when re-expanded */}
          {(!phoneVisible || txPanelExpanded) && (
            <div className="w-[400px] h-full relative">
              {phoneVisible && txPanelExpanded && (
              <button
                  onClick={() => setTxPanelExpanded(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
              <ExecDemoLeftPanel
                selectedIdx={selectedIdx}
                onSelectCustomer={handleSelectCustomer}
                onRunAnalysis={handleRunAnalysis}
                onLoadCustomCsv={handleLoadCustomCsv}
                onChangeCustomer={handleChangeCustomer}
                isRunning={isRunning}
                phase={phase}
                collectedIndices={collectedIndices}
                currentCardColor={currentCardColor}
                isCustomMode={!!customCsv}
                customName={customName || undefined}
                customTransactions={profile?.transactions}
                personaIcon={execProfile.persona.icon}
                personaTitle={execProfile.persona.title}
                filteredIndices={filteredIndices}
                signalMap={execProfile.persona.signalMap}
                activePillLabel={activeTriggerPill?.label || activeRollup?.label || activePillFilter?.label || null}
                activePillColor={
                  activeTriggerPill
                    ? activeTriggerPill.color
                    : activeRollup
                      ? getColor(activeRollup.pillar).dot
                      : activePillFilter
                        ? getColor(activePillFilter.pillar).dot
                        : "#10b981"
                }
                onClearFilter={() => { setActivePillFilter(null); setActiveRollup(null); setActiveTriggerPill(null); }}
                enriched={phase === "cardCycle" || phase === "hold"}
              />
            </div>
          )}
        </div>

        {/* Col 2 — Intelligence panel (always visible, fills remaining space) */}
        <div className="flex-1 border-r border-slate-200 bg-white overflow-hidden min-w-0">
          <ExecDemoIntelPanel
            persona={execProfile.persona}
            intelligence={execProfile.intelligence}
            phase={phase}
            processedSignals={processedSignals}
            revealedTabs={revealedTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            activePillFilter={activePillFilter}
            onPillClick={handlePillClick}
            activePillarFilter={activeRollup?.pillar || null}
            activeRollup={activeRollup}
            onRollupClick={handleRollupClick}
            personaSynthesis={personaSynthesis}
            transactions={execProfile.transactions}
            enrichedTransactions={enrichedTxs}
            generatedOffers={generatedOffers}
            offersLoading={offersLoading}
            detectedLifeEvents={detectedLifeEvents}
            productsLoading={productsLoading}
            productCards={productCards}
            riskFlags={riskFlags}
            riskLoading={riskLoading}
            onTriggerPillClick={handleTriggerPillClick}
            activeTriggerLabel={activeTriggerPill?.label}
            activeTrigger={activeTriggerPill}
            productActions={productActions}
            actionsLoading={actionsLoading}
            onOpenWMCopilot={handleOpenWMCopilot}
            onOpenAIAssistant={handleOpenAIAssistant}
            onAIPromptDispatch={dispatchAIPrompt}
            assistantOpen={aiTabTrigger > 0}
          />
        </div>

        {/* Col 3 — Phone mockup (only opens when "Open AI Banking Assistant" is clicked) */}
        {(() => {
          const phoneVisible = activeTab === "relationship" && aiTabTrigger > 0;
          const expandedW = 360;
          const collapsedW = 40;
          const w = phoneVisible ? (phoneCollapsed ? collapsedW : expandedW) : 0;
          return (
            <div
              className="bg-slate-50 overflow-hidden transition-all duration-500 ease-in-out relative border-l border-slate-200"
              style={{
                width: w,
                minWidth: w,
                opacity: phoneVisible ? 1 : 0,
              }}
            >
              {/* Sliver state */}
              {phoneVisible && phoneCollapsed && (
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setPhoneCollapsed(false)}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400 mb-2" />
                  <span
                    className="text-[10px] text-slate-400 font-medium tracking-wider"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    AI Assistant
                  </span>
                </div>
              )}

              {/* Full phone — with collapse button */}
              {phoneVisible && !phoneCollapsed && (
                <div className="w-[360px] h-full relative">
                  <button
                    onClick={() => setPhoneCollapsed(true)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <ExecDemoPhoneView
                    customer={demoCustomer}
                    activeTab={activeTab}
                    phase={phase}
                    showContent={phoneVisible && phase !== "idle"}
                    generatedOffers={generatedOffers}
                    detectedLifeEvents={detectedLifeEvents}
                    productCards={productCards}
                    activeRollupLabel={activeRollup?.label || null}
                    activeRollupPillar={activeRollup?.pillar || null}
                    enrichedTxs={classifiedRef.current}
                    riskFlags={riskFlags}
                    aiTabTrigger={aiTabTrigger}
                    pendingAIPrompt={pendingAIPrompt}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>
        );
      })()}

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
      <ExecDemoSelectionDialog
        open={selectionDialogOpen}
        onOpenChange={setSelectionDialogOpen}
        selectedIdx={selectedIdx}
        onSelectCustomer={handleSelectCustomer}
        onRunAnalysis={handleRunAnalysis}
        onLoadCustomCsv={handleLoadCustomCsv}
      />
    </div>
    </SimplePasswordGate>
  );
}
