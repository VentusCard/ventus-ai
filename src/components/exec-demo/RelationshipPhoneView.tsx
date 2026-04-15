import { Landmark, CreditCard, Home, BarChart3, Star, MapPin, Calendar, MessageCircle } from "lucide-react";
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

export default function RelationshipPhoneView({ customer, detectedLifeEvents, onGoToAI }: Props) {
  const firstName = customer.profile.name.split(" ")[0];
  const holdings = customer.profile.holdings;
  const eventName = detectedLifeEvents?.[0]?.event_name ?? "financial goals";

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

      {/* Advisor Card */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-blue-700">JR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-800">James Rivera</p>
            <p className="text-[8px] text-slate-400">Senior Relationship Manager</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 italic mt-2 leading-snug">
          "Major milestone ahead? Let's plan together, {firstName}."
        </p>
        <div className="flex gap-2 mt-2.5">
          <button className="flex items-center gap-1 text-[9px] font-semibold text-white bg-blue-600 rounded-lg px-2.5 py-1.5 hover:bg-blue-700 transition-colors">
            <Calendar className="w-2.5 h-2.5" /> Schedule
          </button>
          <button
            onClick={() => onGoToAI(`Hi, I'd like to discuss my ${eventName.toLowerCase()} plans`)}
            className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 hover:bg-blue-100 transition-colors"
          >
            <MessageCircle className="w-2.5 h-2.5" /> Message
          </button>
        </div>
      </div>
    </div>
  );
}
