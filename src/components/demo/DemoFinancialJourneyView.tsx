import { useState, useMemo } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import {
  JOURNEY_PRODUCTS,
  JOURNEY_CATEGORIES,
  type JourneyProduct,
  type JourneyCategory,
} from "@/lib/financialJourneyData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  CreditCard,
  Landmark,
  HandCoins,
  TrendingUp,
  ShieldCheck,
  Crown,
  Scale,
  Mail,
  MessageSquare,
  Bell,
  Zap,
  CheckCircle2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Props ── */
interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  detectedEventA: DetectedLifeEventResult[];
  detectedEventB: DetectedLifeEventResult[];
}

/* ── Source → Product name mapping ── */
const SOURCE_TO_PRODUCT: Record<string, string> = {
  "Premium Card": "World Elite",
  "Cashback Card": "Basic Cashback",
  "Travel Card": "Travel Rewards",
  Checking: "Checking",
  HSA: "HSA",
  Savings: "Savings",
  "Business Card": "Business Card",
  "Student Card": "Student Card",
};

/* ── Source pill colors ── */
const SOURCE_PILL_COLORS: Record<string, string> = {
  "Premium Card": "bg-purple-50 text-purple-700",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  Checking: "bg-slate-100 text-slate-600",
  HSA: "bg-amber-50 text-amber-700",
  Savings: "bg-teal-50 text-teal-700",
  "Business Card": "bg-indigo-50 text-indigo-700",
  "Student Card": "bg-pink-50 text-pink-700",
};

/* ── Category icons ── */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  credit_cards: CreditCard,
  deposit_accounts: Landmark,
  loans_lending: HandCoins,
  investment_products: TrendingUp,
  insurance: ShieldCheck,
  wealth_management: Crown,
  estate_trust: Scale,
};

/* ── Pillar → product affinity boosts ── */
const PILLAR_PRODUCT_AFFINITY: Record<string, string[]> = {
  travel: ["Travel Rewards", "Premium Travel", "Airline Co-Brand", "Hotel Co-Brand", "Travel Insurance"],
  dining: ["Basic Cashback", "Custom Cashback", "Co-Branded Retail"],
  wellness: ["HSA", "Life Insurance", "Disability Insurance"],
  technology: ["Business Card", "Business Line of Credit"],
  fitness: ["HSA", "Life Insurance"],
  shopping: ["Custom Cashback", "Co-Branded Retail", "Basic Cashback"],
  entertainment: ["Custom Cashback", "Travel Rewards"],
};

/* ── Life event → product affinity ── */
const EVENT_PRODUCT_AFFINITY: Record<string, string[]> = {
  home: ["Home Mortgage", "HELOC", "Home Insurance", "Home Mortgage Refi", "Construction Loan"],
  house: ["Home Mortgage", "HELOC", "Home Insurance"],
  mortgage: ["Home Mortgage", "HELOC", "Home Mortgage Refi"],
  family: ["529 Plan", "Life Insurance", "Education Trust", "Guardianship Services", "Youth / Teen Account"],
  baby: ["529 Plan", "Life Insurance", "Education Trust"],
  child: ["529 Plan", "Education Trust", "Youth / Teen Account"],
  career: ["Brokerage", "Managed Portfolio", "Financial Advisory", "Business Card"],
  promotion: ["Brokerage", "Managed Portfolio", "Premium Travel", "World Elite"],
  retire: ["Traditional IRA", "Roth IRA", "Annuity", "Managed Portfolio", "Estate Planning"],
  business: ["Business Card", "Business Checking", "Business Savings", "Small Business Loan", "Business Line of Credit", "SEP IRA"],
  education: ["529 Plan", "Student Loan Refi", "Education Trust"],
};

/* ── Derive held products from transaction sources ── */
function getHeldProducts(customer: DemoCustomer): Set<string> {
  const held = new Set<string>();
  // Always assume they have Checking + Savings as baseline
  held.add("Checking");
  held.add("Savings");
  for (const txn of customer.sampleTransactions) {
    const src = txn.source;
    if (src && SOURCE_TO_PRODUCT[src]) {
      held.add(SOURCE_TO_PRODUCT[src]);
    }
  }
  return held;
}

/* ── Scored opportunity ── */
interface ScoredOpportunity {
  product: JourneyProduct;
  confidence: number;
  signals: string[];
  nextSteps: string[];
}

