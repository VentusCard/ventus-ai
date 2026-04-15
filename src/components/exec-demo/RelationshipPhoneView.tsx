import { Landmark, CreditCard, Home, BarChart3, Star, MapPin, Sunset, GraduationCap, Gift, Briefcase, Baby, Heart, Sparkles, Calendar, MessageCircle } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { LifeEvent } from "@/types/lifestyle-signals";

interface Props {
  customer: DemoCustomer;
  detectedLifeEvents?: LifeEvent[] | null;
  onGoToAI: (message: string) => void;
}

const HOLDINGS_ITEMS = [
  { key: "deposit" as const, label: "Savings", icon: Landmark, color: "#22c55e" },
  { key: "credit" as const, label: "Credit", icon: CreditCard, color: "#f59e0b" },
  { key: "mortgage" as const, label: "Mortgage", icon: Home, color: "#6366f1" },
  { key: "investments" as const, label: "Investments", icon: BarChart3, color: "#3b82f6" },
];

const EVENT_META: Record<string, { icon: React.ElementType; color: string; description: string; suggestions: string[]; ctas: string[] }> = {
  "Retirement Planning": {
    icon: Sunset, color: "#f59e0b",
    description: "Planning for the next chapter? We're here to help.",
    suggestions: ["Retirement savings options tailored to your timeline", "Tax-advantaged investment strategies", "Income planning for your future"],
    ctas: ["Open HY Savings", "Review IRA Options"],
  },
  "Education Funding": {
    icon: GraduationCap, color: "#3b82f6",
    description: "Education is a big step — let's make sure you're set up.",
    suggestions: ["Education savings accounts with tax benefits", "Flexible payment planning", "Scholarship and grant guidance"],
    ctas: ["Open HY Savings", "Apply for 529"],
  },
  "Home Purchase": {
    icon: Home, color: "#22c55e",
    description: "Buying a home is exciting! We can help make it smoother.",
    suggestions: ["Pre-approval with competitive rates", "Down payment assistance programs", "Home buying cost calculator"],
    ctas: ["Open HY Savings", "Get Pre-Approved"],
  },
  "Wealth Transfer": {
    icon: Gift, color: "#8b5cf6",
    description: "Planning for your family's future is meaningful.",
    suggestions: ["Estate planning consultation", "Trust and gifting strategies", "Legacy planning tools"],
    ctas: ["Open HY Savings", "Plan Your Legacy"],
  },
  "Business Liquidity": {
    icon: Briefcase, color: "#64748b",
    description: "Your business is growing — let's keep finances moving.",
    suggestions: ["Business line of credit options", "Cash flow optimization tools", "Commercial banking solutions"],
    ctas: ["Open HY Savings", "Apply for Credit Line"],
  },
  "Family Formation": {
    icon: Baby, color: "#ec4899",
    description: "Congratulations! Let us help you prepare financially.",
    suggestions: ["Family budgeting tools", "Insurance and protection plans", "Savings for your growing family"],
    ctas: ["Open HY Savings", "Family Planning Tools"],
  },
  "Elder Care": {
    icon: Heart, color: "#ef4444",
    description: "Caring for loved ones matters. We have resources.",
    suggestions: ["Long-term care planning", "Flexible savings options", "Caregiver support resources"],
    ctas: ["Open HY Savings", "Care Planning"],
  },
};

const DEFAULT_META = {
  icon: Sparkles, color: "#6366f1",
  description: "We've noticed something important in your journey.",
  suggestions: ["Personalized financial consultation", "Tailored product recommendations", "Schedule a call with an advisor"],
  ctas: ["Open HY Savings", "Learn More"],
};

const EVENT_KEYWORD_MAP: { keywords: string[]; key: string }[] = [
  { keywords: ["college", "education", "529", "tuition", "school", "university"], key: "Education Funding" },
  { keywords: ["retire", "retirement"], key: "Retirement Planning" },
  { keywords: ["home", "house", "mortgage", "property"], key: "Home Purchase" },
  { keywords: ["baby", "expecting", "family formation", "newborn", "child"], key: "Family Formation" },
  { keywords: ["elder", "care", "aging"], key: "Elder Care" },
  { keywords: ["wealth transfer", "estate", "legacy", "inheritance"], key: "Wealth Transfer" },
  { keywords: ["business", "liquidity"], key: "Business Liquidity" },
];

