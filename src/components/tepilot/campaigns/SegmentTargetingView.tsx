import { AutomatedFlowsSection } from "./AutomatedFlowsSection";
import { CampaignStudio } from "./CampaignStudio";

export function SegmentTargetingView() {
  return (
    <div className="space-y-6">
      <AutomatedFlowsSection />
      <CampaignStudio />
    </div>
  );
}
