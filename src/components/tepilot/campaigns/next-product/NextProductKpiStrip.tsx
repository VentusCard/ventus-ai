import { Users, Gauge, TrendingUp, Zap } from "lucide-react";
import { COHORTS, PRODUCTS, topProductFor } from "./data/cohorts";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function NextProductKpiStrip() {
  const totalMatched = COHORTS.reduce((acc, c) => acc + c.audience, 0);
  const avgSignal = Math.round(
    COHORTS.reduce((acc, c) => {
      const top = topProductFor(c);
      return acc + (c.scores[top.id] ?? 0);
    }, 0) / COHORTS.length,
  );

  // top product = product with most cohorts in their top-1
  const counts = new Map<string, number>();
  COHORTS.forEach((c) => {
    const t = topProductFor(c);
    counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
  });
  let topProductId = PRODUCTS[0].id;
  let topCount = 0;
  counts.forEach((v, k) => {
    if (v > topCount) {
      topCount = v;
      topProductId = k;
    }
  });
  const topProduct = PRODUCTS.find((p) => p.id === topProductId)!;

  const feedingFlows = new Set<string>();
  COHORTS.forEach((c) => {
    Object.values(c.feedingFlows).forEach((arr) => arr.forEach((f) => feedingFlows.add(f)));
  });

  const tiles = [
    {
      icon: Users,
      label: "Customers with a next-product match",
      value: formatNum(totalMatched),
    },
    {
      icon: Gauge,
      label: "Avg. next-product signal strength",
      value: `${avgSignal}/100`,
    },
    {
      icon: TrendingUp,
      label: "Top product this week",
      value: topProduct.short,
      sub: `${topCount} cohorts`,
    },
    {
      icon: Zap,
      label: "Automated Flows feeding this view",
      value: feedingFlows.size.toString(),
      sub: "live signals",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className="rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-2.5 min-w-0"
          >
            <div className="shrink-0 w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                {t.label}
              </p>
              <p className="text-base font-bold text-slate-900 mt-1 leading-none truncate">{t.value}</p>
              {t.sub && <p className="text-[10px] text-slate-500 mt-1 leading-none">{t.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
