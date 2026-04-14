import { Gift, Sparkles } from "lucide-react";
import type { RollupOfferGroup } from "./NextOfferRationale";
import { getColor } from "./ExecDemoIntelPanel";

interface Props {
  offerGroups: RollupOfferGroup[];
  customerName: string;
}

export default function GeneratedOffersPhoneView({ offerGroups, customerName }: Props) {
  return (
    <div className="px-3 py-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold text-slate-700">
          Personalized for {customerName.split(" ")[0]}
        </span>
      </div>

      {offerGroups.map((group) => {
        const c = getColor(group.pillar);
        const hero = group.deals[0];
        const rest = group.deals.slice(1);

        return (
          <div key={`${group.pillar}::${group.rollup}`} className="space-y-2">
            {/* Rollup label */}
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
              >
                ✦ {group.rollup}
              </span>
            </div>

            {/* Hero deal */}
            {hero && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
              >
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Top Pick</span>
                  </div>
                  <div className="text-[13px] font-bold text-white mb-0.5">{hero.merchant}</div>
                  <div className="text-[10px] text-slate-300 mb-1.5">{hero.product}</div>
                  <p className="text-[10px] text-slate-400 italic mb-2">"{hero.message}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400">{hero.rewardValue}</span>
                    <button className="text-[9px] font-semibold text-white bg-emerald-500 px-3 py-1 rounded-full">
                      {hero.cta}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rest as compact grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {rest.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-slate-100 px-2.5 py-2 bg-white">
                    <div className="flex items-center gap-1 mb-1">
                      <Gift className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-700 truncate">{deal.merchant}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mb-0.5 line-clamp-1">{deal.product}</div>
                    <p className="text-[9px] text-slate-500 italic mb-1.5 line-clamp-2">"{deal.message}"</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-600">{deal.rewardValue}</span>
                    </div>
                    <button className="mt-1 w-full text-[9px] font-semibold text-emerald-600 bg-emerald-50 py-0.5 rounded-full">
                      {deal.cta}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
