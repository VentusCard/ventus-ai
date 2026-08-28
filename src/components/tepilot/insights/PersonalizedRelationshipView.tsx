import { useState } from "react";
import { Users, Gem, MessagesSquare, Heart, Smartphone } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { RelationshipIntelligenceView } from "./RelationshipIntelligenceView";
import { AIAssistantActivityView } from "./AIAssistantActivityView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { CustomerMockupPanel } from "./CustomerMockupPanel";
import { type SubTabItem } from "./SubTabBar";
import type { ClientProfileData } from "@/types/clientProfile";
import type { AIInsights } from "@/types/lifestyle-signals";
import type { TabValue } from "./AnalyticsContainer";

const TABS: SubTabItem[] = [
  { value: "customer", label: "Customer View", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { value: "insights", label: "Customer Insights", icon: <Heart className="w-3.5 h-3.5" /> },
  { value: "relationship", label: "Relationship Intelligence", icon: <Gem className="w-3.5 h-3.5" /> },
  { value: "assistant", label: "AI Banking Assistant", icon: <MessagesSquare className="w-3.5 h-3.5" /> },
];

interface PersonalizedRelationshipViewProps {
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
  onNavigate?: (tab: TabValue) => void;
}

export function PersonalizedRelationshipView({
  userDemographics,
  lifestyleSignals,
  onNavigate,
}: PersonalizedRelationshipViewProps) {
  const [active, setActive] = useState("customer");

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Users className="w-4 h-4" />}
        title="Personalized Relationship"
        subtitle="Customer insights, relationship signals, and assistant conversations in one surface"
        howItWorks="Ventus enriches every transaction into relationship signals and surfaces what customers are asking the banking assistant."
        whyItMatters="One coordinated view of every relationship touchpoint — so growth, protection, and outreach all run off the same behavioral evidence."
        sections={TABS}
        sectionValue={active}
        onSectionChange={setActive}
      />



      {active === "customer" && <CustomerMockupPanel surface="relationship" onNavigate={onNavigate} />}
      {active === "insights" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <WellnessAlertsDashboard hideHeader />
        </div>
      )}
      {active === "relationship" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <RelationshipIntelligenceView
            hideHeader
            userDemographics={userDemographics}
            lifestyleSignals={lifestyleSignals}
            onNavigate={onNavigate}
          />
        </div>
      )}
      {active === "assistant" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <AIAssistantActivityView hideHeader />
        </div>
      )}
    </div>
  );
}
