import { CampaignStudio } from "./CampaignStudio";
import { FinancialJourneyHeader } from "./FinancialJourneyHeader";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { Route } from "lucide-react";

export function SegmentTargetingView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Route className="w-4 h-4" />}
        title="Next-product"
        subtitle="For each customer, what's the single best next product based on lifestyle pillars and life events?"
        howItWorks="Ventus scores every customer against every product using lifestyle pillars, life events, and behavioral gaps to rank next-best-offer."
        whyItMatters="Replaces guesswork with precision targeting, improving cross-sell conversion and reducing campaign waste."
      />
      <FinancialJourneyHeader />
      <CampaignStudio />
    </div>
  );
}
