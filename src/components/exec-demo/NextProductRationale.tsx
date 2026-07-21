import { useEffect, useState, useCallback, Fragment } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Sparkles, ArrowRight, TrendingUp, CreditCard, CheckCircle2, Star, Smartphone, Mail, UserCheck, CalendarCheck, Heart, Gift, Shield, Lightbulb, Compass, PenLine, Cake, Plane, Home, Briefcase, Bell, Flower, ArrowUp, ArrowDown, Minus, Gauge } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PillarRollup } from "./ExecDemoIntelPanel";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { ProductCard } from "./ProductCardsPhoneView";
import type { Transaction } from "./execDemoData";
import ProductDeliveryChannelCard, { type ProductDeliveryChannel } from "./ProductDeliveryChannelCard";

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

export interface CreditAssessment {
  score: number;
  band: "Excellent" | "Good" | "Fair" | "Limited" | "Poor";
  confidence: number;
  summary: string;
  drivers: { label: string; direction: "positive" | "negative" | "neutral"; weight: number; explanation: string }[];
  affordability: {
    estimated_monthly_inflow: number;
    estimated_monthly_outflow: number;
    estimated_dti_proxy: number;
    surplus_ratio: number;
  };
  signals: {
    income_stability: "stable" | "variable" | "thin" | "unknown";
    cashflow_volatility: "low" | "medium" | "high";
    discretionary_pressure: "low" | "medium" | "high";
    distress_indicators: string[];
    positive_indicators: string[];
  };
  recommended_products: { product: string; rationale: string }[];
  caveats: string[];
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
  onTriggerPillClick?: (label: string, txIndices: number[], color: string, kind?: "lifeEvent" | "risk") => void;
  activeTriggerLabel?: string | null;
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
  pillarRollups?: PillarRollup[];
  riskFlags?: { flags: any[]; summary: string } | null;
  financialSignals?: any[];
  creditAssessment?: CreditAssessment | null;
  creditLoading?: boolean;
  deliveryChannel?: ProductDeliveryChannel;
  onDeliveryChannelChange?: (channel: ProductDeliveryChannel) => void;
}

