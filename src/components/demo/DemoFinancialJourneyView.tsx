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

interface Props {
  customer: DemoCustomer;
  detectedEvents: DetectedLifeEventResult[];
}

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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  credit_cards: CreditCard,
  deposit_accounts: Landmark,
  loans_lending: HandCoins,
  investment_products: TrendingUp,
  insurance: ShieldCheck,
  wealth_management: Crown,
  estate_trust: Scale,
};

const PILLAR_PRODUCT_AFFINITY: Record<string, string[]> = {
  travel: ["Travel Rewards", "Premium Travel", "Airline Co-Brand", "Hotel Co-Brand", "Travel Insurance"],
  dining: ["Basic Cashback", "Custom Cashback", "Co-Branded Retail"],
  wellness: ["HSA", "Life Insurance", "Disability Insurance"],
  technology: ["Business Card", "Business Line of Credit"],
  fitness: ["HSA", "Life Insurance"],
  shopping: ["Custom Cashback", "Co-Branded Retail", "Basic Cashback"],
  entertainment: ["Custom Cashback", "Travel Rewards"],
};

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

function getHeldProducts(customer: DemoCustomer): Set<string> {
  const held = new Set<string>();
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

function getHeldSources(customer: DemoCustomer): string[] {
  const sources = new Set<string>();
  sources.add("Checking");
  sources.add("Savings");
  for (const txn of customer.sampleTransactions) {
    if (txn.source) sources.add(txn.source);
  }
  return Array.from(sources);
}

interface ScoredOpportunity {
  product: JourneyProduct;
  confidence: number;
  signals: string[];
  nextSteps: string[];
}

function scoreOpportunities(
  customer: DemoCustomer,
  heldProducts: Set<string>,
  detectedEvents: DetectedLifeEventResult[],
  allProducts: JourneyProduct[]
): ScoredOpportunity[] {
  const results: ScoredOpportunity[] = [];
  const pillarMap: Record<string, number> = {};
  for (const p of customer.topPillars) {
    pillarMap[p.name.toLowerCase()] = p.pct;
  }
  const eventKeywords = detectedEvents.map(e => ({
    event: e,
    words: e.event_name.toLowerCase().split(/\s+/),
  }));

  for (const product of allProducts) {
    if (heldProducts.has(product.name)) continue;
    let score = 15;
    const signals: string[] = [];
    const adjacentBoost = allProducts
      .filter(p => heldProducts.has(p.name))
      .some(p => p.nextProductOpportunities.includes(product.name));
    if (adjacentBoost) {
      score += 25;
      signals.push("Adjacent to currently held products");
    }
    for (const [pillar, pct] of Object.entries(pillarMap)) {
      const affinityProducts = PILLAR_PRODUCT_AFFINITY[pillar] ?? [];
      if (affinityProducts.includes(product.name)) {
        score += Math.round(pct * 0.6);
        signals.push(`${pillar.charAt(0).toUpperCase() + pillar.slice(1)} spending at ${pct}%`);
      }
    }
    for (const { event, words } of eventKeywords) {
      for (const [keyword, products] of Object.entries(EVENT_PRODUCT_AFFINITY)) {
        if (words.some(w => w.includes(keyword)) && products.includes(product.name)) {
          score += Math.round(event.confidence * 0.3);
          signals.push(`Behavioral Pattern: ${event.event_name} (${event.confidence}%)`);
          break;
        }
      }
    }
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
    score += Math.round(product.penetrationRate * 0.15);
    const confidence = Math.min(Math.max(score, 10), 95);
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

const FINANCIAL_CATEGORIES = JOURNEY_CATEGORIES.filter(c => c.id !== "digital_services");
const FINANCIAL_PRODUCTS = JOURNEY_PRODUCTS.filter(p => p.category !== "digital_services");
const CATEGORY_META_MAP = Object.fromEntries(JOURNEY_CATEGORIES.map(c => [c.id, c]));

const CATEGORY_BORDER_COLOR: Record<string, string> = {
  credit_cards: "#1d4ed8",
  deposit_accounts: "#059669",
  loans_lending: "#d97706",
  investment_products: "#7c3aed",
  insurance: "#e11d48",
  digital_services: "#0891b2",
  wealth_management: "#4338ca",
  estate_trust: "#9333ea",
};

function generatePersonalizedMessages(
  customer: DemoCustomer,
  product: JourneyProduct,
  signals: string[],
  detectedEvents: DetectedLifeEventResult[]
): { email: string; sms: string; inApp: string } {
  const firstName = customer.profile.name.split(" ")[0];
  const topEvent = detectedEvents.length > 0 ? detectedEvents[0] : null;
  const topPillar = customer.topPillars?.[0];

  if (topEvent) {
    const eventName = topEvent.event_name;
    const talkingPoint = topEvent.talking_points?.[0] || `preparing for ${eventName}`;
    return {
      email: `${firstName}, as you prepare for ${eventName}, our ${product.name} could be the perfect fit. ${talkingPoint}. Let's schedule a quick review to explore how this aligns with your goals.`,
      sms: `Hi ${firstName}! We noticed signals around ${eventName} — ${product.name} could help. Reply YES to learn more or speak with an advisor.`,
      inApp: `🎯 Based on your ${eventName} journey, ${product.name} is recommended for you. Tap to explore personalized benefits.`,
    };
  }

  if (topPillar) {
    const pillarName = topPillar.name.charAt(0).toUpperCase() + topPillar.name.slice(1);
    return {
      email: `${firstName}, your ${pillarName.toLowerCase()}-forward lifestyle (${topPillar.pct}% of spend) suggests ${product.name} could unlock significant value. As a ${customer.profile.segment} member, you qualify for enhanced benefits.`,
      sms: `Hi ${firstName}! Your ${pillarName.toLowerCase()} spending pattern is a great match for ${product.name}. Reply YES to see your personalized offer.`,
      inApp: `💡 ${product.name} matches your ${pillarName.toLowerCase()} lifestyle. Explore tailored rewards for ${customer.profile.segment} members.`,
    };
  }

  return {
    email: `${firstName}, based on your profile, ${product.name} could be a great addition to your financial toolkit. Let's explore the benefits together.`,
    sms: `Hi ${firstName}! ${product.name} may be right for you. Reply YES to learn more.`,
    inApp: `Discover how ${product.name} can enhance your financial journey. Tap to explore.`,
  };
}

export default function DemoFinancialJourneyView({ customer, detectedEvents }: Props) {
  return (
    <CustomerOpportunities customer={customer} detectedEvents={detectedEvents} />
  );
}

function CustomerOpportunities({ customer, detectedEvents }: { customer: DemoCustomer; detectedEvents: DetectedLifeEventResult[] }) {
  const heldProducts = useMemo(() => getHeldProducts(customer), [customer]);
  const heldSources = useMemo(() => getHeldSources(customer), [customer]);
  const opportunities = useMemo(
    () => scoreOpportunities(customer, heldProducts, detectedEvents, FINANCIAL_PRODUCTS),
    [customer, heldProducts, detectedEvents]
  );

  const highCount = opportunities.filter(o => o.confidence >= 70).length;
  const medCount = opportunities.filter(o => o.confidence >= 40 && o.confidence < 70).length;
  const lowCount = opportunities.filter(o => o.confidence < 40).length;

  const topOpportunity = opportunities[0] ?? null;

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
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">{highCount} High</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">{medCount} Medium</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{lowCount} Low</span>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currently Held</p>
          <div className="flex flex-wrap gap-1">
            {heldSources.map(source => (
              <Badge key={source} className={cn("text-[9px] border-transparent", SOURCE_PILL_COLORS[source] || "bg-slate-50 text-slate-500")}>
                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                {source}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {topOpportunity && (
        <NextProductCard
          opp={topOpportunity}
          customer={customer}
          detectedEvents={detectedEvents}
        />
      )}

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

function NextProductCard({
  opp,
  customer,
  detectedEvents,
}: {
  opp: ScoredOpportunity;
  customer: DemoCustomer;
  detectedEvents: DetectedLifeEventResult[];
}) {
  const firstName = customer.profile.name.split(" ")[0];
  const catMeta = CATEGORY_META_MAP[opp.product.category];
  const cc = confidenceColor(opp.confidence);
  const messages = useMemo(
    () => generatePersonalizedMessages(customer, opp.product, opp.signals, detectedEvents),
    [customer, opp, detectedEvents]
  );

  const topEvent = detectedEvents[0];
  const sourceLabel = topEvent ? `Behavioral Pattern: ${topEvent.event_name}` : "Spending Pattern Analysis";
  const borderColor = CATEGORY_BORDER_COLOR[opp.product.category] || "#3b82f6";

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
    >
      <div className="px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Best Product</span>
          </div>
          <Badge variant="outline" className={cn("text-[8px] border-transparent", catMeta?.color, catMeta?.textColor)}>
            {catMeta?.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">{opp.product.name}</p>
          <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full", cc.bg, cc.text)}>
            {opp.confidence}% match
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full bg-slate-100 flex-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${opp.confidence}%`,
                background: opp.confidence >= 70 ? "#22c55e" : opp.confidence >= 40 ? "#f59e0b" : "#94a3b8",
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-slate-100 space-y-2">
        <div>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Why this product</p>
          <div className="space-y-1">
            {opp.signals.map((signal, si) => (
              <div key={si} className="flex items-start gap-1.5 text-[10px]">
                <Zap className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-600">{signal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Personalized Outreach</p>
          <OutreachPreview icon={<Mail className="w-3 h-3" />} label="Email" message={messages.email} />
          <OutreachPreview icon={<MessageSquare className="w-3 h-3" />} label="SMS" message={messages.sms} />
          <OutreachPreview icon={<Bell className="w-3 h-3" />} label="In-App" message={messages.inApp} />
        </div>
      </div>
    </div>
  );
}

function OutreachPreview({ icon, label, message }: { icon: React.ReactNode; label: string; message: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 hover:text-slate-800 transition-colors w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {icon}
        <span>{label}</span>
        <ChevronRight className={cn("w-3 h-3 ml-auto transition-transform", expanded && "rotate-90")} />
      </button>
      {expanded && (
        <p className="text-[10px] text-slate-500 leading-relaxed mt-1 pl-5 italic">"{message}"</p>
      )}
    </div>
  );
}

function CategorySection({
  label,
  icon,
  color,
  textColor,
  count,
  topConfidence,
  opportunities,
  customerName,
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
  const [isOpen, setIsOpen] = useState(false);
  const cc = confidenceColor(topConfidence);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors hover:bg-slate-50", cc.border)}>
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", color)}>
            <span className={textColor}>{icon}</span>
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900">{label}</p>
            <p className="text-[9px] text-slate-400">{count} opportunities · Top: {topConfidence}%</p>
          </div>
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", cc.bg, cc.text)}>
            {confidenceLabel(topConfidence)}
          </span>
          <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-90")} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 ml-4 space-y-1">
          {opportunities.map((opp) => {
            const oppCC = confidenceColor(opp.confidence);
            return (
              <div key={opp.product.name} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-100 hover:bg-slate-50">
                <p className="text-[11px] text-slate-700 flex-1 truncate">{opp.product.name}</p>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", oppCC.bg, oppCC.text)}>
                  {opp.confidence}%
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