function resolveEventMeta(eventName: string) {
  if (EVENT_META[eventName]) return EVENT_META[eventName];
  const lower = eventName.toLowerCase();
  for (const entry of EVENT_KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return EVENT_META[entry.key];
    }
  }
  return DEFAULT_META;
}

export default function RelationshipPhoneView({ customer, detectedLifeEvents, onGoToAI }: Props) {
  const firstName = customer.profile.name.split(" ")[0];
  const holdings = customer.profile.holdings;

  // Use first detected event, or fall back to Education Funding
  const event = detectedLifeEvents?.[0] ?? { event_name: "Education Funding", confidence: 0.85 };
  const meta = resolveEventMeta(event.event_name);
  const Icon = meta.icon;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3 gap-2.5">
      {/* Greeting + Segment */}
      <div>
        <p className="text-[13px] font-semibold text-slate-800">Welcome, {firstName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-medium text-emerald-700 uppercase tracking-wider">
            {customer.profile.segment} Member
          </span>
        </div>
      </div>

      {/* Financial Snapshot 2×2 */}
      <div className="grid grid-cols-2 gap-2">
        {HOLDINGS_ITEMS.map((item) => {
          const HIcon = item.icon;
          const value = holdings?.[item.key] || "$0";
          return (
            <div key={item.key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <HIcon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
              <div className="min-w-0">
                <p className="text-[8px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-[11px] font-semibold text-slate-800 truncate">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenure + Branch */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5 text-amber-400" />
          Member since 2018
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-slate-400" />
          TCBY Westfield
        </span>
      </div>

      <div className="border-t border-slate-100" />

      {/* Life Event Card */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${meta.color}30` }}>
        <div className="p-3">
          {/* Event header */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}12` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-900">{event.event_name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{meta.description}</p>
            </div>
          </div>

          {/* Two-column: suggestions + advisor */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Left: How we can help */}
            <div className="rounded-lg p-2.5" style={{ background: `${meta.color}06` }}>
              <p className="text-[9px] font-semibold text-slate-700 mb-1.5">How we can help</p>
              <div className="space-y-1">
                {meta.suggestions.map((s, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1" style={{ background: meta.color }} />
                    <span className="text-[9px] text-slate-600 leading-snug">{s}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-2.5">
                <button className="text-[8px] font-semibold text-white rounded-md px-2 py-1 transition-colors" style={{ background: meta.color }}>
                  {meta.ctas[0]}
                </button>
                <button className="text-[8px] font-semibold rounded-md px-2 py-1 border transition-colors" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
                  {meta.ctas[1]}
                </button>
              </div>
            </div>

            {/* Right: Advisor card */}
            <div className="rounded-lg bg-slate-50 p-2.5 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center mb-1">
                <span className="text-[9px] font-bold text-blue-700">JR</span>
              </div>
              <p className="text-[9px] font-semibold text-slate-900">James Rivera</p>
              <p className="text-[7px] text-slate-400">Senior Relationship Manager</p>
              <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">
                "Hi {firstName}, let's plan together."
              </p>
              <div className="flex gap-1.5 mt-2">
                <button className="flex items-center gap-0.5 text-[8px] font-semibold text-white bg-blue-600 rounded-md px-1.5 py-1 hover:bg-blue-700 transition-colors">
                  <Calendar className="w-2 h-2" /> Schedule
                </button>
                <button
                  onClick={() => onGoToAI(`Hi, I'd like to discuss my ${event.event_name.toLowerCase()} plans`)}
                  className="flex items-center gap-0.5 text-[8px] font-semibold text-blue-600 bg-blue-50 rounded-md px-1.5 py-1 hover:bg-blue-100 transition-colors"
                >
                  <MessageCircle className="w-2 h-2" /> Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