/** Compute the first risk rollup pill (mirrors logic in ExecDemoIntelPanel) */
function getFirstRiskRollup(riskFlags?: { flags: any[]; summary: string } | null): { label: string; severity: "low" | "medium" | "high"; count: number } | null {
  if (!riskFlags || !riskFlags.flags || riskFlags.flags.length === 0) return null;
  const SEV_RANK: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const groupKeyFor = (f: any): { key: string; label: string } => {
    const grp = String(f.category_group || f.category || "").toLowerCase();
    const lbl = String(f.category_label || "").toLowerCase();
    if (grp === "vice" && lbl.includes("adult")) return { key: "adult", label: "Adult Entertainment" };
    if (grp === "vice") return { key: "gambling", label: "Gambling" };
    if (grp === "financial_distress") return { key: "financial_vulnerability", label: "Financial Vulnerability" };
    if (grp === "suspicious_international") return { key: "suspicious_international", label: "Suspicious International" };
    if (grp === "aml") return { key: "aml", label: "AML" };
    const raw = f.category_label || f.category_group || f.category || "Risk";
    return { key: String(raw).toLowerCase(), label: String(raw) };
  };
  type R = { key: string; label: string; severity: "low" | "medium" | "high"; txIds: Set<string> };
  const map = new Map<string, R>();
  const seen = new Set<string>();
  riskFlags.flags.forEach((f: any) => {
    const { key, label } = groupKeyFor(f);
    const txId = f.transaction_id || `pattern::${key}`;
    const dedupeKey = `${txId}::${key}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    let r = map.get(key);
    if (!r) { r = { key, label, severity: "low", txIds: new Set() }; map.set(key, r); }
    const sev = (f.severity || "low") as "low" | "medium" | "high";
    if ((SEV_RANK[sev] || 1) > (SEV_RANK[r.severity] || 1)) r.severity = sev;
    r.txIds.add(txId);
  });
  const ORDER = ["gambling", "financial_vulnerability", "adult", "suspicious_international", "aml"];
  const sorted = Array.from(map.values()).sort((a, b) => {
    const ai = ORDER.indexOf(a.key); const bi = ORDER.indexOf(b.key);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const first = sorted[0];
  if (!first) return null;
  return { label: first.label, severity: first.severity, count: first.txIds.size };
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
    <div className="mb-1 flex flex-wrap items-center gap-1.5">
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
  const sorted = [...PRODUCT_CATALOG].sort((a, b) => {
    const aMatch = recommendedNames.some(r => r.includes(a.toLowerCase()) || a.toLowerCase().includes(r));
    const bMatch = recommendedNames.some(r => r.includes(b.toLowerCase()) || b.toLowerCase().includes(r));
    return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
  });
  const visible = sorted.slice(0, 5);
  const remaining = PRODUCT_CATALOG.length - 5;

  return (
    <div className="mb-1 flex flex-wrap items-center gap-1.5">
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

/* ─── Resolved card data (pill + matched evidence) ─── */
interface ResolvedCard {
  card: ProductCard;
  origIdx: number;
  isBehavioral: boolean;
  resolvedLabel: string;
  resolvedCount: number;
  resolvedSpend: number;
  color: { bg: string; text: string; dot: string; border: string };
  matchedIndices: number[];
  matchedKind?: "lifeEvent" | "risk";
  isClickable: boolean;
}

function resolveCard(
  card: ProductCard,
  origIdx: number,
  lifeEvents: LifeEvent[] | null,
  pillarRollups: PillarRollup[] | undefined,
  transactions: Transaction[] | undefined,
  financialSignals: any[] | undefined,
): ResolvedCard {
  const isBehavioral = card.type === "behavioral";
  const isFinancialSignal = card.type === "financial_signal";

  // Financial signal card → match against financialSignals by label / product_family
  const matchingFinancial = (() => {
    if (!isFinancialSignal || !financialSignals || financialSignals.length === 0) return null;
    const cardLabel = card.signal_label.toLowerCase();
    return (
      financialSignals.find((f: any) => (f.label || "").toLowerCase() === cardLabel)
      || financialSignals.find((f: any) => {
        const fl = (f.label || "").toLowerCase();
        const pf = (f.product_family || "").toLowerCase();
        return fl.includes(cardLabel) || cardLabel.includes(fl) || (pf && cardLabel.includes(pf));
      })
      || financialSignals[0]
    );
  })();

  const matchingEvent = lifeEvents?.find(e =>
    e.event_name.toLowerCase().includes(card.signal_label.toLowerCase()) ||
    card.signal_label.toLowerCase().includes(e.event_name.toLowerCase())
  );

  const matchedRollup = (() => {
    if (!isBehavioral || !pillarRollups || pillarRollups.length === 0) return null;
    const tokenize = (s: string) => s.toLowerCase().split(/[\s,&/-]+/).filter(w => w.length > 2);
    const cardTokens = new Set([
      ...tokenize(card.signal_label),
      ...tokenize(card.theme || ""),
    ]);
    let best: PillarRollup | null = null;
    let bestScore = 0;
    pillarRollups.forEach(r => {
      const rTokens = [
        ...tokenize(r.label),
        ...tokenize(r.pillar),
        ...(r.categories || []).flatMap(tokenize),
      ];
      const score = rTokens.filter(t => cardTokens.has(t)).length;
      if (score > bestScore) { bestScore = score; best = r; }
    });
    return bestScore > 0 ? best : pillarRollups[0];
  })();

  const color = isFinancialSignal
    ? { bg: "#f1f5f9", text: "#0f172a", dot: "#475569", border: "#cbd5e1" }
    : isBehavioral && matchedRollup
      ? (() => {
          const rc = getColor(matchedRollup.pillar);
          return { bg: rc.bg, text: rc.text, dot: rc.dot, border: rc.bg };
        })()
      : isBehavioral
        ? { bg: "#f0f9ff", text: "#0c4a6e", dot: "#3b82f6", border: "#bfdbfe" }
        : getColor(card.theme === "education" ? "Education & Family" : card.theme === "home" ? "Home & Living" : "Financial Planning");

  const hasEvidence = !!matchingEvent && matchingEvent.evidence.length > 0;

  const resolvedLabel = matchingFinancial?.label
    || matchedRollup?.label
    || (matchingEvent?.event_name)
    || card.signal_label;
  const resolvedCount = (matchingFinancial?.transaction_indices?.length)
    ?? matchedRollup?.totalCount
    ?? (matchingEvent?.evidence?.length)
    ?? 0;
  const resolvedSpend = matchedRollup?.totalSpend ?? (matchingEvent
    ? matchingEvent.evidence.reduce((s, ev) => s + Math.abs(parseFloat(String(ev.amount || "0").replace(/[$,]/g, "")) || 0), 0)
    : 0);

  const signalKeywords = resolvedLabel.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

  let matchedIndices: number[] = [];
  let matchedKind: "lifeEvent" | "risk" | undefined;

  if (matchingFinancial?.transaction_indices?.length) {
    matchedIndices = matchingFinancial.transaction_indices;
  } else if (matchedRollup?.txIndices && matchedRollup.txIndices.length > 0) {
    matchedIndices = matchedRollup.txIndices;
  } else if (transactions) {
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
      matchedKind = "lifeEvent";
    } else {
      matchedIndices = transactions
        .map((tx, idx) => {
          const hay = (tx.merchant || "").toLowerCase();
          const isMatch = signalKeywords.some(kw => hay.includes(kw));
          return isMatch ? idx : -1;
        })
        .filter(idx => idx !== -1);
    }
  }

  const isClickable = matchedIndices.length > 0;

  return {
    card,
    origIdx,
    isBehavioral,
    resolvedLabel,
    resolvedCount,
    resolvedSpend,
    color,
    matchedIndices,
    matchedKind,
    isClickable,
  };
}

/* ─── Action pills (extracted) ─── */
function ActionPillsRow({
  origIdx,
  isBehavioral,
  productActions,
  actionsLoading,
}: {
  origIdx: number;
  isBehavioral: boolean;
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
}) {
  const dynamicActions = productActions?.find(ca => ca.card_index === origIdx)?.actions;

  const renderPill = (action: CardAction, ai: number) => {
    const IconComp = ICON_MAP[action.icon] || Bell;
    const colors = COLOR_MAP[action.color] || COLOR_MAP.blue;
    const isWow = action.tone === "wow";
    return (
      <span
        key={ai}
        className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2.5 py-1 border ${colors.text} ${colors.bg} ${colors.border} ${isWow ? "ring-1 ring-offset-1" : ""}`}
        style={isWow ? { boxShadow: "0 0 0 1px currentColor" } : undefined}
      >
        {isWow && <Sparkles className="w-2 h-2 text-amber-400" />}
        <IconComp className="w-2.5 h-2.5" />
        {action.label}
      </span>
    );
  };

  if (dynamicActions && dynamicActions.length > 0) {
    const standard = dynamicActions.filter(a => a.tone === "standard");
    const wow = dynamicActions.filter(a => a.tone === "wow");
    return (
      <div className="mt-2 space-y-1.5">
        {standard.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">Standard Response</span>
            {standard.map((action, ai) => renderPill(action, ai))}
          </div>
        )}
        {wow.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">Concierge Touch</span>
            {wow.map((action, ai) => renderPill(action, ai))}
          </div>
        )}
      </div>
    );
  }

  if (actionsLoading) {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-300 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5 animate-pulse">
          <Sparkles className="w-2.5 h-2.5" /> Generating actions...
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">Standard Response</span>
        {isBehavioral ? (
          <>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
              <Smartphone className="w-3 h-3" /> Signal Sent to Mobile App
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
              <Mail className="w-3 h-3" /> Triggered Email Campaign
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-1">
              <UserCheck className="w-3 h-3" /> Notify Wealth Advisor
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-1">
              <CalendarCheck className="w-3 h-3" /> Schedule Review Meeting
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Offer details derivation (heuristic from product name + theme) ─── */
function deriveOfferDetails(card: ProductCard, isBehavioral: boolean): {
  headline: string;
  benefits: string[];
  eligibility: string;
  cta: string;
  ctaSub: string;
} {
  const name = card.product_name.toLowerCase();
  const theme = (card.theme || "").toLowerCase();

  // Travel
  if (name.includes("travel") || theme === "travel") {
    return {
      headline: "Earn 2x miles on every purchase",
      benefits: [
        "75,000 bonus miles after $4,000 spend in 3 months",
        "$300 annual travel credit",
        "No foreign transaction fees · Priority Pass lounge access",
      ],
      eligibility: "Pre-approved · No impact to credit score to check",
      cta: "Apply in 60 Seconds",
      ctaSub: "Instant decision · Digital card on approval",
    };
  }
  // 529 / Education
  if (name.includes("529") || theme === "education") {
    return {
      headline: "Tax-advantaged college savings",
      benefits: [
        "Tax-free growth on qualified education expenses",
        "State tax deduction up to $10,000 annually",
        "Flexible — use for tuition, room & board, K-12, even student loans",
      ],
      eligibility: "Open with as little as $25 · No income limits",
      cta: "Open 529 Plan",
      ctaSub: "Funded in under 5 minutes",
    };
  }
  // HYSA / Savings
  if (name.includes("hysa") || name.includes("savings") || name.includes("high-yield")) {
    return {
      headline: "4.50% APY — 10x the national average",
      benefits: [
        "No minimum balance · No monthly fees",
        "FDIC insured up to $250,000",
        "Unlimited transfers to your checking account",
      ],
      eligibility: "Available to all primary checking customers",
      cta: "Move Funds & Start Earning",
      ctaSub: "Funds available next business day",
    };
  }
  // Home / HELOC / Mortgage
  if (name.includes("home equity") || name.includes("heloc") || name.includes("mortgage") || theme === "home") {
    return {
      headline: "Tap into your home's equity — variable rate from 7.99% APR",
      benefits: [
        "Borrow up to 85% of appraised value",
        "Interest may be tax-deductible (consult tax advisor)",
        "Draw funds as needed for 10 years",
      ],
      eligibility: "Pre-qualified based on relationship · Soft credit pull only",
      cta: "Start Pre-Qualification",
      ctaSub: "Get an estimated line in 3 minutes",
    };
  }
  // Brokerage / Investing / Merrill
  if (name.includes("brokerage") || name.includes("merrill") || name.includes("invest")) {
    return {
      headline: "Self-directed investing with $0 online stock trades",
      benefits: [
        "$0 commission on online U.S. stock & ETF trades",
        "Preferred Rewards bonus: up to 75% off trade costs",
        "Research from BofA Global Research at no cost",
      ],
      eligibility: "Open with no minimum · Linked to your checking",
      cta: "Open Investment Account",
      ctaSub: "Funded directly from your accounts",
    };
  }
  // Retirement / IRA
  if (name.includes("ira") || name.includes("retirement") || theme === "retirement") {
    return {
      headline: "Tax-advantaged retirement account",
      benefits: [
        "Up to $7,000 annual contribution ($8,000 if 50+)",
        "Choice of Traditional (tax-deferred) or Roth (tax-free growth)",
        "Wide selection of mutual funds, ETFs & target-date options",
      ],
      eligibility: "Eligible based on earned income · No account minimums",
      cta: "Open IRA Account",
      ctaSub: "Set up automatic contributions",
    };
  }
  // Cash back / Credit card default
  if (name.includes("cash") || name.includes("rewards card") || name.includes("credit card")) {
    return {
      headline: "Up to 3% cash back in your top spending category",
      benefits: [
        "$200 cash rewards bonus after $1,000 spend in 90 days",
        "3% in your choice category · 2% groceries · 1% everywhere",
        "Preferred Rewards customers earn 25–75% more",
      ],
      eligibility: "Pre-approved · Soft credit check only",
      cta: "Claim Pre-Approval",
      ctaSub: "Decision in seconds · Use card immediately",
    };
  }
  // Business
  if (name.includes("business") || theme === "business") {
    return {
      headline: "Built for owners — earn rewards on every dollar",
      benefits: [
        "Unlimited 1.5% cash back on all purchases",
        "$300 statement credit after $3,000 spend in 90 days",
        "Free employee cards with spending controls",
      ],
      eligibility: "Available to qualifying business banking clients",
      cta: "Apply for Business Card",
      ctaSub: "Decision typically within 1 business day",
    };
  }
  // Generic fallback
  return {
    headline: isBehavioral
      ? "A product designed around how you already spend"
      : "Built to support this next chapter",
    benefits: [
      "Personalized terms based on your relationship with us",
      "No application fee · Soft credit check only",
      "Dedicated specialist available to walk you through it",
    ],
    eligibility: "Pre-qualified based on your account history",
    cta: "Explore This Offer",
    ctaSub: "See full terms and personalized rate",
  };
}

/* ─── Single product card body ─── */
function ProductCardBody({
  resolved,
  index,
}: {
  resolved: ResolvedCard;
  index: number;
}) {
  const { card, color: c, isBehavioral } = resolved;
  const fallback = deriveOfferDetails(card, isBehavioral);
  const offer = {
    headline: card.offer_headline?.trim() || fallback.headline,
    benefits: (card.benefits && card.benefits.length > 0) ? card.benefits : fallback.benefits,
    eligibility: card.eligibility?.trim() || fallback.eligibility,
    cta: card.cta?.trim() || fallback.cta,
    ctaSub: card.cta_sub?.trim() || fallback.ctaSub,
  };
  return (
    <div
      className="rounded-xl border overflow-hidden bg-white h-full flex flex-col"
      style={{
        borderColor: c.border,
        borderLeftWidth: 3,
        borderLeftColor: c.dot,
        animation: `exec-product-reveal 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      <div className="px-3 py-3 space-y-3 flex flex-col flex-1">
        {/* Product name + quote */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[14px] font-bold text-slate-800">{card.product_name}</span>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed italic">
            "{card.quote}"
          </p>
        </div>

        {/* Offer headline */}
        <div
          className="rounded-lg px-3 py-2"
          style={{ background: `${c.dot}10`, border: `1px solid ${c.dot}25` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3" style={{ color: c.dot }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: c.text }}>
              The Offer
            </span>
          </div>
          <p className="text-[12px] font-semibold text-slate-800 leading-snug">
            {offer.headline}
          </p>
        </div>
        {/* Spacer pushes eligibility + CTA to the bottom so CTAs align across cards */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="pt-1">
          <button
            className="w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-bold text-white rounded-lg px-3 py-2.5 transition-all hover:opacity-90"
            style={{ background: c.dot, boxShadow: `0 2px 8px ${c.dot}40` }}
          >
            {offer.cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Group slideshow ─── */
function GroupSlideshow({
  title,
  resolvedCards,
  activeTriggerLabel,
  onTriggerPillClick,
  productActions,
  actionsLoading,
}: {
  title: string;
  resolvedCards: ResolvedCard[];
  activeTriggerLabel?: string | null;
  onTriggerPillClick?: Props["onTriggerPillClick"];
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance
  useEffect(() => {
    if (!emblaApi || isPaused || resolvedCards.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused, resolvedCards.length]);

  if (resolvedCards.length === 0) return null;

  const handlePillClick = (idx: number) => {
    const r = resolvedCards[idx];
    if (r.isClickable && onTriggerPillClick) {
      onTriggerPillClick(r.resolvedLabel, r.matchedIndices, r.color.dot, r.matchedKind);
    }
    if (emblaApi && idx !== selectedIndex) {
      emblaApi.scrollTo(idx);
    }
  };

  const isSingle = resolvedCards.length === 1;

  return (
    <div className="space-y-2">
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{title}</div>

      {/* Pill row */}
      <div className="flex items-center gap-2 flex-wrap">
        {resolvedCards.map((r, idx) => {
          const isActive = activeTriggerLabel === r.resolvedLabel || (!activeTriggerLabel && idx === selectedIndex);
          const isCurrent = idx === selectedIndex;
          return (
            <div
              key={idx}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${r.isClickable ? "cursor-pointer" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${r.color.dot}10, ${r.color.dot}20)`,
                color: r.color.text,
                border: isCurrent ? `2px solid ${r.color.dot}` : `1.5px solid ${r.color.dot}80`,
                boxShadow: isCurrent ? `0 0 14px ${r.color.dot}30` : `0 2px 8px ${r.color.dot}15`,
                transform: isCurrent ? "scale(1.06)" : "scale(1)",
                opacity: isCurrent ? 1 : 0.75,
                transition: "all 0.2s ease",
              }}
              onClick={() => handlePillClick(idx)}
            >
              <span style={{ color: r.color.dot }}>✦</span>
              {r.resolvedLabel}
              {r.resolvedCount > 0 && (
                <span className="text-[9px] font-medium opacity-70 ml-1 tabular-nums">
                  {r.resolvedCount} txns · {formatSpend(r.resolvedSpend)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Carousel or single card */}
      {isSingle ? (
        <ProductCardBody
          resolved={resolvedCards[0]}
          index={0}
        />
      ) : (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {resolvedCards.map((r, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 pr-1">
                  <ProductCardBody
                    resolved={r}
                    index={idx}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {resolvedCards.map((r, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === selectedIndex ? 16 : 6,
                  height: 6,
                  background: idx === selectedIndex ? r.color.dot : "#cbd5e1",
                }}
                aria-label={`Show card ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Creditworthiness column (4th column in Next-Product row) ─── */
const BAND_COLORS: Record<CreditAssessment["band"], { dot: string; text: string; bg: string; border: string }> = {
  Excellent: { dot: "#10b981", text: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" },
  Good:      { dot: "#3b82f6", text: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe" },
  Fair:      { dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  Limited:   { dot: "#64748b", text: "#334155", bg: "#f8fafc", border: "#e2e8f0" },
  Poor:      { dot: "#f43f5e", text: "#9f1239", bg: "#fff1f2", border: "#fecdd3" },
};

const LEVEL_TONE: Record<string, { text: string; bg: string; border: string }> = {
  stable:   { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  variable: { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100" },
  thin:     { text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  unknown:  { text: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200" },
  low:      { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  medium:   { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100" },
  high:     { text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-100" },
};

function CreditworthinessBanner({ assessment, loading }: { assessment?: CreditAssessment | null; loading: boolean }) {
  return (
    <div
      className="h-full rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-center gap-2"
      style={{ animation: `exec-product-reveal 0.4s ease-out both` }}
    >
      <Gauge className="w-4 h-4 text-slate-400" />
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creditworthiness</div>
      <span className="text-slate-300">·</span>
      <div className="text-[12px] font-semibold text-slate-500">Coming soon</div>
    </div>
  );
}

export default function NextProductRationale({ lifeEvents, loading, productCards, transactions, onTriggerPillClick, activeTriggerLabel, productActions, actionsLoading, pillarRollups, riskFlags, creditAssessment, creditLoading, deliveryChannel = "mobile", onDeliveryChannelChange }: Props) {

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

  if (productCards && productCards.length > 0) {
    // Resolve all cards and show up to 3 — interleave life-event, behavioral, then any extras (e.g. risk)
    const resolvedAll = productCards.map((card, origIdx) =>
      resolveCard(card, origIdx, lifeEvents, pillarRollups, transactions)
    );
    const lifeEventResolved = resolvedAll.filter(r => !r.isBehavioral);
    const behavioralResolved = resolvedAll.filter(r => r.isBehavioral);

    const pickedCards: ResolvedCard[] = [];
    if (lifeEventResolved[0]) pickedCards.push(lifeEventResolved[0]);
    if (behavioralResolved[0]) pickedCards.push(behavioralResolved[0]);
    // Fill remaining slots up to 3 from any leftover cards (third is typically the risk card)
    for (const r of resolvedAll) {
      if (pickedCards.length >= 3) break;
      if (!pickedCards.includes(r)) pickedCards.push(r);
    }

    const RISK_THEMES = new Set(["risk", "account_care", "wellness_finance", "hardship", "support"]);
    const labelFor = (resolved: ResolvedCard, idx: number): string => {
      const theme = (resolved.card.theme || "").toLowerCase();
      if (RISK_THEMES.has(theme)) return "Account Care";
      if (idx >= 2) return "Additional Tools";
      return resolved.isBehavioral ? "Shopping Habit" : "Life Event";
    };

    const firstRisk = getFirstRiskRollup(riskFlags);
    const RISK_RED = { dot: "#ef4444", text: "#991b1b" };

    const renderColumn = (resolved: ResolvedCard, idx: number) => {
      const useRiskPill = idx >= 2 && firstRisk;
      const pillLabel = useRiskPill ? firstRisk!.label : resolved.resolvedLabel;
      const pillColor = useRiskPill ? RISK_RED : { dot: resolved.color.dot, text: resolved.color.text };
      const isActive = !useRiskPill && activeTriggerLabel === resolved.resolvedLabel;
      const clickable = !useRiskPill && resolved.isClickable;
      return (
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {labelFor(resolved, idx)}
          </div>
          <div
            className={`self-start inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${clickable ? "cursor-pointer" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${pillColor.dot}10, ${pillColor.dot}20)`,
              color: pillColor.text,
              border: isActive ? `2px solid ${pillColor.dot}` : `1.5px solid ${pillColor.dot}80`,
              boxShadow: isActive ? `0 0 14px ${pillColor.dot}30` : `0 2px 8px ${pillColor.dot}15`,
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              if (clickable && onTriggerPillClick) {
                onTriggerPillClick(resolved.resolvedLabel, resolved.matchedIndices, resolved.color.dot, resolved.matchedKind);
              }
            }}
          >
            <span style={{ color: pillColor.dot }}>✦</span>
            {pillLabel}
            {useRiskPill ? (
              <span className="text-[9px] font-medium opacity-70 ml-1 tabular-nums">
                {firstRisk!.count} txns · {firstRisk!.severity}
              </span>
            ) : (
              resolved.resolvedCount > 0 && (
                <span className="text-[9px] font-medium opacity-70 ml-1 tabular-nums">
                  {resolved.resolvedCount} txns · {formatSpend(resolved.resolvedSpend)}
                </span>
              )
            )}
          </div>
          <div className="flex-1 flex">
            <ProductCardBody
              resolved={resolved}
              index={idx}
            />
          </div>
        </div>
      );
    };

    return (
      <div className="px-3 py-3 space-y-4 overflow-y-auto">
        {/* Current holdings pills */}
        {transactions && transactions.length > 0 && (
          <CurrentHoldingsPills transactions={transactions} />
        )}

        {/* Product catalog pills */}
        <RecommendedProductsPills productCards={productCards} />

        {/* Delivery channel selector + creditworthiness banner side-by-side */}
        {(onDeliveryChannelChange || creditAssessment || creditLoading) && (
          <div className="flex items-stretch gap-3">
            {onDeliveryChannelChange && (
              <div className="flex-[2] min-w-0">
                <ProductDeliveryChannelCard value={deliveryChannel} onChange={onDeliveryChannelChange} />
              </div>
            )}
            {(creditAssessment || creditLoading) && (
              <div className="flex-[1] min-w-0">
                <CreditworthinessBanner assessment={creditAssessment} loading={!!creditLoading} />
              </div>
            )}
          </div>
        )}

        {/* Up to 3 products side-by-side with vertical dividers */}
        <div className="flex items-stretch gap-3">
          {pickedCards.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <div className="w-px bg-slate-200 self-stretch shrink-0" />}
              {renderColumn(c, i)}
            </Fragment>
          ))}
        </div>

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
