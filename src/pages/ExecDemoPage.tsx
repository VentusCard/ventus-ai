import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ExecDemoLeftPanel from "@/components/exec-demo/ExecDemoLeftPanel";
import ExecDemoIntelPanel, {
  type PersonaSynthesis,
  type PillarRollup,
  getColor,
} from "@/components/exec-demo/ExecDemoIntelPanel";
import type { RollupOfferGroup } from "@/components/exec-demo/NextOfferRationale";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "@/components/exec-demo/ProductCardsPhoneView";
import type { CardActions } from "@/components/exec-demo/NextProductRationale";
import ExecDemoSelectionDialog from "@/components/exec-demo/ExecDemoSelectionDialog";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import {
  getIntelligenceForCustomer,
  getCsvForCustomer,
  buildLocalProfile,
  csvToClassifyPayload,
  buildSignalMapFromClassified,
  type SignalEntry,
  type ExecPersona,
  type ExecIntelligence,
  type Transaction,
  type EnrichedTransaction,
} from "@/components/exec-demo/execDemoData";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getExternalSignalsFor, externalSignalToLifeEvent, externalSignalsForLLM, type ExternalIntelSignal } from "@/lib/externalIntelligenceSignals";
import ContactFormDialog from "@/components/ContactFormDialog";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { supabase } from "@/integrations/supabase/client";
import { getBankPromptContext } from "@/lib/demoBankConfig";

import type { SelectedSignal } from "@/components/exec-demo/NextConversationRationale";
import { publishExecDemoSession } from "@/lib/execDemoSessionStore";


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

interface ExecDemoPageProps {
  embedded?: boolean;
  active?: boolean;
  onBack?: () => void;
  /** When true, run the full pipeline immediately on mount (used by /bankdemo post-password). */
  prefireOnMount?: boolean;
}

