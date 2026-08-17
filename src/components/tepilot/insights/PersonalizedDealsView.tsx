import { useState } from "react";
import { Sparkles, Smartphone } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { CustomerMockupPanel } from "./CustomerMockupPanel";
import { type SubTabItem } from "./SubTabBar";
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
        subtitle="Customer-facing deal intelligence and next-deal recommendations"
        howItWorks="Ventus scores seasonal spend curves and persona affinity to recommend the next best deal, then renders it in the customer surface."
        whyItMatters="Grows share-of-wallet by matching the right deal to the right customer at the right time."
        sections={TABS}
        sectionValue={active}
        onSectionChange={setActive}
      />



      {active === "customer" && <CustomerMockupPanel surface="rewards" onNavigate={onNavigate} />}
      {active === "next-deal" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <RewardsAnalyticsDashboard hideHeader />
        </div>
      )}
    </div>
  );
}
