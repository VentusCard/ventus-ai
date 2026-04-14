import { Sparkles, ArrowRight } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PersonaSynthesis } from "./ExecDemoIntelPanel";

export interface GeneratedOffer {
  id: string;
  merchant: string;
  product: string;
  rewardValue: string;
  message: string;
  cta: string;
}

export interface RollupOfferGroup {
  rollup: string;
  pillar: string;
  deals: GeneratedOffer[];
}

interface Props {
  offers: RollupOfferGroup[] | null;
  personaSynthesis: PersonaSynthesis | null;
  loading: boolean;
}

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

  return (
    <div className="px-3 py-3 space-y-3 overflow-y-auto">
      {/* Rollup pills */}
      {personaSynthesis?.pillarRollups && personaSynthesis.pillarRollups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {personaSynthesis.pillarRollups.filter(r => (r.totalCount ?? 0) > 0).map((r) => {
            const c = getColor(r.pillar);
            return (
              <span
                key={`${r.pillar}::${r.label}`}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${c.bg.replace(".12", ".18")}, ${c.bg.replace(".12", ".08")})`,
                  color: c.text,
                  border: `1.5px solid ${c.dot}`,
                  boxShadow: `0 2px 8px ${c.bg.replace(".12", ".2")}`,
                }}
              >
                <span style={{ color: c.dot }}>✦</span>
                {r.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Strategy header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-500">
          {offers.length} behavioral clusters
        </span>
        <ArrowRight className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] font-bold text-emerald-600">
          {totalDeals} personalized deals
        </span>
      </div>

      {/* Grouped offer sections */}
      {offers.map((group, gi) => {
        const c = getColor(group.pillar);
        return (
          <div key={`${group.pillar}::${group.rollup}`} className="space-y-1.5">
            {/* Section header — rollup pill */}
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                }}
              >
                <span style={{ color: c.dot }}>✦</span>
                {group.rollup}
              </span>
              <span className="text-[10px] text-slate-400">{group.deals.length} deals</span>
            </div>

            {/* Deal cards */}
            {group.deals.map((deal, di) => (
              <div
                key={deal.id}
                className="rounded-xl border border-slate-100 px-3 py-2 bg-white"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: c.dot,
                  animation: `exec-card-reveal 0.4s ease-out ${gi * 0.15 + di * 0.08}s both`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-slate-800">{deal.merchant}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500">{deal.product}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {deal.rewardValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic mb-1.5">
                  "{deal.message}"
                </p>
                <button
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: c.bg, color: c.text }}
                >
                  {deal.cta}
                </button>
              </div>
            ))}
          </div>
        );
      })}

      <style>{`
        @keyframes exec-card-reveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
