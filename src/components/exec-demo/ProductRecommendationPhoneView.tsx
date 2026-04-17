import { ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import type { LifeEvent } from "@/types/lifestyle-signals";

const oneSentence = (text: string) => {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
};

const FUNDING_LABELS: Record<string, string> = {
  "529": "529 Plan",
  savings: "High-Yield Savings",
  roth_ira: "Roth IRA",
  "401k": "401(k)",
  home_equity: "Home Equity LOC",
  taxable: "Brokerage Account",
  utma: "UTMA Account",
  loan: "Personal Loan",
  ira_traditional: "Traditional IRA",
  gifts: "Gift Contributions",
  pension: "Pension",
  social_security: "Social Security",
  business_loan: "Business Loan",
  investor: "Investor",
  grant: "Grant",
  credit: "Credit Line",
  inheritance: "Inheritance",
  other: "Other",
};

const EVENT_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  education: { bg: "#eef2ff", accent: "#6366f1", text: "#3730a3" },
  home: { bg: "#ecfdf5", accent: "#10b981", text: "#065f46" },
  retirement: { bg: "#fff7ed", accent: "#f59e0b", text: "#92400e" },
  business: { bg: "#f0f9ff", accent: "#0ea5e9", text: "#0c4a6e" },
  wedding: { bg: "#fdf2f8", accent: "#ec4899", text: "#9d174d" },
  family_formation: { bg: "#fdf2f8", accent: "#f472b6", text: "#9d174d" },
  other: { bg: "#f8fafc", accent: "#64748b", text: "#334155" },
};

interface Props {
  lifeEvents: LifeEvent[];
  customerName: string;
}

export default function ProductRecommendationPhoneView({ lifeEvents, customerName }: Props) {
  const firstName = customerName.split(" ")[0];
  const heroEvent = lifeEvents[0];
  const secondaryEvents = lifeEvents.slice(1, 3);
  const heroColor = EVENT_COLORS[heroEvent?.financial_projection?.project_type || "other"] || EVENT_COLORS.other;
  const heroSources = heroEvent?.financial_projection?.recommended_funding_sources || [];

  return (
    <div className="px-3 py-3 space-y-3">
      {/* Greeting */}
      <div className="flex items-center gap-1.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <span className="text-[11px] font-semibold text-slate-600">
          Personalized for {firstName}
        </span>
      </div>

      {/* Hero product card */}
      {heroEvent && (
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: heroColor.bg }}
        >
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 -translate-y-6 translate-x-6"
            style={{ background: heroColor.accent }}
          />
          <p className="text-[13px] font-bold leading-snug mb-2" style={{ color: heroColor.text }}>
            {oneSentence(heroEvent.talking_points?.[0] || heroEvent.event_name)}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {heroSources.slice(0, 3).map((src, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full text-white"
                style={{ background: heroColor.accent }}
              >
                <ShieldCheck className="w-3 h-3" />
                {FUNDING_LABELS[src.type] || src.type}
              </span>
            ))}
          </div>
          <button
            className="w-full py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1"
            style={{ background: heroColor.accent }}
          >
            Explore Options <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Secondary event cards */}
      {secondaryEvents.map((event, i) => {
        const color = EVENT_COLORS[event.financial_projection?.project_type || "other"] || EVENT_COLORS.other;
        const sources = event.financial_projection?.recommended_funding_sources || [];
        return (
          <div
            key={i}
            className="rounded-xl border p-3"
            style={{
              borderColor: `${color.accent}30`,
              animation: `phone-product-slide 0.3s ease-out ${0.2 + i * 0.1}s both`,
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-[11px] font-bold" style={{ color: color.text }}>
                {event.event_name}
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${color.accent}15`, color: color.accent }}
              >
                {event.confidence}%
              </span>
            </div>
            {event.talking_points?.[1] && (
              <p className="text-[10px] text-slate-500 leading-relaxed mb-1.5">
                {oneSentence(event.talking_points[1])}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {sources.slice(0, 2).map((src, si) => (
                <span
                  key={si}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: `${color.accent}12`, color: color.accent }}
                >
                  {FUNDING_LABELS[src.type] || src.type}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes phone-product-slide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
