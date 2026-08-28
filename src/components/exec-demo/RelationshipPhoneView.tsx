import { Landmark, CreditCard, Home, BarChart3, Calendar, MessageCircle, MapPin, Clock, Sparkles } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { LifeEvent } from "@/types/lifestyle-signals";
import ProductCardsPhoneView, { type ProductCard } from "./ProductCardsPhoneView";
import advisor1 from "@/assets/advisors/advisor-1.jpg";
import advisor2 from "@/assets/advisors/advisor-2.jpg";
import advisor3 from "@/assets/advisors/advisor-3.jpg";
import advisor4 from "@/assets/advisors/advisor-4.jpg";
import advisor5 from "@/assets/advisors/advisor-5.jpg";
import advisor6 from "@/assets/advisors/advisor-6.jpg";
import advisor7 from "@/assets/advisors/advisor-7.jpg";
import advisor8 from "@/assets/advisors/advisor-8.jpg";

interface Props {
  customer: DemoCustomer;
  detectedLifeEvents?: LifeEvent[] | null;
  productCards?: ProductCard[] | null;
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

const ADVISORS = [
  { name: "James Rivera", title: "Senior Relationship Manager", photo: advisor1 },
  { name: "Emily Chen", title: "Wealth Advisor", photo: advisor2 },
  { name: "Michael Torres", title: "Financial Advisor", photo: advisor3 },
  { name: "Sarah Nguyen", title: "Private Banker", photo: advisor4 },
  { name: "David Park", title: "Relationship Manager", photo: advisor5 },
  { name: "Rachel Adams", title: "Senior Financial Advisor", photo: advisor6 },
  { name: "Thomas Wright", title: "Private Client Advisor", photo: advisor7 },
  { name: "Lisa Patel", title: "Wealth Management Associate", photo: advisor8 },
];

function getAdvisor(customerId: string) {
  let hash = 0;
  for (let i = 0; i < customerId.length; i++) hash = ((hash << 5) - hash + customerId.charCodeAt(i)) | 0;
  return ADVISORS[Math.abs(hash) % ADVISORS.length];
}

export default function RelationshipPhoneView({ customer, detectedLifeEvents, productCards, onGoToAI }: Props) {
  const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";
  const holdings = customer.profile.holdings ?? {};
  const eventName = detectedLifeEvents?.[0]?.event_name ?? "financial goals";

  const holdingValues = HOLDING_META.map(h => ({ ...h, value: parseCurrency(holdings[h.key] || "$0") }));
  const advisor = getAdvisor(customer.id);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 px-3 py-2.5 flex flex-col gap-2">
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
        <div className="shrink-0 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1.5">
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
                  <div className="flex items-center gap-1">
                    <HIcon className="w-3 h-3" style={{ color: h.color }} />
                    <span className="text-[7px] text-slate-500 font-medium">{h.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">{formatCompact(h.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended for You — product slider */}
        <div className="flex-1 min-h-[330px] flex flex-col">
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-700">Recommended for You</span>
          </div>
          {productCards && productCards.length > 0 ? (
            <div className="flex-1 min-h-0">
              <ProductCardsPhoneView cards={productCards} compact />
            </div>
          ) : (
            <div className="px-2 py-4 text-center">
              <span className="text-[10px] text-slate-300">Personalized offers loading…</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
