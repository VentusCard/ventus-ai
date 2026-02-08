import { useState } from "react";
import { SegmentMetricsSummary } from "./SegmentMetricsSummary";
import { SegmentBuilder } from "./SegmentBuilder";
import { SegmentTemplateGrid } from "./SegmentTemplateGrid";
import { SavedSegmentsTable } from "./SavedSegmentsTable";
import { toast } from "sonner";
import type { SegmentTemplate, SavedSegment } from "@/types/segment";

export function SegmentTargetingView() {
  const [builderKey, setBuilderKey] = useState(0);

  const handleTemplateSelect = (template: SegmentTemplate) => {
    // In a real app, this would populate the segment builder with template criteria
    toast.success(`Loaded "${template.name}" targeting criteria`, {
      description: "Criteria applied to Segment Builder",
    });
  };

  const handleSaveSegment = (segment: Partial<SavedSegment>) => {
    toast.success("Segment saved successfully!", {
      description: `Estimated ${((segment.estimatedSize || 0) / 1_000_000).toFixed(1)}M contacts`,
    });
    // Reset builder for new segment
    setBuilderKey(prev => prev + 1);
  };

  const handleEditSegment = (segment: SavedSegment) => {
    // In a real app, this would load the segment into the builder
    toast.info(`Editing "${segment.name}"`, {
      description: "Loaded into Segment Builder",
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Segment Targeting</h2>
        <p className="text-slate-600">
          Build targeted audience segments based on behavioral signals, life events, and product holdings.
          Export segments to your preferred marketing platform (Mailchimp, SendGrid, Twilio, etc.).
        </p>
      </div>

      {/* Metrics Summary */}
      <SegmentMetricsSummary />

      {/* Segment Builder */}
      <SegmentBuilder key={builderKey} onSaveSegment={handleSaveSegment} />

      {/* Segment Templates */}
      <SegmentTemplateGrid onSelectTemplate={handleTemplateSelect} />

      {/* Saved Segments */}
      <SavedSegmentsTable onEditSegment={handleEditSegment} />
    </div>
  );
}
