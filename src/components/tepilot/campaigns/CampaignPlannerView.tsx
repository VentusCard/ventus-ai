import { useState } from "react";
import { CampaignMetricsSummary } from "./CampaignMetricsSummary";
import { SegmentBuilder } from "./SegmentBuilder";
import { CampaignTemplateGrid } from "./CampaignTemplateGrid";
import { ActiveCampaignsTable } from "./ActiveCampaignsTable";
import { CampaignDetailDialog } from "./CampaignDetailDialog";
import type { CampaignTemplate, AudienceSegment } from "@/types/campaign";

export function CampaignPlannerView() {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentAudience, setCurrentAudience] = useState<Partial<AudienceSegment>>({});

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setCurrentAudience(template.suggestedAudience);
    setShowCreateDialog(true);
  };

  const handleCreateFromSegment = (audience: Partial<AudienceSegment>) => {
    setSelectedTemplate(null);
    setCurrentAudience(audience);
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Intro Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Campaign Planner</h2>
        <p className="text-slate-600">
          Build targeted marketing campaigns based on behavioral signals, life events, and product holdings.
          Use the Segment Builder to identify audiences or start from pre-built templates.
        </p>
      </div>

      {/* Metrics Summary */}
      <CampaignMetricsSummary />

      {/* Segment Builder */}
      <SegmentBuilder onCreateCampaign={handleCreateFromSegment} />

      {/* Campaign Templates */}
      <CampaignTemplateGrid onSelectTemplate={handleTemplateSelect} />

      {/* Active Campaigns */}
      <ActiveCampaignsTable />

      {/* Create/Edit Dialog */}
      <CampaignDetailDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        template={selectedTemplate}
        initialAudience={currentAudience}
      />
    </div>
  );
}
