import { useMemo, useRef, useEffect, useState } from "react";
import { BarChart3, Gift, Users, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { ExecIntelligence, ExecPersona, IntelCard, SignalEntry } from "./execDemoData";

type TabKey = "analytics" | "rewards" | "relationship";

export interface PillarRollup {
  pillar: string;
  label: string;
  categories: string[];
  categoryIndices?: number[];
  txIndices?: number[];
}

export interface PersonaSynthesis {
  headline: string;
  insights: string[];
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
  activePillFilter?: { pillar: string; label: string } | null;
  onPillClick?: (pillar: string, label: string) => void;
  activePillarFilter?: string | null;
  activeRollup?: PillarRollup | null;
  onRollupClick?: (rollup: PillarRollup) => void;
  personaSynthesis?: PersonaSynthesis | null;
}

const TAB_META: Record<TabKey, { icon: typeof BarChart3; label: string }> = {
  analytics: { icon: BarChart3, label: "Analytics" },
  rewards: { icon: Gift, label: "Rewards" },
  relationship: { icon: Users, label: "Relationship" },
};

const TAB_ORDER: TabKey[] = ["analytics", "rewards", "relationship"];

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
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

function deriveChips(signals: SignalEntry[]): ChipData[] {
  const map = new Map<string, ChipData & { freqCounts: Map<string, number> }>();
  for (const s of signals) {
    const key = `${s.pillar}::${s.label}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalSpend += (s.amount || 0);
      if (s.frequency) existing.freqCounts.set(s.frequency, (existing.freqCounts.get(s.frequency) || 0) + 1);
    } else {
      const freqCounts = new Map<string, number>();
      if (s.frequency) freqCounts.set(s.frequency, 1);
      map.set(key, { pillar: s.pillar, label: s.label, count: 1, totalSpend: s.amount || 0, freqCounts });
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
}: Props) {
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const showProfile = phase !== "idle";
  const showTabs = phase === "cardCycle" || phase === "cardScan" || phase === "hold";
  const chips = useMemo(() => deriveChips(processedSignals), [processedSignals]);

  // Group chips by pillar, preserving insertion order
  const chipsByPillar = useMemo(() => {
    const map = new Map<string, ChipData[]>();
    for (const chip of chips) {
      if (!map.has(chip.pillar)) map.set(chip.pillar, []);
      map.get(chip.pillar)!.push(chip);
    }
    return map;
  }, [chips]);
  const [synthesisTriggered, setSynthesisTriggered] = useState(false);

  // Determine which pillars have AI rollups
  const rollups = personaSynthesis?.pillarRollups || [];

  // Index-based matching: does a chip belong to a rollup?
  const chipMatchesRollup = (chip: ChipData, r: PillarRollup, chipIndex: number): boolean => {
    // Primary: use category indices if available
    if (r.categoryIndices && r.categoryIndices.length > 0) {
      return r.categoryIndices.includes(chipIndex);
    }
    // Fallback: fuzzy pillar + category matching
    if (chip.pillar === r.pillar) return true;
    const cLower = chip.pillar.toLowerCase();
    const rLower = r.pillar.toLowerCase();
    if (cLower === rLower) return true;
    if (rLower.includes(cLower) || cLower.includes(rLower)) return true;
    if (r.categories?.some(cat => cat.toLowerCase() === chip.label.toLowerCase())) return true;
    return false;
  };

  // Chips not covered by any rollup
  const unrolledChips = useMemo(
    () => chips.filter((c, idx) => !rollups.some(r => chipMatchesRollup(c, r, idx))),
    [chips, rollups]
  );

  // Compute rollup stats from chips with index-based matching
  const rollupStats = useMemo(() => {
    return rollups.map(r => {
      const pillarChips = chips.filter((c, idx) => chipMatchesRollup(c, r, idx));
      const totalSpend = pillarChips.reduce((s, c) => s + c.totalSpend, 0);
      const totalCount = pillarChips.reduce((s, c) => s + c.count, 0);
      return { ...r, totalSpend, totalCount };
    }).filter(r => r.totalCount > 0);
  }, [rollups, chips]);


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

  const hasSynthesis = personaSynthesis && personaSynthesis.headline;

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-hidden">
      {/* Persona section */}
      <div
        className={`rounded-2xl px-4 py-4 mb-4 transition-all duration-700 ease-out overflow-y-auto exec-light-scroll ${!synthesisTriggered || pillsExpanded ? "flex-1 min-h-0" : ""}`}
        style={{
          background: "rgba(11,26,58,.022)",
          border: "1px solid rgba(11,26,58,.14)",
          opacity: showProfile ? 1 : 0,
          transform: showProfile ? "translateY(0)" : "translateY(12px)",
          maxHeight: synthesisTriggered && !pillsExpanded ? "45vh" : undefined,
        }}
      >
        {/* AI Persona Headline — only after synthesis triggered */}
        {hasSynthesis && synthesisTriggered && (
          <div style={{ animation: "desc-crossfade 0.6s ease-out 0.5s both" }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-[15px] font-bold text-slate-800 tracking-tight">
                {personaSynthesis!.headline}
              </span>
            </div>
          </div>
        )}

        {/* Evolving persona description (shown while AI synthesis loads) */}
        {!synthesisTriggered && displayedDesc && (
          <div
            key={descKey}
            className="mb-3 text-[11px] italic text-slate-500 leading-relaxed"
            style={{ animation: "desc-crossfade 0.6s ease-out" }}
          >
            {displayedDesc}
          </div>
        )}

        {/* Synthesize button — appears when AI data ready but not yet triggered */}
        {hasSynthesis && !synthesisTriggered && chips.length > 0 && (
          <button
            onClick={() => setSynthesisTriggered(true)}
            className="flex items-center gap-2 mx-auto mb-3 px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,.15), rgba(245,158,11,.25))",
              color: "#92400e",
              border: "1.5px solid rgba(245,158,11,.4)",
              boxShadow: "0 0 16px rgba(245,158,11,.2)",
              animation: "synthesize-glow 2s ease-in-out infinite",
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            ✦ Synthesize Persona
          </button>
        )}

        {/* Rollup pills + evidence pills */}
        {chips.length > 0 && (
          <div>
            {/* Pillar rollup pills - shown after synthesis triggered */}
            {synthesisTriggered && rollupStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {rollupStats.map((r, i) => (
                  <PillarRollupChip key={`${r.pillar}::${r.label}`} rollup={r} delay={0.5 + i * 0.15} isActive={activeRollup?.pillar === r.pillar && activeRollup?.label === r.label} onClick={() => onRollupClick?.(r)} />
                ))}
              </div>
            )}

            <button
              onClick={() => setPillsExpanded(!pillsExpanded)}
              className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors mb-2"
            >
              {pillsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {synthesisTriggered ? "Supporting evidence" : "Signal breakdown"} · {chips.length} categories
            </button>

            {(pillsExpanded || !synthesisTriggered) && (
              <div
                className="transition-all duration-500 flex-1 min-h-0 overflow-y-auto"
              >
                {Array.from(chipsByPillar.entries()).map(([pillar, pillarChips]) => {
                  const c = getColor(pillar);
                  const firstChipIdx = chips.indexOf(pillarChips[0]);
                  const allRolledUp = synthesisTriggered && rollups.some(r => chipMatchesRollup(pillarChips[0], r, firstChipIdx));
                  return (
                    <div key={pillar} className="mb-2.5" style={{ animation: allRolledUp ? `pill-collapse 0.4s ease-in-out forwards` : undefined }}>
                      {/* Pillar header */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
                        <span className="text-[10px] font-semibold" style={{ color: c.text }}>{pillar}</span>
                      </div>
                      {/* Chips for this pillar */}
                      <div className="flex flex-wrap gap-1.5 pl-3.5">
                        {pillarChips.map((chip, idx) => (
                          <AnimatedChip
                            key={`${chip.pillar}::${chip.label}`}
                            chip={chip}
                            isActive={activePillFilter?.pillar === chip.pillar && activePillFilter?.label === chip.label}
                            onClick={() => onPillClick?.(chip.pillar, chip.label)}
                            collapsed={synthesisTriggered && rollups.some(r => chipMatchesRollup(chip, r, chips.indexOf(chip)))}
                            mergeDelay={idx * 0.06}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab bar + content — hidden when evidence is expanded post-synthesis */}
      {!(synthesisTriggered && pillsExpanded) && (
        <>
          {/* Tab bar — visible whenever enrichment is active */}
          {showProfile && phase !== "idle" && (
            <>
              <div className="flex rounded-lg bg-slate-100 p-0.5 mb-1 shrink-0">
                {TAB_ORDER.map((key) => {
                  const meta = TAB_META[key];
                  const Icon = meta.icon;
                  const isActive = activeTab === key;
                  const isRevealed = revealedTabs.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => isRevealed && onTabClick(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-slate-800 shadow-sm"
                          : isRevealed
                          ? "text-slate-500 hover:text-slate-700 cursor-pointer"
                          : "text-slate-300 cursor-default"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              {/* Arrow key hint */}
              {revealedTabs.length > 0 && revealedTabs.length < 3 && (
                <div className="text-center mb-2">
                  <span className="text-[10px] text-slate-300 font-mono">← → to navigate</span>
                </div>
              )}
            </>
          )}

          {/* Tab content — only after synthesis */}
          {showTabs && synthesisTriggered && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-auto">
                {activeTab && revealedTabs.includes(activeTab) && (
                  <IntelCardContent card={intelligence[activeTab]} />
                )}
                {!activeTab && (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[11px] text-slate-300 font-mono">
                      Analyzing transactions...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
        @keyframes synthesize-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(245,158,11,.15); }
          50% { box-shadow: 0 0 24px rgba(245,158,11,.35); }
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
      className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200"
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
function PillarRollupChip({ rollup, delay, isActive, onClick }: { rollup: { pillar: string; label: string; categories: string[]; totalSpend: number; totalCount: number }; delay: number; isActive?: boolean; onClick?: () => void }) {
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
        {rollup.totalCount} txns · {formatSpend(rollup.totalSpend)}
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
