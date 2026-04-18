import { Sparkles, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
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
  activeRollupLabel?: string | null;
  activeRollupPillar?: string | null;
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
      <div className="px-4 pt-3 pb-2">
        <div className="font-bold text-base text-slate-900 mb-2">
          Behavioral Based Deal Collection
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
        >
          <span style={{ color: c.dot }}>✦</span>
          {group.rollup}
        </span>
        {suppressedCats.map(cat => (
          <span key={cat} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {cat}
          </span>
        ))}
        {boostCats.map(cat => (
          <span key={cat} className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {cat}
          </span>
        ))}
        </div>
      </div>

      {/* Deal tiles — 2 per row, full info */}
      {group.deals.length > 0 && (
        <div className="grid grid-cols-5 gap-2 px-4 pb-4">
          {group.deals.map(deal => (
              <div
                key={deal.id}
                className="min-w-0 min-h-[180px] flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3"
              >
                {/* Merchant + trend */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-slate-800 truncate">{deal.merchant}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>

                {/* Reward pill */}
                {deal.rewardValue && (
                  <span
                    className="self-start inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                  >
                    {deal.rewardValue}
                  </span>
                )}

                {/* Personalized message */}
                {deal.message && (
                  <p className="text-[11px] italic text-slate-600 leading-snug line-clamp-2">
                    "{deal.message}"
                  </p>
                )}

                {/* Signal reason (kept) */}
                <span className="text-[10.5px] leading-snug text-emerald-700">
                  ↑ {deal.signalReason}
                </span>

                {/* CTA */}
                <button
                  className="mt-auto w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                >
                  {deal.cta}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}


/* ─── Main component ─── */
export default function NextOfferRationale({ offers, personaSynthesis, loading, activeRollupLabel, activeRollupPillar }: Props) {
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

  // Filter to only the active rollup's offer group.
  // For Life Events: exact normalized match ONLY (no substring fallback — short labels
  // like "Home Purchase" can spuriously substring-match unrelated behavioral rollups).
  // For behavioral rollups: exact match, then conservative substring fallback.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const target = activeRollupLabel ? norm(activeRollupLabel) : null;
  const isLifeEvent = activeRollupPillar === "Life Event";

  const filtered = !target
    ? offers
    : (() => {
        // 1. exact (case-insensitive) match
        let hits = offers.filter(g => norm(g.rollup) === target);
        if (hits.length > 0) return hits;
        // 2. life events: stop here — never fuzzy-match into a behavioral group
        if (isLifeEvent) return [];
        // 3. behavioral: substring match either direction
        hits = offers.filter(g => {
          const r = norm(g.rollup);
          return r.includes(target) || target.includes(r);
        });
        return hits;
      })();

  if (filtered.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <span className="text-[11px] text-slate-400 italic">
          {activeRollupLabel
            ? `No offers generated for "${activeRollupLabel}" yet.`
            : "Select a persona pill above to see targeted offers."}
        </span>
      </div>
    );
  }

  const totalDeals = filtered.reduce((sum, g) => sum + g.deals.length, 0);
  const totalBoosted = filtered.reduce((sum, g) => sum + g.deals.filter(d => d.signal === "boost").length, 0);
  const totalSuppressed = filtered.reduce((sum, g) => sum + g.deals.filter(d => d.signal === "suppress").length, 0);

  return (
    <div className="px-3 py-3 space-y-2.5">


      {/* Rollup cards (just one when filtered) */}
      {filtered.map((group, gi) => (
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
