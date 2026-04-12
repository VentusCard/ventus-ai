import { Sparkles, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { LifeEvent } from "@/types/lifestyle-signals";

const FUNDING_LABELS: Record<string, string> = {
  "529": "529 College Savings Plan",
  gifts: "Gift Contributions",
  taxable: "Taxable Brokerage Account",
  roth_ira: "Roth IRA",
  utma: "UTMA/UGMA Custodial Account",
  loan: "Personal Loan",
  savings: "High-Yield Savings Account",
  home_equity: "Home Equity Line of Credit",
  pension: "Pension Plan",
  social_security: "Social Security",
  "401k": "401(k) Plan",
  ira_traditional: "Traditional IRA",
  business_loan: "Business Loan",
  investor: "Investor Funding",
  grant: "Grant / Scholarship",
  credit: "Credit Facility",
  inheritance: "Inheritance Planning",
  other: "Other Financial Product",
};

interface Props {
  lifeEvents: LifeEvent[] | null;
  loading: boolean;
}

export default function NextProductRationale({ lifeEvents, loading }: Props) {
  if (loading || !lifeEvents) {
    return (
      <div className="px-3 py-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
          <span className="text-[12px] font-semibold text-slate-500">Detecting life events...</span>
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

  const productEvents = lifeEvents.filter(
    e => (e.financial_projection?.recommended_funding_sources?.length ?? 0) > 0
  );

  if (productEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">No life events detected</span>
      </div>
    );
  }

  const totalProducts = productEvents.reduce(
    (sum, e) => sum + (e.financial_projection?.recommended_funding_sources?.length || 0), 0
  );

  return (
    <div className="px-3 py-3 space-y-2.5 overflow-y-auto">
      {/* Strategy header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-500">
          {lifeEvents.length} life event{lifeEvents.length !== 1 ? "s" : ""} detected
        </span>
        <ArrowRight className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] font-bold text-violet-600">
          {totalProducts} product recommendation{totalProducts !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Life event → product cards */}
      {lifeEvents.map((event, i) => {
        const sources = event.financial_projection?.recommended_funding_sources || [];
        const confidenceColor = event.confidence >= 85 ? "#16a34a" : event.confidence >= 70 ? "#d97706" : "#94a3b8";
        const pillarKey = event.financial_projection?.project_type === "education"
          ? "Education & Family"
          : event.financial_projection?.project_type === "home"
            ? "Home & Living"
            : "Financial Planning";
        const c = getColor(pillarKey);

        return (
          <div
            key={i}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: c.border,
              borderLeftWidth: 3,
              borderLeftColor: c.dot,
              animation: `exec-product-reveal 0.4s ease-out ${i * 0.15}s both`,
            }}
          >
            <div className="px-3 py-2.5">
              {/* Event name + confidence */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-bold text-slate-800">{event.event_name}</span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${confidenceColor}15`, color: confidenceColor }}
                >
                  {event.confidence}% confidence
                </span>
              </div>

              {/* Talking point as personalized message */}
              {event.talking_points?.[0] && (
                <p className="text-[11px] text-slate-600 leading-relaxed mb-2 italic">
                  "{event.talking_points[0]}"
                </p>
              )}

              {/* Evidence chain */}
              <div className="flex items-start gap-1 mb-2">
                <span className="text-[9px] text-slate-400 font-semibold uppercase shrink-0 mt-px">Signals:</span>
                <span className="text-[10px] text-slate-400 leading-relaxed">
                  {event.evidence.slice(0, 4).map(e => e.merchant).join(" → ")}
                </span>
              </div>

              {/* Recommended products */}
              {sources.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Recommended Products:</span>
                  <div className="flex flex-wrap gap-1">
                    {sources.map((src, si) => (
                      <div
                        key={si}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
                        style={{ background: c.bg, color: c.text }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span className="font-semibold">{FUNDING_LABELS[src.type] || src.type}</span>
                      </div>
                    ))}
                  </div>
                  {sources[0]?.rationale && (
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {sources[0].rationale}
                    </p>
                  )}
                </div>
              )}

              {/* Trigger badge */}
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: c.bg, color: c.text }}
                >
                  <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                  Life Event Trigger
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes exec-product-reveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
