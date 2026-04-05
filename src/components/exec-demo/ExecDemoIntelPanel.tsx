import { useMemo, useRef, useEffect, useState } from "react";
import { BarChart3, Gift, Users } from "lucide-react";
import type { ExecIntelligence, ExecPersona, IntelCard, SignalEntry } from "./execDemoData";

type TabKey = "analytics" | "rewards" | "relationship";

interface Props {
  persona: ExecPersona;
  intelligence: ExecIntelligence;
  phase: string;
  processedSignals: SignalEntry[];
  revealedTabs: TabKey[];
  activeTab: TabKey | null;
  onTabClick: (tab: TabKey) => void;
}

const TAB_META: Record<TabKey, { icon: typeof BarChart3; label: string }> = {
  analytics: { icon: BarChart3, label: "Analytics" },
  rewards: { icon: Gift, label: "Rewards" },
  relationship: { icon: Users, label: "Relationship" },
};

const TAB_ORDER: TabKey[] = ["analytics", "rewards", "relationship"];

interface PillarGroup {
  pillar: string;
  chips: { label: string; count: number }[];
}

function deriveGroups(signals: SignalEntry[]): PillarGroup[] {
  const pillarOrder: string[] = [];
  const map = new Map<string, Map<string, number>>();

  for (const s of signals) {
    if (!map.has(s.pillar)) {
      pillarOrder.push(s.pillar);
      map.set(s.pillar, new Map());
    }
    const labelMap = map.get(s.pillar)!;
    labelMap.set(s.label, (labelMap.get(s.label) || 0) + 1);
  }

  return pillarOrder.map((pillar) => {
    const labelMap = map.get(pillar)!;
    const chips = Array.from(labelMap.entries()).map(([label, count]) => ({ label, count }));
    return { pillar, chips };
  });
}

export default function ExecDemoIntelPanel({
  persona,
  intelligence,
  phase,
  processedSignals,
  revealedTabs,
  activeTab,
  onTabClick,
}: Props) {
  const showProfile = phase !== "idle";
  const groups = useMemo(() => deriveGroups(processedSignals), [processedSignals]);

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-hidden">
      {/* Dynamic Persona — Row-based pill accumulator */}
      <div
        className="rounded-2xl px-4 py-4 mb-4 transition-all duration-700 ease-out"
        style={{
          background: "rgba(11,26,58,.022)",
          border: "1px solid rgba(11,26,58,.14)",
          opacity: showProfile ? 1 : 0,
          transform: showProfile ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-3">
          <span style={{ color: "#7c3aed", fontSize: 14 }}>{persona.icon}</span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-violet-600">
            {persona.title}
          </span>
        </div>

        {/* Signal rows */}
        <div className="flex flex-col gap-2 min-h-[28px]">
          {groups.map((group) => (
            <PillarRow key={group.pillar} group={group} />
          ))}
        </div>
      </div>

      {/* Processing shimmer */}
      {phase === "scroll" && (
        <div className="flex-1 flex flex-col justify-center items-center gap-3">
          <div className="w-3/4 h-2 rounded-full overflow-hidden bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: "60%",
                background: "linear-gradient(90deg, #e2e8f0, #3b82f6, #e2e8f0)",
                backgroundSize: "200% 100%",
                animation: "exec-shimmer 1.5s ease-in-out infinite",
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Processing signals...</span>
        </div>
      )}

      {/* Tabbed Intelligence */}
      {(phase === "cardCycle" || phase === "cardScan" || phase === "hold") && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 mb-3 shrink-0">
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

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
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
      `}</style>
    </div>
  );
}

/** A single pillar row with animated chip pills */
function PillarRow({ group }: { group: PillarGroup }) {
  return (
    <div
      className="flex items-start gap-2"
      style={{ animation: "pill-pop 0.35s ease-out both" }}
    >
      <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 mt-1.5 whitespace-nowrap min-w-[110px]">
        {group.pillar}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {group.chips.map((chip) => (
          <AnimatedChip key={chip.label} label={chip.label} count={chip.count} />
        ))}
      </div>
    </div>
  );
}

/** A single chip that pops in and pulses its count on update */
function AnimatedChip({ label, count }: { label: string; count: number }) {
  const prevCount = useRef(count);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count > prevCount.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 350);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full"
      style={{
        background: "rgba(16,185,129,.08)",
        color: "#065f46",
        border: "1px solid rgba(16,185,129,.22)",
        animation: "pill-pop 0.3s ease-out both",
      }}
    >
      {label}
      {count > 1 && (
        <span
          className="text-[9px] font-bold tabular-nums"
          style={{
            color: "#059669",
            animation: pulse ? "count-pulse 0.3s ease-out" : "none",
          }}
        >
          {count}x
        </span>
      )}
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
