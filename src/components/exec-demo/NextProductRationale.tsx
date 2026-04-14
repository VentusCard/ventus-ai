import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, CreditCard, Zap, CheckCircle2, ChevronRight } from "lucide-react";
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

/* ─── Current vs Recommended cross-check ─── */
function CurrentVsRecommended({ transactions, productCards }: { transactions: Transaction[]; productCards: ProductCard[] }) {
  // Extract unique sources with counts
  const sourceCounts = new Map<string, number>();
  transactions.forEach(t => {
    if (t.source) {
      sourceCounts.set(t.source, (sourceCounts.get(t.source) || 0) + 1);
    }
  });
  const sources = Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]);

  if (sources.length === 0) return null;

  // Try to match product cards to sources via signal logic
  const matched: { source: string; count: number; signal: string; product: ProductCard }[] = [];
  const unmatchedSources: { source: string; count: number }[] = [];
  const usedProducts = new Set<number>();

  sources.forEach(([source, count]) => {
    // Find a product card that isn't already matched
    const matchIdx = productCards.findIndex((pc, i) => {
      if (usedProducts.has(i)) return false;
      // Match heuristically: behavioral cards match spending sources, life-event cards match any
      return true;
    });
    if (matchIdx >= 0 && matched.length < productCards.length) {
      usedProducts.add(matchIdx);
      const pc = productCards[matchIdx];
      matched.push({ source, count, signal: pc.signal_label, product: pc });
    } else {
      unmatchedSources.push({ source, count });
    }
  });

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-3 px-3 pt-2.5 pb-1.5 border-b border-slate-100">
        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Current Holdings</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Signal</span>
        <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wider text-right">Recommended Next</span>
      </div>

      {/* Matched rows */}
      <div className="px-2 py-1.5 space-y-1.5">
        {matched.map((m, i) => {
          const isBehavioral = m.product.type === "behavioral";
          const c = isBehavioral
            ? { dot: "#3b82f6", bg: "#eff6ff" }
            : getColor(m.product.theme === "education" ? "Education & Family" : m.product.theme === "home" ? "Home & Living" : "Financial Planning");

          return (
            <div
              key={i}
              className="grid grid-cols-3 items-center gap-1"
              style={{ animation: `crosscheck-row 0.35s ease-out ${i * 0.1}s both` }}
            >
              {/* Current product pill */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-800 block truncate">{m.source}</span>
                  <span className="text-[9px] text-emerald-500">{m.count} txns</span>
                </div>
              </div>

              {/* Signal connector */}
              <div className="flex items-center justify-center gap-0.5">
                <div className="h-px w-2 bg-slate-200" />
                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0.5 truncate max-w-[100px] text-center leading-tight">
                  {m.signal}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              </div>

              {/* Recommended product pill */}
              <div
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 justify-end"
                style={{ background: `${c.dot}10`, border: `1px solid ${c.dot}25` }}
              >
                {isBehavioral ? (
                  <Zap className="w-3 h-3 shrink-0" style={{ color: c.dot }} />
                ) : (
                  <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: c.dot }} />
                )}
                <div className="min-w-0 text-right">
                  <span className="text-[10px] font-bold block truncate" style={{ color: c.dot }}>{m.product.product_name}</span>
                  <span className="text-[8px] uppercase font-semibold" style={{ color: `${c.dot}99` }}>
                    {isBehavioral ? "Behavioral" : "Life Event"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmatched current holdings */}
      {unmatchedSources.length > 0 && (
        <div className="px-3 pb-2 pt-1 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          {unmatchedSources.map(({ source, count }) => (
            <span key={source} className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-slate-300" />
              {source} ({count})
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes crosscheck-row {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
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
        {/* Cross-check section */}
        {transactions && transactions.length > 0 && (
          <CurrentVsRecommended transactions={transactions} productCards={productCards} />
        )}

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
