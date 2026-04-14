import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, CreditCard, Zap, CheckCircle2, Star } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "./ProductCardsPhoneView";
import type { Transaction } from "./execDemoData";

interface Props {
  lifeEvents: LifeEvent[] | null;
  loading: boolean;
  productCards?: ProductCard[] | null;
  transactions?: Transaction[];
}

/* ─── Current holdings pill row ─── */
function CurrentHoldingsPills({ transactions }: { transactions: Transaction[] }) {
  const sourceCounts = new Map<string, number>();
  transactions.forEach(t => {
    if (t.source) sourceCounts.set(t.source, (sourceCounts.get(t.source) || 0) + 1);
  });
  const sources = Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]);
  if (sources.length === 0) return null;

  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Current Holdings</span>
      {sources.map(([source, count]) => (
        <span key={source} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          {source} ({count})
        </span>
      ))}
    </div>
  );
}

const PRODUCT_CATALOG = [
  "Travel Card", "529 Plan", "HYSA", "Home Equity Line", "Auto Loan",
  "CD Ladder", "Premium Card", "Life Insurance", "Brokerage Account",
  "Student Loan Refi", "Balance Transfer Card", "Business Card",
];

function RecommendedProductsPills({ productCards }: { productCards: ProductCard[] }) {
  const recommendedNames = productCards.map(c => c.product_name.toLowerCase());

  return (
    <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Product Catalog</span>
      {PRODUCT_CATALOG.map(name => {
        const isMatch = recommendedNames.some(r => r.includes(name.toLowerCase()) || name.toLowerCase().includes(r));
        return (
          <span
            key={name}
            className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border shrink-0 ${
              isMatch
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : "text-slate-400 bg-slate-50 border-slate-100"
            }`}
          >
            {isMatch && <Star className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />}
            {name}
          </span>
        );
      })}
    </div>
  );
}

export default function NextProductRationale({ lifeEvents, loading, productCards, transactions }: Props) {
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

  // Show product cards rationale if available
  if (productCards && productCards.length > 0) {
    return (
      <div className="px-3 py-3 space-y-2.5 overflow-y-auto">
        {/* Current holdings pills */}
        {transactions && transactions.length > 0 && (
          <CurrentHoldingsPills transactions={transactions} />
        )}

        {/* Product catalog pills */}
        <RecommendedProductsPills productCards={productCards} />

        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500">
            {productCards.length} product card{productCards.length !== 1 ? "s" : ""} generated
          </span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className="text-[11px] font-bold text-violet-600">
            Consumer notifications ready
          </span>
        </div>

        {/* Card rationale */}
        {productCards.map((card, i) => {
          const isBehavioral = card.type === "behavioral";
          const c = isBehavioral
            ? { bg: "#f0f9ff", text: "#0c4a6e", dot: "#3b82f6", border: "#bfdbfe" }
            : getColor(card.theme === "education" ? "Education & Family" : card.theme === "home" ? "Home & Living" : "Financial Planning");

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
                {/* Type badge + product name */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isBehavioral ? (
                      <Zap className="w-3.5 h-3.5" style={{ color: c.dot }} />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: c.dot }} />
                    )}
                    <span className="text-[12px] font-bold text-slate-800">{card.product_name}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{ background: `${c.dot}15`, color: c.dot }}
                  >
                    {isBehavioral ? "Behavioral" : "Life Event"}
                  </span>
                </div>

                {/* Signal */}
                <div className="flex items-start gap-1 mb-1.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase shrink-0 mt-px">
                    {isBehavioral ? "Signal:" : "Trigger:"}
                  </span>
                  <span className="text-[10px] text-slate-500">{card.signal_label}</span>
                </div>

                {/* Quote preview */}
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  "{card.quote}"
                </p>

                {/* Trigger badge */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: `${c.dot}10`, color: c.dot }}
                  >
                    <CreditCard className="w-2.5 h-2.5 inline mr-0.5" />
                    {isBehavioral ? "Spending Pattern" : "Life Event Trigger"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Supporting evidence from life events */}
        {productEvents.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Supporting Evidence</span>
            {productEvents.slice(0, 2).map((event, i) => (
              <div key={i} className="mt-1.5 flex items-start gap-1">
                <TrendingUp className="w-3 h-3 text-slate-300 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-slate-600">{event.event_name}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({event.confidence}%)</span>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    {event.evidence.slice(0, 3).map(e => e.merchant).join(" → ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes exec-product-reveal {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Fallback: no product cards yet but have life events
  if (productEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">No product recommendations detected</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 space-y-2.5 overflow-y-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
        <span className="text-[12px] font-semibold text-slate-500">Generating product cards...</span>
      </div>
    </div>
  );
}
