import { TrendingUp, GraduationCap, Plane, ChevronRight, Landmark, CreditCard, Home, BarChart3, Star, MapPin } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";

interface Props {
  customer: DemoCustomer;
  onGoToAI: () => void;
}

const HOLDINGS_ITEMS = [
  { key: "deposit" as const, label: "Savings", icon: Landmark, color: "#22c55e" },
  { key: "credit" as const, label: "Credit", icon: CreditCard, color: "#f59e0b" },
  { key: "mortgage" as const, label: "Mortgage", icon: Home, color: "#6366f1" },
  { key: "investments" as const, label: "Investments", icon: BarChart3, color: "#3b82f6" },
];

const INSIGHT_HOOKS = [
  {
    icon: TrendingUp,
    color: "#22c55e",
    bg: "bg-emerald-50",
    title: "Your savings rate is up 12%",
    subtitle: "Want to optimize further?",
  },
  {
    icon: GraduationCap,
    color: "#6366f1",
    bg: "bg-indigo-50",
    title: "A milestone is coming up",
    subtitle: "Let's plan together.",
  },
  {
    icon: Plane,
    color: "#f59e0b",
    bg: "bg-amber-50",
    title: "A travel card could save you $400/yr",
    subtitle: "Based on your lifestyle.",
  },
];

export default function RelationshipPhoneView({ customer, onGoToAI }: Props) {
  const firstName = customer.profile.name.split(" ")[0];
  const holdings = customer.profile.holdings;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3 gap-3">
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
          const Icon = item.icon;
          const value = holdings?.[item.key] || "$0";
          return (
            <div key={item.key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
              <div className="min-w-0">
                <p className="text-[8px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-[11px] font-semibold text-slate-800 truncate">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenure + Branch + Wellness */}
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

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* AI Hooks */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-0.5">
          ✨ Insights for You
        </p>
        <div className="flex flex-col gap-2">
          {INSIGHT_HOOKS.map((hook, i) => {
            const Icon = hook.icon;
            return (
              <button
                key={i}
                onClick={onGoToAI}
                className={`flex items-center gap-2.5 rounded-xl ${hook.bg} px-3 py-2.5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
              >
                <div className="shrink-0 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" style={{ color: hook.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-800 leading-tight">{hook.title}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{hook.subtitle}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
