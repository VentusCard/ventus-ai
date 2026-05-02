import { GraduationCap, Home, AlertTriangle, ShieldAlert, Plane, Snowflake, PawPrint, Sparkles, MessageSquare, ListChecks, Package, ArrowRight } from "lucide-react";
import type { CardActions } from "./NextProductRationale";
import type { ProductCard } from "./ProductCardsPhoneView";

export type SignalKind = "lifeEvent" | "lifestyle" | "risk" | "segment" | "all";

export interface SelectedSignal {
  kind: SignalKind;
  label: string;
  source?: string;
}

interface ProductSpec {
  name: string;
  description: string;
}

interface Brief {
  insight: string;
  talkingPoints: string[];
  nextSteps: string[];
  products: ProductSpec[];
  /** When true, render with a sensitive/wellness tone (no marketing accents). */
  sensitive?: boolean;
}

const BRIEF_LIBRARY: Record<string, Brief> = {
  "College Preparation for Dependent": {
    insight:
      "This customer is actively preparing for a child's college education based on recent test prep, campus visit, and application fee transactions. This is a high-confidence signal with an estimated 2-4 year runway before enrollment. Immediate outreach recommended to begin education savings planning.",
    talkingPoints: [
      "We noticed some activity around college prep — have you started thinking about a 529 plan for your child?",
      "With college potentially 2-4 years away, now is a great time to start building an education savings strategy.",
      "We can model out what monthly contributions would look like to hit your target college savings goal.",
    ],
    nextSteps: [
      "Schedule 529 college savings consultation within 30 days",
      "Review and update life insurance coverage — new dependent costs likely increasing",
      "Update beneficiary designations on all investment and retirement accounts",
    ],
    products: [
      { name: "529 Education Savings Plan", description: "Tax-advantaged savings for future education costs" },
      { name: "Term Life Insurance Review", description: "Ensure adequate coverage for growing family expenses" },
      { name: "College Planning Consultation", description: "Model education costs and savings milestones" },
    ],
  },
  "Home Purchase Planning": {
    insight:
      "This customer is showing early home purchase signals including mortgage research and down payment activity. High confidence detection with an estimated 3-6 month purchase timeline. Proactive outreach now positions your bank as the mortgage partner before they shop elsewhere.",
    talkingPoints: [
      "We noticed some activity that looks like home purchase planning — are you working with anyone on a mortgage yet?",
      "We can lock in a pre-approval now so you're ready to move fast when you find the right home.",
      "Have you thought about what your ideal monthly payment looks like?",
    ],
    nextSteps: [
      "Schedule mortgage pre-approval consultation",
      "Review current savings for down payment gap analysis",
      "Discuss homeowners insurance options",
    ],
    products: [
      { name: "Mortgage Pre-Approval", description: "Lock in rates and shop with confidence" },
      { name: "Home Equity Planning", description: "Map out down payment and equity strategy" },
      { name: "Homeowners Insurance Review", description: "Coverage tailored to your future home" },
    ],
  },
  Gambling: {
    sensitive: true,
    insight:
      "This customer has multiple high-severity gambling transactions detected in the past 30 days totaling significant spend. This signal warrants a sensitive financial wellness conversation rather than product promotion. Handle with care.",
    talkingPoints: [
      "We noticed some changes in your spending patterns recently — how are things going financially?",
      "We have some tools that can help you track and manage discretionary spending if that would be useful.",
      "Our financial wellness team is available for a confidential conversation anytime.",
    ],
    nextSteps: [
      "Flag account for financial wellness outreach",
      "Do not surface gambling-adjacent product offers",
      "Schedule confidential financial wellness check-in",
    ],
    products: [
      { name: "Financial Wellness Consultation", description: "Confidential 1:1 with our wellness team" },
      { name: "Budgeting Tools", description: "Track and manage discretionary spending" },
      { name: "Savings Goal Setup", description: "Build a structured plan for the months ahead" },
    ],
  },
  "Financial Vulnerability": {
    sensitive: true,
    insight:
      "This customer is showing early signals of financial strain across multiple categories. Approach with care — this is a wellness conversation, not a product pitch. The right outreach now can build trust and prevent escalation.",
    talkingPoints: [
      "How are things going financially right now? We're here to help, not to sell.",
      "We have tools and people who can help you think through cash flow and upcoming bills.",
      "Would a quick confidential check-in with our wellness team be useful?",
    ],
    nextSteps: [
      "Flag account for financial wellness outreach",
      "Pause non-essential marketing campaigns for this customer",
      "Schedule confidential financial wellness check-in",
    ],
    products: [
      { name: "Financial Wellness Consultation", description: "Confidential support, no products pitched" },
      { name: "Cash Flow Coaching", description: "Build a clear picture of monthly inflows and outflows" },
      { name: "Hardship Resources", description: "Programs and tools for short-term relief" },
    ],
  },
  "Annual Hawaiian Vacations": {
    insight:
      "This customer takes annual Hawaiian vacations and has already begun planning for this year based on recent flight and hotel transactions. Travel rewards and lifestyle products are highly relevant right now.",
    talkingPoints: [
      "Looks like you're planning another Hawaiian trip — have you looked at our travel rewards card?",
      "We can help maximize your rewards on flights and hotels so your trip costs less.",
      "Are you interested in travel insurance for your upcoming trip?",
    ],
    nextSteps: [
      "Surface travel rewards card offer",
      "Send Hawaiian hotel and activity deals through rewards engine",
      "Follow up post-trip for vacation financing options",
    ],
    products: [
      { name: "Travel Rewards Card", description: "Earn premium points on flights and hotels" },
      { name: "Trip Insurance", description: "Protect upcoming travel against the unexpected" },
      { name: "Vacation Savings Account", description: "Set aside funds for next year's trip automatically" },
    ],
  },
  "Seasonal Ski Trips": {
    insight:
      "This customer takes recurring ski trips each season based on lift ticket, lodging, and gear transactions. Lifestyle and travel rewards are well-aligned right now.",
    talkingPoints: [
      "Looks like ski season is on your mind — our travel rewards card earns extra on lodging and lift tickets.",
      "We can help you set up a dedicated savings bucket for next season's trip.",
      "Have you looked at trip insurance for the gear and travel costs?",
    ],
    nextSteps: [
      "Surface travel rewards card offer",
      "Push curated mountain-resort and gear partner deals",
      "Offer seasonal savings sub-account",
    ],
    products: [
      { name: "Travel Rewards Card", description: "Earn boosted points on travel and lodging" },
      { name: "Trip Insurance", description: "Coverage for travel disruption and gear" },
      { name: "Seasonal Savings Account", description: "Auto-save for the next ski season" },
    ],
  },
  "Subscription Pet Care Routine": {
    insight:
      "This customer has a steady cadence of pet care subscriptions and recurring vet visits. Pet ownership is a strong loyalty and cross-sell anchor — great context for everyday rewards and pet-adjacent benefits.",
    talkingPoints: [
      "We noticed regular pet care spend — would extra rewards on those categories be useful?",
      "Some customers love pairing pet expenses with a dedicated rewards card.",
      "Are you covered for unexpected vet costs? We can walk through pet insurance options.",
    ],
    nextSteps: [
      "Surface everyday rewards card with pet-category boost",
      "Push partner deals from pet retailers and vet networks",
      "Offer pet insurance referral",
    ],
    products: [
      { name: "Everyday Rewards Card", description: "Boosted earnings on pet and household categories" },
      { name: "Pet Care Partner Deals", description: "Curated offers from vet and retail partners" },
      { name: "Pet Insurance Referral", description: "Coverage for unexpected vet expenses" },
    ],
  },
};

