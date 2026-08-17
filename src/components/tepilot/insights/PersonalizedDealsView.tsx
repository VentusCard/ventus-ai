import { useState } from "react";
import { Sparkles, Smartphone } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { CustomerMockupPanel } from "./CustomerMockupPanel";
import { SubTabBar, type SubTabItem } from "./SubTabBar";
import type { TabValue } from "./AnalyticsContainer";

const TABS: SubTabItem[] = [
  { value: "customer", label: "Customer View", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { value: "next-deal", label: "Next-Deal Intelligence", icon: <Sparkles className="w-3.5 h-3.5" /> },
];

interface PersonalizedDealsViewProps {
  onNavigate?: (tab: TabValue) => void;
}

export function PersonalizedDealsView({ onNavigate }: PersonalizedDealsViewProps) {
  const [active, setActive] = useState("customer");

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Sparkles className="w-4 h-4" />}
        title="Personalized Deals"
        subtitle="Intelligence, activation, and engagement for merchant and reward programs"
        howItWorks="Ventus connects seasonal deal intelligence, merchant partnership activation, and gamified engagement into one coordinated personalization surface."
        whyItMatters="Grows share-of-wallet by matching the right deal or perk to the right customer at the right time — then sustaining engagement with achievement-driven rewards."
      />

      <SubTabBar items={TABS} value={active} onChange={setActive} />

      {active === "customer" && <CustomerMockupPanel surface="rewards" onNavigate={onNavigate} />}
      {active === "next-deal" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <RewardsAnalyticsDashboard hideHeader />
        </div>
      )}
      {active === "deals" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <DealsAndPerksView defaultTab="shopping" />
        </div>
      )}
      {active === "gamification" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <GamificationManagement hideHeader />
        </div>
      )}
    </div>
  );
}
