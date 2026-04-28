import React, { useMemo, useRef, useEffect, useState } from "react";
import { BarChart3, Gift, Users, CreditCard, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import type { ExecIntelligence, ExecPersona, IntelCard, SignalEntry } from "./execDemoData";
import PurchaseCycleTimeline from "./PurchaseCycleTimeline";
import NextOfferRationale from "./NextOfferRationale";
import NextProductRationale from "./NextProductRationale";
import NextConversationRationale, { type SelectedSignal } from "./NextConversationRationale";
import type { RollupOfferGroup } from "./NextOfferRationale";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "./ProductCardsPhoneView";
import ExecDemoEnrichmentTable from "./ExecDemoEnrichmentTable";

type TabKey = "analytics" | "rewards" | "product" | "relationship";

export interface PillarRollup {
  pillar: string;
  label: string;
  categories: string[];
  categoryIndices?: number[];
  txIndices?: number[];
  totalCount?: number;
  totalSpend?: number;
}

export interface PersonaSynthesis {
  pillarRollups?: PillarRollup[];
}

interface Props {
  persona: ExecPersona;
  intelligence: ExecIntelligence;
  phase: string;
  processedSignals: SignalEntry[];
  revealedTabs: TabKey[];
  activeTab: TabKey | null;
  onTabClick: (tab: TabKey) => void;
  activePillFilter?: { pillar: string; label: string; isCategory?: boolean } | null;
  onPillClick?: (pillar: string, label: string, isCategory?: boolean) => void;
  activePillarFilter?: string | null;
  activeRollup?: PillarRollup | null;
  onRollupClick?: (rollup: PillarRollup) => void;
  personaSynthesis?: PersonaSynthesis | null;
  transactions?: import("./execDemoData").Transaction[];
  enrichedTransactions?: import("./execDemoData").EnrichedTransaction[] | null;
  generatedOffers?: RollupOfferGroup[] | null;
  offersLoading?: boolean;
  detectedLifeEvents?: LifeEvent[] | null;
  productsLoading?: boolean;
  productCards?: ProductCard[] | null;
  onTriggerPillClick?: (label: string, txIndices: number[], color: string, kind?: "lifeEvent" | "risk") => void;
  activeTriggerLabel?: string | null;
  activeTrigger?: { label: string; indices: number[]; color: string; kind: "lifeEvent" | "risk" } | null;
  productActions?: import("./NextProductRationale").CardActions[] | null;
  actionsLoading?: boolean;
  riskFlags?: { flags: any[]; summary: string } | null;
  riskLoading?: boolean;
  onOpenWMCopilot?: (firstName: string, signal: SelectedSignal | null) => void;
  onOpenAIAssistant?: (firstName: string, signal: SelectedSignal | null) => void;
  onAIPromptDispatch?: (prompt: string, kind?: "lifestyle" | "lifeEvent" | "risk", signalContext?: string) => void;
  assistantOpen?: boolean;
  synthesisTriggered?: boolean;
  onSynthesisChange?: (triggered: boolean) => void;
  /** When true, renders the enrichment table edge-to-edge (no card chrome / outer padding). */
  fullWidthEnrichment?: boolean;
  /** Indices to highlight inside the enrichment table. */
  highlightedIndices?: number[] | null;
  /** Accent color for highlighted rows. */
  highlightColor?: string;
  /** Active pill label shown in the table's "Showing N of M" strip. */
  activePillLabel?: string | null;
  /** Clear-highlight callback wired to the strip's Clear button. */
  onClearHighlight?: () => void;
}

const TAB_META: Record<TabKey, { icon: typeof BarChart3; label: string }> = {
  analytics: { icon: BarChart3, label: "Next-Offer" },
  rewards: { icon: Gift, label: "Next-Offer" },
  product: { icon: CreditCard, label: "Next-Product" },
  relationship: { icon: Users, label: "Next Conversation" },
};

const TAB_ORDER: TabKey[] = ["analytics", "product", "relationship"];

// Color palette per pillar
const PILLAR_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  // MCC fallback names
  "Travel & Transport": { bg: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.35)", text: "#1e40af", dot: "#60a5fa" },
  "Food & Dining": { bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.35)", text: "#92400e", dot: "#fbbf24" },
  "Wellness & Fitness": { bg: "rgba(52,211,153,.12)", border: "rgba(52,211,153,.35)", text: "#065f46", dot: "#34d399" },
  "Shopping": { bg: "rgba(167,139,250,.12)", border: "rgba(167,139,250,.35)", text: "#5b21b6", dot: "#a78bfa" },
  "Entertainment": { bg: "rgba(251,113,133,.12)", border: "rgba(251,113,133,.35)", text: "#9f1239", dot: "#fb7185" },
  "Home & Living": { bg: "rgba(45,212,191,.12)", border: "rgba(45,212,191,.35)", text: "#115e59", dot: "#2dd4bf" },
  "Education & Family": { bg: "rgba(129,140,248,.12)", border: "rgba(129,140,248,.35)", text: "#3730a3", dot: "#818cf8" },
  "Healthcare": { bg: "rgba(248,113,113,.12)", border: "rgba(248,113,113,.35)", text: "#991b1b", dot: "#f87171" },
  "Technology": { bg: "rgba(56,189,248,.12)", border: "rgba(56,189,248,.35)", text: "#0c4a6e", dot: "#38bdf8" },
  "Pets & Care": { bg: "rgba(244,114,182,.12)", border: "rgba(244,114,182,.35)", text: "#9d174d", dot: "#f472b6" },
  "Financial Planning": { bg: "rgba(250,204,21,.12)", border: "rgba(250,204,21,.35)", text: "#854d0e", dot: "#facc15" },
  "Sports & Active": { bg: "rgba(74,222,128,.12)", border: "rgba(74,222,128,.35)", text: "#166534", dot: "#4ade80" },
  "Miscellaneous": { bg: "rgba(148,163,184,.12)", border: "rgba(148,163,184,.35)", text: "#475569", dot: "#94a3b8" },
  // AI classifier pillar names
  "Sports & Active Living": { bg: "rgba(74,222,128,.12)", border: "rgba(74,222,128,.35)", text: "#166534", dot: "#4ade80" },
  "Health & Wellness": { bg: "rgba(52,211,153,.12)", border: "rgba(52,211,153,.35)", text: "#065f46", dot: "#34d399" },
  "Travel & Exploration": { bg: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.35)", text: "#1e40af", dot: "#60a5fa" },
  "Style & Beauty": { bg: "rgba(244,114,182,.12)", border: "rgba(244,114,182,.35)", text: "#9d174d", dot: "#f472b6" },
  "Pets": { bg: "rgba(244,114,182,.12)", border: "rgba(244,114,182,.35)", text: "#9d174d", dot: "#f472b6" },
  "Entertainment & Culture": { bg: "rgba(251,113,133,.12)", border: "rgba(251,113,133,.35)", text: "#9f1239", dot: "#fb7185" },
  "Technology & Digital Life": { bg: "rgba(56,189,248,.12)", border: "rgba(56,189,248,.35)", text: "#0c4a6e", dot: "#38bdf8" },
  "Family & Community": { bg: "rgba(129,140,248,.12)", border: "rgba(129,140,248,.35)", text: "#3730a3", dot: "#818cf8" },
  "Financial & Aspirational": { bg: "rgba(250,204,21,.12)", border: "rgba(250,204,21,.35)", text: "#854d0e", dot: "#facc15" },
  "Miscellaneous & Unclassified": { bg: "rgba(148,163,184,.12)", border: "rgba(148,163,184,.35)", text: "#475569", dot: "#94a3b8" },
};

