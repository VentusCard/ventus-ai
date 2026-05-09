import { Wallet } from "lucide-react";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { getBudgetStatus } from "@/lib/budgetUtils";
import type { EnrichedTransaction } from "./execDemoData";

interface Props {
  enrichedTxs?: EnrichedTransaction[] | null;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function BudgetPhoneView({ enrichedTxs }: Props) {
  const txs = enrichedTxs ?? [];

  // Aggregate spend by pillar
  const byPillar = new Map<string, number>();
  txs.forEach((t) => {
    if (!t.pillar) return;
    byPillar.set(t.pillar, (byPillar.get(t.pillar) || 0) + (t.amount || 0));
  });

  const top = Array.from(byPillar.entries())
    .map(([pillar, totalSpend]) => {
      // Demo budget: round up spend × 1.15 to nearest $10 so progress reads ~85% by default
      const budget = Math.max(10, Math.ceil((totalSpend * 1.15) / 10) * 10);
      return { pillar, totalSpend, budget };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 4);

  const totalSpend = top.reduce((s, p) => s + p.totalSpend, 0);
  const totalBudget = top.reduce((s, p) => s + p.budget, 0);
  const overall = totalBudget > 0 ? getBudgetStatus(totalSpend, totalBudget) : null;
  const overallPct = totalBudget > 0 ? Math.min(100, (totalSpend / totalBudget) * 100) : 0;

  if (top.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Building budget view...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Monthly Budget</p>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Top 4 lifestyle pillars
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-100">
            <Wallet className="w-3.5 h-3.5 text-sky-600" />
          </div>
        </div>

        {/* Overall summary */}
        {overall && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Spent vs budget</p>
                <p className="text-[15px] font-bold text-slate-900 mt-0.5">
                  {fmt(totalSpend)} <span className="text-[11px] font-medium text-slate-400">/ {fmt(totalBudget)}</span>
                </p>
              </div>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border"
                style={{ borderColor: overall.color, color: overall.color, backgroundColor: `${overall.color}10` }}
              >
                <overall.icon className="w-2.5 h-2.5" />
                <span className="text-[9px] font-semibold">{overall.label}</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPct}%`, backgroundColor: overall.color }}
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-1.5">{overallPct.toFixed(0)}% used this period</p>
          </div>
        )}

        {/* Per-pillar rows */}
        <div className="space-y-2">
          {top.map((p) => {
            const status = getBudgetStatus(p.totalSpend, p.budget);
            const pct = Math.min(100, (p.totalSpend / p.budget) * 100);
            const color = PILLAR_COLORS[p.pillar] || "#64748b";
            return (
              <div
                key={p.pillar}
                className="rounded-lg bg-white border border-slate-200 p-2.5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-semibold text-slate-800 flex-1 truncate">
                    {p.pillar}
                  </span>
                  <status.icon className="w-3 h-3 shrink-0" style={{ color: status.color }} />
                </div>
                <div className="flex items-end justify-between mb-1">
                  <span className="text-[12px] font-bold text-slate-900">{fmt(p.totalSpend)}</span>
                  <span className="text-[9px] text-slate-500">budget {fmt(p.budget)}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: status.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
