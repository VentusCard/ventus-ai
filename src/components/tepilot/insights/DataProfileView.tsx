import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar } from "@/lib/aggregations";
import { PILLAR_COLORS } from "@/lib/sampleData";

interface DataProfileViewProps {
  transactions: EnrichedTransaction[];
}

export function DataProfileView({ transactions }: DataProfileViewProps) {
  const pillars = aggregateByPillar(transactions);
  const totalSpend = pillars.reduce((s, p) => s + p.totalSpend, 0);

  const travelTxns = transactions.filter(t => t.pillar === "Travel & Exploration");
  const travelCities = [...new Set(travelTxns.map(t => t.normalized_merchant).filter(Boolean))].slice(0, 5);

  const topMerchants = Object.entries(
    transactions.reduce((acc, t) => {
      const name = t.normalized_merchant || t.merchant_name;
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="h-full rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/60 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-slate-400 font-mono">enriched_profile.json</span>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        <Line indent={0} text="{" color="text-slate-300" />
        
        {/* Summary */}
        <Key indent={1} name="customer_id" value='"USR-4821-A7F3"' valueColor="text-amber-400" />
        <Key indent={1} name="total_spend" value={`$${totalSpend.toFixed(0)}`} valueColor="text-green-400" />
        <Key indent={1} name="transactions_analyzed" value={String(transactions.length)} valueColor="text-cyan-400" />
        <Key indent={1} name="pillars_detected" value={String(pillars.length)} valueColor="text-cyan-400" />

        {/* Pillar breakdown */}
        <Line indent={1} text="" />
        <Comment indent={1} text="// Lifestyle pillar breakdown" />
        <Line indent={1} text={`"pillar_scores": {`} color="text-purple-400" />
        {pillars.map((p, i) => {
          const pct = ((p.totalSpend / totalSpend) * 100).toFixed(1);
          const color = PILLAR_COLORS[p.pillar] || "#64748b";
          return (
            <div key={p.pillar} className="flex items-center gap-1 pl-8 py-0.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sky-300">"{p.pillar}"</span>
              <span className="text-slate-500">:</span>
              <span className="text-slate-300">{`{ `}</span>
              <span className="text-green-400">${p.totalSpend.toFixed(0)}</span>
              <span className="text-slate-500">,</span>
              <span className="text-yellow-300 ml-1">{pct}%</span>
              <span className="text-slate-500">,</span>
              <span className="text-slate-400 ml-1">{p.transactionCount}tx</span>
              <span className="text-slate-300">{` }`}{i < pillars.length - 1 ? "," : ""}</span>
            </div>
          );
        })}
        <Line indent={1} text="}," color="text-purple-400" />

        {/* Subcategories */}
        <Line indent={1} text="" />
        <Comment indent={1} text="// Top subcategories per pillar" />
        <Line indent={1} text={`"subcategories": {`} color="text-purple-400" />
        {pillars.slice(0, 4).map((p, pi) => (
          <div key={p.pillar}>
            <div className="pl-8 py-0.5">
              <span className="text-sky-300">"{p.pillar}"</span>
              <span className="text-slate-500">: [</span>
            </div>
            {p.subcategories.slice(0, 3).map((s, si) => (
              <div key={s.subcategory} className="pl-12 py-0.5">
                <span className="text-amber-300">"{s.subcategory}"</span>
                <span className="text-slate-500"> → </span>
                <span className="text-green-400">${s.totalSpend.toFixed(0)}</span>
                {si < Math.min(p.subcategories.length, 3) - 1 && <span className="text-slate-500">,</span>}
              </div>
            ))}
            <div className="pl-8 py-0.5">
              <span className="text-slate-500">]{pi < 3 ? "," : ""}</span>
            </div>
          </div>
        ))}
        <Line indent={1} text="}," color="text-purple-400" />

        {/* Top merchants */}
        <Line indent={1} text="" />
        <Comment indent={1} text="// Merchant affinity signals" />
        <Line indent={1} text={`"top_merchants": [`} color="text-purple-400" />
        {topMerchants.map(([name, amount], i) => (
          <div key={name} className="pl-8 py-0.5">
            <span className="text-amber-300">"{name}"</span>
            <span className="text-slate-500"> : </span>
            <span className="text-green-400">${amount.toFixed(0)}</span>
            {i < topMerchants.length - 1 && <span className="text-slate-500">,</span>}
          </div>
        ))}
        <Line indent={1} text="]," color="text-purple-400" />

        {/* Travel */}
        <Line indent={1} text="" />
        <Comment indent={1} text="// Travel intelligence" />
        <Line indent={1} text={`"travel_signals": {`} color="text-purple-400" />
        <Key indent={2} name="cities_visited" value={JSON.stringify(travelCities.slice(0, 5))} valueColor="text-amber-300" />
        <Key indent={2} name="travel_spend_pct" value={`${totalSpend > 0 ? ((travelTxns.reduce((s, t) => s + t.amount, 0) / totalSpend) * 100).toFixed(1) : 0}%`} valueColor="text-cyan-400" />
        <Line indent={1} text="}," color="text-purple-400" />

        {/* Lifestyle signals */}
        <Line indent={1} text="" />
        <Comment indent={1} text="// Derived lifestyle signals" />
        <Line indent={1} text={`"lifestyle_signals": [`} color="text-purple-400" />
        {pillars.slice(0, 3).map((p, i) => (
          <div key={p.pillar} className="pl-8 py-0.5">
            <span className="text-amber-300">"{p.pillar.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}_affinity"</span>
            <span className="text-slate-500"> : </span>
            <span className="text-green-400">{((p.totalSpend / totalSpend) * 100).toFixed(0)}%</span>
            {i < 2 && <span className="text-slate-500">,</span>}
          </div>
        ))}
        <Line indent={1} text="]" color="text-purple-400" />

        <Line indent={0} text="}" color="text-slate-300" />
      </div>
    </div>
  );
}

function Line({ indent, text, color = "text-slate-300" }: { indent: number; text: string; color?: string }) {
  return <div className={`${color}`} style={{ paddingLeft: `${indent * 16}px` }}>{text}</div>;
}

function Key({ indent, name, value, valueColor }: { indent: number; name: string; value: string; valueColor: string }) {
  return (
    <div style={{ paddingLeft: `${indent * 16}px` }} className="py-0.5">
      <span className="text-sky-300">"{name}"</span>
      <span className="text-slate-500">: </span>
      <span className={valueColor}>{value}</span>
      <span className="text-slate-500">,</span>
    </div>
  );
}

function Comment({ indent, text }: { indent: number; text: string }) {
  return <div className="text-slate-600 italic" style={{ paddingLeft: `${indent * 16}px` }}>{text}</div>;
}