const GENERIC_LIFE_EVENT_BRIEF: Brief = {
  insight:
    "An emerging life event signal has been detected for this customer based on recent transaction patterns. Early outreach positions your bank as a trusted partner before competing institutions reach them.",
  talkingPoints: [
    "We noticed some recent activity that suggests something new is happening — how can we help?",
    "We'd love to walk through your goals and make sure your accounts are set up to support them.",
    "Are there any upcoming financial decisions where a quick conversation would help?",
  ],
  nextSteps: [
    "Schedule a relationship review within 30 days",
    "Update household profile and dependent designations",
    "Align product mix with the detected life-stage shift",
  ],
  products: [
    { name: "Relationship Review", description: "Re-baseline goals and recommended products" },
    { name: "Goal Planning Consultation", description: "Map detected life event to financial milestones" },
    { name: "Insurance & Beneficiary Review", description: "Ensure coverage matches the new chapter" },
  ],
};

const GENERIC_RISK_BRIEF: Brief = {
  sensitive: true,
  insight:
    "Behavioral signals suggest this customer may be navigating financial stress. Approach with care — prioritize wellness and trust over product promotion. The right tone now protects the long-term relationship.",
  talkingPoints: [
    "How are things going financially right now? We're here to help.",
    "We have tools and people who can help you think through your cash flow.",
    "Would a confidential check-in with our financial wellness team be useful?",
  ],
  nextSteps: [
    "Flag account for financial wellness outreach",
    "Pause non-essential marketing for this customer",
    "Offer a confidential wellness consultation",
  ],
  products: [
    { name: "Financial Wellness Consultation", description: "Confidential support with no product pitch" },
    { name: "Budgeting Tools", description: "Track and plan around upcoming bills" },
    { name: "Hardship Resources", description: "Short-term programs and relief options" },
  ],
};

