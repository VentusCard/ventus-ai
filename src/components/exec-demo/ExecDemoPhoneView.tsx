import { useState, useEffect } from "react";
import { BarChart3, Gift, Users } from "lucide-react";
import { type CustomerProfile, type IntelCard } from "./execDemoData";

type TabKey = "analytics" | "rewards" | "relationship";

interface Props {
  customer: CustomerProfile;
  phase: string;
  visiblePills: number;
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

export default function ExecDemoPhoneView({
  customer,
  phase,
  visiblePills,
  revealedTabs,
  activeTab,
  onTabClick,
}: Props) {
  const persona = customer.persona;
  const showProfile = phase !== "idle";
  const isProcessing = phase === "scroll";

  const getCard = (key: TabKey): IntelCard => customer.intelligence[key];

  return (
    <div className="flex items-center justify-center h-full py-6">
      {/* iPhone frame */}
      <div
        className="relative rounded-[40px] bg-white shadow-2xl border-[6px] border-slate-200 overflow-hidden flex flex-col"
        style={{ width: 320, height: 640 }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-200 rounded-b-2xl z-10" />

        {/* Status bar */}
        <div className="h-10 bg-slate-50 flex items-end justify-between px-6 pb-1 text-[9px] text-slate-400 font-medium shrink-0">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span>●●●●○</span>
            <span>🔋</span>
          </span>
        </div>

        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-slate-600 tracking-wide">
              Ventus AI · {customer.name}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col px-3 py-2">
          {/* Dynamic Persona */}
          <div
            className="rounded-xl px-3 py-2.5 mb-2 transition-all duration-700 ease-out border border-slate-100"
            style={{
              background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
              opacity: showProfile ? 1 : 0,
              transform: showProfile ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <span style={{ color: "#7c3aed", fontSize: 12 }}>{persona.icon}</span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-violet-600">
                {persona.title}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[22px]">
              {persona.pills?.map((pill, i) => (
                <span
                  key={pill}
                  className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700"
                  style={{
                    opacity: i < visiblePills ? 1 : 0,
                    transform: i < visiblePills ? "scale(1)" : "scale(0.7)",
                    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Processing shimmer */}
          {isProcessing && (
            <div className="flex-1 flex flex-col justify-center items-center gap-2">
              <div className="w-3/4 h-1.5 rounded-full overflow-hidden bg-slate-100">
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
              <span className="text-[10px] text-slate-400 font-mono">Processing signals...</span>
            </div>
          )}

          {/* Tabbed Intelligence */}
          {(phase === "cardCycle" || phase === "cardScan" || phase === "hold") && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab bar */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 mb-2 shrink-0">
                {TAB_ORDER.map((key) => {
                  const meta = TAB_META[key];
                  const Icon = meta.icon;
                  const isActive = activeTab === key;
                  const isRevealed = revealedTabs.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => isRevealed && onTabClick(key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-slate-800 shadow-sm"
                          : isRevealed
                          ? "text-slate-500 hover:text-slate-700 cursor-pointer"
                          : "text-slate-300 cursor-default"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeTab && revealedTabs.includes(activeTab) && (
                  <IntelCardContent card={getCard(activeTab)} />
                )}
                {!activeTab && (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-slate-300 font-mono">
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
              <span className="text-[11px] text-slate-300">Select a customer & run analysis</span>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div className="h-6 flex items-center justify-center shrink-0">
          <div className="w-24 h-1 rounded-full bg-slate-200" />
        </div>
      </div>

      <style>{`
        @keyframes exec-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function IntelCardContent({ card }: { card: IntelCard }) {
  return (
    <div
      className="rounded-xl border border-slate-100 px-3 py-3"
      style={{
        borderLeft: `3px solid ${card.accent}`,
        animation: "exec-card-reveal 0.4s ease-out",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: card.accent, fontSize: 14 }}>{card.icon}</span>
        <span
          className="text-[11px] font-bold tracking-wider uppercase"
          style={{ color: card.accent }}
        >
          {card.title}
        </span>
      </div>
      {card.subtitle && (
        <div className="text-[9px] text-slate-400 mb-2">{card.subtitle}</div>
      )}
      {card.pills ? (
        <div className="flex flex-wrap gap-1.5">
          {card.pills.map((pill) => (
            <span
              key={pill}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full"
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
        <p className="text-[11px] text-slate-600 leading-relaxed">{card.content}</p>
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
