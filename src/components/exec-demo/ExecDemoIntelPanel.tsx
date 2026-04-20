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
}: Props) {
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const showProfile = phase !== "idle";
  const showTabs = phase === "cardCycle" || phase === "cardScan" || phase === "hold";
  const chips = useMemo(() => deriveChips(processedSignals), [processedSignals]);

  // Group chips by pillar → category → subcategory chips
  const chipsByPillarCategory = useMemo(() => {
    const map = new Map<string, Map<string, ChipData[]>>();
    for (const chip of chips) {
      if (!map.has(chip.pillar)) map.set(chip.pillar, new Map());
      const catMap = map.get(chip.pillar)!;
      if (!catMap.has(chip.category)) catMap.set(chip.category, []);
      catMap.get(chip.category)!.push(chip);
    }
    return map;
  }, [chips]);
  const [synthesisTriggered, setSynthesisTriggered] = useState(false);

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

  // Use pre-computed stats from rollups directly — no re-derivation from chips
  const rollupStats = useMemo(() => {
    return rollups.filter(r => (r.totalCount ?? 0) > 0);
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
    <div className="flex flex-col h-full px-5 py-3 overflow-hidden">
      {/* Persona section */}
      <div
        className={`rounded-2xl px-4 py-3.5 mb-2.5 transition-all duration-700 ease-out overflow-y-auto exec-light-scroll ${(!synthesisTriggered || pillsExpanded || !activeTab) ? "flex-1 min-h-0" : ""}`}
        style={{
          background: "rgba(11,26,58,.022)",
          border: "1px solid rgba(11,26,58,.14)",
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
              <div className="mb-2.5">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-slate-800 mb-1.5 text-lg">Behavioral Intelligence: <span className="text-slate-500 font-semibold">Personas = Multi-category spending patterns</span></p>
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
                    if (isRelTab) setSelectedSignal({ kind: "lifestyle", label: r.label });
                  };
                  const handleLifeEventForRel = (label: string, indices: number[]) => {
                    onTriggerPillClick?.(label, indices, "#f59e0b", "lifeEvent");
                    if (isRelTab) setSelectedSignal({ kind: "lifeEvent", label });
                  };
                  const handleRiskForRel = (label: string, indices: number[], color: string) => {
                    onTriggerPillClick?.(label, indices, color, "risk");
                    if (isRelTab) setSelectedSignal({ kind: "risk", label });
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
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200"
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
                          <span className="text-[10px] opacity-60 tabular-nums font-normal">
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
                      // Client-side dedupe safety net: collapse by transaction_id + category_group
                      // (deterministic flags win — they appear first from the backend)
                      const seen = new Set<string>();
                      const uniqueFlags = riskFlags.flags.filter((f: any) => {
                        const group = String(f.category_group || f.category || "risk").toLowerCase();
                        const txId = f.transaction_id || "pattern";
                        const key = `${txId}::${group}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                      });
                      return uniqueFlags;
                    })().map((flag: any, i: number) => {
                      // Prefer specific category_label; fall back to category_group, then legacy category
                      const rawLabel = flag.category_label || flag.category_group || flag.category || flag.type || "Risk";
                      const flagLabel = String(rawLabel).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                      const isActive = activeTriggerLabel === flagLabel;
                      const isHigh = flag.severity === "high";
                      const dotColor = isHigh ? "#ef4444" : "#f59e0b";

                      // Match by transaction_id first (raw csv uses tx-N format → idx = N)
                      let matchedIndices: number[] = [];
                      const txId: string = flag.transaction_id || "";
                      if (txId && txId !== "pattern" && transactions) {
                        const m = txId.match(/^tx-(\d+)$/);
                        if (m) {
                          const idx = parseInt(m[1], 10);
                          if (idx >= 0 && idx < transactions.length) matchedIndices = [idx];
                        }
                      }
                      // Fallback: exact merchant name match (no fuzzy word splitting)
                      if (matchedIndices.length === 0 && flag.merchant && transactions) {
                        const target = String(flag.merchant).toLowerCase().trim();
                        matchedIndices = transactions
                          .map((tx, idx) => {
                            const m = ((tx as any).merchant_name || (tx as any).merchant || "").toLowerCase().trim();
                            return m && m === target ? idx : -1;
                          })
                          .filter((idx) => idx !== -1);
                      }
                      const isClickable = matchedIndices.length > 0 && !isOfferTab;
                      const pillKey = `${flag.transaction_id || "pattern"}::${flagLabel}::${i}`;
                      return (
                        <span
                          key={pillKey}
                          onClick={() => isClickable && handleRiskForRel(flagLabel, matchedIndices, dotColor)}
                          title={isOfferTab ? "Not applicable for offer targeting" : undefined}
                          className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full ${isClickable ? "cursor-pointer" : isOfferTab ? "cursor-not-allowed pointer-events-none" : ""} transition-all duration-200`}
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
                          {flag.severity && <span className="text-[10px] uppercase opacity-60 font-normal">{flag.severity}</span>}
                        </span>
                      );
                    })
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full"
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
                       <div className="mb-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-600/70 mb-1.5">Spending Habits</p>
                        <div className="flex flex-wrap gap-2">{rollupPills}</div>
                      </div>
                      <div className="mt-3" style={{ animation: "fade-in 0.5s ease-out 0.2s both" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600/70 mb-1.5">Life Event Detection</p>
                        <div className="flex flex-wrap gap-2">{lifeEventPills}</div>
                      </div>
                      <div className="mt-3" style={{ animation: "fade-in 0.5s ease-out 0.4s both" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-red-500/70 mb-1.5">Risk Factors</p>
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
                <p className="font-bold text-slate-800 mb-1.5 text-lg">Semantic Enrichment: <span className="text-slate-500 font-semibold">Reveal behavioral signals hidden by MCCs</span></p>
                <button onClick={() => setPillsExpanded(!pillsExpanded)} className="shrink-0 ml-2 mt-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${pillsExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
              </>
            )}

            {(pillsExpanded || !synthesisTriggered || !activeTab) && (
              <div
                className={`transition-all duration-500 overflow-y-auto ${pillsExpanded ? "flex-1 min-h-0" : ""}`}
              >
                {/* Header row */}
                <div className="flex items-center py-2 px-2 border-b border-slate-300 sticky top-0 bg-slate-100 z-10 rounded-t-md">
                  <div className="w-[115px] shrink-0 pr-2 text-[12px] font-bold uppercase tracking-wider text-slate-900">
                    Pillar
                  </div>
                  <div className="flex-1 text-[12px] font-bold uppercase tracking-wider text-slate-900">
                    (Category) Subcategory, Amount
                  </div>
                  <div className="w-[70px] shrink-0 pl-2 text-right text-[12px] font-bold uppercase tracking-wider text-slate-900">
                    Total
                  </div>
                </div>
                {(() => {
                  const entries = Array.from(chipsByPillarCategory.entries());
                  return entries.map(([pillar, categoriesMap], pillarIdx) => {
                    const c = getColor(pillar);
                    const pillarTotal = Array.from(categoriesMap.values())
                      .flat()
                      .reduce((sum, chip) => sum + chip.totalSpend, 0);
                    return (
                      <div
                        key={pillar}
                        className={`flex py-2 ${pillarIdx < entries.length - 1 ? "border-b border-slate-200/40" : ""}`}
                      >
                        {/* Left column — pillar name */}
                        <div className="w-[115px] shrink-0 flex items-start gap-1.5 pt-[3px] pr-2">
                          <span className="w-2 h-2 rounded-full shrink-0 mt-[3px]" style={{ background: c.dot }} />
                          <span className="text-[12px] font-semibold leading-tight" style={{ color: c.text }}>{pillar}</span>
                        </div>
                        {/* Middle column — categories + subcategory pills */}
                        <div className="flex-1 flex flex-wrap items-center gap-1.5">
                          {Array.from(categoriesMap.entries()).map(([category, catChips]) => (
                            <React.Fragment key={category}>
                              <span
                                onClick={() => onPillClick?.(pillar, category, true)}
                                className={`inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-all duration-200 hover:brightness-95 ${
                                  activePillFilter?.pillar === pillar && activePillFilter?.label === category && activePillFilter?.isCategory
                                    ? "ring-1 ring-offset-1 shadow-sm"
                                    : ""
                                }`}
                                style={{
                                  background: c.bg,
                                  color: c.text,
                                  border: `1px solid ${c.border}`,
                                }}
                              >
                                {category}
                              </span>
                              {catChips.map((chip, idx) => {
                                const isActive = activePillFilter?.pillar === chip.pillar && activePillFilter?.label === chip.label;
                                return (
                                  <span
                                    key={`${chip.pillar}::${chip.category}::${chip.label}`}
                                    onClick={() => onPillClick?.(chip.pillar, chip.label)}
                                    className={`inline-flex items-center gap-0.5 text-[12.5px] cursor-pointer transition-opacity duration-200 ${isActive ? "font-semibold" : "opacity-80 hover:opacity-100"}`}
                                    style={{ color: c.text }}
                                  >
                                    {chip.label}
                                    {chip.count > 1 && (
                                      <span className="text-[11.5px] tabular-nums" style={{ color: c.dot }}>{chip.count}×</span>
                                    )}
                                    <span className="text-[11.5px] opacity-60 tabular-nums">{formatSpend(chip.totalSpend)}</span>
                                    {idx < catChips.length - 1 && <span className="text-slate-300 mx-0.5">·</span>}
                                  </span>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                        {/* Right column — pillar total */}
                        <div className="w-[70px] shrink-0 pl-2 pt-[3px] text-right text-[12px] font-semibold tabular-nums" style={{ color: c.text }}>
                          {formatSpend(pillarTotal)}
                        </div>
                      </div>
                    );
                  });
                })()}
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
            <span>Behavioral Intelligence:</span>
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
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200"
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
      <span className="text-[10px] opacity-60 tabular-nums font-normal">
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
