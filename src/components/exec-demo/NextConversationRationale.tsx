import { Mail, Bot, Bell, FileText, Sparkles, Briefcase, MessageCircle, Send, Plus, GraduationCap, Home, AlertTriangle, ShieldAlert, Plane, Snowflake, PawPrint, Inbox } from "lucide-react";

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
          /* ============ REGULAR CLIENT (full width) ============ */
          <div className="flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="shrink-0 px-3 pt-2 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-semibold tracking-wide text-blue-600">Regular Client</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-2 space-y-2">
              {/* AI Chatbot Context Card */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-800">AI Banking Assistant Context</span>
                </div>
                <div className="mb-1.5">
                  <p className="text-[10px] font-semibold tracking-wide uppercase text-slate-500 mb-0.5">Knows</p>
                  <ul className="space-y-0.5 text-[11px] text-slate-700">
                    <li className="flex gap-1.5"><span className="text-blue-400">•</span> Recent spending pattern</li>
                    <li className="flex gap-1.5"><span className="text-blue-400">•</span> Account holdings</li>
                    <li className="flex gap-1.5"><span className="text-blue-400">•</span> Recent product interactions</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wide uppercase text-slate-500 mb-0.5">Can Answer</p>
                  <ul className="space-y-0.5 text-[11px] text-slate-700">
                    <li className="flex gap-1.5"><MessageCircle className="w-2.5 h-2.5 text-blue-400 mt-0.5 shrink-0" /> "What products fit my situation?"</li>
                    <li className="flex gap-1.5"><MessageCircle className="w-2.5 h-2.5 text-blue-400 mt-0.5 shrink-0" /> "Show me relevant offers"</li>
                  </ul>
                </div>
              </div>

              {/* Personalized Outreach Card */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-800">Personalized Outreach</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Signal detected</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">24h delay</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Send</span>
                </div>
                <ol className="space-y-0.5 text-[11px] text-slate-700">
                  <li className="flex gap-1.5"><span className="text-blue-500 font-bold">1.</span> Educational nudge</li>
                  <li className="flex gap-1.5"><span className="text-blue-500 font-bold">2.</span> Product spotlight</li>
                  <li className="flex gap-1.5"><span className="text-blue-500 font-bold">3.</span> Soft conversion CTA</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          /* ============ WEALTH CLIENT (full width) ============ */
          <div className="flex flex-col min-h-0 rounded-xl border border-purple-200 bg-white overflow-hidden">
            <div className="shrink-0 px-3 pt-2 pb-1.5 border-b border-purple-100 flex items-center gap-1.5">
              <Plus className="w-3 h-3 text-purple-600" />
              <span className="text-[11px] font-semibold tracking-wide text-purple-600">Wealth Client</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-2 space-y-2">
              {/* Single Advisor Notification card with prep brief + actions */}
              <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bell className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] font-bold text-purple-700">Advisor Notification</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 mb-2">
                  <p>Sent to: <span className="font-semibold text-slate-800">Assigned relationship manager</span></p>
                  <p>Suggested outreach: <span className="font-semibold text-slate-800">Within 5 business days</span></p>
                </div>

                {/* Prep brief */}
                <div className="rounded-md border border-purple-200/60 bg-white p-2 mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-purple-700">Prep Brief Includes</span>
                  </div>
                  <ul className="space-y-0.5 text-[11px] text-slate-700">
                    <li className="flex gap-1.5"><span className="text-purple-400 mt-1">•</span> <span>Suggested talking points based on detected signal</span></li>
                    <li className="flex gap-1.5"><span className="text-purple-400 mt-1">•</span> <span>Cross-sell opportunities aligned to behavior</span></li>
                    <li className="flex gap-1.5"><span className="text-purple-400 mt-1">•</span> <span>Recent activity summary</span></li>
                  </ul>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-purple-700">Actions</span>
                  </div>
                  {(() => {
                    const l = (effectiveSignal.label || "").toLowerCase();
                    let consultLabel = "Schedule Lifestyle Consultation";
                    if (/college/.test(l)) consultLabel = "Schedule 529 Consultation";
                    else if (/home|mortgage|down ?payment|house/.test(l)) consultLabel = "Schedule Mortgage Consultation";
                    else if (/gambl|vulnerab|hardship|stress/.test(l) || brief.sensitive) consultLabel = "Schedule Wellness Check-in";
                    const consultStyle = brief.sensitive
                      ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100";
                    return (
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Automated</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button className="text-left text-[11px] font-semibold rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
                              <Bell className="w-3 h-3 text-slate-500 shrink-0" /> <span className="truncate">Notify Wealth Advisor</span>
                            </button>
                            <button
                              type="button"
                              onClick={onOpenWMCopilot}
                              className="text-left text-[11px] font-semibold rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-slate-500 shrink-0" /> <span className="truncate">Open Full Intelligence Brief</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Advisor Actions</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button className={`text-left text-[11px] font-semibold rounded-md border px-2 py-1.5 inline-flex items-center gap-1 ${consultStyle}`}>
                              <Sparkles className="w-3 h-3 shrink-0 opacity-70" /> <span className="truncate">{consultLabel}</span>
                            </button>
                            <button className="text-left text-[11px] font-semibold rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
                              <Bell className="w-3 h-3 text-slate-500 shrink-0" /> <span className="truncate">Flag for Follow-up</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
