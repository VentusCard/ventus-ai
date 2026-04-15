import { Landmark, CreditCard, Home, BarChart3, Calendar, MessageCircle, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react";
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

function computeWellness(holdings: Record<string, string | undefined>) {
  const savings = parseCurrency(holdings.deposit || "$0");
  const credit = parseCurrency(holdings.credit || "$0");
  const items = [
    { label: "On-time payments", ok: true },
    { label: "Emergency fund", ok: savings > 5000 },
    { label: "Debt-to-income ratio", ok: credit < savings * 0.4 },
    { label: "Savings momentum", ok: true },
  ];
  const score = Math.round(50 + items.filter(i => i.ok).length * 12.5);
  return { score, items };
}

export default function RelationshipPhoneView({ customer, detectedLifeEvents, onGoToAI }: Props) {
  const firstName = customer.profile.name.split(" ")[0];
  const holdings = customer.profile.holdings ?? {};
  const eventName = detectedLifeEvents?.[0]?.event_name ?? "financial goals";
  const tip = generateFinancialTip(customer.enrichedTransactions ?? []);
  const [tipDismissed, setTipDismissed] = useState(false);

  // Compute totals
  const holdingValues = HOLDING_META.map(h => ({ ...h, value: parseCurrency(holdings[h.key] || "$0") }));
  const total = holdingValues.reduce((s, h) => s + h.value, 0);
  const wellness = computeWellness(holdings);

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

        {/* Total Relationship + Segmented Bar */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Total Relationship</span>
            <span className="text-[15px] font-bold text-slate-800">{formatCompact(total)}</span>
          </div>
          {/* Segmented bar */}
          <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-slate-200">
            {holdingValues.map(h => {
              const pct = total > 0 ? (h.value / total) * 100 : 25;
              return <div key={h.key} style={{ width: `${pct}%`, backgroundColor: h.color }} />;
            })}
          </div>
          {/* Legend */}
          <div className="flex justify-between mt-2">
            {holdingValues.map(h => {
              const HIcon = h.icon;
              return (
                <div key={h.key} className="flex items-center gap-1">
                  <HIcon className="w-2.5 h-2.5" style={{ color: h.color }} />
                  <span className="text-[7px] text-slate-500">{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Wellness Score */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-700">Financial Wellness</span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: wellness.score >= 75 ? "#22c55e" : wellness.score >= 50 ? "#f59e0b" : "#ef4444" }}>
                <span className="text-[10px] font-bold text-slate-800">{wellness.score}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {wellness.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[9px] text-slate-600">{item.label}</span>
                {item.ok ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>

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
