import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Minus, TrendingDown } from "lucide-react";
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

/* ─── Single rollup card with carousel ─── */
function RollupCard({ group, index }: { group: RollupOfferGroup; index: number }) {
  const c = getColor(group.pillar);
  const suppressed = group.deals.filter(d => d.signal === "suppress");
  const active = group.deals.filter(d => d.signal !== "suppress");
  const [current, setCurrent] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % active.length), 4000);
    return () => clearInterval(t);
  }, [active.length]);

  const prev = useCallback(() => setCurrent(p => (p - 1 + active.length) % active.length), [active.length]);
  const next = useCallback(() => setCurrent(p => (p + 1) % active.length), [active.length]);

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
        {suppressed.map(d => (
          <span key={d.id} className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            {d.merchant}
          </span>
        ))}
      </div>

      {/* Carousel */}
      {active.length > 0 && (
        <div className="relative px-3 pb-2">
          {/* Navigation arrows */}
          {active.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={next}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            </>
          )}

          {/* Deal card */}
          <div className="overflow-hidden rounded-lg">
            {active.map((deal, di) => (
              <div
                key={deal.id}
                className="transition-all duration-400 ease-in-out"
                style={{
                  display: di === current ? "block" : "none",
                }}
              >
                <div className="px-3 py-2.5 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
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

                  <p className="text-[11px] text-slate-600 leading-relaxed italic mb-2">
                    "{deal.message}"
                  </p>

                  {/* Signal badge */}
                  <div className="flex items-center justify-between">
                    <SignalBadge signal={deal.signal} reason={deal.signalReason} />
                    <button
                      className="text-[9px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {deal.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {active.length > 1 && (
            <div className="flex items-center justify-center gap-1 mt-1.5">
              {active.map((_, di) => (
                <button
                  key={di}
                  onClick={() => setCurrent(di)}
                  className="transition-all duration-200"
                  style={{
                    width: di === current ? 12 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: di === current ? c.dot : "#e2e8f0",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Signal badge component ─── */
function SignalBadge({ signal, reason }: { signal: string; reason: string }) {
  if (signal === "boost") {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          <TrendingUp className="w-2.5 h-2.5" />
          Boosted
        </span>
        <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{reason}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
        <Minus className="w-2.5 h-2.5" />
        Neutral
      </span>
      <span className="text-[9px] text-slate-300 truncate max-w-[120px]">{reason}</span>
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
    <div className="px-3 py-3 space-y-2.5 overflow-y-auto">

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
      {offers.map((group, gi) => (
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
