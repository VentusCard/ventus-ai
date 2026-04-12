import { Gift, MapPin, Sparkles } from "lucide-react";
import type { GeneratedOffer } from "./NextOfferRationale";

interface Props {
  offers: GeneratedOffer[];
  customerName: string;
}

export default function GeneratedOffersPhoneView({ offers, customerName }: Props) {
  const hero = offers[0];
  const rest = offers.slice(1);

  return (
    <div className="px-3 py-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold text-slate-700">
          Personalized for {customerName.split(" ")[0]}
        </span>
      </div>

      {/* Hero deal */}
      {hero && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e293b, #334155)",
          }}
        >
          <div className="px-4 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Top Pick
              </span>
            </div>
            <div className="text-[14px] font-bold text-white mb-1">
              {hero.merchant}
            </div>
            <div className="text-[11px] text-slate-300 mb-2">{hero.product}</div>
            <p className="text-[11px] text-slate-400 italic mb-3">"{hero.message}"</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-emerald-400">{hero.rewardValue}</span>
              <button className="text-[10px] font-semibold text-white bg-emerald-500 px-3 py-1.5 rounded-full">
                {hero.cta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal grid */}
      <div className="grid grid-cols-2 gap-2">
        {rest.map((offer) => (
          <div
            key={offer.id}
            className="rounded-xl border border-slate-100 px-3 py-2.5 bg-white"
          >
            <div className="flex items-center gap-1 mb-1.5">
              {offer.isDiscovery ? (
                <MapPin className="w-3 h-3 text-purple-500" />
              ) : (
                <Gift className="w-3 h-3 text-emerald-500" />
              )}
              <span className="text-[10px] font-bold text-slate-700 truncate">
                {offer.merchant}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mb-1 line-clamp-1">{offer.product}</div>
            <p className="text-[9px] text-slate-500 italic mb-2 line-clamp-2">"{offer.message}"</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600">{offer.rewardValue}</span>
            </div>
            <button className="mt-1.5 w-full text-[9px] font-semibold text-emerald-600 bg-emerald-50 py-1 rounded-full">
              {offer.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
