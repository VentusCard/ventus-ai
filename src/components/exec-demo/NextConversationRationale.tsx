import { Mail, MessageSquare, Bell, Sparkles, ChevronRight, ArrowUpRight, Smartphone, UserCheck, CalendarCheck, Heart, Gift, Shield, Lightbulb, Star, Compass, Flower, PenLine, Cake, Plane, Home, Briefcase, Baby, PiggyBank, Landmark, ShieldAlert, Users, Send, Database, Zap, Activity, Brain, Radar, FileText, type LucideIcon } from "lucide-react";

/* ─── Context band: 3 rows describing the AI assistant ─── */
const CONTEXT_ROWS: Array<{
  label: string;
  icon: LucideIcon;
  accent: string;
  labelClass: string;
  pillClass: string;
  pills: string[];
}> = [
  {
    label: "Inputs",
    icon: Database,
    accent: "bg-slate-400",
    labelClass: "text-slate-600",
    pillClass: "border-slate-300 bg-white text-slate-700",
    pills: [
      "Transaction streams",
      "Account holdings",
      "Demographics",
      "Loans & credit",
      "KYC records",
      "Digital telemetry",
    ],
  },
  {
    label: "Capabilities",
    icon: Zap,
    accent: "bg-blue-500",
    labelClass: "text-blue-700",
    pillClass: "border-blue-300 bg-white text-blue-700",
    pills: [
      "Check balances & transactions",
      "Track spending & subscriptions",
      "Surface offers & deals",
      "Recommend bank products",
      "Plan major purchases",
      "Coach on goals & savings",
    ],
  },
  {
    label: "Routes To",
    icon: Send,
    accent: "bg-violet-500",
    labelClass: "text-violet-700",
    pillClass: "border-violet-300 bg-white text-violet-700",
    pills: [
      "Wealth advisors",
      "Insurance specialists",
      "Mortgage team",
      "Business banking",
      "Fraud operations",
      "Branch staff",
    ],
  },
];

