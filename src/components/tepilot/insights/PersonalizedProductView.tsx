import { useState } from "react";
import { Route, Smartphone, Target } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { CustomerMockupPanel } from "./CustomerMockupPanel";
import { type SubTabItem } from "./SubTabBar";
import type { TabValue } from "./AnalyticsContainer";

const TABS: SubTabItem[] = [
  { value: "customer", label: "Customer View", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { value: "targeting", label: "Segment Targeting", icon: <Target className="w-3.5 h-3.5" /> },
];

interface PersonalizedProductViewProps {
  onNavigate?: (tab: TabValue) => void;
}

export function PersonalizedProductView({ onNavigate }: PersonalizedProductViewProps) {
  const [active, setActive] = useState("customer");

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Route className="w-4 h-4" />}
        title="Personalized Product"
        subtitle="The product a customer is most likely to need next — and how it reaches them"
        howItWorks="Ventus maps enriched behavioral and financial signals onto the product catalog, ranks the highest-fit next product, and delivers it through the customer's preferred channel."
        whyItMatters="Higher conversion per outreach by leading with one relevant product grounded in the customer's own spending evidence."
        sections={TABS}
        sectionValue={active}
        onSectionChange={setActive}
      />



      {active === "customer" && <CustomerMockupPanel surface="product" onNavigate={onNavigate} />}
      {active === "targeting" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <SegmentTargetingView />
        </div>
      )}
    </div>
  );
}
