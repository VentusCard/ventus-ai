import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { Heart, GraduationCap, Home, Briefcase, Baby, Sunset, Gift, DollarSign, TrendingUp, Sparkles, ArrowRight, Shield } from "lucide-react";

interface Props {
  customer: DemoCustomer;
  detectedEvents?: DetectedLifeEventResult[];
}

const EVENT_META: Record<string, { icon: React.ElementType; color: string; description: string; suggestions: string[] }> = {
  "Retirement Planning": {
    icon: Sunset, color: "#f59e0b",
    description: "It looks like you're planning for the next chapter. We're here to help you get there confidently.",
    suggestions: ["Retirement savings options tailored to your timeline", "Tax-advantaged investment strategies", "Income planning for your future"],
  },
  "Education Funding": {
    icon: GraduationCap, color: "#3b82f6",
    description: "Education is a big step — let's make sure you're set up for success.",
    suggestions: ["Education savings accounts with tax benefits", "Flexible payment planning", "Scholarship and grant guidance"],
  },
  "Home Purchase": {
    icon: Home, color: "#22c55e",
    description: "Buying a home is exciting! We can help make the process smoother.",
    suggestions: ["Pre-approval with competitive rates", "Down payment assistance programs", "Home buying cost calculator"],
  },
  "Wealth Transfer": {
    icon: Gift, color: "#8b5cf6",
    description: "Planning for your family's future is one of the most meaningful things you can do.",
    suggestions: ["Estate planning consultation", "Trust and gifting strategies", "Legacy planning tools"],
  },
  "Business Liquidity": {
    icon: Briefcase, color: "#64748b",
    description: "Your business is growing — let's keep your finances moving with it.",
    suggestions: ["Business line of credit options", "Cash flow optimization tools", "Commercial banking solutions"],
  },
  "Family Formation": {
    icon: Baby, color: "#ec4899",
    description: "Congratulations on this new chapter! Let us help you prepare financially.",
    suggestions: ["Family budgeting tools", "Insurance and protection plans", "Savings accounts for your growing family"],
  },
  "Elder Care": {
    icon: Heart, color: "#ef4444",
    description: "Caring for loved ones matters. We have resources to support you.",
    suggestions: ["Long-term care planning", "Flexible savings options", "Caregiver support resources"],
  },
};

const DEFAULT_META = {
  icon: Sparkles, color: "#6366f1",
  description: "We've noticed something important in your financial journey. Let's explore how we can help.",
  suggestions: ["Personalized financial consultation", "Tailored product recommendations", "Schedule a call with an advisor"],
};

export default function DemoWealthView({ customer, detectedEvents }: Props) {
  const holdings = customer.profile.holdings;
  const events = detectedEvents ?? [];
  const firstName = customer.profile.name.split(" ")[0];

  const holdingItems = [
    { label: "Savings & Deposits", value: holdings.deposit, icon: DollarSign, color: "#3b82f6" },
    { label: "Credit", value: holdings.credit, icon: DollarSign, color: "#f59e0b" },
    { label: "Mortgage", value: holdings.mortgage, icon: Home, color: "#22c55e" },
    { label: "Investments", value: holdings.investments, icon: TrendingUp, color: "#8b5cf6" },
  ];

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[820px]">
        {/* iPad frame */}
        <div className="rounded-[2rem] border-[12px] border-slate-800 overflow-hidden bg-slate-800" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18), inset 0 0 0 2px rgba(255,255,255,0.05)" }}>
          {/* Camera */}
          <div className="flex justify-center py-1 bg-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
          </div>

          {/* Screen */}
          <div className="bg-slate-50 rounded-sm overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-1 bg-white border-b border-slate-100">
              <span className="text-[9px] font-semibold text-slate-500">9:41 AM</span>
              <span className="text-[9px] text-slate-400 font-mono">yourbank.com/banking</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-2 rounded-sm border border-slate-400 relative">
                  <div className="absolute inset-0.5 bg-green-500 rounded-[1px]" style={{ width: '70%' }} />
                </div>
              </div>
            </div>

          {/* Content area */}
          <div className="max-h-[600px] overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Greeting Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {customer.profile.name.split(" ").map(w => w[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Welcome back, {firstName}</p>
                    <p className="text-xs text-slate-500">{customer.profile.segment} Member · {customer.profile.tenure}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Based on your recent activity, we've put together personalized insights and recommendations just for you.
                </p>
              </div>

              {/* Life Events — Hero Section */}
              {events.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-400 px-1">Your Upcoming Milestones</p>
                  {events.map((event, i) => {
                    const meta = EVENT_META[event.event_name] ?? DEFAULT_META;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={i}
                        className="rounded-xl border bg-white overflow-hidden"
                        style={{ borderColor: `${meta.color}30` }}
                      >
                        <div className="p-4">
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

                          <div className="rounded-lg p-3 mb-3" style={{ background: `${meta.color}06` }}>
                            <p className="text-[10px] font-semibold text-slate-700 mb-2">How we can help</p>
                            <div className="space-y-1.5">
                              {meta.suggestions.map((s, j) => (
                                <div key={j} className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                                  <span className="text-xs text-slate-600">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition-colors"
                            style={{ color: meta.color, background: `${meta.color}08` }}
                          >
                            Explore Options <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Financial Snapshot */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">Your Financial Snapshot</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {holdingItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3 h-3" style={{ color: item.color }} />
                          <span className="text-[10px] text-slate-400">{item.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

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
          </div>

          {/* Bottom bezel / home indicator */}
          <div className="flex justify-center py-2 bg-slate-800">
            <div className="w-16 h-1 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