function ContextPillRows() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5 space-y-2 divide-y divide-slate-100">
      {CONTEXT_ROWS.map((row, idx) => {
        const Icon = row.icon;
        return (
          <div
            key={row.label}
            className={`flex items-stretch gap-2.5 ${idx > 0 ? "pt-2" : ""}`}
          >
            <div className={`w-0.5 rounded-sm ${row.accent} shrink-0`} />
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider shrink-0 w-[110px] ${row.labelClass}`}
            >
              <Icon className="w-3 h-3" />
              {row.label}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {row.pills.map((p) => (
                <span
                  key={p}
                  className={`inline-flex items-center text-[12px] font-medium rounded-sm px-2 py-1 border shrink-0 ${row.pillClass}`}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
import type { CardActions, CardAction } from "./NextProductRationale";
import type { ProductCard } from "./ProductCardsPhoneView";

export type SignalKind = "lifeEvent" | "lifestyle" | "risk" | "segment" | "all";

export interface SelectedSignal {
  kind: SignalKind;
  label: string;
  source?: string;
}

interface Playbook {
  signalSource: string;
  automatedFlow: {
    channel: "Email" | "SMS" | "Push";
    subject: string;
    triggerLogic: string;
    sequence: string[];
  };
  chatbotContext: {
    knows: string[];
    canAnswer: string[];
  };
  advisorBrief: {
    recipient: string;
    briefBullets: string[];
    suggestedOutreach: string;
  };
}

const FALLBACK_PLAYBOOK: Playbook = {
  signalSource: "behavioral signal detected from transaction history",
  automatedFlow: {
    channel: "Email",
    subject: "A personalized recommendation for you",
    triggerLogic: "Signal detected → 24h delay → send",
    sequence: ["Educational nudge", "Product spotlight", "Soft conversion CTA"],
  },
  chatbotContext: {
    knows: ["Recent spending pattern", "Account holdings", "Recent product interactions"],
    canAnswer: ['"What products fit my situation?"', '"Show me relevant offers"'],
  },
  advisorBrief: {
    recipient: "Assigned relationship manager",
    briefBullets: [
      "Suggested talking points based on detected signal",
      "Cross-sell opportunities aligned to behavior",
      "Recent activity summary",
    ],
    suggestedOutreach: "Within 5 business days",
  },
};

// Synthesized risk-appropriate actions used when no risk product card was generated.
// Keyed loosely by the risk signal label/category. Always returns both standard + wow tones.
function synthesizeRiskActions(label: string): CardAction[] {
  const l = (label || "").toLowerCase();
  const isVice = /gambl|bet|sport|adult|payday|pawn|crypto/.test(l);
  const isIntl = /international|ofac|currency|sanction|foreign/.test(l);
  const isAML = /aml|structur|layer|kyc/.test(l);

  if (isVice) {
    return [
      { label: "Push: Set Merchant Block", icon: "shield", color: "slate", tone: "standard" },
      { label: "Suppress Category Marketing", icon: "bell", color: "slate", tone: "standard" },
      { label: "Discreet Wellness Check-in", icon: "user-check", color: "rose", tone: "wow" },
      { label: "Personalized Spending Limit", icon: "lightbulb", color: "indigo", tone: "wow" },
    ];
  }
  if (isIntl) {
    return [
      { label: "SMS Verification Sent", icon: "bell", color: "sky", tone: "standard" },
      { label: "Card-Freeze Quick Action", icon: "shield", color: "slate", tone: "standard" },
      { label: "Concierge Fraud-Team Callback", icon: "user-check", color: "rose", tone: "wow" },
    ];
  }
  if (isAML) {
    return [
      { label: "Flag for Compliance Review", icon: "shield", color: "slate", tone: "standard" },
      { label: "KYC Refresh Sent", icon: "bell", color: "indigo", tone: "standard" },
      { label: "Private Compliance Liaison", icon: "user-check", color: "indigo", tone: "wow" },
    ];
  }
  return [
    { label: "Account Review Flagged", icon: "shield", color: "slate", tone: "standard" },
    { label: "Discreet Advisor Outreach", icon: "user-check", color: "rose", tone: "wow" },
  ];
}

// Keyed by lowercased label; substring match
const PLAYBOOKS: Record<string, Playbook> = {
  "home buyer": {
    signalSource: "detected from escrow deposit + title insurance fees",
    automatedFlow: {
      channel: "Email",
      subject: '"Your home journey starts here"',
      triggerLogic: "Escrow detected → 24h delay → multi-step nurture",
      sequence: ["Mortgage pre-approval CTA", "Homeowners insurance bundle", "HELOC eligibility post-close"],
    },
    chatbotContext: {
      knows: ["Estimated closing date", "Down payment size", "Property location"],
      canAnswer: ['"When\'s my first mortgage payment?"', '"What insurance do I need?"', '"Can I open a HELOC?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Estate plan update for new property",
        "Jumbo mortgage vs portfolio loan analysis",
        "Liquidity timing for down payment",
      ],
      suggestedOutreach: "Within 48 hours",
    },
  },
  "new parent": {
    signalSource: "detected from hospital + baby retailer + pediatric purchases",
    automatedFlow: {
      channel: "Email",
      subject: '"Financial planning for your growing family"',
      triggerLogic: "Baby spend pattern → 3-day delay → family series",
      sequence: ["529 college savings intro", "Term life insurance review", "Joint account / beneficiary update"],
    },
    chatbotContext: {
      knows: ["Approximate child arrival window", "Healthcare spend changes", "Updated household income needs"],
      canAnswer: ['"How do I open a 529?"', '"Should I update my beneficiaries?"', '"What insurance should I add?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Estate plan + guardianship documentation review",
        "529 funding strategy aligned to projected tuition",
        "Term life coverage gap analysis",
      ],
      suggestedOutreach: "Within 1 week",
    },
  },
  "retirement": {
    signalSource: "detected from age cohort + 401k contribution shifts + planning searches",
    automatedFlow: {
      channel: "Email",
      subject: '"Your retirement readiness check-in"',
      triggerLogic: "Pre-retirement cohort → quarterly nurture",
      sequence: ["Income replacement calculator", "Roth conversion education", "Medicare timing reminder"],
    },
    chatbotContext: {
      knows: ["Years to target retirement", "Tax-deferred balance", "Social Security timing"],
      canAnswer: ['"When can I retire?"', '"Should I do a Roth conversion?"', '"How do I enroll in Medicare?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Glide-path rebalancing recommendation",
        "Roth conversion ladder modeling",
        "Withdrawal sequencing & tax optimization plan",
      ],
      suggestedOutreach: "Within 2 weeks · schedule annual review",
    },
  },
  "wealth transfer": {
    signalSource: "detected from large inflow + estate attorney payments",
    automatedFlow: {
      channel: "Email",
      subject: '"Planning your inheritance with confidence"',
      triggerLogic: "Large inflow detected → 48h delay → discreet outreach",
      sequence: ["Trust & estate primer", "Investment policy statement intro", "Family governance resources"],
    },
    chatbotContext: {
      knows: ["Approximate transfer size", "Account funding source", "Existing investment posture"],
      canAnswer: ['"How should I invest an inheritance?"', '"Do I need a trust?"', '"What are the tax implications?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor + estate specialist",
      briefBullets: [
        "Generational wealth strategy session",
        "Trust structuring & beneficiary alignment",
        "Tax-loss harvesting & step-up basis review",
      ],
      suggestedOutreach: "Within 24 hours",
    },
  },
  "travel": {
    signalSource: "detected from airline + lodging + foreign currency activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Your travel-ready toolkit"',
      triggerLogic: "Travel booking detected → immediate pre-trip series",
      sequence: ["No-foreign-fee card highlight", "Travel insurance offer", "Trip rewards reminder"],
    },
    chatbotContext: {
      knows: ["Upcoming destination", "Trip duration", "Card with best travel rewards"],
      canAnswer: ['"Which card should I use abroad?"', '"How do I avoid FX fees?"', '"Add travel insurance?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Liquidity check for extended travel",
        "Concierge / premium card upgrade discussion",
        "International account access readiness",
      ],
      suggestedOutreach: "Pre-trip courtesy call",
    },
  },
  "luxury": {
    signalSource: "detected from premium retailer + high-ticket discretionary spend",
    automatedFlow: {
      channel: "Email",
      subject: '"Exclusive benefits matched to how you spend"',
      triggerLogic: "Luxury pattern → monthly curated series",
      sequence: ["Premium card upgrade offer", "Concierge benefits showcase", "Private banking invitation"],
    },
    chatbotContext: {
      knows: ["Preferred retailer categories", "Average ticket size", "Reward potential"],
      canAnswer: ['"Am I missing rewards?"', '"What perks come with my card?"', '"How do I unlock concierge?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Private banking eligibility review",
        "Lifestyle financing options (art, auto, jewelry)",
        "Concierge & exclusive access onboarding",
      ],
      suggestedOutreach: "Within 1 week",
    },
  },
  "health": {
    signalSource: "detected from gym, wellness, and healthy retailer activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Wellness rewards just for you"',
      triggerLogic: "Wellness pattern → monthly perk drops",
      sequence: ["HSA contribution nudge", "Wellness merchant cashback", "Fitness partner offers"],
    },
    chatbotContext: {
      knows: ["Wellness category spend", "HSA contribution status", "Recurring gym/wellness subs"],
      canAnswer: ['"Should I contribute more to my HSA?"', '"Any wellness cashback?"', '"Best card for fitness spend?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "HSA maximization as long-term vehicle",
        "Long-term care planning conversation",
        "Health-aligned investment themes",
      ],
      suggestedOutreach: "Next scheduled review",
    },
  },
  "gambling": {
    signalSource: "detected from gambling MCC transactions",
    automatedFlow: {
      channel: "Push",
      subject: '"A discreet check-in on your spending"',
      triggerLogic: "Risk threshold crossed → wellness check (no marketing)",
      sequence: ["Spending insights nudge", "Self-control tools (limits, alerts)", "Confidential support resources"],
    },
    chatbotContext: {
      knows: ["Recent gambling-category spend pattern", "Available account controls", "Support resource directory"],
      canAnswer: ['"Can I set a spending limit?"', '"How do I block certain merchants?"', '"Where can I get support?"'],
    },
    advisorBrief: {
      recipient: "Compliance + wealth advisor",
      briefBullets: [
        "Compliance escalation per risk policy",
        "Discreet wellness conversation talking points",
        "Account control & monitoring recommendations",
      ],
      suggestedOutreach: "Compliance review within 24 hours",
    },
  },
  "suspicious": {
    signalSource: "detected from anomalous international or high-risk activity",
    automatedFlow: {
      channel: "SMS",
      subject: '"Confirm recent activity on your account"',
      triggerLogic: "Anomaly score crossed → immediate verification",
      sequence: ["Transaction confirmation prompt", "Card-freeze quick action", "Fraud team callback option"],
    },
    chatbotContext: {
      knows: ["Flagged transaction details", "Account verification status", "Card-control options"],
      canAnswer: ['"Was this transaction me?"', '"Freeze my card now"', '"Connect me to fraud team"'],
    },
    advisorBrief: {
      recipient: "Compliance + wealth advisor",
      briefBullets: [
        "AML/KYC review per policy",
        "Coordinated client outreach script",
        "Account monitoring & travel-notice update",
      ],
      suggestedOutreach: "Compliance review within 24 hours",
    },
  },
  "adult": {
    signalSource: "detected from adult-content merchant activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Quiet account controls available"',
      triggerLogic: "Sensitive category detected → discreet, non-marketing surface",
      sequence: ["Privacy & control reminder", "Statement-detail preferences", "No further marketing on category"],
    },
    chatbotContext: {
      knows: ["Available privacy controls", "Statement preferences", "Account controls"],
      canAnswer: ['"How do I hide statement details?"', '"Set merchant controls"'],
    },
    advisorBrief: {
      recipient: "Compliance review (no advisor outreach)",
      briefBullets: [
        "No proactive outreach — privacy first",
        "Log per compliance policy",
        "Suppress related marketing",
      ],
      suggestedOutreach: "No proactive outreach",
    },
  },
};

function findPlaybook(label: string): Playbook {
  const key = label.toLowerCase();
  for (const k of Object.keys(PLAYBOOKS)) {
    if (key.includes(k)) return PLAYBOOKS[k];
  }
  return { ...FALLBACK_PLAYBOOK, signalSource: `detected from ${label.toLowerCase()} signal` };
}

// ─── Static Wealth Copilot preview content keyed by playbook key ───
interface WealthSignalCard {
  icon: LucideIcon;
  label: string;
  confidence: number;
  urgency: "Urgent" | "Soon" | "Upcoming";
  evidence: string;
}
interface WealthPreview {
  signals: WealthSignalCard[];
  talkingPoints: [string, string, string];
  nextSteps: { when: string; action: string }[];
  chatPreview: { assistant: string; user: string };
}

const STATIC_WEALTH_PREVIEW: Record<string, WealthPreview> = {
  "home buyer": {
    signals: [
      { icon: Home, label: "Home Purchase", confidence: 92, urgency: "Urgent", evidence: "Escrow deposit + title insurance fees this week" },
      { icon: Briefcase, label: "Liquidity Shift", confidence: 78, urgency: "Soon", evidence: "Brokerage drawdown matches down-payment range" },
    ],
    talkingPoints: [
      "Congratulate on the home and offer a jumbo vs portfolio loan walkthrough.",
      "Suggest revisiting the estate plan to add the new property.",
      "Tee up HELOC eligibility for post-close liquidity.",
    ],
    nextSteps: [
      { when: "Today", action: "Review prep brief + closing timeline" },
      { when: "Tomorrow", action: "Send personal congratulations note" },
      { when: "This week", action: "Schedule mortgage strategy call" },
      { when: "Post-close", action: "Trigger HELOC eligibility review" },
    ],
    chatPreview: {
      assistant: "I've prepped a brief on the home-purchase signal — want me to draft a personal note and a jumbo vs portfolio loan one-pager?",
      user: "Yes, draft both.",
    },
  },
  "new parent": {
    signals: [
      { icon: Baby, label: "New Parent", confidence: 88, urgency: "Soon", evidence: "Hospital + pediatric + baby retailer activity" },
      { icon: Shield, label: "Coverage Gap", confidence: 71, urgency: "Soon", evidence: "Term life policy below recommended household ratio" },
    ],
    talkingPoints: [
      "Open the 529 conversation framed around projected tuition.",
      "Walk through guardianship + beneficiary updates on the estate plan.",
      "Quantify the term life coverage gap with a quick scenario.",
    ],
    nextSteps: [
      { when: "Today", action: "Review family + coverage prep brief" },
      { when: "This week", action: "Send congratulations + 529 primer" },
      { when: "Next 10 days", action: "Schedule estate doc refresh" },
      { when: "Within 30 days", action: "Present term life options" },
    ],
    chatPreview: {
      assistant: "New parent signal detected. Want me to model a 529 contribution plan against their tax bracket?",
      user: "Yes, and add a coverage scenario.",
    },
  },
  "retirement": {
    signals: [
      { icon: PiggyBank, label: "Pre-Retirement", confidence: 84, urgency: "Upcoming", evidence: "Catch-up 401k contributions + planning searches" },
      { icon: Landmark, label: "Roth Window", confidence: 69, urgency: "Soon", evidence: "Income dip creates favorable conversion year" },
    ],
    talkingPoints: [
      "Frame a glide-path rebalance for the next 5 years.",
      "Walk through a Roth conversion ladder with tax modeling.",
      "Confirm Medicare timing and Social Security election plan.",
    ],
    nextSteps: [
      { when: "This week", action: "Review retirement readiness brief" },
      { when: "Next 2 weeks", action: "Schedule annual planning review" },
      { when: "Before year-end", action: "Execute Roth conversion ladder" },
      { when: "Q1", action: "Coordinate Medicare enrollment timeline" },
    ],
    chatPreview: {
      assistant: "Their income dip opens a Roth conversion window. Want me to draft a 3-year ladder?",
      user: "Yes, model it through year-end.",
    },
  },
  "wealth transfer": {
    signals: [
      { icon: Landmark, label: "Estate Inflow", confidence: 95, urgency: "Urgent", evidence: "Large inflow + estate attorney payments" },
      { icon: Briefcase, label: "Trust Need", confidence: 82, urgency: "Soon", evidence: "No existing trust structure on file" },
    ],
    talkingPoints: [
      "Open a discreet generational wealth strategy conversation.",
      "Walk through trust structuring and beneficiary alignment.",
      "Cover step-up basis and tax-loss harvesting opportunities.",
    ],
    nextSteps: [
      { when: "Within 24h", action: "Send discreet outreach + brief" },
      { when: "This week", action: "Co-meeting with estate specialist" },
      { when: "Next 2 weeks", action: "Draft investment policy statement" },
      { when: "30 days", action: "Family governance kick-off" },
    ],
    chatPreview: {
      assistant: "Large inflow detected — I've prepped trust + IPS materials. Want me to loop in the estate specialist?",
      user: "Yes, schedule a joint call.",
    },
  },
  "travel": {
    signals: [
      { icon: Plane, label: "Premium Traveler", confidence: 81, urgency: "Soon", evidence: "Airline + lodging + FX activity this quarter" },
      { icon: Star, label: "Upgrade Eligible", confidence: 64, urgency: "Upcoming", evidence: "Spend pattern qualifies for concierge tier" },
    ],
    talkingPoints: [
      "Offer a pre-trip courtesy call and travel-ready toolkit.",
      "Discuss premium card upgrade with concierge benefits.",
      "Confirm international account access and travel notice.",
    ],
    nextSteps: [
      { when: "Pre-trip", action: "Send travel-ready toolkit" },
      { when: "This week", action: "Courtesy call on upcoming trip" },
      { when: "Post-trip", action: "Review premium card upgrade" },
      { when: "Quarterly", action: "Liquidity check for travel cadence" },
    ],
    chatPreview: {
      assistant: "Travel pattern suggests concierge-tier eligibility. Want a one-pager on the upgrade benefits?",
      user: "Yes, send it over.",
    },
  },
  "luxury": {
    signals: [
      { icon: Sparkles, label: "Luxury Spender", confidence: 86, urgency: "Soon", evidence: "Premium retailer + high-ticket discretionary spend" },
      { icon: Star, label: "Private Banking Fit", confidence: 73, urgency: "Upcoming", evidence: "Asset profile crosses private-bank threshold" },
    ],
    talkingPoints: [
      "Review private banking eligibility and onboarding.",
      "Introduce lifestyle financing options (art, auto, jewelry).",
      "Showcase concierge and exclusive access perks.",
    ],
    nextSteps: [
      { when: "This week", action: "Send private banking invitation" },
      { when: "Next 10 days", action: "Schedule lifestyle financing review" },
      { when: "Within 30 days", action: "Concierge onboarding session" },
      { when: "Quarterly", action: "Curated exclusive access drop" },
    ],
    chatPreview: {
      assistant: "Spend profile fits private banking. Want me to prep the invitation and benefits one-pager?",
      user: "Yes, draft both.",
    },
  },
  "health": {
    signals: [
      { icon: Heart, label: "Wellness Engaged", confidence: 77, urgency: "Upcoming", evidence: "Recurring fitness + wellness merchant activity" },
      { icon: PiggyBank, label: "HSA Underused", confidence: 68, urgency: "Soon", evidence: "Contributing below annual maximum" },
    ],
    talkingPoints: [
      "Frame HSA as a long-term tax-advantaged vehicle.",
      "Open the long-term care planning conversation.",
      "Discuss health-aligned investment themes.",
    ],
    nextSteps: [
      { when: "Next review", action: "Walk through HSA maximization" },
      { when: "This quarter", action: "Long-term care planning intro" },
      { when: "Annual review", action: "Add health-aligned themes" },
      { when: "Ongoing", action: "Surface wellness partner perks" },
    ],
    chatPreview: {
      assistant: "Their HSA is underused — want a model showing 20-year compounding vs current path?",
      user: "Yes, run the comparison.",
    },
  },
  "gambling": {
    signals: [
      { icon: ShieldAlert, label: "Vice Risk", confidence: 89, urgency: "Urgent", evidence: "Repeat gambling-MCC activity above threshold" },
      { icon: Shield, label: "Control Gap", confidence: 72, urgency: "Soon", evidence: "No spending limits or merchant blocks set" },
    ],
    talkingPoints: [
      "Lead with a discreet, non-judgmental wellness check-in.",
      "Walk through optional spending limits and merchant blocks.",
      "Share confidential support resources, no marketing.",
    ],
    nextSteps: [
      { when: "Within 24h", action: "Compliance escalation per policy" },
      { when: "This week", action: "Discreet advisor wellness check-in" },
      { when: "On request", action: "Activate spending controls" },
      { when: "Ongoing", action: "Suppress related marketing" },
    ],
    chatPreview: {
      assistant: "Sensitive signal flagged. Want a discreet talking-points script (no marketing) for the check-in?",
      user: "Yes, keep it gentle.",
    },
  },
  "suspicious": {
    signals: [
      { icon: ShieldAlert, label: "Anomalous Activity", confidence: 91, urgency: "Urgent", evidence: "International + high-risk merchant anomalies" },
      { icon: Shield, label: "Verification Pending", confidence: 80, urgency: "Urgent", evidence: "No travel notice on file for region" },
    ],
    talkingPoints: [
      "Confirm recent activity through coordinated client outreach.",
      "Walk through card-freeze and quick controls if needed.",
      "Reset travel notice and account monitoring preferences.",
    ],
    nextSteps: [
      { when: "Within 24h", action: "AML/KYC compliance review" },
      { when: "Today", action: "Coordinated client verification call" },
      { when: "Same day", action: "Update travel notice + monitoring" },
      { when: "This week", action: "Document outcome per policy" },
    ],
    chatPreview: {
      assistant: "Anomaly flagged. Want a verification call script aligned with compliance policy?",
      user: "Yes, send it.",
    },
  },
  "adult": {
    signals: [
      { icon: Shield, label: "Privacy-Sensitive", confidence: 70, urgency: "Upcoming", evidence: "Adult-content merchant activity" },
      { icon: Bell, label: "No Outreach", confidence: 100, urgency: "Upcoming", evidence: "Privacy-first policy applies" },
    ],
    talkingPoints: [
      "No proactive outreach — privacy-first policy.",
      "If client raises it, offer statement-detail preferences.",
      "Confirm marketing suppression on the category.",
    ],
    nextSteps: [
      { when: "Today", action: "Log per compliance policy" },
      { when: "Ongoing", action: "Suppress related marketing" },
      { when: "On request", action: "Adjust statement preferences" },
      { when: "On request", action: "Apply merchant controls" },
    ],
    chatPreview: {
      assistant: "Privacy-sensitive signal — no outreach. Want me to confirm marketing suppression is active?",
      user: "Yes, please confirm.",
    },
  },
};

const FALLBACK_WEALTH_PREVIEW: WealthPreview = {
  signals: [
    { icon: Sparkles, label: "Behavioral Signal", confidence: 70, urgency: "Soon", evidence: "Pattern detected from recent transaction history" },
    { icon: Users, label: "Segment Match", confidence: 62, urgency: "Upcoming", evidence: "Aligns with high-value advisor cohort" },
  ],
  talkingPoints: [
    "Acknowledge the recent behavior with a relevant talking point.",
    "Surface a cross-sell opportunity aligned to the signal.",
    "Confirm next planning checkpoint on the calendar.",
  ],
  nextSteps: [
    { when: "This week", action: "Review prep brief" },
    { when: "Within 5 days", action: "Send personalized outreach" },
    { when: "Next 2 weeks", action: "Schedule planning conversation" },
    { when: "Ongoing", action: "Monitor signal evolution" },
  ],
  chatPreview: {
    assistant: "I've prepped a brief on this signal. Want me to draft the outreach?",
    user: "Yes, draft it.",
  },
};

function findWealthPreview(label: string): WealthPreview {
  const key = label.toLowerCase();
  for (const k of Object.keys(STATIC_WEALTH_PREVIEW)) {
    if (key.includes(k)) return STATIC_WEALTH_PREVIEW[k];
  }
  return FALLBACK_WEALTH_PREVIEW;
}

const URGENCY_STYLES: Record<WealthSignalCard["urgency"], string> = {
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
  Soon: "bg-amber-50 text-amber-700 border-amber-200",
  Upcoming: "bg-slate-50 text-slate-600 border-slate-200",
};

const KIND_META: Record<SignalKind, { label: string; color: string; bg: string; border: string }> = {
  lifeEvent: { label: "Life Event", color: "#92400e", bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.35)" },
  lifestyle: { label: "Spending Habit", color: "#0e7490", bg: "rgba(6,182,212,.10)", border: "rgba(6,182,212,.32)" },
  risk: { label: "Risk", color: "#991b1b", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.32)" },
  segment: { label: "Segment", color: "#5b21b6", bg: "rgba(139,92,246,.10)", border: "rgba(139,92,246,.32)" },
  all: { label: "All Signals", color: "#334155", bg: "rgba(100,116,139,.10)", border: "rgba(100,116,139,.32)" },
};

// Local action pill icon/color maps (mirror NextProductRationale)
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
  slate: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

function renderActionPill(action: CardAction, key: string | number) {
  const IconComp = ICON_MAP[action.icon] || Bell;
  const colors = COLOR_MAP[action.color] || COLOR_MAP.violet;
  const isWow = action.tone === "wow";
  return (
    <span
      key={key}
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 border ${colors.text} ${colors.bg} ${colors.border}`}
      style={isWow ? { boxShadow: "0 0 0 1px currentColor" } : undefined}
    >
      {isWow && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
      <IconComp className="w-3 h-3" />
      {action.label}
    </span>
  );
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
}

export default function NextConversationRationale({
  selectedSignal,
  availableSignals = [],
  customerFirstName = "the client",
  productActions,
  actionsLoading,
  productCards,
  onSelectSignal,
  onOpenWMCopilot,
  onOpenAIAssistant,
}: Props) {
  const effectiveSignal: SelectedSignal =
    selectedSignal ?? availableSignals[0] ?? { kind: "all", label: "All Signals" };

  // ALL SIGNALS view — compact roll-up
  if (effectiveSignal.kind === "all") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Orchestration roll-up · all signals
        </div>
        <div className="space-y-1.5">
          {availableSignals.length === 0 && (
            <div className="text-[11px] text-slate-400 italic">No signals detected yet</div>
          )}
          {availableSignals.map((s) => {
            const pb = findPlaybook(s.label);
            const meta = KIND_META[s.kind];
            return (
              <button
                key={`${s.kind}-${s.label}`}
                onClick={() => onSelectSignal?.(s)}
                className="w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  {meta.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-700">{s.label}</span>
                <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                  <ChannelIcon channel={pb.automatedFlow.channel} /> {pb.automatedFlow.channel}
                  <> · <Bell className="w-2.5 h-2.5 inline" /> Advisor</>
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const playbook = findPlaybook(effectiveSignal.label);
  const meta = KIND_META[effectiveSignal.kind];

  // 3-tier resolver: matches the selected signal to actions from generate-product-actions.
  // Tier 1: exact/substring match on signal_label.
  // Tier 2: token-overlap scoring against signal_label + theme (mirrors NextProductRationale).
  // Tier 3: kind-aware fallback. For risk signals with no risk card at all, synthesize defaults.
  const matchedActions: CardAction[] = (() => {
    if (!productCards || productCards.length === 0) {
      return effectiveSignal.kind === "risk" ? synthesizeRiskActions(effectiveSignal.label) : [];
    }
    const cards = productCards as unknown as Array<{ signal_label?: string; theme?: string; type?: string }>;
    const sigLower = effectiveSignal.label.toLowerCase();

    // Tier 1
    let matchIdx = cards.findIndex(c => {
      const cl = (c.signal_label || "").toLowerCase();
      return !!cl && (cl.includes(sigLower) || sigLower.includes(cl));
    });

    // Tier 2 — token overlap
    if (matchIdx === -1) {
      const STOP = new Set(["the","and","for","with","your","you","are","from","this","that","into","over","under","new","high","low"]);
      const tokenize = (s: string) => s.toLowerCase().split(/[\s,&/-]+/).filter(w => w.length > 2 && !STOP.has(w));
      const sigTokens = new Set(tokenize(effectiveSignal.label));
      let bestScore = 0;
      cards.forEach((c, i) => {
        const cTokens = [...tokenize(c.signal_label || ""), ...tokenize(c.theme || "")];
        const score = cTokens.filter(t => sigTokens.has(t)).length;
        if (score > bestScore) { bestScore = score; matchIdx = i; }
      });
      if (bestScore < 1) matchIdx = -1;
    }

    // Tier 3 — kind-aware fallback
    if (matchIdx === -1) {
      if (effectiveSignal.kind === "risk") {
        const riskIdx = cards.findIndex(c => c.type === "risk");
        if (riskIdx === -1) return synthesizeRiskActions(effectiveSignal.label);
        matchIdx = riskIdx;
      } else if (effectiveSignal.kind === "lifeEvent") {
        matchIdx = cards.findIndex(c => c.type === "life_event");
        if (matchIdx === -1) matchIdx = cards.findIndex(c => c.type !== "risk");
      } else {
        // lifestyle / segment / all
        matchIdx = cards.findIndex(c => c.type === "behavioral");
        if (matchIdx === -1) matchIdx = cards.findIndex(c => c.type !== "risk");
      }
    }

    if (matchIdx === -1) {
      return effectiveSignal.kind === "risk" ? synthesizeRiskActions(effectiveSignal.label) : [];
    }
    if (!productActions || productActions.length === 0) {
      return effectiveSignal.kind === "risk" && cards[matchIdx]?.type !== "risk"
        ? synthesizeRiskActions(effectiveSignal.label)
        : [];
    }
    const found = productActions.find(a => a.card_index === matchIdx);
    const actions = found?.actions || [];
    // If we ended up on a non-risk card for a risk signal, ignore those marketing actions.
    if (effectiveSignal.kind === "risk" && cards[matchIdx]?.type !== "risk") {
      return synthesizeRiskActions(effectiveSignal.label);
    }
    return actions;
  })();

  const wowActions = matchedActions.filter(a => a.tone === "wow");
  const standardActions = matchedActions.filter(a => a.tone === "standard");

  const wp = findWealthPreview(effectiveSignal.label);
  const primarySignal = wp.signals[0];
  const PrimaryIcon = primarySignal?.icon;
  const secondarySignal = wp.signals[1];
  const SecondaryIcon = secondarySignal?.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-1.5 flex flex-col h-full min-h-0">
      {/* Context band — pinned at top */}
      <div className="shrink-0">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-900 mb-1">AI Native Intelligence Layer</h3>
        <ContextPillRows />
      </div>

      {/* Two journeys — stacked 50/50, each is a single horizontal flow: SIGNAL → INTENT → PERSONALIZE → ORCHESTRATE */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-900 shrink-0">Personalized Engagement Orchestration</h3>
        {/* ───────── REGULAR CLIENT — automated machine ───────── */}
        <article className="flex-1 basis-0 min-h-0 rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col">
          {/* Brand strip */}
          <div className="h-[6px] shrink-0" style={{ background: "linear-gradient(90deg,#3b82f6,#1d4ed8)" }} />

          {/* Eyebrow */}
          <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Regular Client</span>
            <span className="ml-auto text-[10px] font-semibold text-blue-700 bg-blue-100/80 border border-blue-200 rounded-full px-2 py-0.5">
              Automated · 0 advisor time
            </span>
          </div>

          {/* Horizontal flow — workflow showcase, signal-agnostic */}
          <div className="grid grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1.05fr)_12px_140px] gap-0 px-3.5 pb-3 flex-1 min-h-0">
            {/* 1. SIGNAL → INTENT (merged) */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1 shrink-0">Signal → Intent</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-blue-200 shrink-0">
                  <Brain className="w-3 h-3 text-blue-600" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Behavior decoded</div>
              </div>
            </div>
            <div className="flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-blue-200" /></div>

            {/* 3. PERSONALIZE */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1 shrink-0">Personalize</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-blue-200 shrink-0">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Message crafted</div>
              </div>
            </div>
            <div className="flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-blue-300" /></div>

            {/* 4. ORCHESTRATE — accented, content only */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-blue-300 bg-blue-50/70 px-2.5 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-1 shrink-0">Orchestrate</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-blue-300 shrink-0">
                  <Send className="w-3 h-3 text-blue-700" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Delivered automatically</div>
              </div>
            </div>

            {/* spacer */}
            <div />

            {/* 5. CTA — separate column, vertically centered */}
            <div className="min-w-0 flex items-center">
              <button
                onClick={onOpenAIAssistant}
                className="w-full inline-flex items-center justify-between gap-1.5 text-[11px] font-bold rounded-lg px-2.5 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Open AI Assistant
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>

        {/* ───────── WEALTH CLIENT — AI-prepped human conversation ───────── */}
        <article className="flex-1 basis-0 min-h-0 rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col">
          {/* Brand strip */}
          <div className="h-[6px] shrink-0" style={{ background: "linear-gradient(90deg,#8b5cf6,#6d28d9)" }} />

          {/* Eyebrow */}
          <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Wealth Client <span className="text-purple-400">(+)</span>
            </span>
            <span className="ml-auto text-[10px] font-semibold text-purple-700 bg-purple-100/80 border border-purple-200 rounded-full px-2 py-0.5">
              Advisor-led · AI prepped
            </span>
          </div>

          {/* Horizontal flow — workflow showcase, signal-agnostic */}
          <div className="grid grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1.05fr)_12px_140px] gap-0 px-3.5 pb-3 flex-1 min-h-0">
            {/* 1. SIGNAL → INTENT (merged) */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-purple-500 mb-1 shrink-0">Signal → Intent</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-purple-200 shrink-0">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Signals synthesized</div>
              </div>
            </div>
            <div className="flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-purple-200" /></div>

            {/* 3. PERSONALIZE */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-purple-500 mb-1 shrink-0">Personalize</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-purple-200 shrink-0">
                  <FileText className="w-3 h-3 text-purple-600" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Brief tailored</div>
              </div>
            </div>
            <div className="flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-purple-300" /></div>

            {/* 4. ORCHESTRATE — accented, content only */}
            <div className="min-h-0 min-w-0 flex flex-col rounded-md border border-purple-300 bg-purple-50/70 px-2.5 py-1.5 overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-purple-700 mb-1 shrink-0">Orchestrate</div>
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-purple-300 shrink-0">
                  <CalendarCheck className="w-3 h-3 text-purple-700" />
                </span>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">Conversation scheduled</div>
              </div>
            </div>

            {/* spacer */}
            <div />

            {/* 5. CTA — separate column, vertically centered */}
            <div className="min-w-0 flex items-center">
              <button
                onClick={onOpenWMCopilot}
                className="w-full inline-flex items-center justify-between gap-1.5 text-[11px] font-bold rounded-lg px-2.5 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
              >
                Open WM Copilot
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function ChannelIcon({ channel, color = "currentColor" }: { channel: "Email" | "SMS" | "Push"; color?: string }) {
  if (channel === "Email") return <Mail className="w-3 h-3" style={{ color }} />;
  if (channel === "SMS") return <MessageSquare className="w-3 h-3" style={{ color }} />;
  return <Bell className="w-3 h-3" style={{ color }} />;
}
