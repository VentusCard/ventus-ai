import { Sparkles, ArrowRight, TrendingUp, CreditCard, CheckCircle2, Star, Smartphone, Mail, UserCheck, CalendarCheck, Heart, Gift, Shield, Lightbulb, Compass, PenLine, Cake, Plane, Home, Briefcase, Bell, Flower } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "./ProductCardsPhoneView";
import type { Transaction } from "./execDemoData";

export interface CardAction {
  label: string;
  icon: string;
  color: string;
  tone: "standard" | "wow";
}

export interface CardActions {
  card_index: number;
  actions: CardAction[];
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  smartphone: Smartphone, mail: Mail, "user-check": UserCheck, calendar: CalendarCheck,
  heart: Heart, gift: Gift, shield: Shield, lightbulb: Lightbulb, star: Star,
  compass: Compass, flower: Flower, "pen-line": PenLine, cake: Cake, plane: Plane,
  home: Home, briefcase: Briefcase, bell: Bell,
};

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  violet: { text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  teal: { text: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  rose: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  sky: { text: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
  orange: { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  indigo: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  pink: { text: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
};

interface Props {
  lifeEvents: LifeEvent[] | null;
  loading: boolean;
  productCards?: ProductCard[] | null;
  transactions?: Transaction[];
  onTriggerPillClick?: (label: string, txIndices: number[], color: string) => void;
  activeTriggerLabel?: string | null;
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
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

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

const PRODUCT_CATALOG = [
  "Travel Card", "529 Plan", "HYSA", "Home Equity Line", "Auto Loan",
  "CD Ladder", "Premium Card", "Life Insurance", "Brokerage Account",
  "Student Loan Refi", "Balance Transfer Card", "Business Card",
];

function RecommendedProductsPills({ productCards }: { productCards: ProductCard[] }) {
  const recommendedNames = productCards.map(c => c.product_name.toLowerCase());

  // Sort so matched (blue) pills come first, then take first 5
  const sorted = [...PRODUCT_CATALOG].sort((a, b) => {
    const aMatch = recommendedNames.some(r => r.includes(a.toLowerCase()) || a.toLowerCase().includes(r));
    const bMatch = recommendedNames.some(r => r.includes(b.toLowerCase()) || b.toLowerCase().includes(r));
    return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
  });
  const visible = sorted.slice(0, 5);
  const remaining = PRODUCT_CATALOG.length - 5;

  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Product Catalog</span>
      {visible.map(name => {
        const isMatch = recommendedNames.some(r => r.includes(name.toLowerCase()) || name.toLowerCase().includes(r));
        return (
          <span
            key={name}
            className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border ${
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
      {remaining > 0 && (
        <span className="text-[10px] text-slate-300 font-medium">+{remaining} more</span>
      )}
    </div>
  );
}

export default function NextProductRationale({ lifeEvents, loading, productCards, transactions, onTriggerPillClick, activeTriggerLabel, productActions, actionsLoading }: Props) {

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
        {[...productCards].map((card, origIdx) => ({ card, origIdx }))
          .sort((a, b) => {
            if (a.card.type === "behavioral" && b.card.type !== "behavioral") return 1;
            if (a.card.type !== "behavioral" && b.card.type === "behavioral") return -1;
            return 0;
          })
          .map(({ card, origIdx }, i) => {
          const isBehavioral = card.type === "behavioral";
          const c = isBehavioral
            ? { bg: "#f0f9ff", text: "#0c4a6e", dot: "#3b82f6", border: "#bfdbfe" }
            : getColor(card.theme === "education" ? "Education & Family" : card.theme === "home" ? "Home & Living" : "Financial Planning");

          const matchingEvent = lifeEvents?.find(e =>
            e.event_name.toLowerCase().includes(card.signal_label.toLowerCase()) ||
            card.signal_label.toLowerCase().includes(e.event_name.toLowerCase())
          );
          const hasEvidence = !!matchingEvent && matchingEvent.evidence.length > 0;
          const isActive = activeTriggerLabel === card.signal_label;

          // Build keyword list from the signal label for fallback matching
          const signalKeywords = card.signal_label.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

          const handlePillClick = () => {
            if (!transactions || !onTriggerPillClick) return;

            let matchedIndices: number[] = [];

            if (hasEvidence && matchingEvent) {
              const evidenceMerchants = matchingEvent.evidence.map(ev => ev.merchant.toLowerCase());
              matchedIndices = transactions
                .map((tx, idx) => {
                  const merchant = (tx.merchant || "").toLowerCase();
                  const isMatch = evidenceMerchants.some(em =>
                    merchant.includes(em) || em.includes(merchant)
                  );
                  return isMatch ? idx : -1;
                })
                .filter(idx => idx !== -1);
            } else {
              matchedIndices = transactions
                .map((tx, idx) => {
                  const hay = (tx.merchant || "").toLowerCase();
                  const isMatch = signalKeywords.some(kw => hay.includes(kw));
                  return isMatch ? idx : -1;
                })
                .filter(idx => idx !== -1);
            }

            if (matchedIndices.length > 0) {
              onTriggerPillClick(card.signal_label, matchedIndices, c.dot);
            }
          };

          // Pre-compute matched indices for pill stats
          let pillMatchedIndices: number[] = [];
          if (transactions) {
            if (hasEvidence && matchingEvent) {
              const evidenceMerchants = matchingEvent.evidence.map(ev => ev.merchant.toLowerCase());
              pillMatchedIndices = transactions
                .map((tx, idx) => {
                  const merchant = (tx.merchant || "").toLowerCase();
                  return evidenceMerchants.some(em => merchant.includes(em) || em.includes(merchant)) ? idx : -1;
                })
                .filter(idx => idx !== -1);
            } else {
              pillMatchedIndices = transactions
                .map((tx, idx) => {
                  const hay = (tx.merchant || "").toLowerCase();
                  return signalKeywords.some(kw => hay.includes(kw)) ? idx : -1;
                })
                .filter(idx => idx !== -1);
            }
          }
          const txnCount = pillMatchedIndices.length;
          const txnSpend = transactions ? pillMatchedIndices.reduce((sum, idx) => {
            const raw = String(transactions[idx]?.amount || "").replace(/[$,]/g, "");
            return sum + Math.abs(parseFloat(raw) || 0);
          }, 0) : 0;

          const isClickable = hasEvidence || (transactions && signalKeywords.length > 0);

          return (
            <div key={i} className="space-y-0">
              {/* Type label + Trigger pill */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold shrink-0" style={{ color: c.dot }}>
                  {isBehavioral ? "Behavioral:" : "Life Event:"}
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full ${isClickable ? "cursor-pointer" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${c.dot}10, ${c.dot}20)`,
                    color: c.text,
                    border: isActive ? `2px solid ${c.dot}` : `1.5px solid ${c.dot}`,
                    boxShadow: isActive ? `0 0 14px ${c.dot}30` : `0 2px 8px ${c.dot}15`,
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={handlePillClick}
                >
                  <span style={{ color: c.dot }}>✦</span>
                  {card.signal_label}
                  {txnCount > 0 && (
                    <span className="text-[9px] font-medium opacity-70 ml-1">
                      {txnCount} txns · {formatSpend(txnSpend)}
                    </span>
                  )}
                </div>
              </div>

              {/* Product card */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: c.border,
                  borderLeftWidth: 3,
                  borderLeftColor: c.dot,
                  animation: `exec-product-reveal 0.4s ease-out ${i * 0.15}s both`,
                }}
              >
                <div className="px-3 py-2.5">
                  {/* Product name */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[12px] font-bold text-slate-800">{card.product_name}</span>
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
                  {/* Action pills — dynamic or fallback */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {(() => {
                      const cardIdx = i;
                      const dynamicActions = productActions?.find(ca => ca.card_index === cardIdx)?.actions;
                      
                      if (dynamicActions && dynamicActions.length > 0) {
                        return dynamicActions.map((action, ai) => {
                          const IconComp = ICON_MAP[action.icon] || Bell;
                          const colors = COLOR_MAP[action.color] || COLOR_MAP.blue;
                          const isWow = action.tone === "wow";
                          return (
                            <span
                              key={ai}
                              className={`inline-flex items-center gap-1 text-[9px] font-medium rounded-full px-2 py-0.5 border ${colors.text} ${colors.bg} ${colors.border} ${isWow ? "ring-1 ring-offset-1" : ""}`}
                              style={isWow ? { boxShadow: "0 0 0 1px currentColor" } : undefined}
                            >
                              {isWow && <Sparkles className="w-2 h-2 text-amber-400" />}
                              <IconComp className="w-2.5 h-2.5" />
                              {action.label}
                            </span>
                          );
                        });
                      }
                      
                      // Fallback: loading or hardcoded
                      if (actionsLoading) {
                        return (
                          <>
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-300 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5 animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" /> Generating actions...
                            </span>
                          </>
                        );
                      }
                      
                      // Static fallback
                      return isBehavioral ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                            <Smartphone className="w-2.5 h-2.5" /> Signal Sent to Mobile App
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                            <Mail className="w-2.5 h-2.5" /> Triggered Email Campaign
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Notify Wealth Advisor
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
                            <CalendarCheck className="w-2.5 h-2.5" /> Schedule Review Meeting
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Supporting evidence from life events */}

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