export default function ExecDemoPage({ embedded = false, active = true, onBack, prefireOnMount = false }: ExecDemoPageProps = {}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(!embedded);

  const [phase, setPhase] = useState<Phase>("idle");
  const [processedIndices, setProcessedIndices] = useState<number[]>([]);
  const [revealedTabs, setRevealedTabs] = useState<TabKey[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [txPanelExpanded, setTxPanelExpanded] = useState(false);
  const [phoneCollapsed, setPhoneCollapsed] = useState(false);
  const [collectedIndices, setCollectedIndices] = useState<number[]>([]);
  const [currentCardColor, setCurrentCardColor] = useState("#60a5fa");
  const [contactOpen, setContactOpen] = useState(false);
  const [activePillFilter, setActivePillFilter] = useState<{
    pillar: string;
    label: string;
    isCategory?: boolean;
  } | null>(null);
  const [activeRollup, setActiveRollup] = useState<PillarRollup | null>(null);
  const [profile, setProfile] = useState<{
    persona: ExecPersona;
    intelligence: ExecIntelligence;
    transactions: Transaction[];
  } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [aiTabTrigger, setAiTabTrigger] = useState(0);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<{
    text: string;
    nonce: number;
    kind?: "lifestyle" | "lifeEvent" | "risk";
    signalContext?: string;
  } | null>(null);

  const handleOpenAIAssistant = useCallback(() => {
    setAiTabTrigger((n) => n + 1);
  }, []);

  const dispatchAIPrompt = useCallback(
    (text: string, kind?: "lifestyle" | "lifeEvent" | "risk", signalContext?: string) => {
      setPendingAIPrompt({ text, nonce: Date.now(), kind, signalContext });
      setAiTabTrigger((n) => n + 1);
    },
    [],
  );

  const [wmCopilotOpen, setWmCopilotOpen] = useState(false);
  const [wmCopilotSignal, setWmCopilotSignal] = useState<SelectedSignal | null>(null);

  const handleOpenWMCopilot = useCallback((_firstName: string, signal: SelectedSignal | null) => {
    setWmCopilotSignal(signal);
    setWmCopilotOpen(true);
  }, []);

  const handleCloseWMCopilot = useCallback(() => {
    setWmCopilotOpen(false);
  }, []);

  // When the AI Banking Assistant is opened, ensure the WM CoPilot is closed.
  const handleOpenAIAssistantWrapper = useCallback(() => {
    setWmCopilotOpen(false);
    setAiTabTrigger((n) => n + 1);
  }, []);
  const profileRef = useRef<{
    persona: ExecPersona;
    intelligence: ExecIntelligence;
    transactions: Transaction[];
  } | null>(null);
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
  const [productDeliveryChannel, setProductDeliveryChannel] = useState<"mobile" | "email" | "sms">("mobile");
  const [activeTriggerPill, setActiveTriggerPill] = useState<{
    label: string;
    indices: number[];
    color: string;
    kind: "lifeEvent" | "risk";
  } | null>(null);
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
  const fireRiskDetectionRef = useRef<() => Promise<void>>(async () => {});
  /** Promise resolved once risk detection finishes (success or failure) for the current CSV. */
  const riskReadyRef = useRef<Promise<void> | null>(null);
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

    // Kick off risk detection in PARALLEL with classification.
    // detect-risk-transactions runs against the raw CSV (no dependency on classification),
    // so persona synthesis can later await this promise to suppress overlapping lifestyle pills.
    riskReadyRef.current = fireRiskDetectionRef.current().catch((e) => {
      console.warn("[PRELOAD] Risk detection promise rejected:", e);
    });

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
                  return {
                    ...etx,
                    ...(raw?.source && !(etx as any).source ? { source: raw.source } : {}),
                    ...(raw?.description ? { description: raw.description } : {}),
                    ...(raw?.mcc ? { mcc: raw.mcc } : {}),
                  };
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
    const grouped = new Map<
      string,
      {
        pillar: string;
        label: string;
        count: number;
        totalSpend: number;
        frequency?: string;
        txIndices: number[];
        topMerchants: string[];
        spendingTier: string;
        subcategories: string[];
        dates: string[];
      }
    >();
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
        if (tx.subcategories)
          tx.subcategories.forEach((sc) => {
            if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
          });
        // Keep highest tier
        const tierRank: Record<string, number> = { Budget: 0, Standard: 1, Premium: 2 };
        if ((tierRank[tx.spending_tier] ?? 1) > (tierRank[existing.spendingTier] ?? 1)) {
          existing.spendingTier = tx.spending_tier;
        }
      } else {
        grouped.set(key, {
          pillar: tx.pillar,
          label: tx.category,
          count: 1,
          totalSpend: tx.amount,
          frequency: tx.purchase_frequency,
          txIndices: [txIdx],
          topMerchants: tx.merchant_name ? [tx.merchant_name] : [],
          spendingTier: tx.spending_tier || "Standard",
          subcategories: tx.subcategories ? [...tx.subcategories] : [],
          dates: tx.date ? [tx.date] : [],
        });
      }
    }
    const pillars = Array.from(grouped.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    // pillars[i].txIndices = the transaction indices for row i sent to AI

    // Fire upstream life-event detection in PARALLEL with synthesize-persona so
    // the Behavioral Intelligence Ready button unblocks as soon as persona resolves.
    // Late-arriving upstream events are merged into detectedLifeEvents below.
    const upstreamLifeEventsPromise: Promise<LifeEvent[]> = detectLifeEventsOnlyRef
      .current()
      .catch((e) => {
        console.warn("[PRELOAD] Upstream life event detection failed:", e);
        return [] as LifeEvent[];
      });


    // Await risk detection (started in parallel from fireClassification) so we can pass
    // risk categories + flagged transaction IDs into synthesize-persona for vice/gambling
    // theme suppression. Bound to 6s so a slow risk call never blocks the demo.
    if (riskReadyRef.current) {
      try {
        await Promise.race([riskReadyRef.current, new Promise<void>((resolve) => setTimeout(resolve, 6000))]);
      } catch {
        /* swallow — defensive UI filter still applies */
      }
    }
    const riskFlagsForPersona = riskFlagsRef.current?.flags || [];
    const riskCategoriesPresent = Array.from(
      new Set(
        riskFlagsForPersona
          .map((f: any) => String(f.category_label || f.category_group || "").trim())
          .filter((s: string) => s.length > 0),
      ),
    );
    const riskTransactionIds = Array.from(
      new Set(
        riskFlagsForPersona.map((f: any) => String(f.transaction_id || "").trim()).filter((s: string) => s.length > 0),
      ),
    );
    const riskTxIdSet = new Set(riskTransactionIds);
    console.log(
      `[PRELOAD] Risk-aware persona synthesis: ${riskCategoriesPresent.length} risk categories, ${riskTransactionIds.length} flagged txn ids`,
    );

    // Resolve external intelligence signals BEFORE the LLM call so the model
    // sees them as pre-classified inputs and can respect their bucket assignments.
    const externalSignalsRaw = getExternalSignalsFor(DEMO_CUSTOMERS[selectedIdx]?.id);
    const externalForLLM = externalSignalsForLLM(externalSignalsRaw);

    try {
      const { data, error } = await supabase.functions.invoke("synthesize-persona", {
        body: {
          pillars,
          // Send the full enriched transaction list so the LLM can pick exact rows
          // (with their lifestyle subcategory tags) for lifestyle-prone rollups.
          transactions: enrichedTxs.map((t) => ({
            merchant_name: t.merchant_name,
            normalized_merchant: (t as any).normalized_merchant,
            amount: t.amount,
            date: t.date,
            pillar: t.pillar,
            category: t.category,
            subcategories: t.subcategories,
            spending_tier: t.spending_tier,
          })),
          lifeEvents: [],

          riskCategoriesPresent,
          riskTransactionIds,
          externalSignals: externalForLLM,
          bankContext: getBankPromptContext(),
        },
      });
      if (error) throw error;
      // ---- Financial signals (auto loans, mortgages, brokerage, etc.) ----
      // Any txn owned by a financial signal is stripped from lifestyle rollups
      // (mirrors the risk-guard logic below).
      const rawFinancialSignals: any[] = Array.isArray(data.financial_signals) ? data.financial_signals : [];
      const financialTxIdxSet = new Set<number>();
      for (const fs of rawFinancialSignals) {
        for (const ti of fs.transaction_indices || []) financialTxIdxSet.add(ti);
      }
      const rawDemographicShifts: any[] = Array.isArray(data.demographic_shifts) ? data.demographic_shifts : [];

      // Trust the edge function's demographic filtering — synthesize-persona already
      // applies the ladder (life > financial > demographic), NON_DEMO vocab guard,
      // and unclaimed-index test server-side. No redundant re-gate here.
      const dedupedDemographicShifts = rawDemographicShifts
        .filter((d: any) => d.category !== "life_stage_entry"); // legacy category retired


      const synthesis: PersonaSynthesis = {
        financialSignals: rawFinancialSignals.map((f: any) => ({
          id: f.id,
          product_family: f.product_family,
          label: f.label,
          servicer: f.servicer,
          monthly_amount_band: f.monthly_amount_band,
          cadence: f.cadence,
          transaction_indices: (f.transaction_indices || []).filter(
            (ti: number) => ti >= 0 && ti < enrichedTxs.length,
          ),
          talking_points: f.talking_points || [],
        })),
        demographicShifts: dedupedDemographicShifts.map((d: any) => ({
          id: d.id,
          category: d.category,
          label: d.label,
          direction: d.direction,
          confidence: d.confidence,
          magnitude_band: d.magnitude_band,
          evidence_summary: d.evidence_summary,
          transaction_indices: d.transaction_indices,
        })),
        pillarRollups: (data.pillar_rollups || [])
          .map((r: any) => {
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
                  (p, i) =>
                    !matchedGroupIndices.has(i) &&
                    p.pillar === r.pillar &&
                    p.label.toLowerCase() === catName.toLowerCase(),
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
            // RISK GUARD: any transaction owned by a risk flag (gambling, BNPL, payday, collections,
            // adult, offshore, etc.) is the exclusive property of the Risk pill — never let it appear
            // inside a lifestyle rollup, no matter what the LLM said.
            if (riskTxIdSet.size > 0) {
              for (const ti of Array.from(txIndicesSet)) {
                const txId = (enrichedTxs[ti] as any)?.transaction_id;
                if (txId && riskTxIdSet.has(txId)) txIndicesSet.delete(ti);
              }
            }
            // FINANCIAL-SIGNAL GUARD: any transaction owned by a financial signal
            // (auto loan, mortgage, brokerage contribution, etc.) belongs exclusively
            // to that signal and must not appear inside a lifestyle rollup.
            if (financialTxIdxSet.size > 0) {
              for (const ti of Array.from(txIndicesSet)) {
                if (financialTxIdxSet.has(ti)) txIndicesSet.delete(ti);
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
            derivedCatKeys.forEach((key) => {
              const idx = pillars.findIndex((p) => `${p.pillar}::${p.label}` === key);
              if (idx >= 0) derivedCategoryIndices.push(idx);
            });
            // Union with LLM-claimed categories so non-txn-level pillars (utilities etc.) still work
            for (const gi of matchedGroupIndices) {
              if (!derivedCategoryIndices.includes(gi)) derivedCategoryIndices.push(gi);
            }

            const totalCount = txIndices.length;
            const totalSpend = txIndices.reduce((s, ti) => s + (enrichedTxs[ti]?.amount || 0), 0);

            // Collect the resolved category labels for coherence validation
            const resolvedCategories = derivedCategoryIndices.map((gi) => pillars[gi].label.toLowerCase());

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
            const lifeStageKeywords = [
              "nursery",
              "nesting",
              "new parent",
              "baby",
              "suburban",
              "family setup",
              "expecting",
            ];
            const isLifeStageLabel = lifeStageKeywords.some((kw) => label.includes(kw));
            if (isLifeStageLabel) {
              const familyKeywords = [
                "baby",
                "kids",
                "child",
                "nursery",
                "pediatr",
                "daycare",
                "maternity",
                "infant",
                "toddler",
              ];
              const familyCatCount = cats.filter((c) => familyKeywords.some((fk) => c.includes(fk))).length;
              if (familyCatCount < 2) {
                console.log(
                  `[ROLLUP-REJECT] "${r.label}" — life-stage label with only ${familyCatCount} family categories`,
                );
                return false;
              }
            }

            // Rule 3: Reject rollups that mix incompatible themes
            const incompatiblePairs: [string[], string[]][] = [
              [
                ["gas", "fuel", "commut", "auto", "car wash"],
                ["nursery", "baby", "kids", "child", "toy"],
              ],
              [
                ["gas", "fuel", "commut", "auto"],
                ["streaming", "subscription", "netflix", "hulu", "spotify"],
              ],
              [
                ["grocery", "supermarket", "food"],
                ["streaming", "subscription", "software"],
              ],
            ];
            for (const [groupA, groupB] of incompatiblePairs) {
              const hasA = cats.some((c) => groupA.some((kw) => c.includes(kw)));
              const hasB = cats.some((c) => groupB.some((kw) => c.includes(kw)));
              if (hasA && hasB) {
                console.log(`[ROLLUP-REJECT] "${r.label}" — incompatible themes detected`);
                return false;
              }
            }

            // Rule 4: Reject rollups whose label uses risk-domain vocabulary. Those concepts
            // belong exclusively to the Risk surface — never restate them as a customer-facing lifestyle.
            const riskVocab = /betting|sportsbook|casino|wager|gambl|payday|bnpl|cash advance|adult|vice|high roller/i;
            if (riskVocab.test(r.label)) {
              console.warn(`[ROLLUP-REJECT] "${r.label}" — uses risk-domain vocabulary; coordinate via Risk pill`);
              return false;
            }

            // Rule 5: After the risk-id guard above stripped risk-owned txns, the rollup may
            // have collapsed below the meaningful-evidence threshold. Drop it.
            if (r.totalCount < 2) {
              console.log(`[ROLLUP-REJECT] "${r.label}" — fewer than 2 transactions after risk filtering`);
              return false;
            }

            return true;
          })
          .sort((a: any, b: any) => (b.totalSpend || 0) - (a.totalSpend || 0))
          .map(({ _resolvedCategories, ...rest }: any) => rest),
      };

      // --- Inject external-intelligence signals bucketed as financial / demographic ---
      // The LLM was already told about these (via `externalSignals` in the request),
      // but we authoritatively append them here so the UI ownership is deterministic
      // and never depends on the model choosing to echo them back.
      for (const es of externalSignalsRaw) {
        if (es.bucket === "financial_signal") {
          // Replace any LLM-emitted financial signal in the same product family so
          // external intelligence always wins ownership of that pill. Merge in the
          // LLM's transaction indices + servicer inference so the click-to-highlight
          // still works.
          const familyKey = (es.product_family || "").toLowerCase();
          const collidingIdx = synthesis.financialSignals.findIndex(
            (f: any) => (f.product_family || "").toLowerCase() === familyKey && familyKey !== "",
          );
          const inherited: any = collidingIdx >= 0 ? synthesis.financialSignals[collidingIdx] : null;
          const merged: any = {
            id: es.id,
            product_family: es.product_family || "other",
            label: es.event_name,
            servicer: es.servicer || inherited?.servicer,
            monthly_amount_band: es.monthly_amount_band || inherited?.monthly_amount_band,
            cadence: es.cadence || inherited?.cadence,
            transaction_indices: inherited?.transaction_indices || [],
            talking_points: es.talking_points || inherited?.talking_points || [],
            source: "external",
            provider: es.provider,
            confidence: es.confidence,
            detail: es.detail,
          };
          if (collidingIdx >= 0) {
            synthesis.financialSignals.splice(collidingIdx, 1, merged);
          } else {
            synthesis.financialSignals.push(merged);
          }
        } else if (es.bucket === "demographic_shift") {
          // Same policy for demographic shifts — external wins & absorbs any LLM
          // transaction linkage.
          const collidingIdx = synthesis.demographicShifts.findIndex(
            (d: any) => (d.category || "") === (es.demographic_category || ""),
          );
          const inherited: any = collidingIdx >= 0 ? synthesis.demographicShifts[collidingIdx] : null;
          const merged: any = {
            id: es.id,
            category: es.demographic_category || "household_composition",
            label: es.event_name,
            direction: es.direction || inherited?.direction || "lateral",
            confidence: es.confidence,
            magnitude_band: es.magnitude_band || inherited?.magnitude_band,
            evidence_summary: es.detail || inherited?.evidence_summary,
            transaction_indices: inherited?.transaction_indices || [],
            source: "external",
            provider: es.provider,
          };
          if (collidingIdx >= 0) {
            synthesis.demographicShifts.splice(collidingIdx, 1, merged);
          } else {
            synthesis.demographicShifts.push(merged);
          }
        }
      }


      personaSynthesisRef.current = synthesis;
      setPersonaSynthesis(synthesis);
      console.log("[PRELOAD] Persona synthesis ready:", synthesis.pillarRollups?.length, "rollups");

      // --- Life events come EXCLUSIVELY from synthesize-persona (the final classifier). ---
      // Upstream analyze-lifestyle-signals output is intentionally discarded here so the
      // Behavioral Intelligence pills reflect the single authoritative taxonomy decision.
      const promotedRaw = Array.isArray(data?.detected_life_events) ? data.detected_life_events : [];
      const finalLifeEvents: LifeEvent[] = promotedRaw
        .filter((e: any) => e?.event_name)
        .map((e: any) => {
          const txIdx: number[] = Array.isArray(e.transaction_indices) ? e.transaction_indices : [];
          const hydratedEvidence =
            e.evidence && e.evidence.length > 0
              ? e.evidence
              : txIdx
                  .slice(0, 4)
                  .map((ti: number) => {
                    const t: any = enrichedTxs[ti];
                    if (!t) return null;
                    return {
                      merchant: t.normalized_merchant || t.merchant_name || "Unknown",
                      amount: typeof t.amount === "number" ? t.amount : 0,
                      date: t.date || "",
                      relevance: `Cluster evidence for ${e.event_name}`,
                    };
                  })
                  .filter(Boolean);
          return {
            event_name: e.event_name,
            confidence: typeof e.confidence === "number" ? e.confidence : 70,
            evidence: hydratedEvidence,
            talking_points: Array.isArray(e.talking_points) ? e.talking_points : [],
          } as LifeEvent;
        });

      // Fire downstream views with the final classifier's life events immediately —
      // don't block on the parallel upstream detector.
      fireLifeEventDetection(synthesis, pillars, finalLifeEvents);

      // Upstream analyze-lifestyle-signals is used only as a dedup hint for
      // synthesize-persona (see upstreamLifeEventsPromise above). Its events
      // are intentionally NOT merged back into the pill strip — the panel
      // reflects synthesize-persona's authoritative taxonomy only.

    } catch (err) {
      console.error("[PRELOAD] Persona synthesis failed:", err);
    }
  }, []);


  /** Generate AI-powered deal recommendations from persona + pillars + optional life events */
  const fireNextOffers = useCallback(
    async (synthesis: PersonaSynthesis, pillars: any[], lifeEvents?: LifeEvent[]) => {
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
          pillars: pillars.slice(0, 8).map((p) => ({
            pillar: p.pillar,
            label: p.label,
            count: p.count,
            totalSpend: p.totalSpend,
            topMerchants: p.topMerchants,
            subcategories: p.subcategories,
          })),
          demographics,
          financial_signals: synthesis?.financialSignals || [],
          months_of_data: 12,
        };
        if (lifeEvents && lifeEvents.length > 0) {
          body.lifeEvents = lifeEvents.map((e) => ({
            event_name: e.event_name,
            confidence: e.confidence,
            evidence_merchants: (e.evidence || []).map((ev) => ev.merchant).filter(Boolean),
          }));
        }
        body.bankContext = getBankPromptContext();
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
    },
    [selectedIdx],
  );

  /** Pure life-event detection — invokes the edge function and returns events.
   *  Used both pre-synthesis (to feed dedup hint into synthesize-persona) and
   *  reused by fireLifeEventDetection to avoid double API calls. */
  const detectLifeEventsOnly = useCallback(async (): Promise<LifeEvent[]> => {
    const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
    const demographics = (demoCustomer?.profile?.demographics as Record<string, string>) || {};
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

    const topCategories = [...new Set(enrichedTxs.map((tx) => tx.category))].slice(0, 5);
    const totalSpend = enrichedTxs.reduce((s, tx) => s + tx.amount, 0);

    const { data, error } = await supabase.functions.invoke("analyze-lifestyle-signals", {
      body: {
        client,
        transactions,
        spending_summary: { total_spend: totalSpend, top_categories: topCategories },
        bankContext: getBankPromptContext(),
      },
    });
    if (error) throw error;
    return (data.detected_events || []) as LifeEvent[];
  }, [selectedIdx, customCsv]);

  detectLifeEventsOnlyRef.current = detectLifeEventsOnly;

  /** Hydrate UI state with detected life events and trigger downstream product cards + offers.
   *  If `preDetectedEvents` is supplied, skip the API call and reuse them. */
  const fireLifeEventDetection = useCallback(
    async (synthesis?: PersonaSynthesis, pillars?: any[], preDetectedEvents?: LifeEvent[]) => {
      setProductsLoading(true);
      setDetectedLifeEvents(null);
      try {
        const events: LifeEvent[] = preDetectedEvents ?? (await detectLifeEventsOnly());
        // Inject dynamic external-intelligence signals into the life-event pill
        // ONLY when the signal is bucketed as a life_event. Financial-signal and
        // demographic-shift externals are injected into their own synthesis rows
        // (see firePersonaSynthesis) — they must not double-post as life events.
        const external = getExternalSignalsFor(DEMO_CUSTOMERS[selectedIdx]?.id)
          .filter((s) => s.bucket === "life_event")
          .map(externalSignalToLifeEvent);
        const merged: LifeEvent[] = [...external, ...events]
          .filter(Boolean)
          .slice(0, 3) as LifeEvent[];
        setDetectedLifeEvents(merged);
        detectedLifeEventsRef.current = merged;
        console.log("[PRELOAD] Life events hydrated:", merged.length, `(${external.length} external life_event)`, preDetectedEvents ? "(reused detected)" : "(fresh detected)");
        // Fire product cards generation with life events + persona data
        fireProductCards(merged, personaSynthesisRef.current);
        // Fire offers with both pillars and detected life events in a single call
        const syn = synthesis || personaSynthesisRef.current;
        if (syn && pillars) {
          fireNextOffers(syn, pillars, merged.length > 0 ? merged : undefined);
        }
      } catch (err) {
        console.error("[PRELOAD] Life event detection failed:", err);
      } finally {
        setProductsLoading(false);
      }
    },
    [detectLifeEventsOnly],
  );

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
      const homeZip =
        (demoCustomer?.profile?.demographics as any)?.zip ||
        (demoCustomer?.profile?.demographics as any)?.zip_code ||
        "";
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
        body: { transactions: payload, bankContext: getBankPromptContext() },
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
  const fireProductCards = useCallback(
    async (events: LifeEvent[], synthesis: PersonaSynthesis | null) => {
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
            if (tx.subcategories)
              tx.subcategories.forEach((sc: string) => {
                if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
              });
          } else {
            grouped.set(key, {
              pillar: tx.pillar,
              label: tx.category,
              count: 1,
              totalSpend: tx.amount,
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
            financial_signals: synthesis?.financialSignals || [],
            risk_flags: riskFlagsRef.current?.flags || [],
            bankContext: getBankPromptContext(),
          },
        });
        if (error) throw error;
        const cards = data.cards || [];
        setProductCards(cards);
        console.log("[PRELOAD] Product cards ready:", cards.length, "types:", cards.map((c: any) => c.type));
        // Fire action generation with full context
        if (cards.length > 0) {
          fireProductActions(cards, events, synthesis);
        }
      } catch (err) {
        console.error("[PRELOAD] Product cards failed:", err);
      } finally {
        setProductCardsLoading(false);
      }
    },
    [selectedIdx],
  );

  /** Generate AI-powered engagement actions for each product card */
  const fireProductActions = useCallback(
    async (cards: ProductCard[], events: LifeEvent[], synthesis: PersonaSynthesis | null) => {
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
            bankContext: getBankPromptContext(),
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
    },
    [selectedIdx],
  );



  firePersonaSynthesisRef.current = firePersonaSynthesis;
  fireRiskDetectionRef.current = fireRiskDetection;

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  // Fire classification for initial customer on mount (skipped if the
  // prefire-coordinator effect below will do it — avoids double SSE).
  const mountClassifyRef = useRef(false);
  useEffect(() => {
    if (mountClassifyRef.current) return;
    if (prefireOnMount) return; // prefire effect owns the kickoff when embedded
    mountClassifyRef.current = true;
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
    [clearTimeouts, fireClassification],
  );

  const handleChangeCustomer = useCallback(() => {
    setSelectionDialogOpen(true);
  }, []);

  const handleLoadCustomCsv = useCallback(
    (csv: string, name: string) => {
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
      setSynthesisTriggered(false);
      setProfile(buildLocalProfile(csv, 0, name));
      // Preload classification for custom CSV
      fireClassification(csv);
    },
    [clearTimeouts, fireClassification],
  );

  const revealStep = useCallback(
    (
      idx: number,
      p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] },
      skipHighlight = false,
    ) => {
      const tabKey = TAB_ORDER[idx];
      const card = p.intelligence[tabKey];
      setActiveTab(tabKey);
      setCurrentCardColor(card.accent);
      if (!skipHighlight) {
        setCollectedIndices(card.txIndices);
      }
      setRevealedTabs(TAB_ORDER.slice(0, idx + 1));
      setStepIndex(idx);
    },
    [],
  );

  // ============================================================================
  // Global stage navigation: ◀ / ▶ / Backspace step through the entire /demo flow
  // Stages: 1 Selection → 2 Enrichment → 3 Behavioral Intelligence → 4 Next-Offer
  //         → 5 Next-Product → 6 Next-Conversation
  // ============================================================================
  const NAV_TAB_ORDER: TabKey[] = useMemo(() => ["analytics", "product", "relationship"], []);
  const STAGE_LABELS = useMemo(
    () => [
      "Data Selection",
      "Enrichment",
      "Behavioral Intelligence",
      "Next-Offer",
      "Next-Product",
      "Next-Conversation",
    ],
    [],
  );

  const currentStage = useMemo<number>(() => {
    if (selectionDialogOpen) return 1;
    if (activeTab === "analytics") return 4;
    if (activeTab === "product") return 5;
    if (activeTab === "relationship") return 6;
    if (synthesisTriggered) return 3;
    if (phase === "hold" || phase === "cardCycle") return 2;
    return 1;
  }, [selectionDialogOpen, activeTab, synthesisTriggered, phase]);

  // Forward-ref to handleRunAnalysis so we can invoke it before its declaration below.
  const runAnalysisRef = useRef<(() => void) | null>(null);

  const goToStage = useCallback(
    (target: number) => {
      const t = Math.max(1, Math.min(6, target));
      switch (t) {
        case 1:
          setSelectionDialogOpen(true);
          return;
        case 2:
          setSelectionDialogOpen(false);
          setActiveTab(null);
          setSynthesisTriggered(false);
          if (!profileRef.current) {
            runAnalysisRef.current?.();
          }
          return;
        case 3:
          setSelectionDialogOpen(false);
          setActiveTab(null);
          if (!profileRef.current) {
            runAnalysisRef.current?.();
          }
          setSynthesisTriggered(true);
          return;
        case 4:
        case 5:
        case 6: {
          setSelectionDialogOpen(false);
          if (!profileRef.current) {
            runAnalysisRef.current?.();
          }
          setSynthesisTriggered(true);
          const tabKey = NAV_TAB_ORDER[t - 4];
          setActivePillFilter(null);
          setActiveRollup(null);
          setActiveTriggerPill(null);
          setActiveTab(tabKey);
          return;
        }
      }
    },
    [NAV_TAB_ORDER],
  );

  const goNext = useCallback(() => {
    if (currentStage >= 6) return;
    goToStage(currentStage + 1);
  }, [currentStage, goToStage]);

  const goBack = useCallback(() => {
    if (currentStage <= 1) return;
    goToStage(currentStage - 1);
  }, [currentStage, goToStage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goBack]);

  const runAnimationWithProfile = useCallback(
    (p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }) => {
      setProcessedIndices([]);
      setRevealedTabs([]);
      setActiveTab(null);
      setTxPanelExpanded(false);
      setCollectedIndices([]);
      profileRef.current = p;

      // Skip the scroll/cardScan animation — go straight to the full-width
      // enrichment table view. Mark all transactions as "processed" so any
      // downstream consumers of processedSignals stay in sync.
      const txCount = p.transactions.length;
      setProcessedIndices(Array.from({ length: txCount }, (_, i) => i));
      setPhase("hold");
      setCurrentCardColor(p.intelligence.analytics.accent);
    },
    [schedule, revealStep],
  );

  const handleRunAnalysis = useCallback(async () => {
    if (isRunning) return;
    clearTimeouts();
    setSynthesisTriggered(false);

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

  // Keep the forward-ref in sync so stage navigation can call analysis from
  // earlier in the file without TDZ issues.
  useEffect(() => {
    runAnalysisRef.current = handleRunAnalysis;
  }, [handleRunAnalysis]);

  // Pre-fire coordinator: as soon as ExecDemoPage mounts (post-password on
  // /bankdemo), kick off the full pipeline for customer 0 so the Demo tab is
  // ready before the user ever clicks it. Kicks off in this order:
  //   1) fireClassification -> SSE done -> firePersonaSynthesis
  //      -> fireLifeEventDetection -> fireProductCards + fireNextOffers
  //   2) handleRunAnalysis to build local profile + animation state so the
  //      Demo tab renders instantly on first open.
  // Guarded against StrictMode double-mount by didPrefireRef.
  const didPrefireRef = useRef(false);
  useEffect(() => {
    if (!prefireOnMount || didPrefireRef.current) return;
    if (profileRef.current || customCsv) return;
    didPrefireRef.current = true;
    // Start SSE classification (safe: fireClassification aborts any in-flight).
    if (!classifyAbortRef.current) {
      fireClassification(getCsvForCustomer(0));
    }
    // Build local profile so the visible Demo tab is instant on first open.
    // handleRunAnalysis has an isRunning short-circuit but at mount phase===idle.
    handleRunAnalysis();
  }, [prefireOnMount, customCsv, handleRunAnalysis, fireClassification]);

  // When embedded, always open the selection dialog whenever the user
  // navigates to the Demo tab. Cached results still render behind the dialog,
  // but the customer picker is the first thing the user sees every time.
  useEffect(() => {
    if (!embedded) return;
    if (active) {
      setSelectionDialogOpen(true);
    } else {
      setSelectionDialogOpen(false);
    }
  }, [embedded, active]);


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
      prev && prev.pillar === pillar && prev.label === label && prev.isCategory === !!isCategory
        ? null
        : { pillar, label, isCategory: !!isCategory },
    );
  }, []);

  const handleRollupClick = useCallback((rollup: PillarRollup) => {
    setActivePillFilter(null);
    setActiveTriggerPill(null);
    setActiveRollup((prev) => (prev && prev.pillar === rollup.pillar && prev.label === rollup.label ? null : rollup));
  }, []);

  const handleTriggerPillClick = useCallback(
    (label: string, txIndices: number[], color: string, kind: "lifeEvent" | "risk" = "lifeEvent") => {
      setActivePillFilter(null);
      setActiveRollup(null);
      setActiveTriggerPill((prev) =>
        prev && prev.label === label ? null : { label, indices: txIndices, color, kind },
      );
    },
    [],
  );

  const execProfile = profile || getIntelligenceForCustomer(selectedIdx);
  const demoCustomer = DEMO_CUSTOMERS[selectedIdx];
  const externalSignals = useMemo(() => getExternalSignalsFor(demoCustomer?.id), [demoCustomer?.id]);

  // Publish the live demo session so the Personalized pages can mirror the customer mockup.
  useEffect(() => {
    publishExecDemoSession({
      hasRun: Boolean(generatedOffers || productCards || enrichedTxs),
      customer: demoCustomer ?? null,
      generatedOffers,
      productCards,
      detectedLifeEvents,
      enrichedTxs: enrichedTxs ?? classifiedRef.current ?? null,
      riskFlags,
      activeRollupLabel: activeTriggerPill?.label || activeRollup?.label || null,
      activeRollupPillar: activeTriggerPill ? "Life Event" : activeRollup?.pillar || null,
    });
  }, [
    demoCustomer,
    generatedOffers,
    productCards,
    detectedLifeEvents,
    enrichedTxs,
    riskFlags,
    activeTriggerPill,
    activeRollup,
  ]);



  // Click any Pillar pill inside the enrichment table → bring all txns in that pillar to the top.
  const handleEnrichmentPillarClick = useCallback(
    (pillar: string) => {
      const sm = execProfile.persona.signalMap;
      const indices = Object.entries(sm)
        .filter(([, s]) => s.pillar === pillar)
        .map(([idx]) => Number(idx));
      const color = getColor(pillar).dot;
      handleTriggerPillClick(pillar, indices, color, "lifeEvent");
    },
    [execProfile.persona.signalMap, handleTriggerPillClick],
  );

  // Derive processedSignals from indices + current signalMap (auto-syncs on AI upgrade)
  const processedSignals = useMemo(
    () => processedIndices.map((i) => execProfile.persona.signalMap[i]).filter(Boolean),
    [processedIndices, execProfile.persona.signalMap],
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
        .filter(
          ([, s]) =>
            s.pillar === activePillFilter.pillar &&
            (activePillFilter.isCategory ? s.category === activePillFilter.label : s.label === activePillFilter.label),
        )
        .map(([idx]) => Number(idx));
    }
    return null;
  }, [activePillFilter, activeRollup, activeTriggerPill, execProfile.persona.signalMap]);

  return (
    <SimplePasswordGate
      tagline="Behavioral Intelligence Infrastructure For Banking Personalization"
      bullets={["Multi-Rail Enrichment", "Behavioral Intelligence", "Personalization Orchestration"]}
    >
      <div className="h-full min-h-0 bg-slate-50 flex flex-col font-[Manrope,sans-serif] overflow-hidden">
        {/* Top bar */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <img src={ventusLogo} alt="Ventus AI" className="h-8 w-auto" />
            <span className="text-[15px] font-semibold text-slate-700 hidden sm:inline">
              Multi-Rail Enrichment - Behavioral Intelligence - Personalization Orchestration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setContactOpen(true)}
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Next Step →
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setProcessedIndices([]);
                setRevealedTabs([]);
                setActiveTab(null);
                setPersonaSynthesis(null);
                setDetectedLifeEvents(null);
                setEnrichedTxs(null);
                setGeneratedOffers(null);
                setProductCards(null);
                setProductActions(null);
                setRiskFlags(null);
                
                setSynthesisTriggered(false);
                setActivePillFilter(null);
                setActiveRollup(null);
                setActiveTriggerPill(null);
                setCollectedIndices([]);
                setStepIndex(0);
                setOffersLoading(false);
                setProductsLoading(false);
                setProductCardsLoading(false);
                setActionsLoading(false);
                setRiskLoading(false);
                
                setSelectionDialogOpen(true);
              }}
              title="Restart demo"
              aria-label="Restart demo"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Main content — 3 columns with animated collapse */}
        {(() => {
          const isNextTab =
            activeTab === "analytics" ||
            activeTab === "rewards" ||
            activeTab === "product" ||
            activeTab === "relationship";
          const phoneVisible = isNextTab;
          const showEnrichmentFullScreen = phase === "hold" && !activeTab;
          return (
            <div className="flex-1 min-h-0 flex">
              {/* Col 1 — Transaction feed (hidden during pre-synthesis enrichment table view AND on Next tabs) */}
              {!showEnrichmentFullScreen && !isNextTab && (
                <div
                  className="border-r border-slate-200 bg-white transition-all duration-500 ease-in-out relative"
                  style={{
                    width: 400,
                    minWidth: 400,
                    overflow: "hidden",
                  }}
                >
                  <div className="w-[400px] h-full relative">
                    <ExecDemoLeftPanel
                      selectedIdx={selectedIdx}
                      onSelectCustomer={handleSelectCustomer}
                      onRunAnalysis={handleRunAnalysis}
                      onLoadCustomCsv={handleLoadCustomCsv}
                      onChangeCustomer={embedded ? undefined : handleChangeCustomer}
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
                      activePillLabel={
                        activeTriggerPill?.label || activeRollup?.label || activePillFilter?.label || null
                      }
                      activePillColor={
                        activeTriggerPill
                          ? activeTriggerPill.color
                          : activeRollup
                            ? getColor(activeRollup.pillar).dot
                            : activePillFilter
                              ? getColor(activePillFilter.pillar).dot
                              : "#10b981"
                      }
                      onClearFilter={() => {
                        setActivePillFilter(null);
                        setActiveRollup(null);
                        setActiveTriggerPill(null);
                      }}
                      enriched={phase === "cardCycle" || phase === "hold"}
                    />
                  </div>
                </div>
              )}

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
                  onCloseWMCopilot={() => setWmCopilotOpen(false)}
                  onOpenAIAssistant={handleOpenAIAssistantWrapper}
                  onAIPromptDispatch={dispatchAIPrompt}
                  assistantOpen={!wmCopilotOpen}
                  wmCopilotOpen={wmCopilotOpen}
                  synthesisTriggered={synthesisTriggered}
                  onSynthesisChange={setSynthesisTriggered}
                  fullWidthEnrichment={showEnrichmentFullScreen}
                  highlightedIndices={filteredIndices}
                  highlightColor={
                    activeTriggerPill
                      ? activeTriggerPill.color
                      : activeRollup
                        ? getColor(activeRollup.pillar).dot
                        : activePillFilter
                          ? getColor(activePillFilter.pillar).dot
                          : "#0ea5e9"
                  }
                  activePillLabel={activeTriggerPill?.label || activeRollup?.label || activePillFilter?.label || null}
                  onClearHighlight={() => {
                    setActivePillFilter(null);
                    setActiveRollup(null);
                    setActiveTriggerPill(null);
                  }}
                  onEnrichmentPillarClick={handleEnrichmentPillarClick}
                  productDeliveryChannel={productDeliveryChannel}
                  onProductDeliveryChannelChange={setProductDeliveryChannel}
                  externalSignals={externalSignals}
                />
              </div>

              {/* Col 3 — Phone mockup (only opens when "Open AI Banking Assistant" is clicked) */}
              {(() => {
                const phoneVisible =
                  activeTab === "analytics" ||
                  activeTab === "rewards" ||
                  activeTab === "product" ||
                  activeTab === "relationship";
                 const isRelTab = activeTab === "relationship";
                 const expandedW = 560;
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
                      <div className="h-full relative flex flex-col" style={{ width: expandedW }}>
                        <button
                          onClick={() => setPhoneCollapsed(true)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <div className="flex-1 min-h-0">
                          <ExecDemoPhoneView
                            customer={demoCustomer}
                            activeTab={activeTab}
                            phase={phase}
                            showContent={phoneVisible && phase !== "idle"}
                            generatedOffers={generatedOffers}
                            detectedLifeEvents={detectedLifeEvents}
                            productCards={productCards}
                            productDeliveryChannel={productDeliveryChannel}
                            activeRollupLabel={activeTriggerPill?.label || activeRollup?.label || null}
                            activeRollupPillar={activeTriggerPill ? "Life Event" : activeRollup?.pillar || null}
                            enrichedTxs={classifiedRef.current}
                            riskFlags={riskFlags}
                            aiTabTrigger={aiTabTrigger}
                            pendingAIPrompt={pendingAIPrompt}
                            wmCopilotMode={wmCopilotOpen && activeTab === "relationship"}
                            wmCopilotSignal={wmCopilotSignal}
                            wmCopilotSecondarySignal={
                              wmCopilotSignal && /college/i.test(wmCopilotSignal.label) ? "Home Purchase" : null
                            }
                            wmCopilotPersonaTitle={execProfile.persona.title}
                            onCloseWMCopilot={handleCloseWMCopilot}
                          />
                        </div>
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
          embedded={embedded}
          onBack={onBack}
        />
      </div>
    </SimplePasswordGate>
  );
}
