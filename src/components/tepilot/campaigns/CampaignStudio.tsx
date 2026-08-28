import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Heart, Users as UsersIcon, Bookmark, Download, Target,
  ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2, Loader2, CreditCard,
  Zap, Megaphone } from
"lucide-react";
import { PersonalizationPreviewPanel } from "./PersonalizationPreviewPanel";
import { AutomatedFlowsSection } from "./AutomatedFlowsSection";
import { DEMO_PRODUCTS } from "@/lib/samplePersonaGenerator";
import { toast } from "sonner";
import { useSaveSequence, SIGNAL_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";
import { DimensionChipCloud } from "./DimensionChipCloud";
import { ProductDimensionGroup } from "./ProductDimensionGroup";
import { GeoDimensionSelector } from "./GeoDimensionSelector";
import { StrategyChips } from "./StrategyChips";
import { AudienceEstimateBar } from "./AudienceEstimateBar";
import { AICampaignPreview } from "./AICampaignPreview";
import { DemographicFilters } from "./DemographicFilters";
import { SemanticIntentInput, type ParsedIntent } from "./SemanticIntentInput";
import { Input } from "@/components/ui/input";
import { LIFESTYLE_PILLARS, estimateStudioAudienceSize } from "@/lib/campaignStudioData";
import { LIFE_EVENTS } from "@/types/segment";
import { SAVED_SEGMENTS, getSegmentMetricsSummary } from "@/lib/segmentData";
import type { ProductMode, CampaignBrief } from "@/types/campaign-studio";
import type { LifeEventCriteria, DemographicFilters as DemographicFiltersType, SavedSegment } from "@/types/segment";
import { supabase } from "@/integrations/supabase/client";

export function CampaignStudio() {
  // ─── Mode State ───
  const [activeMode, setActiveMode] = useState<'campaigns' | 'automations'>('automations');

  // ─── Dimension State ───
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [lifeEventCriteria, setLifeEventCriteria] = useState<LifeEventCriteria>({
    eventTypes: [],
    minConfidence: 0.6,
    timingWindow: '6-12_months'
  });
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductMode>>({});
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMetros, setSelectedMetros] = useState<string[]>([]);
  const [areaType, setAreaType] = useState('All');
  const [demographicFilters, setDemographicFilters] = useState<DemographicFiltersType>({
    ageRanges: [],
    regions: [],
    incomeBands: [],
    accountTenure: 'all'
  });
  const [crossSellStrategies, setCrossSellStrategies] = useState<string[]>([]);
  const [upsellStrategies, setUpsellStrategies] = useState<string[]>([]);
  const [campaignGoal, setCampaignGoal] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>("travel_card");


  // ─── Segments State ───
  const [savedOpen, setSavedOpen] = useState(false);

  // ─── AI Brief State ───
  const [generatedBrief, setGeneratedBrief] = useState<CampaignBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── Metrics ───
  const metrics = useMemo(() => getSegmentMetricsSummary(), []);

  // ─── Togglers ───
  const toggleItem = useCallback((list: string[], item: string) => {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  }, []);

  const handleTogglePillar = useCallback((id: string) => {
    setSelectedPillars((prev) => toggleItem(prev, id));
  }, [toggleItem]);

  const handleToggleLifeEvent = useCallback((id: string) => {
    setLifeEventCriteria((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(id) ?
      prev.eventTypes.filter((e) => e !== id) :
      [...prev.eventTypes, id]
    }));
  }, []);

  const handleToggleProduct = useCallback((name: string, mode: ProductMode) => {
    setSelectedProducts((prev) => ({ ...prev, [name]: mode }));
  }, []);

  const handleRemoveProduct = useCallback((name: string) => {
    setSelectedProducts((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleToggleCrossSell = useCallback((id: string) => {
    setCrossSellStrategies((prev) => toggleItem(prev, id));
  }, [toggleItem]);

  const handleToggleUpsell = useCallback((id: string) => {
    setUpsellStrategies((prev) => toggleItem(prev, id));
  }, [toggleItem]);


  // ─── Edit Saved Segment ───
  const handleEditSegment = useCallback((segment: SavedSegment) => {
    applySegmentFallback(segment);
  }, []);

  // ─── Fallback for saved segments ───
  const applySegmentFallback = useCallback((segment: SavedSegment) => {
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
      segment.productCriteria.hasProducts?.forEach((p) => {products[p] = 'has';});
      segment.productCriteria.lacksProducts?.forEach((p) => {products[p] = 'lacks';});
      setSelectedProducts(products);
    }
    if (segment.demographicFilters) {
      setDemographicFilters(segment.demographicFilters);
    }

    pendingGenerateRef.current = true;
    toast.info(`Loaded "${segment.name}" (offline mode)`, { description: 'Criteria loaded into studio' });
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
      demographicAccountTenure: demographicFilters.accountTenure
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
      estimatedAudience: estimatedSize
    };

    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign-brief', {
        body: payload
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

  const campaignSave = useSaveSequence({ stages: SIGNAL_STAGES, doneLabel: "Campaign synced" });

  const handleSave = () => {
    campaignSave.run(() => {
      toast.success("Campaign saved!", {
        description: `${(estimatedSize / 1_000_000).toFixed(1)}M estimated contacts`,
      });
    });
  };

  // ─── Auto-generate trigger ───
  const pendingGenerateRef = useRef(false);

  useEffect(() => {
    if (pendingGenerateRef.current && hasSelections && !isGenerating) {
      pendingGenerateRef.current = false;
      handleGenerate();
    }
  });

  // ─── Semantic Intent Handler ───
  const handleIntentParsed = useCallback((result: ParsedIntent) => {
    setCampaignGoal(result.campaign_goal || '');
    setSelectedPillars(result.lifestyle_pillars || []);
    setLifeEventCriteria((prev) => ({
      ...prev,
      eventTypes: result.life_events || []
    }));

    const products: Record<string, 'has' | 'lacks'> = {};
    (result.products_has || []).forEach((p) => {products[p] = 'has';});
    (result.products_lacks || []).forEach((p) => {products[p] = 'lacks';});
    setSelectedProducts(products);

    setCrossSellStrategies(result.cross_sell_strategies || []);
    setUpsellStrategies(result.upsell_strategies || []);

    if (result.regions?.length > 0) {
      setSelectedRegions(result.regions);
    }

    if (result.age_ranges?.length > 0 || result.income_bands?.length > 0) {
      setDemographicFilters((prev) => ({
        ...prev,
        ageRanges: result.age_ranges?.length > 0 ? result.age_ranges : prev.ageRanges,
        incomeBands: result.income_bands?.length > 0 ? result.income_bands : prev.incomeBands
      }));
    }

    pendingGenerateRef.current = true;
  }, []);

  // ─── Mode label helper ───
  const modeLabel = (mode: string) => {
    switch (mode) {
      case 'life_event':return 'Life Event';
      case 'lifestyle':return 'Lifestyle';
      case 'product':return 'Product';
      default:return mode;
    }
  };

  return (
    <div className="space-y-0">
      {/* Header with inline metrics */}
      





























      

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-0 rounded-lg border border-border bg-muted/30 p-1 mb-6">
        <button
          onClick={() => setActiveMode('automations')}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
          activeMode === 'automations' ?
          'bg-primary text-primary-foreground shadow-sm' :
          'text-muted-foreground hover:bg-muted hover:text-foreground'}`
          }>
          
          <Zap className="w-4 h-4" />
          Automated Flows
        </button>
        <button
          onClick={() => setActiveMode('campaigns')}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
          activeMode === 'campaigns' ?
          'bg-primary text-primary-foreground shadow-sm' :
          'text-muted-foreground hover:bg-muted hover:text-foreground'}`
          }>
          
          <Megaphone className="w-4 h-4" />
          Campaigns
        </button>
      </div>

      {activeMode === 'automations' ?
      <AutomatedFlowsSection /> :

      <>
      {/* Semantic Intent Input */}
      <SemanticIntentInput onIntentParsed={handleIntentParsed} />

      {/* Main Studio Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="space-y-1 pr-4 overflow-y-auto max-h-[80vh]">
              {/* Saved Segments */}
              <Collapsible open={savedOpen} onOpenChange={setSavedOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">Saved Segments</span>
                    <span className="text-xs text-muted-foreground">({SAVED_SEGMENTS.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {SAVED_SEGMENTS.length > 0 &&
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2">
                        {SAVED_SEGMENTS.length}
                      </Badge>
                        }
                    {savedOpen ?
                        <ChevronDown className="w-4 h-4 text-muted-foreground" /> :

                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 space-y-1.5">
                    {SAVED_SEGMENTS.map((segment) =>
                        <div
                          key={segment.id}
                          className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer"
                          onClick={() => handleEditSegment(segment)}>
                          
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{segment.name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {modeLabel(segment.targetingMode)}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground ml-3 shrink-0">
                          {(segment.estimatedSize / 1_000_000).toFixed(1)}M
                        </span>
                      </div>
                        )}
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
                    chips={LIFESTYLE_PILLARS.map((p) => ({ id: p, label: p }))}
                    selectedChips={selectedPillars}
                    onToggle={handleTogglePillar}
                    badge={`${LIFESTYLE_PILLARS.length}`}
                    defaultOpen />
                  

              {/* Life Events */}
              <DimensionChipCloud
                    title="Life Events"
                    icon={<Sparkles className="w-4 h-4 text-primary" />}
                    chips={LIFE_EVENTS.map((e) => ({ id: e.id, label: e.name }))}
                    selectedChips={lifeEventCriteria.eventTypes}
                    onToggle={handleToggleLifeEvent}
                    badge={`${LIFE_EVENTS.length}`} />
                  

              {/* Banking Products */}
              <ProductDimensionGroup
                    selectedProducts={selectedProducts}
                    onToggle={handleToggleProduct}
                    onRemove={handleRemoveProduct} />
                  

              {/* Geography */}
              <GeoDimensionSelector
                    selectedRegions={selectedRegions}
                    selectedMetros={selectedMetros}
                    areaType={areaType}
                    onToggleRegion={(r) => setSelectedRegions((prev) => toggleItem(prev, r))}
                    onToggleMetro={(m) => setSelectedMetros((prev) => toggleItem(prev, m))}
                    onSetAreaType={setAreaType} />
                  

              {/* Demographics */}
              <div className="pt-1">
                <DemographicFilters
                      filters={demographicFilters}
                      onChange={setDemographicFilters} />
                    
              </div>

              {/* Strategies */}
              <StrategyChips
                    crossSellStrategies={crossSellStrategies}
                    upsellStrategies={upsellStrategies}
                    onToggleCrossSell={handleToggleCrossSell}
                    onToggleUpsell={handleToggleUpsell} />
                  

              {/* Audience Estimate */}
              <AudienceEstimateBar
                    estimatedSize={estimatedSize}
                    hasSelections={hasSelections} />
                  
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Column: AI Preview + Personalization */}
          <ResizablePanel defaultSize={60} minSize={35} maxSize={70}>
            <div className="pl-4 space-y-4">
              {/* Product Selector */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <CreditCard className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">Promoting:</span>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="w-full max-w-[220px] bg-background h-8 text-sm">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_PRODUCTS.map((product) =>
                        <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                        )}
                  </SelectContent>
                </Select>
              </div>

              {/* Personalization Preview */}
              <PersonalizationPreviewPanel
                    selectedProduct={DEMO_PRODUCTS.find((p) => p.id === selectedProductId) || null}
                    selectedPillars={selectedPillars}
                    selectedLifeEvents={lifeEventCriteria.eventTypes}
                    hasSelections={hasSelections} />

                  

              <AICampaignPreview
                    brief={generatedBrief}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                    estimatedSize={estimatedSize}
                    hasSelections={hasSelections}
                    onSave={handleSave} />
                  <div className="mt-2 flex justify-end">
                    <SaveSequence status={campaignSave.status} label={campaignSave.stageLabel} />
                  </div>
                  

            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        </CardContent>
      </Card>
      </>
      }
    </div>);

}