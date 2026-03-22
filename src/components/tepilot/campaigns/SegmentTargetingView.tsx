import { CampaignStudio } from "./CampaignStudio";
import { FinancialJourneyHeader } from "./FinancialJourneyHeader";

export function SegmentTargetingView() {
  return (
    <div className="space-y-6">
      <FinancialJourneyHeader />
      <CampaignStudio />
    </div>
  );
}
