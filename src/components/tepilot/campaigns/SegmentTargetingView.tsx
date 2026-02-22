import { SegmentMetricsSummary } from "./SegmentMetricsSummary";
import { CampaignStudio } from "./CampaignStudio";
import { SegmentTemplateGrid } from "./SegmentTemplateGrid";
import { SavedSegmentsTable } from "./SavedSegmentsTable";
import { toast } from "sonner";
import type { SegmentTemplate, SavedSegment } from "@/types/segment";

export function SegmentTargetingView() {
  const handleTemplateSelect = (template: SegmentTemplate) => {
    toast.success(`Loaded "${template.name}" targeting criteria`, {
      description: "Criteria applied to Campaign Studio",
    });
  };

  const handleEditSegment = (segment: SavedSegment) => {
    toast.info(`Editing "${segment.name}"`, {
      description: "Loaded into Campaign Studio",
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Campaign Studio</h2>
        <p className="text-muted-foreground">
          Build multi-dimensional audience segments and generate AI-powered campaign briefs.
          Select criteria across lifestyle, life events, products, geography, and more — then let AI create your campaign copy.
        </p>
      </div>

      {/* Metrics Summary */}
      <SegmentMetricsSummary />

      {/* Campaign Studio (replaces old Segment Builder) */}
      <CampaignStudio />

      {/* Segment Templates */}
      <SegmentTemplateGrid onSelectTemplate={handleTemplateSelect} />

      {/* Saved Segments */}
      <SavedSegmentsTable onEditSegment={handleEditSegment} />
    </div>
  );
}
