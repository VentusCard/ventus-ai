import { Bot, Sparkles, Send, Inbox, Target, Lightbulb, MessageCircle, ShieldCheck, Users, PenLine, Route, GraduationCap } from "lucide-react";


const INGEST_ITEMS = [
  "Enriched Transactions",
  "Behavioral Intelligence",
  "KYC & Demographics",
  "Account Holdings",
  "Product Tenure",
  "Channel Engagement",
];

const HANDOFF_ITEMS = [
  "Wealth Advisor",
  "Account Opening",
  "Customer Service",
  "Branch Banker",
  "Mortgage Specialist",
];

function PipelineSliver() {
  return (
    <div className="shrink-0 rounded-xl border border-slate-200 bg-white flex flex-col divide-y divide-slate-200">
      {[
        { label: "Ingest", Icon: Inbox, items: INGEST_ITEMS },
        { label: "Hands Off To", Icon: Send, items: HANDOFF_ITEMS },
      ].map(({ label, Icon, items }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-2.5 overflow-hidden min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 min-w-[140px]">
            <Icon className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[13px] font-bold tracking-wide text-slate-900 uppercase">{label}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-nowrap">
            {items.map((item) => (
              <span
                key={item}
                className="shrink-0 whitespace-nowrap text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
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

export interface Brief {
  insight: string;
  talkingPoints: string[];
  nextSteps: string[];
  products: ProductSpec[];
  conciergeActions: string[]; // 2 personalized concierge actions for the WEALTH CLIENT column
  /** When true, render with a sensitive/wellness tone (no marketing accents). */
  sensitive?: boolean;
}

const BRIEF_LIBRARY: Record<string, Brief> = {
  "College Preparation for Dependent": {
    insight:
      "This customer is actively preparing for a child's college education while showing early home purchase signals. Two major life events in parallel represent a significant wealth planning opportunity. Immediate outreach recommended to begin coordinated education and home savings planning.",
    talkingPoints: [
      "We noticed activity around college prep — have you started thinking about a 529 plan?",
      "It looks like you may also be in early home purchase planning — would a mortgage consultation be helpful?",
      "With two major financial milestones on the horizon, now is a great time to build a coordinated financial plan.",
    ],
    nextSteps: [
      "Schedule 529 college savings consultation within 30 days",
      "Begin mortgage pre-approval process to understand borrowing capacity",
      "Review and update life insurance coverage for growing family needs",
    ],
    products: [
      { name: "529 Education Savings Plan", description: "Tax-advantaged college savings" },
      { name: "Mortgage Pre-Approval", description: "Lock in rates and shop with confidence" },
      { name: "Family Protection Review", description: "Coverage for the next chapter" },
    ],
    conciergeActions: ["Personalized 529 Consultation", "College Planning Outreach"],
  },
  "Home Purchase Planning": {
    insight:
      "Mortgage research and down payment activity suggest an early home purchase — estimated 3–6 month timeline. Proactive outreach now positions your bank as the mortgage partner before they shop elsewhere.",
    talkingPoints: [
      "Are you working with anyone on a mortgage yet?",
      "We can lock in a pre-approval so you're ready to move fast.",
      "Have you thought about your ideal monthly payment?",
    ],
    nextSteps: [
      "Schedule mortgage pre-approval consultation",
      "Run down payment gap analysis on current savings",
      "Discuss homeowners insurance options",
    ],
    products: [
      { name: "Mortgage Pre-Approval", description: "Lock in rates and shop with confidence" },
      { name: "Home Equity Planning", description: "Map out down payment strategy" },
      { name: "Homeowners Insurance", description: "Coverage tailored to your future home" },
    ],
    conciergeActions: ["Personalized Home Improvement Consultation", "Curated Mortgage Options"],
  },
  Gambling: {
    sensitive: true,
    insight:
      "Multiple high-severity gambling transactions detected in the past 30 days. Warrants a sensitive financial wellness conversation rather than product promotion.",
    talkingPoints: [
      "We noticed some changes in your spending — how are things going?",
      "We have tools to help track and manage discretionary spending.",
      "Our financial wellness team is available for a confidential chat.",
    ],
    nextSteps: [
      "Flag account for financial wellness outreach",
      "Suppress gambling-adjacent product offers",
      "Schedule confidential wellness check-in",
    ],
    products: [
      { name: "Wellness Consultation", description: "Confidential 1:1 with our wellness team" },
      { name: "Budgeting Tools", description: "Track and manage discretionary spending" },
      { name: "Savings Goal Setup", description: "Build a structured plan" },
    ],
    conciergeActions: ["Financial Wellness Check-in", "Confidential Support Outreach"],
  },
  "Financial Vulnerability": {
    sensitive: true,
    insight:
      "Early signals of financial strain across multiple categories. The right outreach now builds trust and prevents escalation — wellness conversation, not a product pitch.",
    talkingPoints: [
      "How are things going financially right now? We're here to help.",
      "We can help you think through cash flow and upcoming bills.",
      "Would a confidential wellness check-in be useful?",
    ],
    nextSteps: [
      "Flag account for financial wellness outreach",
      "Pause non-essential marketing campaigns",
      "Offer confidential wellness consultation",
    ],
    products: [
      { name: "Wellness Consultation", description: "Confidential support, no products pitched" },
      { name: "Cash Flow Coaching", description: "Build a clear picture of monthly inflows" },
      { name: "Hardship Resources", description: "Programs and tools for relief" },
    ],
    conciergeActions: ["Financial Wellness Check-in", "Confidential Support Outreach"],
  },
  "Annual Hawaiian Vacations": {
    insight:
      "Annual Hawaiian vacation pattern with recent flight and hotel transactions. Travel rewards and lifestyle products are highly relevant right now.",
    talkingPoints: [
      "Planning another Hawaiian trip — have you seen our travel rewards card?",
      "We can help maximize rewards on flights and hotels.",
      "Interested in trip insurance for your upcoming travel?",
    ],
    nextSteps: [
      "Surface travel rewards card offer",
      "Push Hawaiian hotel & activity deals",
      "Follow up post-trip with vacation financing",
    ],
    products: [
      { name: "Travel Rewards Card", description: "Premium points on flights and hotels" },
      { name: "Trip Insurance", description: "Protect upcoming travel" },
      { name: "Vacation Savings", description: "Auto-save for next year's trip" },
    ],
    conciergeActions: ["Curated Hawaii Itinerary Concierge", "Travel Rewards Upgrade Outreach"],
  },
  "Seasonal Ski Trips": {
    insight:
      "Recurring seasonal ski activity across lift tickets, lodging, and gear. Lifestyle travel rewards and seasonal savings products are well-aligned.",
    talkingPoints: [
      "Our travel card earns extra on lodging and lift tickets.",
      "We can set up a savings bucket for next season's trip.",
      "Have you looked at trip insurance for gear and travel?",
    ],
    nextSteps: [
      "Surface travel rewards card offer",
      "Push mountain-resort and gear partner deals",
      "Offer seasonal savings sub-account",
    ],
    products: [
      { name: "Travel Rewards Card", description: "Boosted points on travel and lodging" },
      { name: "Trip Insurance", description: "Coverage for travel disruption" },
      { name: "Seasonal Savings", description: "Auto-save for next ski season" },
    ],
    conciergeActions: ["Premium Ski Trip Planning", "Mountain Resort Partner Perks"],
  },
  "Subscription Pet Care Routine": {
    insight:
      "Steady cadence of pet care subscriptions and recurring vet visits. Pet ownership is a strong loyalty anchor — great context for everyday rewards.",
    talkingPoints: [
      "Would extra rewards on pet care categories be useful?",
      "Many pet owners pair expenses with a dedicated rewards card.",
      "Are you covered for unexpected vet costs?",
    ],
    nextSteps: [
      "Surface everyday rewards card with pet boost",
      "Push partner deals from pet retailers & vets",
      "Offer pet insurance referral",
    ],
    products: [
      { name: "Everyday Rewards", description: "Boosted earnings on pet categories" },
      { name: "Pet Partner Deals", description: "Curated offers from vet & retail partners" },
      { name: "Pet Insurance", description: "Coverage for unexpected vet expenses" },
    ],
    conciergeActions: ["Pet Care Premium Membership", "Curated Vet Partner Network"],
  },
};

const GENERIC_LIFE_EVENT_BRIEF: Brief = {
  insight:
    "An emerging life event signal has been detected for this customer based on recent transaction patterns. Early outreach positions your bank as a trusted partner.",
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
    { name: "Relationship Review", description: "Re-baseline goals and products" },
    { name: "Goal Planning Consultation", description: "Map life event to milestones" },
    { name: "Insurance Review", description: "Ensure coverage matches the new chapter" },
  ],
  conciergeActions: ["Personalized Goal Consultation", "Relationship Review Outreach"],
};

const GENERIC_RISK_BRIEF: Brief = {
  sensitive: true,
  insight:
    "Behavioral signals suggest this customer may be navigating financial stress. Approach with care — prioritize wellness and trust over product promotion.",
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
    { name: "Financial Wellness Consultation", description: "Confidential support" },
    { name: "Budgeting Tools", description: "Track and plan around upcoming bills" },
    { name: "Hardship Resources", description: "Short-term programs and relief" },
  ],
  conciergeActions: ["Financial Wellness Check-in", "Confidential Support Outreach"],
};

function buildLifestyleBrief(label: string): Brief {
  return {
    insight: `This customer shows a clear behavioral pattern around ${label.toLowerCase()}. Lifestyle-aligned rewards and curated partner offers will resonate strongly.`,
    talkingPoints: [
      `We noticed a recurring pattern around ${label.toLowerCase()} — would tailored rewards be useful?`,
      "We can curate partner deals so your everyday spend earns more.",
      "Want to set up a dedicated savings bucket for this part of your life?",
    ],
    nextSteps: [
      "Surface lifestyle-aligned rewards card",
      `Push curated partner deals tied to ${label}`,
      "Offer dedicated savings sub-account",
    ],
    products: [
      { name: "Lifestyle Rewards Card", description: `Boosted earnings on ${label.toLowerCase()}` },
      { name: "Curated Partner Deals", description: "Hand-picked offers from merchants" },
      { name: "Dedicated Savings", description: "Automatic set-aside for what matters" },
    ],
    conciergeActions: [`Personalized ${label} Concierge`, `${label} Partner Perks Outreach`],
  };
}

export function resolveBrief(signal: SelectedSignal): Brief {
  const exact = BRIEF_LIBRARY[signal.label];
  if (exact) return exact;

  const l = (signal.label || "").toLowerCase();
  if (/college/.test(l)) return BRIEF_LIBRARY["College Preparation for Dependent"];
  if (/home|mortgage|down ?payment|house/.test(l)) return BRIEF_LIBRARY["Home Purchase Planning"];
  if (/gambl/.test(l)) return BRIEF_LIBRARY.Gambling;
  if (/vulnerab|hardship|stress/.test(l)) return BRIEF_LIBRARY["Financial Vulnerability"];
  if (/hawaii|vacation|beach/.test(l)) return BRIEF_LIBRARY["Annual Hawaiian Vacations"];
  if (/ski|snowboard|mountain/.test(l)) return BRIEF_LIBRARY["Seasonal Ski Trips"];
  if (/pet|dog|cat|vet/.test(l)) return BRIEF_LIBRARY["Subscription Pet Care Routine"];

  if (signal.kind === "risk") return GENERIC_RISK_BRIEF;
  if (signal.kind === "lifeEvent") return GENERIC_LIFE_EVENT_BRIEF;
  return buildLifestyleBrief(signal.label);
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
  /** True when right-side phone panel is showing the AI Banking Assistant chat. */
  assistantOpen?: boolean;
  /** True when right-side phone panel is showing the WM CoPilot view. */
  wmCopilotOpen?: boolean;
  /** Which audience view to render full-width. Defaults to 'customer'. */
  audience?: "customer" | "rm";
}

export default function NextConversationRationale({
  selectedSignal,
  availableSignals = [],
  onOpenWMCopilot,
  onOpenAIAssistant,
  assistantOpen = false,
  wmCopilotOpen = false,
  audience = "customer",
}: Props) {
  const effectiveSignal: SelectedSignal | null =
    selectedSignal ?? (availableSignals.length > 0 ? availableSignals[0] : null);

  if (!effectiveSignal || effectiveSignal.kind === "all") {
    return (
      <div className="h-full flex flex-col gap-3">
        <PipelineSliver />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm text-center text-[12px] text-slate-400">
            Select a signal pill above to see the engagement plan.
          </div>
        </div>
      </div>
    );
  }

  const brief = resolveBrief(effectiveSignal);

  return (
    <div className="h-full min-h-0 flex flex-col gap-3 animate-in fade-in duration-300" key={effectiveSignal.label}>
      <PipelineSliver />
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-3">
        {audience === "customer" ? (
          /* ============ REGULAR CLIENT ============ */
          <ExplainerCard
            accent="blue"
            Icon={Bot}
            title="Regular Client"
            tagline="In-app AI banking assistant for the customer."
            description="Answers product questions in the app using the customer's own spending, holdings, and recent interactions — then surfaces the right offer at the right moment."
            features={[
              { Icon: Target, text: "Context-aware answers grounded in account & behavior" },
              { Icon: Sparkles, text: "Personalized product and offer recommendations" },
              { Icon: Lightbulb, text: "Educational nudges timed to detected signals" },
              { Icon: MessageCircle, text: "Soft, opt-in conversion CTA — never pushy" },
            ]}
          />
        ) : (
          /* ============ VENTUS AI COWORKER ============ */
          <ExplainerCard
            accent="purple"
            Icon={Sparkles}
            title="Ventus AI Coworker"
            tagline="24/7 teammate for advisors, bankers, and ops."
            description="Digests signals across the book, drafts outreach, and hands work off to the right human specialist with full context attached."
            features={[
              { Icon: Inbox, text: "Signal digest across the full client book" },
              { Icon: PenLine, text: "Drafts emails, briefs, and campaign cohorts" },
              { Icon: Route, text: "Routes to Wealth Advisor, Mortgage, Service, etc." },
              { Icon: GraduationCap, text: "Learns from every advisor edit and reply" },
            ]}
          />
        )}
      </div>
    </div>
  );
}

interface FeatureItem {
  Icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface ExplainerCardProps {
  accent: "blue" | "purple";
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  description: string;
  features: FeatureItem[];
}

function ExplainerCard({ accent, Icon, title, tagline, description, features }: ExplainerCardProps) {
  const isPurple = accent === "purple";
  const borderCls = isPurple ? "border-purple-200" : "border-slate-200";
  const headerBorder = isPurple ? "border-purple-100" : "border-slate-100";
  const accentText = isPurple ? "text-purple-600" : "text-blue-600";
  const accentBg = isPurple ? "bg-purple-50" : "bg-blue-50";
  const iconColor = isPurple ? "text-purple-600" : "text-blue-600";
  const featureIconColor = isPurple ? "text-purple-500" : "text-blue-500";

  return (
    <div className={`flex flex-col min-h-0 rounded-xl border ${borderCls} bg-white overflow-hidden`}>
      <div className={`shrink-0 px-4 py-2.5 border-b ${headerBorder} flex items-center gap-2`}>
        <div className={`w-7 h-7 rounded-lg ${accentBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-[12px] font-bold ${accentText} leading-tight`}>{title}</span>
          <span className="text-[10.5px] text-slate-500 leading-tight truncate">{tagline}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 py-3 gap-3">
        <div>
          <p className="text-[9.5px] font-semibold tracking-wider uppercase text-slate-400 mb-1">What it does</p>
          <p className="text-[12px] leading-snug text-slate-700">{description}</p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-[9.5px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Features</p>
          <ul className="space-y-1.5">
            {features.map(({ Icon: FIcon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <div className={`shrink-0 w-4 h-4 rounded ${accentBg} flex items-center justify-center mt-0.5`}>
                  <FIcon className={`w-2.5 h-2.5 ${featureIconColor}`} />
                </div>
                <span className="text-[11.5px] leading-snug text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

