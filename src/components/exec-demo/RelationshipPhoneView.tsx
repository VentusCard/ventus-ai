import { Landmark, CreditCard, Home, BarChart3, Calendar, MessageCircle, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, Star, Gift, Sparkles, MapPin, Clock } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { LifeEvent } from "@/types/lifestyle-signals";
import { generateFinancialTip } from "@/lib/wellnessIntelligenceEngine";
import { useState } from "react";

interface Props {
  customer: DemoCustomer;
  detectedLifeEvents?: LifeEvent[] | null;
  onGoToAI: (message: string) => void;
}

const parseCurrency = (val: string): number => {
  const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
};

const formatCompact = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

const HOLDING_META = [
  { key: "deposit" as const, label: "Savings", icon: Landmark, color: "#22c55e" },
  { key: "credit" as const, label: "Credit", icon: CreditCard, color: "#f59e0b" },
  { key: "mortgage" as const, label: "Mortgage", icon: Home, color: "#6366f1" },
  { key: "investments" as const, label: "Investments", icon: BarChart3, color: "#3b82f6" },
];

const PILLAR_DEALS: Record<string, { merchant: string; offer: string }> = {
  "Travel & Exploration": { merchant: "Delta SkyMiles", offer: "2x miles on travel" },
  "Food & Dining": { merchant: "Whole Foods", offer: "5% back on groceries" },
  "Sports & Active Living": { merchant: "REI Co-op", offer: "10% back on outdoor gear" },
  "Health & Wellness": { merchant: "Equinox", offer: "$50 off membership" },
  "Entertainment & Culture": { merchant: "AMC Theatres", offer: "Buy 1 get 1 free" },
  "Style & Beauty": { merchant: "Nordstrom", offer: "3x points on apparel" },
  "Technology & Digital Life": { merchant: "Apple", offer: "0% APR 24 months" },
  "Home & Living": { merchant: "Home Depot", offer: "10% back on home" },
};
const DEFAULT_DEAL = { merchant: "Amazon", offer: "3% back on all purchases" };

function computeWellness(holdings: Record<string, string | undefined>) {
  const savings = parseCurrency(holdings.deposit || "$0");
  const credit = parseCurrency(holdings.credit || "$0");
  const items = [
    { label: "Emergency fund", ok: savings > 5000, goodText: "Strong", badText: "Build up" },
    { label: "Debt ratio", ok: credit < savings * 0.4, goodText: "Healthy", badText: "Improving" },
    { label: "Savings", ok: true, goodText: "On track", badText: "Needs focus" },
  ];
  const score = Math.round(50 + (items.filter(i => i.ok).length + 1) * 12.5);
  return { score, items };
}

export default function RelationshipPhoneView({ customer, detectedLifeEvents, onGoToAI }: Props) {
  const firstName = customer.profile.name.split(" ")[0];
  const holdings = customer.profile.holdings ?? {};
  const eventName = detectedLifeEvents?.[0]?.event_name ?? "financial goals";
  const tip = generateFinancialTip([]);
  const [tipDismissed, setTipDismissed] = useState(false);

  const holdingValues = HOLDING_META.map(h => ({ ...h, value: parseCurrency(holdings[h.key] || "$0") }));
  const wellness = computeWellness(holdings);

  // Pick a deal based on top pillar from life events or default
  const topPillar = detectedLifeEvents?.[0]?.event_name;
  const deal = (topPillar && PILLAR_DEALS[topPillar]) || DEFAULT_DEAL;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5">
        {/* Header */}
        <div>
          <p className="text-[13px] font-semibold text-slate-800">Welcome, {firstName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-medium text-emerald-700 uppercase tracking-wider">
              {customer.profile.segment} Member Since 2018
            </span>
          </div>
        </div>

        {/* Your Financial Snapshot */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700">Your Financial Snapshot</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {holdingValues.map(h => {
              const HIcon = h.icon;
              return (
                <div key={h.key} className="flex flex-col items-center gap-1 rounded-lg bg-white border border-slate-100 py-2 px-1">
                  <HIcon className="w-3.5 h-3.5" style={{ color: h.color }} />
                  <span className="text-[7px] text-slate-400 font-medium">{h.label}</span>
                  <span className="text-[10px] font-bold text-slate-800">{formatCompact(h.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wellness Card */}
        <div className="grid grid-cols-1 gap-1.5">
          {/* Financial Wellness */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span className="text-[8px] font-bold text-slate-700">Financial Wellness</span>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Donut score */}
              <div className="relative w-10 h-10 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="14" fill="none"
                    stroke={wellness.score >= 75 ? "#22c55e" : wellness.score >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={`${(wellness.score / 100) * 88} 88`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-800">
                  {wellness.score}
                </span>
              </div>
              {/* Status items */}
              <div className="space-y-1 flex-1">
                {wellness.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full shrink-0 ${item.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span className="text-[7px] text-slate-500">{item.label}:</span>
                    <span className={`text-[7px] font-semibold ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>
                      {item.ok ? item.goodText : item.badText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Your Local Branch */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-slate-700">Your Local Branch</span>
            <div className="ml-auto flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-[7px] font-medium text-emerald-600">Open til 6 PM</span>
            </div>
          </div>
          <p className="text-[8px] text-slate-400 mb-2">Main St Branch · Downtown</p>
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

      {/* Pinned AI Financial Tip */}
      <div className="shrink-0 px-3 py-2.5 border-t border-slate-100 bg-white">
        {!tipDismissed ? (
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">Smart Financial Tip</span>
            </div>
            <p className="text-[10px] text-amber-900 leading-snug">{tip.message}</p>
            {tip.potentialSavings && (
              <span className="inline-block mt-1 text-[8px] font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                Save {tip.potentialSavings}
              </span>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setTipDismissed(true)}
                className="flex items-center gap-1 text-[8px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Got it
              </button>
              <button
                onClick={() => onGoToAI(`I need help with this: ${tip.message}`)}
                className="flex items-center gap-1 text-[8px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 hover:bg-blue-100 transition-colors"
              >
                <MessageSquare className="w-2.5 h-2.5" /> Ask AI
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setTipDismissed(false)}
            className="w-full flex items-center justify-center gap-1.5 text-[9px] font-medium text-amber-600 hover:text-amber-700 py-1"
          >
            <Lightbulb className="w-3 h-3" /> Show financial tip
          </button>
        )}
      </div>
    </div>
  );
}