import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { Heart, GraduationCap, Home, Briefcase, Baby, Sunset, Gift, DollarSign, TrendingUp, Sparkles, ArrowRight, Shield, Calendar, MessageCircle, Star, Activity, PiggyBank, FileText, Send, Clock, MapPin } from "lucide-react";

interface Props {
  customer: DemoCustomer;
  detectedEvents?: DetectedLifeEventResult[];
}

const EVENT_META: Record<string, { icon: React.ElementType; color: string; description: string; suggestions: string[]; ctas: string[] }> = {
  "Retirement Planning": {
    icon: Sunset, color: "#f59e0b",
    description: "It looks like you're planning for the next chapter. We're here to help you get there confidently.",
    suggestions: ["Retirement savings options tailored to your timeline", "Tax-advantaged investment strategies", "Income planning for your future"],
    ctas: ["Open HY Savings", "Review IRA Options"],
  },
  "Education Funding": {
    icon: GraduationCap, color: "#3b82f6",
    description: "Education is a big step — let's make sure you're set up for success.",
    suggestions: ["Education savings accounts with tax benefits", "Flexible payment planning", "Scholarship and grant guidance"],
    ctas: ["Open HY Savings", "Apply for 529"],
  },
  "Home Purchase": {
    icon: Home, color: "#22c55e",
    description: "Buying a home is exciting! We can help make the process smoother.",
    suggestions: ["Pre-approval with competitive rates", "Down payment assistance programs", "Home buying cost calculator"],
    ctas: ["Open HY Savings", "Get Pre-Approved"],
  },
  "Wealth Transfer": {
    icon: Gift, color: "#8b5cf6",
    description: "Planning for your family's future is one of the most meaningful things you can do.",
    suggestions: ["Estate planning consultation", "Trust and gifting strategies", "Legacy planning tools"],
    ctas: ["Open HY Savings", "Plan Your Legacy"],
  },
  "Business Liquidity": {
    icon: Briefcase, color: "#64748b",
    description: "Your business is growing — let's keep your finances moving with it.",
    suggestions: ["Business line of credit options", "Cash flow optimization tools", "Commercial banking solutions"],
    ctas: ["Open HY Savings", "Apply for Credit Line"],
  },
  "Family Formation": {
    icon: Baby, color: "#ec4899",
    description: "Congratulations on this new chapter! Let us help you prepare financially.",
    suggestions: ["Family budgeting tools", "Insurance and protection plans", "Savings accounts for your growing family"],
    ctas: ["Open HY Savings", "Family Planning Tools"],
  },
  "Elder Care": {
    icon: Heart, color: "#ef4444",
    description: "Caring for loved ones matters. We have resources to support you.",
    suggestions: ["Long-term care planning", "Flexible savings options", "Caregiver support resources"],
    ctas: ["Open HY Savings", "Care Planning"],
  },
};

