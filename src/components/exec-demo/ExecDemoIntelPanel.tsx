import React, { useMemo, useRef, useEffect, useState } from "react";
import { BarChart3, Gift, Users, CreditCard, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import type { ExecIntelligence, ExecPersona, IntelCard, SignalEntry } from "./execDemoData";
import PurchaseCycleTimeline from "./PurchaseCycleTimeline";
import NextOfferRationale from "./NextOfferRationale";
import NextProductRationale from "./NextProductRationale";
import NextConversationRationale from "./NextConversationRationale";
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
}

const TAB_META: Record<TabKey, { icon: typeof BarChart3; label: string }> = {
  analytics: { icon: BarChart3, label: "Next-Purchase" },
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

  return (
    <div className="flex flex-col h-full px-5 py-3 overflow-hidden">
      {/* Persona section */}
      <div
        className={`rounded-2xl px-4 py-3.5 mb-2.5 transition-all duration-700 ease-out overflow-y-auto exec-light-scroll ${(!synthesisTriggered || pillsExpanded) ? "flex-1 min-h-0" : ""}`}
        style={{
          background: "rgba(11,26,58,.022)",
          border: "1px solid rgba(11,26,58,.14)",
          opacity: showProfile ? 1 : 0,
          transform: showProfile ? "translateY(0)" : "translateY(12px)",
          maxHeight: synthesisTriggered && !pillsExpanded ? "45vh" : undefined,
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

        {/* Synthesize button — appears when AI data ready, pills done animating, and not yet triggered */}
        {hasSynthesis && !synthesisTriggered && chips.length > 0 && phase === "hold" && (
          <button
            onClick={() => setSynthesisTriggered(true)}
            className="flex items-center gap-2 mx-auto mb-3 px-5 py-2.5 rounded-lg text-[12px] font-bold tracking-wide uppercase transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "rgba(15,23,42,.92)",
              color: "#67e8f9",
              border: "1px solid rgba(6,182,212,.45)",
              boxShadow: "0 0 20px rgba(6,182,212,.2), inset 0 1px 0 rgba(6,182,212,.1)",
              animation: "intel-ready-pulse 2.5s ease-in-out infinite",
              letterSpacing: "0.08em",
            }}
          >
            <Cpu className="w-4.5 h-4.5" style={{ color: "#22d3ee" }} />
            <span style={{ color: "#e0f2fe" }} className="text-[12px]">Behavioral Intelligence:</span>
            <span style={{ color: "#22d3ee", marginLeft: "-2px" }} className="text-[12px]">Ready</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#22d3ee" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#06b6d4" }} />
            </span>
          </button>
        )}

        {/* Rollup pills + evidence pills */}
        {chips.length > 0 && (
          <div>
            {/* Pillar rollup pills - shown after synthesis triggered */}
            {synthesisTriggered && rollupStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {rollupStats.map((r, i) => (
                  <PillarRollupChip key={`${r.pillar}::${r.label}`} rollup={r} delay={0.5 + i * 0.15} isActive={activeRollup?.pillar === r.pillar && activeRollup?.label === r.label} onClick={() => onRollupClick?.(r)} />
                ))}
              </div>
            )}

            <button
              onClick={() => setPillsExpanded(!pillsExpanded)}
              className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400 hover:text-slate-600 transition-colors mb-2.5"
            >
              {pillsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {synthesisTriggered ? "Full Analysis" : "Signal breakdown"} · {chips.length} categories
            </button>

            {(pillsExpanded || !synthesisTriggered) && (
              <div
                className={`transition-all duration-500 overflow-y-auto ${pillsExpanded ? "flex-1 min-h-0" : ""}`}
              >
                {(() => {
                  const entries = Array.from(chipsByPillarCategory.entries());
                  return entries.map(([pillar, categoriesMap], pillarIdx) => {
                    const c = getColor(pillar);
                    return (
                      <div
                        key={pillar}
                        className={`flex py-2 ${pillarIdx < entries.length - 1 ? "border-b border-slate-200/40" : ""}`}
                      >
                        {/* Left column — pillar name */}
                        <div className="w-[95px] shrink-0 flex items-start gap-1 pt-[3px] pr-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[3px]" style={{ background: c.dot }} />
                          <span className="text-[11px] font-semibold leading-tight" style={{ color: c.text }}>{pillar}</span>
                        </div>
                        {/* Right column — categories + subcategory pills */}
                        <div className="flex-1 flex flex-wrap items-center gap-1.5">
                          {Array.from(categoriesMap.entries()).map(([category, catChips]) => (
                            <React.Fragment key={category}>
                              <span
                                onClick={() => onPillClick?.(pillar, category, true)}
                                className={`inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer transition-all duration-200 hover:brightness-95 ${
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
                                    className={`inline-flex items-center gap-0.5 text-[11.5px] cursor-pointer transition-opacity duration-200 ${isActive ? "font-semibold" : "opacity-80 hover:opacity-100"}`}
                                    style={{ color: c.text }}
                                  >
                                    {chip.label}
                                    {chip.count > 1 && (
                                      <span className="text-[10.5px] tabular-nums" style={{ color: c.dot }}>{chip.count}×</span>
                                    )}
                                    <span className="text-[10.5px] opacity-60 tabular-nums">{formatSpend(chip.totalSpend)}</span>
                                    {idx < catChips.length - 1 && <span className="text-slate-300 mx-0.5">·</span>}
                                  </span>
                                );
                              })}
                            </React.Fragment>
                          ))}
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

      {/* Tab bar — always visible when enrichment is active */}
      {showProfile && phase !== "idle" && (
        <>
          <div className="flex rounded-lg bg-slate-100 p-0.5 mb-1.5 shrink-0">
            {TAB_ORDER.map((key) => {
              const meta = TAB_META[key];
              const Icon = meta.icon;
              const isActive = activeTab === key;
              const isRevealed = revealedTabs.includes(key);
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
              <PurchaseCycleTimeline chips={chips} transactions={transactions || []} signalMap={persona.signalMap} personaSynthesis={personaSynthesis} generatedOffers={generatedOffers} offersLoading={offersLoading} />
            ) : activeTab === "product" ? (
              <NextProductRationale lifeEvents={detectedLifeEvents || null} loading={!!productsLoading} productCards={productCards} />
            ) : activeTab === "relationship" ? (
              <NextConversationRationale />
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
      className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full cursor-pointer transition-all duration-200"
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
          className="text-[10px] font-bold tabular-nums"
          style={{
            color: c.dot,
            animation: pulse ? "count-pulse 0.45s ease-out" : "none",
          }}
        >
          {chip.count}×
        </span>
      )}
      <span className="text-[10px] opacity-70 tabular-nums">
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
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200"
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
      <span className="text-[9px] opacity-60 tabular-nums font-normal">
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