/* ── Confidence scoring engine ── */
function scoreOpportunities(
  customer: DemoCustomer,
  heldProducts: Set<string>,
  detectedEvents: DetectedLifeEventResult[],
  allProducts: JourneyProduct[]
): ScoredOpportunity[] {
  const results: ScoredOpportunity[] = [];

  // Pre-compute pillar map
  const pillarMap: Record<string, number> = {};
  for (const p of customer.topPillars) {
    pillarMap[p.name.toLowerCase()] = p.pct;
  }

  // Pre-compute event keywords
  const eventKeywords = detectedEvents.map(e => ({
    event: e,
    words: e.event_name.toLowerCase().split(/\s+/),
  }));

  for (const product of allProducts) {
    if (heldProducts.has(product.name)) continue;

    let score = 15; // base
    const signals: string[] = [];

    // 1. Adjacent product boost — if any held product lists this as nextProductOpportunity
    const adjacentBoost = allProducts
      .filter(p => heldProducts.has(p.name))
      .some(p => p.nextProductOpportunities.includes(product.name));
    if (adjacentBoost) {
      score += 25;
      signals.push("Adjacent to currently held products");
    }

    // 2. Pillar affinity
    for (const [pillar, pct] of Object.entries(pillarMap)) {
      const affinityProducts = PILLAR_PRODUCT_AFFINITY[pillar] ?? [];
      if (affinityProducts.includes(product.name)) {
        score += Math.round(pct * 0.6);
        signals.push(`${pillar.charAt(0).toUpperCase() + pillar.slice(1)} spending at ${pct}%`);
      }
    }

    // 3. Life event match
    for (const { event, words } of eventKeywords) {
      for (const [keyword, products] of Object.entries(EVENT_PRODUCT_AFFINITY)) {
        if (words.some(w => w.includes(keyword)) && products.includes(product.name)) {
          score += Math.round(event.confidence * 0.3);
          signals.push(`Life event: ${event.event_name} (${event.confidence}%)`);
          break;
        }
      }
    }

    // 4. Segment/AUM tier boost for wealth products
    const aum = parseInt(customer.profile.aum?.replace(/[^0-9]/g, "") || "0");
    if (product.category === "wealth_management" || product.category === "estate_trust") {
      if (aum >= 500000) {
        score += 20;
        signals.push(`AUM ${customer.profile.aum} qualifies for premium services`);
      } else if (aum >= 100000) {
        score += 10;
        signals.push(`AUM ${customer.profile.aum} — growth potential`);
      }
    }

    // 5. Penetration rate as a small factor (popular products slightly boosted)
    score += Math.round(product.penetrationRate * 0.15);

    // Cap at 95
    const confidence = Math.min(Math.max(score, 10), 95);

    // Generate next steps
    const nextSteps = generateNextSteps(product, confidence);

    results.push({ product, confidence, signals: signals.slice(0, 3), nextSteps });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

function generateNextSteps(product: JourneyProduct, confidence: number): string[] {
  const steps: string[] = [];
  if (confidence >= 70) {
    steps.push("Schedule personalized outreach with tailored offer");
    steps.push("Include in next relationship review meeting");
  } else if (confidence >= 40) {
    steps.push("Add to awareness campaign drip sequence");
    steps.push("Monitor for signal strengthening triggers");
  } else {
    steps.push("Include in educational content program");
    steps.push("Track behavioral signals for future readiness");
  }
  return steps;
}

function confidenceColor(c: number) {
  if (c >= 70) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (c >= 40) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" };
}

function confidenceLabel(c: number) {
  if (c >= 70) return "High";
  if (c >= 40) return "Medium";
  return "Low";
}

/* ── Financial categories (exclude digital_services) ── */
const FINANCIAL_CATEGORIES = JOURNEY_CATEGORIES.filter(c => c.id !== "digital_services");
const FINANCIAL_PRODUCTS = JOURNEY_PRODUCTS.filter(p => p.category !== "digital_services");

/* ── Main component ── */
export default function DemoFinancialJourneyView({ customerA, customerB, detectedEventA, detectedEventB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <CustomerOpportunities customer={customerA} detectedEvents={detectedEventA} />
      <CustomerOpportunities customer={customerB} detectedEvents={detectedEventB} />
    </div>
  );
}

/* ── Per-customer column ── */
function CustomerOpportunities({ customer, detectedEvents }: { customer: DemoCustomer; detectedEvents: DetectedLifeEventResult[] }) {
  const heldProducts = useMemo(() => getHeldProducts(customer), [customer]);
  const opportunities = useMemo(
    () => scoreOpportunities(customer, heldProducts, detectedEvents, FINANCIAL_PRODUCTS),
    [customer, heldProducts, detectedEvents]
  );

  const highCount = opportunities.filter(o => o.confidence >= 70).length;
  const medCount = opportunities.filter(o => o.confidence >= 40 && o.confidence < 70).length;
  const lowCount = opportunities.filter(o => o.confidence < 40).length;

  // Group by category
  const byCategory = useMemo(() => {
    const map = new Map<JourneyCategory, ScoredOpportunity[]>();
    for (const opp of opportunities) {
      const cat = opp.product.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(opp);
    }
    return map;
  }, [opportunities]);

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{customer.profile.name}</p>
            <p className="text-[10px] text-slate-500">{customer.profile.segment} · AUM {customer.profile.aum}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{opportunities.length}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Opportunities</p>
          </div>
        </div>

        {/* Confidence breakdown */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">{highCount} High</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">{medCount} Medium</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{lowCount} Low</span>
        </div>

        {/* Held products */}
        <div>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currently Held</p>
          <div className="flex flex-wrap gap-1">
            {Array.from(heldProducts).map(name => (
              <Badge key={name} variant="secondary" className="text-[9px] bg-slate-100 text-slate-600 border-transparent">
                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Category sections */}
      {FINANCIAL_CATEGORIES.map(cat => {
        const catOpps = byCategory.get(cat.id);
        if (!catOpps || catOpps.length === 0) return null;
        const CatIcon = CATEGORY_ICONS[cat.id] || Package;
        const topConfidence = catOpps[0].confidence;

        return (
          <CategorySection
            key={cat.id}
            label={cat.label}
            icon={<CatIcon className="w-4 h-4" />}
            color={cat.color}
            textColor={cat.textColor}
            count={catOpps.length}
            topConfidence={topConfidence}
            opportunities={catOpps}
            customerName={customer.profile.name}
          />
        );
      })}
    </div>
  );
}

/* ── Category collapsible section ── */
function CategorySection({
  label, icon, color, textColor, count, topConfidence, opportunities, customerName,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  count: number;
  topConfidence: number;
  opportunities: ScoredOpportunity[];
  customerName: string;
}) {
  const [open, setOpen] = useState(false);
  const cc = confidenceColor(topConfidence);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className={cn(
          "w-full flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left",
          open && "bg-slate-50"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn("p-1.5 rounded-md", color, textColor)}>{icon}</span>
            <span className="text-xs font-semibold text-slate-800">{label}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{count}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", cc.bg, cc.text)}>
              Top: {topConfidence}%
            </span>
            <ChevronRight className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-90")} />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 mt-2 pl-2">
          {opportunities.map((opp, idx) => (
            <ProductCard key={idx} opp={opp} customerName={customerName} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Individual product opportunity card ── */
function ProductCard({ opp, customerName }: { opp: ScoredOpportunity; customerName: string }) {
  const [expanded, setExpanded] = useState(false);
  const cc = confidenceColor(opp.confidence);
  const firstName = customerName.split(" ")[0];

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger asChild>
        <button className={cn(
          "w-full flex items-center justify-between rounded-lg border px-3 py-2 hover:shadow-sm transition-all text-left",
          cc.border, "bg-white"
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-medium text-slate-800 truncate">{opp.product.name}</span>
            {opp.signals.length > 0 && (
              <Badge variant="outline" className="text-[8px] border-transparent bg-purple-50 text-purple-600 shrink-0">
                <Zap className="w-2 h-2 mr-0.5" />
                {opp.signals.length} signal{opp.signals.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cc.bg, cc.text)}>
              {opp.confidence}%
            </span>
            <ChevronRight className={cn("w-3 h-3 text-slate-400 transition-transform", expanded && "rotate-90")} />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-b-lg border border-t-0 border-slate-200 bg-white px-3 py-3 space-y-3">
          {/* Confidence + label */}
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 rounded-full bg-slate-100 flex-1")}>
              <div
                className={cn("h-1.5 rounded-full transition-all", opp.confidence >= 70 ? "bg-emerald-500" : opp.confidence >= 40 ? "bg-amber-500" : "bg-slate-400")}
                style={{ width: `${opp.confidence}%` }}
              />
            </div>
            <span className={cn("text-[9px] font-semibold", cc.text)}>{confidenceLabel(opp.confidence)} Confidence</span>
          </div>

          {/* Signals */}
          {opp.signals.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Signals Detected</p>
              <ul className="space-y-0.5">
                {opp.signals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 leading-snug">
                    <Zap className="w-2.5 h-2.5 text-purple-400 mt-0.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Recommended Next Steps</p>
            <ul className="space-y-0.5">
              {opp.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 leading-snug">
                  <ChevronRight className="w-2.5 h-2.5 text-slate-300 mt-0.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Est. value */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[9px] text-slate-400">
              Est. Annual Revenue: <span className="font-semibold text-emerald-600 text-[10px]">${opp.product.revenuePerCustomer.toLocaleString()}</span>
            </span>
          </div>

          {/* Downstream personalization */}
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Push to Personalization</p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2.5 text-[9px] rounded-md"
                onClick={(e) => { e.stopPropagation(); toast.success(`Email campaign queued for ${firstName} — ${opp.product.name}`); }}
              >
                <Mail className="w-3 h-3 mr-1" />
                Email Campaign
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2.5 text-[9px] rounded-md"
                onClick={(e) => { e.stopPropagation(); toast.success(`SMS outreach scheduled for ${firstName} — ${opp.product.name}`); }}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2.5 text-[9px] rounded-md"
                onClick={(e) => { e.stopPropagation(); toast.success(`In-app notification set for ${firstName} — ${opp.product.name}`); }}
              >
                <Bell className="w-3 h-3 mr-1" />
                In-App
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
