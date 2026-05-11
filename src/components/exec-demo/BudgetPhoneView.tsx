import { useState } from "react";
import { Wallet, ChevronDown, ChevronRight } from "lucide-react";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { getBudgetStatus } from "@/lib/budgetUtils";
import type { EnrichedTransaction } from "./execDemoData";

interface Props {
  enrichedTxs?: EnrichedTransaction[] | null;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function BudgetPhoneView({ enrichedTxs }: Props) {
  const txs = enrichedTxs ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  // Aggregate spend by pillar AND categories within each pillar
  const byPillar = new Map<string, { total: number; cats: Map<string, number> }>();
  txs.forEach((t) => {
    if (!t.pillar) return;
    const entry = byPillar.get(t.pillar) || { total: 0, cats: new Map() };
    entry.total += t.amount || 0;
    const cat = t.category || "Other";
    entry.cats.set(cat, (entry.cats.get(cat) || 0) + (t.amount || 0));
    byPillar.set(t.pillar, entry);
  });

  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const ranked = Array.from(byPillar.entries())
    .map(([pillar, data]) => ({ pillar, data }))
    .sort((a, b) => b.data.total - a.data.total)
    .slice(0, 4);

  // Deterministically mark 2 of the 4 pillars as overbudget based on customer's pillar mix
  const overbudgetSet = new Set(
    ranked
      .map((r) => ({ pillar: r.pillar, score: hash(r.pillar) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((r) => r.pillar)
  );

  const top = ranked.map(({ pillar, data }) => {
    const isOver = overbudgetSet.has(pillar);
    // Over: budget is 70-85% of spend → ratio > 1. Under: budget is ~115% of spend.
    const factor = isOver ? 0.7 + ((hash(pillar) % 16) / 100) : 1.15;
    const budget = Math.max(10, Math.ceil((data.total * factor) / 10) * 10);
    const categories = Array.from(data.cats.entries())
      .map(([category, spend]) => ({ category, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
    return { pillar, totalSpend: data.total, budget, categories };
  });

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
            const isOpen = expanded === p.pillar;
            const maxCat = p.categories[0]?.spend || 1;
            return (
              <div
                key={p.pillar}
                className="rounded-lg bg-white border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : p.pillar)}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-semibold text-slate-800 flex-1 truncate">
                      {p.pillar}
                    </span>
                    <status.icon className="w-3 h-3 shrink-0" style={{ color: status.color }} />
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
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
                </button>

                {isOpen && p.categories.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-2.5 py-2 space-y-1.5">
                    <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Top categories
                    </p>
                    {p.categories.map((c) => {
                      const w = Math.max(4, (c.spend / maxCat) * 100);
                      return (
                        <div key={c.category}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-medium text-slate-700 truncate pr-2">
                              {c.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-900 shrink-0">
                              {fmt(c.spend)}
                            </span>
                          </div>
                          <div className="h-[3px] bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${w}%`, backgroundColor: color, opacity: 0.7 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
