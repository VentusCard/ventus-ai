import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PersonaSynthesis } from "./ExecDemoIntelPanel";

export interface GeneratedOffer {
  id: string;
  merchant: string;
  product: string;
  category: string;
  rewardType: string;
  rewardValue: string;
  message: string;
  cta: string;
  rationale: string;
  sourceRollup: string;
  isDiscovery?: boolean;
}

interface Props {
  offers: GeneratedOffer[] | null;
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

  const rollupCount = personaSynthesis?.pillarRollups?.length || 0;

  return (
    <div className="px-3 py-3 space-y-2.5 overflow-y-auto">
      {/* Strategy header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-500">
          {rollupCount} behavioral clusters
        </span>
        <ArrowRight className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] font-bold text-emerald-600">
          {offers.length} personalized offers
        </span>
      </div>

      {personaSynthesis?.headline && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 w-fit">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-semibold text-amber-700">{personaSynthesis.headline}</span>
        </div>
      )}

      {/* Offer rationale cards */}
      {offers.map((offer, i) => {
        const c = getColor(offer.category);
        return (
          <div
            key={offer.id}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: offer.isDiscovery ? "rgba(168,85,247,.25)" : c.border,
              borderLeftWidth: 3,
              borderLeftColor: offer.isDiscovery ? "#a855f7" : c.dot,
              animation: `exec-card-reveal 0.4s ease-out ${i * 0.12}s both`,
            }}
          >
            <div className="px-3 py-2.5">
              {/* Merchant + reward */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {offer.isDiscovery && <Compass className="w-3 h-3 text-purple-500" />}
                  <span className="text-[12px] font-bold text-slate-800">{offer.merchant}</span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-[10px] text-slate-500">{offer.product}</span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: offer.isDiscovery ? "rgba(168,85,247,.1)" : c.bg,
                    color: offer.isDiscovery ? "#7c3aed" : c.text,
                  }}
                >
                  {offer.rewardValue}
                </span>
              </div>

              {/* Personalized message */}
              <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5 italic">
                "{offer.message}"
              </p>

              {/* Rationale */}
              <div className="flex items-start gap-1">
                <span className="text-[9px] text-slate-400 font-semibold uppercase shrink-0 mt-px">Why:</span>
                <span className="text-[10px] text-slate-400 leading-relaxed">{offer.rationale}</span>
              </div>

              {/* Source rollup tag */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: offer.isDiscovery ? "rgba(168,85,247,.08)" : c.bg,
                    color: offer.isDiscovery ? "#7c3aed" : c.text,
                  }}
                >
                  {offer.isDiscovery ? "🔮 Discovery" : `✦ ${offer.sourceRollup}`}
                </span>
              </div>
            </div>
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