function buildLifestyleBrief(label: string): Brief {
  return {
    insight: `This customer shows a clear behavioral pattern around ${label.toLowerCase()}. Lifestyle-aligned rewards and curated partner offers will resonate strongly. Use this signal to deepen everyday engagement and reinforce why your bank fits their life.`,
    talkingPoints: [
      `We noticed a recurring pattern around ${label.toLowerCase()} — would tailored rewards in that area be useful?`,
      "We can curate partner deals so your everyday spend earns more.",
      "Want to set up a dedicated savings bucket for this part of your life?",
    ],
    nextSteps: [
      "Surface lifestyle-aligned rewards card",
      `Push curated partner deals tied to ${label}`,
      "Offer dedicated savings sub-account",
    ],
    products: [
      { name: "Lifestyle Rewards Card", description: `Boosted earnings on ${label.toLowerCase()} categories` },
      { name: "Curated Partner Deals", description: "Hand-picked offers from relevant merchants" },
      { name: "Dedicated Savings Account", description: "Automatic set-aside for what matters most to you" },
    ],
  };
}

function resolveBrief(signal: SelectedSignal): Brief {
  // Tier 1 — exact label match
  const exact = BRIEF_LIBRARY[signal.label];
  if (exact) return exact;

  // Tier 2 — case-insensitive substring match
  const l = (signal.label || "").toLowerCase();
  const findKey = (needle: RegExp) =>
    Object.keys(BRIEF_LIBRARY).find((k) => needle.test(k.toLowerCase()) || needle.test(l));

  if (/college/.test(l)) return BRIEF_LIBRARY["College Preparation for Dependent"];
  if (/home|mortgage|down ?payment|house/.test(l)) return BRIEF_LIBRARY["Home Purchase Planning"];
  if (/gambl/.test(l)) return BRIEF_LIBRARY.Gambling;
  if (/vulnerab|hardship|stress/.test(l)) return BRIEF_LIBRARY["Financial Vulnerability"];
  if (/hawaii|vacation|beach/.test(l)) return BRIEF_LIBRARY["Annual Hawaiian Vacations"];
  if (/ski|snowboard|mountain/.test(l)) return BRIEF_LIBRARY["Seasonal Ski Trips"];
  if (/pet|dog|cat|vet/.test(l)) return BRIEF_LIBRARY["Subscription Pet Care Routine"];

  // Tier 3 — kind-aware fallback
  if (signal.kind === "risk") return GENERIC_RISK_BRIEF;
  if (signal.kind === "lifeEvent") return GENERIC_LIFE_EVENT_BRIEF;
  return buildLifestyleBrief(signal.label);
}

