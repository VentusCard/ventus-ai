import { useState, useMemo } from "react";
import { useSaveSequence, SIGNAL_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Target, Sparkles, Bookmark, CreditCard } from "lucide-react";
import { LifeEventTargeting } from "./LifeEventTargeting";
import { LifestyleTargeting } from "./LifestyleTargeting";
import { ProductTargeting } from "./ProductTargeting";
import { AudiencePreview } from "./AudiencePreview";
import { DemographicFilters } from "./DemographicFilters";
import { SegmentExportControls } from "./SegmentExportControls";
import { PersonalizationPreviewPanel } from "./PersonalizationPreviewPanel";
import { estimateAudienceSize } from "@/lib/segmentData";
import { DEMO_PRODUCTS } from "@/lib/samplePersonaGenerator";
import type { 
  SavedSegment, 
  LifeEventCriteria, 
  LifestyleCriteria, 
  ProductCriteria,
  DemographicFilters as DemographicFiltersType,
  TargetingMode 
} from "@/types/segment";

interface SegmentBuilderProps {
  onSaveSegment: (segment: Partial<SavedSegment>) => void;
}

export function SegmentBuilder({ onSaveSegment }: SegmentBuilderProps) {
  const [targetingMode, setTargetingMode] = useState<TargetingMode>("life_event");
  const [selectedProductId, setSelectedProductId] = useState<string>("travel_card");
  
  // Life event state
  const [lifeEventCriteria, setLifeEventCriteria] = useState<LifeEventCriteria>({
    eventTypes: [],
    minConfidence: 0.6,
    timingWindow: '6-12_months',
  });

  // Lifestyle state
  const [lifestyleCriteria, setLifestyleCriteria] = useState<LifestyleCriteria>({
    pillars: [],
    spendingThreshold: "top_20",
    recency: '90_days',
  });

  // Product state
  const [productCriteria, setProductCriteria] = useState<ProductCriteria>({
    hasProducts: [],
    lacksProducts: [],
    spendingPatterns: {},
  });

  // Demographic filters (global across all modes)
  const [demographicFilters, setDemographicFilters] = useState<DemographicFiltersType>({
    ageRanges: [],
    regions: [],
    incomeBands: [],
    accountTenure: 'all',
  });

  // Calculate audience size based on current mode and filters
  const estimatedSize = useMemo(() => {
    let baseSize = 0;
    
    switch (targetingMode) {
      case "life_event":
        baseSize = estimateAudienceSize(lifeEventCriteria, undefined, undefined);
        break;
      case "lifestyle":
        baseSize = estimateAudienceSize(undefined, lifestyleCriteria, undefined);
        break;
      case "product":
        baseSize = estimateAudienceSize(undefined, undefined, productCriteria);
        break;
      default:
        baseSize = 0;
    }
    
    // Apply demographic filter multipliers
    let multiplier = 1.0;
    
    // Age ranges: each age band is roughly equal portion
    if (demographicFilters.ageRanges.length > 0 && demographicFilters.ageRanges.length < 6) {
      const AGE_RATES: Record<string, number> = {
        '18-24': 0.12, '25-34': 0.18, '35-44': 0.17,
        '45-54': 0.17, '55-64': 0.16, '65+': 0.20
      };
      const ageMultiplier = demographicFilters.ageRanges.reduce((sum, age) => sum + (AGE_RATES[age] || 0.16), 0);
      multiplier *= ageMultiplier;
    }
    
    // Regions
    if (demographicFilters.regions.length > 0 && demographicFilters.regions.length < 6) {
      const REGION_RATES: Record<string, number> = {
        'Northeast': 0.17, 'Southeast': 0.24, 'Midwest': 0.21,
        'Southwest': 0.12, 'West': 0.18, 'Northwest': 0.08
      };
      const regionMultiplier = demographicFilters.regions.reduce((sum, r) => sum + (REGION_RATES[r] || 0.15), 0);
      multiplier *= regionMultiplier;
    }
    
    // Income bands
    if (demographicFilters.incomeBands.length > 0 && demographicFilters.incomeBands.length < 4) {
      multiplier *= (demographicFilters.incomeBands.length * 0.25);
    }
    
    // Account tenure
    if (demographicFilters.accountTenure !== 'all') {
      multiplier *= 0.35; // Roughly 1/3 in each tenure bucket
    }
    
    return Math.floor(baseSize * multiplier);
  }, [targetingMode, lifeEventCriteria, lifestyleCriteria, productCriteria, demographicFilters]);

  const hasSelections = useMemo(() => {
    switch (targetingMode) {
      case "life_event":
        return lifeEventCriteria.eventTypes.length > 0;
      case "lifestyle":
        return lifestyleCriteria.pillars.length > 0;
      case "product":
        return productCriteria.hasProducts.length > 0 || productCriteria.lacksProducts.length > 0;
      default:
        return false;
    }
  }, [targetingMode, lifeEventCriteria, lifestyleCriteria, productCriteria]);

  // Get selected product for personalization preview
  const selectedProduct = useMemo(() => {
    return DEMO_PRODUCTS.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId]);

  // Get selected pillars for personalization
  const selectedPillarsForPreview = useMemo(() => {
    return targetingMode === "lifestyle" ? lifestyleCriteria.pillars : [];
  }, [targetingMode, lifestyleCriteria.pillars]);

  // Get selected life events for personalization
  const selectedLifeEventsForPreview = useMemo(() => {
    return targetingMode === "life_event" ? lifeEventCriteria.eventTypes : [];
  }, [targetingMode, lifeEventCriteria.eventTypes]);

  const segmentSave = useSaveSequence({ stages: SIGNAL_STAGES, doneLabel: "Segment synced" });

  const handleSaveSegment = () => {
    const segment: Partial<SavedSegment> = {
      targetingMode,
      estimatedSize,
      demographicFilters,
    };

    switch (targetingMode) {
      case "life_event":
        segment.lifeEventCriteria = lifeEventCriteria;
        break;
      case "lifestyle":
        segment.lifestyleCriteria = lifestyleCriteria;
        break;
      case "product":
        segment.productCriteria = productCriteria;
        break;
    }

    segmentSave.run(() => onSaveSegment(segment));
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Segment Builder</CardTitle>
          </div>
          {hasSelections && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Users className="w-3 h-3 mr-1" />
              {(estimatedSize / 1_000_000).toFixed(1)}M estimated reach
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Preview how personalized campaigns reach different customer profiles
        </p>
      </CardHeader>
      <CardContent>
        {/* Product Selector */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-slate-900">What product are you promoting?</span>
          </div>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full max-w-xs bg-white">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_PRODUCTS.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs 
          value={targetingMode} 
          onValueChange={(v) => setTargetingMode(v as TargetingMode)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="life_event" className="text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Life Events
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              Lifestyle Pillars
            </TabsTrigger>
            <TabsTrigger value="product" className="text-sm">
              <Target className="w-4 h-4 mr-2" />
              Product Holdings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="life_event" className="mt-0">
            <LifeEventTargeting 
              criteria={lifeEventCriteria}
              onChange={setLifeEventCriteria}
            />
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-0">
            <LifestyleTargeting 
              criteria={lifestyleCriteria}
              onChange={setLifestyleCriteria}
            />
          </TabsContent>

          <TabsContent value="product" className="mt-0">
            <ProductTargeting 
              criteria={productCriteria}
              onChange={setProductCriteria}
            />
          </TabsContent>
        </Tabs>

        {/* Demographic Filters Section */}
        <div className="mt-6">
          <DemographicFilters 
            filters={demographicFilters}
            onChange={setDemographicFilters}
          />
        </div>

        {/* Personalization Preview Panel */}
        {hasSelections && (
          <div className="mt-6">
            <PersonalizationPreviewPanel
              selectedProduct={selectedProduct}
              selectedPillars={selectedPillarsForPreview}
              selectedLifeEvents={selectedLifeEventsForPreview}
              hasSelections={hasSelections}
            />
          </div>
        )}

        {/* Audience Preview */}
        {hasSelections && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <AudiencePreview 
              targetingMode={targetingMode}
              estimatedSize={estimatedSize}
              lifeEventCriteria={targetingMode === "life_event" ? lifeEventCriteria : undefined}
              lifestyleCriteria={targetingMode === "lifestyle" ? lifestyleCriteria : undefined}
              productCriteria={targetingMode === "product" ? productCriteria : undefined}
              demographicFilters={demographicFilters}
            />
            
            <div className="mt-4 flex justify-end gap-3">
              <SegmentExportControls
                targetingMode={targetingMode}
                estimatedSize={estimatedSize}
                lifeEventCriteria={targetingMode === "life_event" ? lifeEventCriteria : undefined}
                lifestyleCriteria={targetingMode === "lifestyle" ? lifestyleCriteria : undefined}
                productCriteria={targetingMode === "product" ? productCriteria : undefined}
              />
              <SaveSequence status={segmentSave.status} label={segmentSave.stageLabel} className="self-center" />
              <Button onClick={handleSaveSegment} disabled={segmentSave.isBusy}>
                <Bookmark className="w-4 h-4 mr-2" />
                Save Segment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
