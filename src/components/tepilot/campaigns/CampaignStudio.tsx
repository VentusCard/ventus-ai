import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Heart, Users as UsersIcon, Bookmark, Download, Target,
  ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2, LayoutTemplate,
} from "lucide-react";
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
import { SEGMENT_TEMPLATES, SAVED_SEGMENTS, getSegmentMetricsSummary } from "@/lib/segmentData";
import type { ProductMode, CampaignBrief } from "@/types/campaign-studio";
import type { LifeEventCriteria, DemographicFilters as DemographicFiltersType, SegmentTemplate, SavedSegment } from "@/types/segment";
import { supabase } from "@/integrations/supabase/client";

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'life_event', label: 'Life Events' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'cross_sell', label: 'Cross-Sell' },
  { id: 'seasonal', label: 'Seasonal' },
];

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

  // ─── Presets/Segments State ───
  const [templateCategory, setTemplateCategory] = useState('all');
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  // ─── AI Brief State ───
  const [generatedBrief, setGeneratedBrief] = useState<CampaignBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── Metrics ───
  const metrics = useMemo(() => getSegmentMetricsSummary(), []);

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

  // ─── Apply Preset Template ───
  const handleApplyTemplate = useCallback((template: SegmentTemplate) => {
    // Clear all dimensions first
    setSelectedPillars([]);
    setLifeEventCriteria({ eventTypes: [], minConfidence: 0.6, timingWindow: '6-12_months' });
    setSelectedProducts({});
    setCrossSellStrategies([]);
    setUpsellStrategies([]);
    setCampaignGoal('');

    const audience = template.suggestedAudience;

    if (audience.lifeEventCriteria) {
      setLifeEventCriteria(audience.lifeEventCriteria as LifeEventCriteria);
    }
    if (audience.lifestyleCriteria?.pillars) {
      setSelectedPillars(audience.lifestyleCriteria.pillars);
    }
    if (audience.productCriteria) {
      const products: Record<string, ProductMode> = {};
      audience.productCriteria.hasProducts?.forEach(p => { products[p] = 'has'; });
      audience.productCriteria.lacksProducts?.forEach(p => { products[p] = 'lacks'; });
      setSelectedProducts(products);
    }
    if (audience.demographicFilters) {
      setDemographicFilters(audience.demographicFilters as DemographicFiltersType);
    }

    toast.success(`Applied "${template.name}" preset`, {
      description: `${(template.estimatedSize / 1_000_000).toFixed(1)}M estimated contacts`,
    });
  }, []);

  // ─── Edit Saved Segment ───
  const handleEditSegment = useCallback((segment: SavedSegment) => {
    setSelectedPillars([]);
    setLifeEventCriteria({ eventTypes: [], minConfidence: 0.6, timingWindow: '6-12_months' });
    setSelectedProducts({});

    if (segment.lifeEventCriteria) {
      setLifeEventCriteria(segment.lifeEventCriteria);
    }
    if (segment.lifestyleCriteria?.pillars) {
      setSelectedPillars(segment.lifestyleCriteria.pillars);
    }
    if (segment.productCriteria) {
      const products: Record<string, ProductMode> = {};
      segment.productCriteria.hasProducts?.forEach(p => { products[p] = 'has'; });
      segment.productCriteria.lacksProducts?.forEach(p => { products[p] = 'lacks'; });
      setSelectedProducts(products);
    }
    if (segment.demographicFilters) {
      setDemographicFilters(segment.demographicFilters);
    }

    toast.info(`Editing "${segment.name}"`, { description: "Criteria loaded into studio" });
  }, []);

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

  // ─── Filtered Templates ───
  const filteredTemplates = useMemo(() => {
    if (templateCategory === 'all') return SEGMENT_TEMPLATES;
    return SEGMENT_TEMPLATES.filter(t => t.category === templateCategory);
  }, [templateCategory]);

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

  // ─── Mode label helper ───
  const modeLabel = (mode: string) => {
    switch (mode) {
      case 'life_event': return 'Life Event';
      case 'lifestyle': return 'Lifestyle';
      case 'product': return 'Product';
      default: return mode;
    }
  };

  return (
    <div className="space-y-0">
      {/* Header with inline metrics */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-lg border border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Campaign Studio</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Build multi-dimensional audience segments and generate AI-powered campaign briefs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
              <Bookmark className="w-3 h-3" />
              {metrics.savedSegments} Saved
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
              <UsersIcon className="w-3 h-3" />
              {(metrics.totalContacts / 1_000_000).toFixed(1)}M Contacts
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
              <Download className="w-3 h-3" />
              {metrics.totalExports} Exports
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
              <Target className="w-3 h-3" />
              {Object.values(metrics.modeBreakdown).filter(v => v > 0).length} Modes
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-1">
              {/* Preset Templates */}
              <Collapsible open={presetsOpen} onOpenChange={setPresetsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">Preset Templates</span>
                    <span className="text-xs text-muted-foreground">({SEGMENT_TEMPLATES.length})</span>
                  </div>
                  {presetsOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 space-y-3">
                    {/* Category filter chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setTemplateCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                            templateCategory === cat.id
                              ? 'bg-primary/15 border-primary text-primary'
                              : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    {/* Template rows */}
                    <div className="space-y-1.5">
                      {filteredTemplates.map(template => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {(template.estimatedSize / 1_000_000).toFixed(1)}M
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-primary hover:text-primary"
                              onClick={() => handleApplyTemplate(template)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Saved Segments */}
              <Collapsible open={savedOpen} onOpenChange={setSavedOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">Saved Segments</span>
                    <span className="text-xs text-muted-foreground">({SAVED_SEGMENTS.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {SAVED_SEGMENTS.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/15 text-primary text-xs px-2">
                        {SAVED_SEGMENTS.length}
                      </Badge>
                    )}
                    {savedOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 space-y-1.5">
                    {SAVED_SEGMENTS.map(segment => (
                      <div
                        key={segment.id}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-secondary/30"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{segment.name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {modeLabel(segment.targetingMode)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {(segment.estimatedSize / 1_000_000).toFixed(1)}M
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSegment(segment)}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Exported "${segment.name}"`)}>
                                <Download className="w-3.5 h-3.5 mr-2" /> Export
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => toast.success(`Deleted "${segment.name}"`)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="px-3 py-1">
                <Separator />
              </div>

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
    </div>
  );
}
