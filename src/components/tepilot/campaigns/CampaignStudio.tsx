import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { DimensionChipCloud } from "./DimensionChipCloud";
import { ProductDimensionGroup } from "./ProductDimensionGroup";
import { GeoDimensionSelector } from "./GeoDimensionSelector";
import { StrategyChips } from "./StrategyChips";
import { CampaignGoalSelector } from "./CampaignGoalSelector";
import { AudienceEstimateBar } from "./AudienceEstimateBar";
import { AICampaignPreview } from "./AICampaignPreview";
import { DemographicFilters } from "./DemographicFilters";
import { LIFESTYLE_PILLARS, estimateStudioAudienceSize } from "@/lib/campaignStudioData";
import { LIFE_EVENTS } from "@/types/segment";
import type { ProductMode, CampaignBrief } from "@/types/campaign-studio";
import type { LifeEventCriteria, DemographicFilters as DemographicFiltersType } from "@/types/segment";
import { supabase } from "@/integrations/supabase/client";

export function CampaignStudio() {
  // ─── Dimension State ───
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [lifeEventCriteria, setLifeEventCriteria] = useState<LifeEventCriteria>({
    eventTypes: [],
    minConfidence: 0.6,
    timingWindow: '6-12_months',
  });
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductMode>>({});
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMetros, setSelectedMetros] = useState<string[]>([]);
  const [areaType, setAreaType] = useState('All');
  const [demographicFilters, setDemographicFilters] = useState<DemographicFiltersType>({
    ageRanges: [],
    regions: [],
    incomeBands: [],
    accountTenure: 'all',
  });
  const [crossSellStrategies, setCrossSellStrategies] = useState<string[]>([]);
  const [upsellStrategies, setUpsellStrategies] = useState<string[]>([]);
  const [campaignGoal, setCampaignGoal] = useState('');

  // ─── AI Brief State ───
  const [generatedBrief, setGeneratedBrief] = useState<CampaignBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── Togglers ───
  const toggleItem = useCallback((list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  }, []);

  const handleTogglePillar = useCallback((id: string) => {
    setSelectedPillars(prev => toggleItem(prev, id));
  }, [toggleItem]);

  const handleToggleLifeEvent = useCallback((id: string) => {
    setLifeEventCriteria(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(id)
        ? prev.eventTypes.filter(e => e !== id)
        : [...prev.eventTypes, id],
    }));
  }, []);

  const handleToggleProduct = useCallback((name: string, mode: ProductMode) => {
    setSelectedProducts(prev => ({ ...prev, [name]: mode }));
  }, []);

  const handleRemoveProduct = useCallback((name: string) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleToggleCrossSell = useCallback((id: string) => {
    setCrossSellStrategies(prev => toggleItem(prev, id));
  }, [toggleItem]);

  const handleToggleUpsell = useCallback((id: string) => {
    setUpsellStrategies(prev => toggleItem(prev, id));
  }, [toggleItem]);

  // ─── Audience Estimation ───
  const estimatedSize = useMemo(() => {
    return estimateStudioAudienceSize({
      selectedPillars,
      lifeEventTypes: lifeEventCriteria.eventTypes,
      selectedProducts,
      selectedRegions,
      selectedMetros,
      areaType,
      crossSellStrategies,
      upsellStrategies,
      demographicAgeRanges: demographicFilters.ageRanges,
      demographicIncomeBands: demographicFilters.incomeBands,
      demographicAccountTenure: demographicFilters.accountTenure,
    });
  }, [selectedPillars, lifeEventCriteria, selectedProducts, selectedRegions, selectedMetros, areaType, crossSellStrategies, upsellStrategies, demographicFilters]);

  const hasSelections = estimatedSize > 0;

  // ─── AI Brief Generation ───
  const handleGenerate = async () => {
    if (!hasSelections) return;
    setIsGenerating(true);
    setGeneratedBrief(null);

    const payload = {
      pillars: selectedPillars,
      lifeEvents: lifeEventCriteria.eventTypes,
      products: selectedProducts,
      regions: selectedRegions,
      metros: selectedMetros,
      areaType,
      demographics: demographicFilters,
      crossSellStrategies,
      upsellStrategies,
      campaignGoal,
      estimatedAudience: estimatedSize,
    };

    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign-brief', {
        body: payload,
      });

      if (error) {
        console.error('Brief generation error:', error);
        toast.error("Failed to generate brief", { description: error.message });
        setIsGenerating(false);
        return;
      }

      if (data?.error) {
        if (data.status === 429) {
          toast.error("Rate limit exceeded", { description: "Please try again in a moment" });
        } else if (data.status === 402) {
          toast.error("Usage limit reached", { description: "Please add credits to your workspace" });
        } else {
          toast.error("Generation failed", { description: data.error });
        }
        setIsGenerating(false);
        return;
      }

      setGeneratedBrief(data as CampaignBrief);
      toast.success("Campaign brief generated!");
    } catch (err) {
      console.error('Brief generation error:', err);
      toast.error("Failed to generate brief");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    toast.success("Campaign saved!", {
      description: `${(estimatedSize / 1_000_000).toFixed(1)}M estimated contacts`,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Campaign Studio</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Select targeting criteria across all dimensions, then generate an AI-powered campaign brief
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Dimension Selectors */}
          <div className="lg:col-span-3 space-y-1">
            {/* Lifestyle Pillars */}
            <DimensionChipCloud
              title="Lifestyle Pillars"
              icon={<Heart className="w-4 h-4 text-primary" />}
              chips={LIFESTYLE_PILLARS.map(p => ({ id: p, label: p }))}
              selectedChips={selectedPillars}
              onToggle={handleTogglePillar}
              badge={`${LIFESTYLE_PILLARS.length}`}
              defaultOpen
            />

            {/* Life Events */}
            <DimensionChipCloud
              title="Life Events"
              icon={<Sparkles className="w-4 h-4 text-primary" />}
              chips={LIFE_EVENTS.map(e => ({ id: e.id, label: e.name }))}
              selectedChips={lifeEventCriteria.eventTypes}
              onToggle={handleToggleLifeEvent}
              badge={`${LIFE_EVENTS.length}`}
            />

            {/* Banking Products */}
            <ProductDimensionGroup
              selectedProducts={selectedProducts}
              onToggle={handleToggleProduct}
              onRemove={handleRemoveProduct}
            />

            {/* Geography */}
            <GeoDimensionSelector
              selectedRegions={selectedRegions}
              selectedMetros={selectedMetros}
              areaType={areaType}
              onToggleRegion={(r) => setSelectedRegions(prev => toggleItem(prev, r))}
              onToggleMetro={(m) => setSelectedMetros(prev => toggleItem(prev, m))}
              onSetAreaType={setAreaType}
            />

            {/* Demographics */}
            <div className="pt-1">
              <DemographicFilters
                filters={demographicFilters}
                onChange={setDemographicFilters}
              />
            </div>

            {/* Strategies */}
            <StrategyChips
              crossSellStrategies={crossSellStrategies}
              upsellStrategies={upsellStrategies}
              onToggleCrossSell={handleToggleCrossSell}
              onToggleUpsell={handleToggleUpsell}
            />

            {/* Campaign Goal */}
            <CampaignGoalSelector
              selectedGoal={campaignGoal}
              onSelect={setCampaignGoal}
            />

            {/* Audience Estimate */}
            <AudienceEstimateBar
              estimatedSize={estimatedSize}
              hasSelections={hasSelections}
            />
          </div>

          {/* Right Column: AI Preview */}
          <div className="lg:col-span-2">
            <AICampaignPreview
              brief={generatedBrief}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              estimatedSize={estimatedSize}
              hasSelections={hasSelections}
              onSave={handleSave}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