const DEFAULT_META = {
  icon: Sparkles, color: "#6366f1",
  description: "We've noticed something important in your financial journey. Let's explore how we can help.",
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

const WELLNESS_ITEMS = [
  { label: "Emergency fund", status: "Strong", color: "#22c55e" },
  { label: "Debt ratio", status: "Improving", color: "#3b82f6" },
  { label: "Savings rate", status: "On track", color: "#22c55e" },
];

export default function DemoWealthView({ customer, detectedEvents }: Props) {
  const holdings = customer.profile.holdings;
  const events = detectedEvents ?? [];
  const firstName = "{firstname}";
  const tenureYears = parseInt(customer.profile.tenure) || 8;
  const sinceYear = new Date().getFullYear() - tenureYears;
  const milestones = customer.profile.milestones ?? [];

  const quickActions = [
    { icon: PiggyBank, label: "Transfer to Savings" },
    { icon: Home, label: "Review Mortgage Rate" },
    { icon: GraduationCap, label: "Explore 529 Plans" },
    { icon: FileText, label: "Schedule Tax Review" },
  ];

  const holdingItems = [
    { label: "Savings & Deposits", value: holdings.deposit, icon: DollarSign, color: "#3b82f6" },
    { label: "Credit", value: holdings.credit, icon: DollarSign, color: "#f59e0b" },
    { label: "Mortgage", value: holdings.mortgage, icon: Home, color: "#22c55e" },
    { label: "Investments", value: holdings.investments, icon: TrendingUp, color: "#8b5cf6" },
  ];

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-3">

                {/* Greeting */}
                <p className="text-sm font-semibold text-slate-900 px-1">Welcome back, {firstName} <span className="font-normal text-slate-400">· {customer.profile.segment} Member</span></p>

                {/* Financial Snapshot */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[10px] font-semibold text-slate-700">Your Financial Snapshot</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {holdingItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Icon className="w-3 h-3" style={{ color: item.color }} />
                            <span className="text-[9px] text-slate-400">{item.label}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tenure + Deals + Wellness Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Relationship + Branch */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-semibold text-slate-700">Your Relationship</span>
                    </div>
                    <p className="text-xs text-slate-600">Valued member since <span className="font-semibold text-slate-900">{sinceYear}</span></p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <p className="text-[10px] text-slate-500">TCBY Westfield — <span className="text-emerald-600 font-medium">Open until 6:00 PM</span></p>
                    </div>
                  </div>

                  {/* Deals for You */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Gift className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-[10px] font-semibold text-slate-700">Deals for You</span>
                    </div>
                    {customer.deals.length > 0 && (() => {
                      const deal = customer.deals[0];
                      return (
                        <div className="rounded-lg border border-slate-100 p-2">
                          <p className="text-[11px] font-semibold text-slate-900 mb-0.5">{deal.brand}</p>
                          <p className="text-[10px] text-slate-500 leading-snug">{deal.offer}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Wellness Score */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-slate-700">Financial Wellness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-9 h-9">
                        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${78 * 0.942} 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-800">78</span>
                      </div>
                      <div className="space-y-0.5">
                        {WELLNESS_ITEMS.map(w => (
                          <div key={w.label} className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full" style={{ background: w.color }} />
                            <span className="text-[9px] text-slate-500">{w.label}: <span className="font-medium" style={{ color: w.color }}>{w.status}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-semibold text-slate-700 mb-2">Quick Actions</p>
                  <div className="grid grid-cols-4 gap-2">
                    {quickActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button key={action.label} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-[9px] text-slate-600 text-center leading-tight">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Life Events — Hero Section */}
                {events.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-400 px-1">Your Upcoming Milestones</p>
                    {events.map((event, i) => {
                      const meta = resolveEventMeta(event.event_name);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={i}
                          className="rounded-xl border bg-white overflow-hidden"
                          style={{ borderColor: `${meta.color}30` }}
                        >
                          <div className="p-4">
                            {/* Event header */}
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: `${meta.color}12` }}
                              >
                                <Icon className="w-4.5 h-4.5" style={{ color: meta.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{event.event_name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                              </div>
                            </div>
                            {/* Two-column: suggestions + advisor */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg p-3" style={{ background: `${meta.color}06` }}>
                                <p className="text-[10px] font-semibold text-slate-700 mb-2">How we can help</p>
                                <div className="space-y-1.5">
                                  {meta.suggestions.map((s, j) => (
                                    <div key={j} className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                                      <span className="text-xs text-slate-600">{s}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button className="text-[9px] font-semibold text-white rounded-md px-2.5 py-1.5 transition-colors" style={{ background: meta.color }}>
                                    {meta.ctas[0]}
                                  </button>
                                  <button className="text-[9px] font-semibold rounded-md px-2.5 py-1.5 border transition-colors" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
                                    {meta.ctas[1]}
                                  </button>
                                </div>
                              </div>
                              <div className="rounded-lg bg-slate-50 p-3 flex flex-col items-center text-center">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center mb-1.5">
                                  <span className="text-[10px] font-bold text-blue-700">JR</span>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-900">James Rivera</p>
                                <p className="text-[8px] text-slate-400">Senior Relationship Manager</p>
                                <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                                  "Hi {firstName}, let's plan together."
                                </p>
                                <div className="flex gap-1.5 mt-2">
                                  <button className="flex items-center gap-1 text-[9px] font-semibold text-white bg-blue-600 rounded-md px-2 py-1 hover:bg-blue-700 transition-colors">
                                    <Calendar className="w-2.5 h-2.5" /> Schedule
                                  </button>
                                  <button className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 bg-blue-50 rounded-md px-2 py-1 hover:bg-blue-100 transition-colors">
                                    <MessageCircle className="w-2.5 h-2.5" /> Message
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No events fallback */}
                {events.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                    <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Your personalized insights are on the way</p>
                    <p className="text-xs text-slate-400 mt-1">We're analyzing your activity to bring you tailored recommendations.</p>
                  </div>
                )}
      </div>
    </div>
  );
}
