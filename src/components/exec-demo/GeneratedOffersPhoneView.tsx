import { Gift, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import type { RollupOfferGroup } from "./NextOfferRationale";
import { getColor } from "./ExecDemoIntelPanel";

interface Props {
  offerGroups: RollupOfferGroup[];
  customerName: string;
}

export default function GeneratedOffersPhoneView({ offerGroups, customerName }: Props) {
  return (
    <div className="px-3 py-3 space-y-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold text-slate-700">
          Personalized for {customerName.split(" ")[0]}
        </span>
      </div>

      {offerGroups.map((group) => {
        const c = getColor(group.pillar);
        const suppressed = group.deals.filter(d => d.signal === "suppress");
        const active = group.deals.filter(d => d.signal !== "suppress");
        const hero = active[0];
        const rest = active.slice(1);

        return (
          <div key={`${group.pillar}::${group.rollup}`} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
              >
                ✦ {group.rollup}
              </span>
            </div>

            {/* Suppressed strip */}
            {suppressed.length > 0 && (
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Already Covered</div>
                {suppressed.map(d => (
                  <div key={d.id} className="flex items-center gap-1 text-[9px] text-slate-400">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="line-through">{d.merchant}</span>
                  </div>
                ))}
              </div>
            )}

            {hero && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
              >
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Top Pick</span>
                    {hero.signal === "boost" && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded-full">
                        <TrendingUp className="w-2 h-2" /> Boosted
                      </span>
                    )}
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
                    {deal.signal === "boost" && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-2 h-2 text-emerald-500" />
                        <span className="text-[8px] text-emerald-600 font-semibold">Boosted</span>
                      </div>
                    )}
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
