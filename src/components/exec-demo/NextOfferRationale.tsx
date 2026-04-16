import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Minus } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PersonaSynthesis } from "./ExecDemoIntelPanel";

export interface GeneratedOffer {
  id: string;
  merchant: string;
  product: string;
  rewardValue: string;
  message: string;
  cta: string;
  signal: "boost" | "suppress" | "neutral";
  signalReason: string;
  suppressedCategory?: string;
  boostCategory?: string;
}

export interface RollupOfferGroup {
  rollup: string;
  pillar: string;
  deals: GeneratedOffer[];
  collectionMessage?: string;
  suppressedCategories?: string[];
}

interface Props {
  offers: RollupOfferGroup[] | null;
  personaSynthesis: PersonaSynthesis | null;
  loading: boolean;
}

/* ─── Single rollup card with horizontal deal tiles ─── */
function RollupCard({ group, index }: { group: RollupOfferGroup; index: number }) {
  const c = getColor(group.pillar);

  const suppressedCats = group.suppressedCategories || [];
  const boostCats = [...new Set(
    group.deals.filter(d => d.signal === "boost" && d.boostCategory).map(d => d.boostCategory!)
  )];

  return (
    <div
      className="rounded-xl border border-slate-100 bg-white overflow-hidden"
      style={{
        borderTopWidth: 3,
        borderTopColor: c.dot,
        animation: `offer-card-in 0.45s ease-out ${index * 0.12}s both`,
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-1.5 flex-wrap px-3 pt-2.5 pb-1.5">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
        >
          <span style={{ color: c.dot }}>✦</span>
          {group.rollup}
        </span>
        {suppressedCats.map(cat => (
          <span key={cat} className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            {cat}
          </span>
        ))}
        {boostCats.map(cat => (
          <span key={cat} className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
            {cat}
          </span>
        ))}
      </div>

      {/* Horizontal deal tiles */}
      {group.deals.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5 px-3 pb-2.5">
          {group.deals.map(deal => (
            <div
              key={deal.id}
              className="min-w-0 flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800 truncate">{deal.merchant}</span>
                {deal.signal === "boost" && <TrendingUp className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                {deal.signal === "neutral" && <Minus className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
              </div>
              <span className={`text-[8px] px-1.5 py-1 rounded-full whitespace-normal leading-relaxed ${
                deal.signal === "boost"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-slate-50 text-slate-500 border border-slate-100"
              }`}>
                {deal.signal === "boost" ? "↑ " : ""}{deal.signalReason}
              </span>
              <button
                className="mt-auto text-[8px] font-semibold px-2 py-0.5 rounded-full text-center"
                style={{ background: c.bg, color: c.text }}
              >
                {deal.cta}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ─── Main component ─── */
export default function NextOfferRationale({ offers, personaSynthesis, loading }: Props) {
  if (loading || !offers) {
    return (
      <div className="px-3 py-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[12px] font-semibold text-slate-500">Generating personalized offers...</span>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-slate-100 p-3 animate-pulse">
            <div className="h-3 w-32 bg-slate-100 rounded mb-2" />
            <div className="h-2 w-48 bg-slate-50 rounded mb-1.5" />
            <div className="h-2 w-40 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalDeals = offers.reduce((sum, g) => sum + g.deals.length, 0);
  const totalBoosted = offers.reduce((sum, g) => sum + g.deals.filter(d => d.signal === "boost").length, 0);
  const totalSuppressed = offers.reduce((sum, g) => sum + g.deals.filter(d => d.signal === "suppress").length, 0);

  return (
    <div className="px-3 py-3 space-y-2.5">

      {/* Strategy header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-500">
          {offers.length} behavioral clusters
        </span>
        <ArrowRight className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] font-bold text-emerald-600">
          {totalDeals} deals
        </span>
        <span className="text-[9px] text-slate-400">
          ({totalBoosted} boosted · {totalSuppressed} suppressed)
        </span>
      </div>

      {/* Rollup cards */}
      {[...offers]
        .sort((a, b) => {
          const aLife = a.pillar === "Life Event" ? 1 : 0;
          const bLife = b.pillar === "Life Event" ? 1 : 0;
          return aLife - bLife;
        })
        .map((group, gi) => (
          <RollupCard key={`${group.pillar}::${group.rollup}`} group={group} index={gi} />
        ))}

      <style>{`
        @keyframes offer-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