const DEFAULT_COLOR = { bg: "rgba(148,163,184,.12)", border: "rgba(148,163,184,.35)", text: "#475569", dot: "#94a3b8" };

export function getColor(pillar: string) {
  return PILLAR_COLORS[pillar] || DEFAULT_COLOR;
}

interface ChipData {
  pillar: string;
  category: string;
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

function deriveChips(signals: SignalEntry[]): ChipData[] {
  const map = new Map<string, ChipData & { freqCounts: Map<string, number> }>();
  for (const s of signals) {
    const category = s.category || s.pillar;
    const subcategory = s.label;
    const key = `${s.pillar}::${category}::${subcategory}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalSpend += (s.amount || 0);
      if (s.frequency) existing.freqCounts.set(s.frequency, (existing.freqCounts.get(s.frequency) || 0) + 1);
    } else {
      const freqCounts = new Map<string, number>();
      if (s.frequency) freqCounts.set(s.frequency, 1);
      map.set(key, { pillar: s.pillar, category, label: subcategory, count: 1, totalSpend: s.amount || 0, freqCounts });
    }
  }
  return Array.from(map.values()).map(({ freqCounts, ...rest }) => {
    let topFreq: string | undefined;
    let topCount = 0;
    for (const [f, c] of freqCounts) {
      if (c > topCount) { topFreq = f; topCount = c; }
    }
    return { ...rest, frequency: topFreq };
  }).sort((a, b) => b.totalSpend - a.totalSpend);
}

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

export default function ExecDemoIntelPanel({
  persona,
  intelligence,
  phase,
  processedSignals,
  revealedTabs,
  activeTab,
  onTabClick,
  activePillFilter,
  onPillClick,
  activePillarFilter,
  activeRollup,
  onRollupClick,
  personaSynthesis,
  transactions,
  enrichedTransactions,
  generatedOffers,
  offersLoading,
  detectedLifeEvents,
  productsLoading,
  productCards,
  onTriggerPillClick,
  activeTriggerLabel,
  activeTrigger,
  productActions,
  actionsLoading,
  riskFlags,
  riskLoading,
  onOpenWMCopilot,
  onOpenAIAssistant,
  onAIPromptDispatch,
  assistantOpen = false,
  synthesisTriggered: synthesisTriggeredProp,
  onSynthesisChange,
  fullWidthEnrichment = false,
  highlightedIndices,
  highlightColor,
  activePillLabel,
  onClearHighlight,
}: Props) {
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const showProfile = phase !== "idle";
  const showTabs = phase === "cardCycle" || phase === "cardScan" || phase === "hold";
  const chips = useMemo(() => deriveChips(processedSignals), [processedSignals]);

  const [synthesisTriggeredInternal, setSynthesisTriggeredInternal] = useState(false);
  const synthesisTriggered = synthesisTriggeredProp ?? synthesisTriggeredInternal;
  const setSynthesisTriggered = (v: boolean) => {
    setSynthesisTriggeredInternal(v);
    onSynthesisChange?.(v);
  };

  // Determine which pillars have AI rollups
  const rollups = personaSynthesis?.pillarRollups || [];

  // Chips not covered by any rollup
  const unrolledChips = useMemo(
    () => {
      if (rollups.length === 0) return chips;
      // Build set of all category indices covered by rollups
      const coveredIndices = new Set<number>();
      for (const r of rollups) {
        if (r.categoryIndices) {
          for (const ci of r.categoryIndices) coveredIndices.add(ci);
        }
      }
      // If we have covered indices, filter by index; otherwise keep all
      if (coveredIndices.size > 0) {
        return chips.filter((_, idx) => !coveredIndices.has(idx));
      }
      // Fallback: fuzzy pillar matching
      return chips.filter(c => !rollups.some(r => {
        if (c.pillar === r.pillar) return true;
        const cLower = c.pillar.toLowerCase();
        const rLower = r.pillar.toLowerCase();
        return rLower.includes(cLower) || cLower.includes(rLower) || r.categories?.some(cat => cat.toLowerCase() === c.label.toLowerCase());
      }));
    },
    [chips, rollups]
  );

  // Use pre-computed stats from rollups directly — no re-derivation from chips.
  // Sort by total spend (descending) so highest-dollar lifestyle behaviors lead.
  const rollupStats = useMemo(() => {
    return rollups
      .filter(r => (r.totalCount ?? 0) > 0)
      .slice()
      .sort((a, b) => (b.totalSpend ?? 0) - (a.totalSpend ?? 0));
  }, [rollups]);


  // Derive current description from milestone keys
  const currentDescription = useMemo(() => {
    if (!persona.descriptions) return null;
    const milestones = Object.keys(persona.descriptions)
      .map(Number)
      .sort((a, b) => a - b);
    const count = processedSignals.length;
    let desc: string | null = null;
    for (const m of milestones) {
      if (count >= m) desc = persona.descriptions[m];
    }
    return desc;
  }, [persona.descriptions, processedSignals.length]);

  const [displayedDesc, setDisplayedDesc] = useState<string | null>(null);
  const [descKey, setDescKey] = useState(0);

  useEffect(() => {
    if (currentDescription && currentDescription !== displayedDesc) {
      setDisplayedDesc(currentDescription);
      setDescKey((k) => k + 1);
    }
  }, [currentDescription]);

  // Reset pills expansion when phase changes
  useEffect(() => {
    if (phase === "idle") {
      setPillsExpanded(false);
      setSynthesisTriggered(false);
    }
  }, [phase]);

  const hasSynthesis = personaSynthesis && personaSynthesis.pillarRollups && personaSynthesis.pillarRollups.length > 0;

  // ---- Next Conversation: build available signals + selection state ----
  const customerSegment = (persona as any)?.profile?.segment || (persona as any)?.segment || "Preferred";
  const isWealthClient = customerSegment === "Private" || customerSegment === "Premium" || customerSegment === "Premier";
  const customerFirstName = (((persona as any)?.profile?.name || (persona as any)?.name || "the client") as string).split(" ")[0];

  const availableSignals = useMemo<SelectedSignal[]>(() => {
    const out: SelectedSignal[] = [];
    (detectedLifeEvents || []).forEach((evt) => {
      out.push({ kind: "lifeEvent", label: evt.event_name });
    });
    if (riskFlags && riskFlags.flags) {
      const seen = new Set<string>();
      riskFlags.flags.forEach((f: any) => {
        const group = String(f.category_group || f.category || "risk").toLowerCase();
        const txId = f.transaction_id || "pattern";
        const key = `${txId}::${group}`;
        if (seen.has(key)) return;
        seen.add(key);
        const rawLabel = f.category_label || f.category_group || f.category || f.type || "Risk";
        const label = String(rawLabel).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        out.push({ kind: "risk", label });
      });
    }
    rollupStats.forEach((r) => {
      out.push({ kind: "lifestyle", label: r.label });
    });
    out.push({ kind: "segment", label: `${customerSegment} Client` });
    return out;
  }, [detectedLifeEvents, riskFlags, rollupStats, customerSegment]);

  const [selectedSignal, setSelectedSignal] = useState<SelectedSignal | null>(null);

  useEffect(() => {
    if (activeTab === "relationship" && !selectedSignal && availableSignals.length > 0) {
      setSelectedSignal(availableSignals[0]);
    }
    if (activeTab !== "relationship") {
      setSelectedSignal(null);
    }
  }, [activeTab, availableSignals, selectedSignal]);

  // Auto-select first lifestyle rollup pill ONCE when entering Next-Offer tab
  // (do NOT re-run when activeRollup is cleared by a life-event/risk pill click —
  //  that would overwrite the user's selection in an infinite loop).
  const autoSelectedTabRef = useRef<TabKey | null>(null);
  // Reset auto-default memo whenever the persona itself changes (new customer / re-run)
  useEffect(() => {
    autoSelectedTabRef.current = null;
  }, [personaSynthesis]);
  useEffect(() => {
    // Reset memo when leaving the tab so re-entering can default again
    if (activeTab !== "analytics") {
      autoSelectedTabRef.current = null;
      return;
    }
    if (activeTab === "analytics"
      && autoSelectedTabRef.current !== "analytics"
      && !activeRollup
      && !activeTriggerLabel
      && rollupStats.length > 0
    ) {
      autoSelectedTabRef.current = "analytics";
      onRollupClick?.(rollupStats[0]);
    }
  }, [activeTab, activeRollup, activeTriggerLabel, rollupStats, onRollupClick, personaSynthesis]);

  const isOfferTab = activeTab === "analytics" || activeTab === "product";


  return (
    <div className={`flex flex-col h-full overflow-hidden ${fullWidthEnrichment ? "pt-2 pb-1 px-6" : "py-3 px-5"}`}>
      {/* Persona section */}
      <div
        className={`transition-all duration-700 ease-out overflow-y-auto exec-light-scroll ${(!synthesisTriggered || pillsExpanded || !activeTab) ? "flex-1 min-h-0" : ""} ${
          fullWidthEnrichment
            ? "pt-3.5 pb-0"
            : "rounded-2xl px-4 py-3.5 mb-2.5"
        }`}
        style={{
          background: fullWidthEnrichment ? undefined : "rgba(11,26,58,.022)",
          border: fullWidthEnrichment ? undefined : "1px solid rgba(11,26,58,.14)",
          opacity: showProfile ? 1 : 0,
          transform: showProfile ? "translateY(0)" : "translateY(12px)",
          maxHeight: synthesisTriggered && !pillsExpanded && activeTab ? "45vh" : undefined,
        }}
      >

        {/* Evolving persona description (shown while AI synthesis loads) */}
        {!synthesisTriggered && displayedDesc && (
          <div
            key={descKey}
            className="mb-3 text-[12px] italic text-slate-500 leading-relaxed"
            style={{ animation: "desc-crossfade 0.6s ease-out" }}
          >
            {displayedDesc}
          </div>
        )}


        {/* Rollup pills + evidence pills */}
        {chips.length > 0 && (
          <div>
            {/* Header text - always visible */}
            {synthesisTriggered && rollupStats.length > 0 ? (
              <div className="mb-2">
                <div className="flex items-start justify-between">
                  {(() => {
                    const headerCopy =
                      activeTab === "analytics"
                        ? { title: "3.1 Curated Deal Collections", sub: "Persona-fit deals lift engagement and grow customer LTV" }
                        : activeTab === "product"
                        ? { title: "3.2 Next Financial Product", sub: "Behavioral signals surface the right product to grow AUM" }
                        : activeTab === "relationship"
                        ? { title: "3.3 Shared Customer Intelligence", sub: "Retail insights empower wealth managers to boost retention" }
                        : { title: "2. Behavioral Intelligence", sub: "Personas = Multi-category spending patterns" };
                    return (
                      <p className="font-bold text-slate-800 mb-1 text-xl">{headerCopy.title}: <span className="text-slate-500 font-semibold">{headerCopy.sub}</span></p>
                    );
                  })()}
                  <button onClick={() => setPillsExpanded(!pillsExpanded)} className="shrink-0 ml-2 mt-1 text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${pillsExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {(() => {
                  const isCollapsed = !pillsExpanded && !!activeTab;

                  // When the relationship tab is active, pill clicks also drive the in-tab signal selection.
                  const isRelTab = activeTab === "relationship";
                  const handleRollupForRel = (r: typeof rollupStats[number]) => {
                    onRollupClick?.(r);
                    if (isRelTab) {
                      setSelectedSignal({ kind: "lifestyle", label: r.label });
                      if (assistantOpen) {
                        // Visible chat bubble stays short and natural; the merchant
                        // breakdown is forwarded as hidden signal context so the AI
                        // can answer with ground-truth aggregates without the user
                        // having to type or see them.
                        const totalSpend = Math.round(r.totalSpend ?? 0);
                        const totalCount = r.totalCount ?? 0;
                        let merchantBreakdown = "";
                        if (transactions && r.txIndices && r.txIndices.length > 0) {
                          const mMap: Record<string, { total: number; count: number }> = {};
                          for (const idx of r.txIndices) {
                            const tx: any = transactions[idx];
                            if (!tx) continue;
                            const name = tx.normalized_merchant || tx.merchant_name || tx.merchant || "Unknown";
                            const amt = typeof tx.amount === "number"
                              ? Math.abs(tx.amount)
                              : Math.abs(parseFloat(String(tx.amount).replace(/[^0-9.\-]/g, "")) || 0);
                            if (!mMap[name]) mMap[name] = { total: 0, count: 0 };
                            mMap[name].total += amt;
                            mMap[name].count += 1;
                          }
                          const top = Object.entries(mMap)
                            .sort((a, b) => b[1].total - a[1].total)
                            .slice(0, 5)
                            .map(([n, v]) => `${n} $${Math.round(v.total)} (${v.count}x)`);
                          if (top.length) merchantBreakdown = ` Top merchants: ${top.join("; ")}.`;
                        }
                        const visiblePrompt = `How much do I typically spend on ${r.label.toLowerCase()}?`;
                        const signalContext = `Lifestyle rollup "${r.label}": total $${totalSpend.toLocaleString()} across ${totalCount} transaction${totalCount !== 1 ? "s" : ""}.${merchantBreakdown}`;
                        onAIPromptDispatch?.(visiblePrompt, "lifestyle", signalContext);
                      }
                    }
                  };
                  const handleLifeEventForRel = (label: string, indices: number[]) => {
                    onTriggerPillClick?.(label, indices, "#f59e0b", "lifeEvent");
                    if (isRelTab) {
                      setSelectedSignal({ kind: "lifeEvent", label });
                      if (assistantOpen) {
                        onAIPromptDispatch?.(
                          `I'm preparing for ${label.toLowerCase()}. What financial resources and products should I consider for this?`,
                          "lifeEvent"
                        );
                      }
                    }
                  };
                  const handleRiskForRel = (label: string, indices: number[], color: string, merchant?: string) => {
                    onTriggerPillClick?.(label, indices, color, "risk");
                    if (isRelTab) {
                      setSelectedSignal({ kind: "risk", label });
                      const subject = merchant && merchant.trim().length > 0 ? `at ${merchant}` : `flagged as ${label}`;
                      if (assistantOpen) {
                        onAIPromptDispatch?.(
                          `What is this transaction ${subject}? What is it typically associated with statistically?`,
                          "risk"
                        );
                      }
                    }
                  };

                  // Shared pill renderers
                  const rollupPills = rollupStats.map((r, i) => (
                    <PillarRollupChip key={`${r.pillar}::${r.label}`} rollup={r} delay={0.5 + i * 0.15} isActive={activeRollup?.pillar === r.pillar && activeRollup?.label === r.label} onClick={() => handleRollupForRel(r)} />
                  ));

                  const lifeEventPills = productsLoading ? (
                    <>
                      <span className="h-6 w-28 rounded-full bg-amber-100 animate-pulse" />
                      <span className="h-6 w-24 rounded-full bg-amber-100 animate-pulse" />
                    </>
                  ) : detectedLifeEvents && detectedLifeEvents.length > 0 ? (
                    detectedLifeEvents.map((evt, i) => {
                      const isActive = activeTriggerLabel === evt.event_name;
                      const evidenceMerchants = evt.evidence?.map(e => e.merchant.toLowerCase()) || [];
                      const matchedIndices = transactions
                        ? transactions.map((tx, idx) => {
                            const m = (tx.merchant || "").toLowerCase();
                            return evidenceMerchants.some(em => m.includes(em) || em.includes(m)) ? idx : -1;
                          }).filter(idx => idx !== -1)
                        : [];
                      const confidence = evt.confidence > 1 ? Math.round(evt.confidence) : Math.round(evt.confidence * 100);
                      const evCount = evt.evidence?.length ?? 0;
                      return (
                        <span
                          key={evt.event_name}
                          onClick={() => handleLifeEventForRel(evt.event_name, matchedIndices)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200"
                          style={{
                            background: isActive
                              ? "linear-gradient(135deg, rgba(245,158,11,.30), rgba(245,158,11,.18))"
                              : "linear-gradient(135deg, rgba(245,158,11,.18), rgba(245,158,11,.08))",
                            color: "#92400e",
                            border: isActive ? "2px solid #f59e0b" : "1.5px solid #f59e0b",
                            animation: `rollup-entrance 0.5s ease-out ${0.8 + i * 0.15}s both, rollup-glow 1s ease-out ${1.3 + i * 0.15}s both`,
                            boxShadow: isActive ? "0 0 14px rgba(245,158,11,.35)" : "0 2px 8px rgba(245,158,11,.2)",
                            transform: isActive ? "scale(1.08)" : "scale(1)",
                          }}
                        >
                          <span style={{ color: "#f59e0b" }}>✦</span>
                          {evt.event_name}
                          <span className="text-[11px] opacity-60 tabular-nums font-normal">
                            {confidence}% · {evCount} txn{evCount !== 1 ? "s" : ""}
                          </span>
                        </span>
                      );
                    })
                  ) : !isCollapsed ? (
                    <p className="text-[11px] text-slate-400 italic">No significant life events detected</p>
                  ) : null;

                  const riskPills = riskLoading ? (
                    <>
                      <span className="h-6 w-28 rounded-full bg-red-100 animate-pulse" />
                      <span className="h-6 w-24 rounded-full bg-red-100 animate-pulse" />
                    </>
                  ) : riskFlags && riskFlags.flags && riskFlags.flags.length > 0 ? (
                    (() => {
                      // Roll up flags into ONE pill per high-level group:
                      //   - Gambling (any vice gambling subcategory)
                      //   - Financial Vulnerability (any financial_distress subcategory)
                      //   - Adult Entertainment
                      //   - AML / Suspicious International also collapse to one pill each.
                      // Severity = max severity in group; count = unique transactions.
                      type Rollup = {
                        key: string;
                        label: string;
                        severity: "low" | "medium" | "high";
                        txIds: Set<string>;
                        merchants: Set<string>;
                        sampleMerchant?: string;
                      };
                      const SEV_RANK: Record<string, number> = { low: 1, medium: 2, high: 3 };
                      const groupKeyFor = (f: any): { key: string; label: string } => {
                        const grp = String(f.category_group || f.category || "").toLowerCase();
                        const lbl = String(f.category_label || "").toLowerCase();
                        if (grp === "vice" && lbl.includes("adult")) return { key: "adult", label: "Adult Entertainment" };
                        if (grp === "vice") return { key: "gambling", label: "Gambling" };
                        if (grp === "financial_distress") return { key: "financial_vulnerability", label: "Financial Vulnerability" };
                        if (grp === "suspicious_international") return { key: "suspicious_international", label: "Suspicious International" };
                        if (grp === "aml") return { key: "aml", label: "AML" };
                        const raw = f.category_label || f.category_group || f.category || "Risk";
                        return { key: String(raw).toLowerCase(), label: String(raw) };
                      };
                      const rollupMap = new Map<string, Rollup>();
                      const seenTxGroup = new Set<string>();
                      riskFlags.flags.forEach((f: any) => {
                        const { key, label } = groupKeyFor(f);
                        const txId = f.transaction_id || `pattern::${key}`;
                        const dedupeKey = `${txId}::${key}`;
                        if (seenTxGroup.has(dedupeKey)) return;
                        seenTxGroup.add(dedupeKey);
                        let r = rollupMap.get(key);
                        if (!r) {
                          r = { key, label, severity: "low", txIds: new Set(), merchants: new Set() };
                          rollupMap.set(key, r);
                        }
                        const sev = (f.severity || "low") as "low" | "medium" | "high";
                        if ((SEV_RANK[sev] || 1) > (SEV_RANK[r.severity] || 1)) r.severity = sev;
                        r.txIds.add(txId);
                        if (f.merchant) {
                          r.merchants.add(String(f.merchant));
                          if (!r.sampleMerchant) r.sampleMerchant = String(f.merchant);
                        }
                      });
                      const ORDER = ["gambling", "financial_vulnerability", "adult", "suspicious_international", "aml"];
                      return Array.from(rollupMap.values()).sort((a, b) => {
                        const ai = ORDER.indexOf(a.key); const bi = ORDER.indexOf(b.key);
                        if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
                        if (ai === -1) return 1;
                        if (bi === -1) return -1;
                        return ai - bi;
                      });
                    })().map((rollup: any, i: number) => {
                      const flagLabel = rollup.label;
                      const isActive = activeTriggerLabel === flagLabel;
                      const isHigh = rollup.severity === "high";
                      const dotColor = isHigh ? "#ef4444" : "#f59e0b";
                      const txCount = rollup.txIds.size;

                      // Resolve all matched transaction indices across the group
                      let matchedIndices: number[] = [];
                      if (transactions) {
                        const idSet = new Set<string>(rollup.txIds);
                        const merchantSet = new Set<string>(
                          Array.from(rollup.merchants as Set<string>).map((m: string) => m.toLowerCase().trim())
                        );
                        transactions.forEach((tx: any, idx: number) => {
                          const tid = tx.transaction_id || tx.id || "";
                          if (tid && idSet.has(tid)) { matchedIndices.push(idx); return; }
                          const m = String(tid).match(/^tx-(\d+)$/);
                          if (m && idSet.has(`tx-${m[1]}`)) { matchedIndices.push(idx); return; }
                          const mname = ((tx as any).merchant_name || (tx as any).merchant || "").toLowerCase().trim();
                          if (mname && merchantSet.has(mname)) matchedIndices.push(idx);
                        });
                      }
                      const isClickable = matchedIndices.length > 0 && !isOfferTab;
                      const pillKey = `rollup::${rollup.key}::${i}`;
                      return (
                        <span
                          key={pillKey}
                          onClick={() => {
                            if (!isClickable) return;
                            const all = Array.from(rollup.merchants as Set<string>);
                            const picked = all.length > 0
                              ? all[Math.floor(Math.random() * all.length)]
                              : rollup.sampleMerchant;
                            handleRiskForRel(flagLabel, matchedIndices, dotColor, picked);
                          }}
                          title={isOfferTab ? "Not applicable for offer targeting" : `${txCount} transaction${txCount !== 1 ? "s" : ""} flagged`}
                          className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full ${isClickable ? "cursor-pointer" : isOfferTab ? "cursor-not-allowed pointer-events-none" : ""} transition-all duration-200`}
                          style={{
                            background: isOfferTab
                              ? "#e2e8f0"
                              : isActive
                              ? `linear-gradient(135deg, ${isHigh ? "rgba(239,68,68,.30)" : "rgba(245,158,11,.30)"}, ${isHigh ? "rgba(239,68,68,.18)" : "rgba(245,158,11,.18)"})`
                              : `linear-gradient(135deg, ${isHigh ? "rgba(239,68,68,.18)" : "rgba(245,158,11,.18)"}, ${isHigh ? "rgba(239,68,68,.08)" : "rgba(245,158,11,.08)"})`,
                            color: isOfferTab ? "#94a3b8" : isHigh ? "#991b1b" : "#92400e",
                            border: isOfferTab
                              ? "1.5px solid #cbd5e1"
                              : isActive
                              ? `2px solid ${dotColor}`
                              : `1.5px solid ${dotColor}`,
                            animation: `rollup-entrance 0.5s ease-out ${1.2 + i * 0.15}s both, rollup-glow 1s ease-out ${1.7 + i * 0.15}s both`,
                            boxShadow: isOfferTab ? "none" : isActive ? `0 0 14px ${isHigh ? "rgba(239,68,68,.35)" : "rgba(245,158,11,.35)"}` : `0 2px 8px ${isHigh ? "rgba(239,68,68,.2)" : "rgba(245,158,11,.2)"}`,
                            transform: isActive && !isOfferTab ? "scale(1.08)" : "scale(1)",
                            opacity: isOfferTab ? 0.65 : 1,
                            filter: isOfferTab ? "grayscale(1)" : "none",
                            textDecoration: isOfferTab ? "line-through" : "none",
                            textDecorationColor: isOfferTab ? "#94a3b8" : undefined,
                            textDecorationThickness: isOfferTab ? "1.5px" : undefined,
                          }}
                        >
                          <span style={{ color: isOfferTab ? "#94a3b8" : dotColor, textDecoration: "none" }}>{isOfferTab ? "✕" : "⚠"}</span>
                          {flagLabel}
                          <span className="text-[11px] opacity-60 tabular-nums font-normal">
                            {txCount} txn{txCount !== 1 ? "s" : ""} · {rollup.severity}
                          </span>
                        </span>
                      );
                    })
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, rgba(16,185,129,.18), rgba(16,185,129,.08))",
                        color: "#065f46",
                        border: "1.5px solid #10b981",
                        animation: "rollup-entrance 0.5s ease-out 1.2s both, rollup-glow 1s ease-out 1.7s both",
                        boxShadow: "0 2px 8px rgba(16,185,129,.2)",
                      }}
                    >
                      <span style={{ color: "#10b981" }}>✓</span>
                      No Risk Factors Detected
                    </span>
                  );

                  if (isCollapsed) {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {rollupPills}
                        {lifeEventPills}
                        {riskPills}
                      </div>
                    );
                  }

                  return (
                    <>
                       <div className="mb-1">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-cyan-600/70 mb-1.5">Spending Habits</p>
                        <div className="flex flex-wrap gap-2">{rollupPills}</div>
                      </div>
                      <div className="mt-2.5" style={{ animation: "fade-in 0.5s ease-out 0.2s both" }}>
                        <p className="text-[12px] font-bold uppercase tracking-wider text-amber-600/70 mb-1.5">Life Event Detection</p>
                        <div className="flex flex-wrap gap-2">{lifeEventPills}</div>
                      </div>
                      <div className="mt-2.5" style={{ animation: "fade-in 0.5s ease-out 0.4s both" }}>
                        <p className="text-[12px] font-bold uppercase tracking-wider text-red-500/70 mb-1.5">Risk Factors</p>
                        <div className="flex flex-wrap gap-2">{riskPills}</div>
                      </div>
                    </>
                  );
                })()}

                {/* Action buttons moved outside scroll container */}
              </div>
            ) : (
              <>
              <div className="flex items-start justify-between">
                <p className="font-bold text-slate-800 mb-1.5 text-lg">1. Semantic Enrichment: <span className="text-slate-500 font-semibold">Source and format agnostic enrichment to gain a full picture</span></p>
                <button onClick={() => setPillsExpanded(!pillsExpanded)} className="shrink-0 ml-2 mt-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${pillsExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
              </>
            )}

            {(pillsExpanded || !activeTab) && (
              <div
                className={`transition-all duration-500 overflow-hidden flex flex-col ${(!activeTab || pillsExpanded) ? "flex-1 min-h-0" : ""} ${fullWidthEnrichment ? "" : "mb-0"}`}
                style={{ maxHeight: (!activeTab || pillsExpanded) ? undefined : 360 }}
              >
                {!activeTab ? (
                  <ExecDemoEnrichmentTable
                    transactions={enrichedTransactions || []}
                    rawRows={(transactions || []).map((t, i) => ({
                      transaction_id: `tx-${i}`,
                      source: t.source,
                      date: t.date,
                      merchant_name: t.merchant,
                      description: (t as any).description,
                      mcc: (t as any).mcc,
                      amount: parseFloat(String(t.amount).replace(/[^0-9.\-]/g, "")) || 0,
                    }))}
                    flush={fullWidthEnrichment}
                    highlightedIndices={synthesisTriggered ? highlightedIndices : null}
                    highlightColor={highlightColor}
                    activePillLabel={synthesisTriggered ? activePillLabel : null}
                    onClearHighlight={onClearHighlight}
                  />
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — shown after synthesis, before any tab selected */}
      {showProfile && synthesisTriggered && !activeTab && (
        <div className="flex items-center justify-center gap-3 py-3 border-t border-slate-200/60 shrink-0">
          {(["analytics", "product", "relationship"] as TabKey[]).map((key, i) => {
            const meta = TAB_META[key];
            const Icon = meta.icon;
            return (
              <button
                key={key}
                onClick={() => onTabClick(key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
                style={{ animation: `offer-card-in 0.45s ease-out ${i * 0.1}s both` }}
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{meta.label}</span>
              </button>
            );
          })}
          <style>{`
            @keyframes offer-card-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Tab bar — visible when enrichment active AND a tab has been selected */}
      {showProfile && phase !== "idle" && activeTab && (
        <>
          <div className="flex rounded-lg bg-slate-100 p-0.5 mb-1.5 shrink-0">
            {TAB_ORDER.map((key) => {
              const meta = TAB_META[key];
              const Icon = meta.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => onTabClick(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 cursor-pointer"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Tab content — only after synthesis, hidden when evidence expanded */}
      {showTabs && !pillsExpanded && activeTab && (
        <div className={`flex flex-col min-h-0 overflow-hidden ${synthesisTriggered ? "flex-1" : ""}`}>
          <div className="flex-1 min-h-0 overflow-auto scrollbar-light">
            {activeTab === "analytics" && synthesisTriggered ? (
              <PurchaseCycleTimeline chips={chips} transactions={transactions || []} signalMap={persona.signalMap} personaSynthesis={personaSynthesis} generatedOffers={generatedOffers} offersLoading={offersLoading} activeRollup={activeRollup} activeTriggerLabel={activeTriggerLabel} activeTrigger={activeTrigger} />
            ) : activeTab === "product" ? (
              <NextProductRationale lifeEvents={detectedLifeEvents || null} loading={!!productsLoading} productCards={productCards} transactions={transactions} onTriggerPillClick={onTriggerPillClick} activeTriggerLabel={activeTriggerLabel} productActions={productActions} actionsLoading={actionsLoading} pillarRollups={rollupStats} />
            ) : activeTab === "relationship" ? (
              <NextConversationRationale
                selectedSignal={selectedSignal}
                availableSignals={availableSignals}
                customerFirstName={customerFirstName}
                productActions={productActions}
                actionsLoading={actionsLoading}
                productCards={productCards}
                onSelectSignal={(s) => setSelectedSignal(s)}
                onOpenWMCopilot={() => onOpenWMCopilot?.(customerFirstName, selectedSignal)}
                onOpenAIAssistant={() => onOpenAIAssistant?.(customerFirstName, selectedSignal)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[11px] text-slate-300 font-mono">
                  Analyzing transactions...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle placeholder */}
      {phase === "idle" && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[12px] text-slate-300">Select a customer & run analysis</span>
        </div>
      )}

      {/* Synthesize button — anchored at the bottom of the card */}
      {hasSynthesis && !synthesisTriggered && phase === "hold" && (
        <div className="mt-auto pt-3">
          <button
            onClick={() => setSynthesisTriggered(true)}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-bold tracking-wide uppercase text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 55%) 0%, hsl(217 91% 60%) 50%, hsl(199 89% 48%) 100%)",
              boxShadow: "0 4px 20px hsl(217 91% 60% / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
              animation: "intel-ready-pulse 2.5s ease-in-out infinite",
              letterSpacing: "0.08em",
            }}
          >
            <Cpu className="w-4 h-4 text-white" />
            <span>Semantic Enrichment:</span>
            <span className="text-cyan-200">Ready</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 bg-cyan-300" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-200" />
            </span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes exec-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pill-pop {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes count-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes desc-crossfade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rollup-entrance {
          0% { opacity: 0; transform: scale(0.6); }
          50% { transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rollup-glow {
          0% { box-shadow: 0 0 0 0 currentColor; }
          50% { box-shadow: 0 0 12px 2px currentColor; }
          100% { box-shadow: 0 0 0 0 currentColor; }
        }
        @keyframes pill-collapse {
          0% { opacity: 1; transform: scale(1); max-width: 200px; padding: 4px 10px; margin: 0 3px; }
          100% { opacity: 0; transform: scale(0.3); max-width: 0; padding: 0; margin: 0; overflow: hidden; }
        }
        @keyframes intel-ready-pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(6,182,212,.15), inset 0 1px 0 rgba(6,182,212,.1); }
          50% { box-shadow: 0 0 28px rgba(6,182,212,.35), inset 0 1px 0 rgba(6,182,212,.2); border-color: rgba(6,182,212,.7); }
        }
      `}</style>
    </div>
  );
}

/** A single color-coded chip showing label · count× · $amount */
function AnimatedChip({ chip, isActive, onClick, collapsed, mergeDelay = 0 }: { chip: ChipData; isActive?: boolean; onClick?: () => void; collapsed?: boolean; mergeDelay?: number }) {
  const prevCount = useRef(chip.count);
  const [pulse, setPulse] = useState(false);
  const c = getColor(chip.pillar);

  useEffect(() => {
    if (chip.count > prevCount.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 350);
      prevCount.current = chip.count;
      return () => clearTimeout(t);
    }
    prevCount.current = chip.count;
  }, [chip.count]);

  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[12px] font-medium px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200"
      style={{
        background: isActive ? c.bg.replace(".12", ".25") : c.bg,
        color: c.text,
        border: isActive ? `2px solid ${c.dot}` : `1px solid ${c.border}`,
        animation: collapsed ? `pill-collapse 0.6s ease-in-out ${mergeDelay}s forwards` : "pill-pop 0.45s ease-out both",
        transform: isActive ? "scale(1.08)" : "scale(1)",
        boxShadow: isActive ? `0 0 8px ${c.bg}` : "none",
      }}
    >
      {chip.label}
      {chip.count > 1 && (
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{
            color: c.dot,
            animation: pulse ? "count-pulse 0.45s ease-out" : "none",
          }}
        >
          {chip.count}×
        </span>
      )}
      <span className="text-[11px] opacity-70 tabular-nums">
        {formatSpend(chip.totalSpend)}
      </span>
    </span>
  );
}

/** Synthesized rollup pill for a pillar */
function PillarRollupChip({ rollup, delay, isActive, onClick }: { rollup: PillarRollup & { totalSpend?: number; totalCount?: number }; delay: number; isActive?: boolean; onClick?: () => void }) {
  const c = getColor(rollup.pillar);
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${c.bg.replace(".12", ".30")}, ${c.bg.replace(".12", ".18")})`
          : `linear-gradient(135deg, ${c.bg.replace(".12", ".18")}, ${c.bg.replace(".12", ".08")})`,
        color: c.text,
        border: isActive ? `2px solid ${c.dot}` : `1.5px solid ${c.dot}`,
        animation: `rollup-entrance 0.5s ease-out ${delay}s both, rollup-glow 1s ease-out ${delay + 0.5}s both`,
        boxShadow: isActive ? `0 0 14px ${c.bg.replace(".12", ".35")}` : `0 2px 8px ${c.bg.replace(".12", ".2")}`,
        transform: isActive ? "scale(1.08)" : "scale(1)",
      }}
    >
      <span style={{ color: c.dot }}>✦</span>
      {rollup.label}
      <span className="text-[11px] opacity-60 tabular-nums font-normal">
        {rollup.totalCount ?? 0} txns · {formatSpend(rollup.totalSpend ?? 0)}
      </span>
    </span>
  );
}

function IntelCardContent({ card }: { card: IntelCard }) {
  return (
    <div
      className="rounded-xl border border-slate-100 px-4 py-4"
      style={{
        borderLeft: `3px solid ${card.accent}`,
        animation: "exec-card-reveal 0.4s ease-out",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color: card.accent, fontSize: 16 }}>{card.icon}</span>
        <span
          className="text-[12px] font-bold tracking-wider uppercase"
          style={{ color: card.accent }}
        >
          {card.title}
        </span>
      </div>
      {card.subtitle && (
        <div className="text-[10px] text-slate-400 mb-3">{card.subtitle}</div>
      )}
      {card.pills ? (
        <div className="flex flex-wrap gap-2">
          {card.pills.map((pill) => (
            <span
              key={pill}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full"
              style={{
                background: `${card.accent}15`,
                color: card.accent,
                border: `1px solid ${card.accent}30`,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-slate-600 leading-relaxed">{card.content}</p>
      )}

      <style>{`
        @keyframes exec-card-reveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
