import { useMemo } from "react";
import { Clock, RotateCw, TrendingUp } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";

interface ChipData {
  pillar: string;
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

interface Props {
  chips: ChipData[];
}

const FREQ_DAYS: Record<string, number> = {
  Weekly: 7,
  Monthly: 30,
  Occasional: 60,
  Annually: 365,
  "One-Time": 0,
};

const FREQ_LABELS: Record<string, string> = {
  Weekly: "Every ~7 days",
  Monthly: "Every ~30 days",
  Occasional: "Every ~2 months",
  Annually: "Once a year",
};

function daysUntilNext(frequency: string, count: number): number | null {
  const cycleDays = FREQ_DAYS[frequency];
  if (!cycleDays) return null;
  // Simulate: based on count, the last purchase was some fraction into the cycle
  const elapsed = Math.round(cycleDays * ((count % 3 + 1) / 5));
  return Math.max(1, cycleDays - elapsed);
}

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

export default function PurchaseCycleTimeline({ chips }: Props) {
  const cycles = useMemo(() => {
    return chips
      .filter((c) => c.frequency && c.frequency !== "One-Time" && FREQ_DAYS[c.frequency!])
      .slice(0, 6)
      .map((c) => {
        const cycleDays = FREQ_DAYS[c.frequency!];
        const daysLeft = daysUntilNext(c.frequency!, c.count);
        const progress = daysLeft !== null && cycleDays > 0 ? Math.max(0, Math.min(1, 1 - daysLeft / cycleDays)) : 0;
        return { ...c, cycleDays, daysLeft, progress };
      })
      .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));
  }, [chips]);

  if (cycles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Detecting purchase cycles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-1" style={{ animation: "exec-card-reveal 0.4s ease-out" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <RotateCw className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Purchase Cycles Detected
        </span>
      </div>

      {cycles.map((cycle, i) => {
        const c = getColor(cycle.pillar);
        const isImminent = cycle.daysLeft !== null && cycle.daysLeft <= 3;
        const isSoon = cycle.daysLeft !== null && cycle.daysLeft <= 7;

        return (
          <div
            key={`${cycle.pillar}::${cycle.label}`}
            className="rounded-lg px-3 py-2 transition-all"
            style={{
              background: isImminent ? c.bg.replace(".12", ".18") : "rgba(248,250,252,.6)",
              border: `1px solid ${isImminent ? c.dot + "40" : "rgba(226,232,240,.6)"}`,
              animation: `exec-card-reveal 0.35s ease-out ${i * 0.08}s both`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {/* Left: pillar dot + label */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
                <span className="text-[11px] font-semibold truncate" style={{ color: c.text }}>
                  {cycle.label}
                </span>
                <span className="text-[9px] text-slate-400 shrink-0">
                  {cycle.count}× · {formatSpend(cycle.totalSpend)}
                </span>
              </div>

              {/* Right: countdown badge */}
              {cycle.daysLeft !== null && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                  style={{
                    background: isImminent
                      ? `linear-gradient(135deg, ${c.dot}30, ${c.dot}15)`
                      : isSoon
                      ? "rgba(251,191,36,.12)"
                      : "rgba(148,163,184,.08)",
                    color: isImminent ? c.dot : isSoon ? "#92400e" : "#64748b",
                    border: `1px solid ${isImminent ? c.dot + "40" : isSoon ? "rgba(251,191,36,.3)" : "rgba(148,163,184,.15)"}`,
                    animation: isImminent ? "purchase-pulse 2s ease-in-out infinite" : undefined,
                  }}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {cycle.daysLeft}d
                </span>
              )}
            </div>

            {/* Progress bar — cycle visualization */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${cycle.progress * 100}%`,
                    background: `linear-gradient(90deg, ${c.dot}60, ${c.dot})`,
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-400 shrink-0 tabular-nums">
                {FREQ_LABELS[cycle.frequency!] || cycle.frequency}
              </span>
            </div>
          </div>
        );
      })}

      {/* Predicted next purchase */}
      {cycles[0] && cycles[0].daysLeft !== null && (
        <div
          className="mt-2 rounded-lg px-3 py-2.5 border"
          style={{
            background: "linear-gradient(135deg, rgba(96,165,250,.06), rgba(167,139,250,.06))",
            borderColor: "rgba(96,165,250,.2)",
            animation: "exec-card-reveal 0.4s ease-out 0.5s both",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Predicted Next
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold" style={{ color: getColor(cycles[0].pillar).text }}>
              {cycles[0].label}
            </span>
            {" "}purchase expected in{" "}
            <span className="font-bold text-slate-800">{cycles[0].daysLeft} days</span>
            {" "}— avg {formatSpend(cycles[0].totalSpend / cycles[0].count)} per transaction
          </p>
        </div>
      )}

      <style>{`
        @keyframes purchase-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); box-shadow: 0 0 8px currentColor; }
        }
        @keyframes exec-card-reveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