function getSignalIcon(signal: SelectedSignal): typeof GraduationCap {
  const l = (signal.label || "").toLowerCase();
  if (/college/.test(l)) return GraduationCap;
  if (/home|mortgage|house/.test(l)) return Home;
  if (/gambl/.test(l)) return AlertTriangle;
  if (/vulnerab|hardship|stress/.test(l)) return ShieldAlert;
  if (/hawaii|vacation|beach/.test(l)) return Plane;
  if (/ski|snow|mountain/.test(l)) return Snowflake;
  if (/pet|dog|cat|vet/.test(l)) return PawPrint;
  if (signal.kind === "risk") return ShieldAlert;
  if (signal.kind === "lifeEvent") return Sparkles;
  return Sparkles;
}

interface Props {
  selectedSignal?: SelectedSignal | null;
  availableSignals?: SelectedSignal[];
  customerFirstName?: string;
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
  productCards?: ProductCard[] | null;
  onSelectSignal?: (s: SelectedSignal) => void;
  onOpenWMCopilot?: () => void;
  onOpenAIAssistant?: () => void;
  assistantOpen?: boolean;
  wmCopilotOpen?: boolean;
}

export default function NextConversationRationale({
  selectedSignal,
  availableSignals = [],
}: Props) {
  const effectiveSignal: SelectedSignal | null =
    selectedSignal ??
    (availableSignals.length > 0 ? availableSignals[0] : null);

  if (!effectiveSignal || effectiveSignal.kind === "all") {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="max-w-sm text-center text-[12px] text-slate-400">
          Select a signal pill above to see the advisor brief.
        </div>
      </div>
    );
  }

  const brief = resolveBrief(effectiveSignal);
  const SignalIcon = getSignalIcon(effectiveSignal);
  const accent = brief.sensitive ? "rose" : effectiveSignal.kind === "lifeEvent" ? "indigo" : "blue";

  // Tailwind-safe accent classes
  const accentMap = {
    blue:   { iconBg: "bg-blue-50",   iconText: "text-blue-600",   chipBg: "bg-blue-50",   chipText: "text-blue-700",   chipBorder: "border-blue-200" },
    indigo: { iconBg: "bg-indigo-50", iconText: "text-indigo-600", chipBg: "bg-indigo-50", chipText: "text-indigo-700", chipBorder: "border-indigo-200" },
    rose:   { iconBg: "bg-rose-50",   iconText: "text-rose-600",   chipBg: "bg-rose-50",   chipText: "text-rose-700",   chipBorder: "border-rose-200" },
  } as const;
  const a = accentMap[accent];

  return (
    <div
      className="h-full overflow-auto scrollbar-light animate-in fade-in slide-in-from-bottom-1 duration-300"
      key={effectiveSignal.label}
    >
      <article className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        {/* Header — selected signal + detection time */}
        <header className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <span className={`flex items-center justify-center w-7 h-7 rounded-md ${a.iconBg}`}>
            <SignalIcon className={`w-3.5 h-3.5 ${a.iconText}`} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-slate-900 truncate">
              {effectiveSignal.label}
            </div>
            <div className="text-[11px] text-slate-500">detected today</div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${a.chipBg} ${a.chipText} ${a.chipBorder}`}>
            {effectiveSignal.kind === "lifeEvent" ? "Life Event" : effectiveSignal.kind === "risk" ? "Risk Signal" : "Lifestyle"}
          </span>
        </header>

        {/* VENTUS AI INSIGHT */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ventus AI Insight
            </h4>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">{brief.insight}</p>
        </section>

        {/* TALKING POINTS */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Talking Points
            </h4>
          </div>
          <ul className="space-y-1.5">
            {brief.talkingPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-slate-400"}`} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* NEXT STEPS */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <ListChecks className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Next Steps
            </h4>
          </div>
          <ul className="space-y-1.5">
            {brief.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-slate-400"}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* RECOMMENDED PRODUCTS */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {brief.sensitive ? "Recommended Resources" : "Recommended Products"}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {brief.products.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col gap-1.5 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">{p.name}</div>
                <div className="text-[11px] text-slate-500 leading-snug flex-1">{p.description}</div>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md px-2 py-1 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
