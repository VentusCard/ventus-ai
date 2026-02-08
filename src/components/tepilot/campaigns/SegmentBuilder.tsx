import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Sparkles, Bookmark } from "lucide-react";
import { LifeEventTargeting } from "./LifeEventTargeting";
import { LifestyleTargeting } from "./LifestyleTargeting";
import { ProductTargeting } from "./ProductTargeting";
import { AudiencePreview } from "./AudiencePreview";
import { SegmentExportControls } from "./SegmentExportControls";
import { estimateAudienceSize } from "@/lib/segmentData";
import type { 
  SavedSegment, 
  LifeEventCriteria, 
  LifestyleCriteria, 
  ProductCriteria,
  TargetingMode 
} from "@/types/segment";

interface SegmentBuilderProps {
  onSaveSegment: (segment: Partial<SavedSegment>) => void;
}

export function SegmentBuilder({ onSaveSegment }: SegmentBuilderProps) {
  const [targetingMode, setTargetingMode] = useState<TargetingMode>("life_event");
  
  // Life event state
  const [lifeEventCriteria, setLifeEventCriteria] = useState<LifeEventCriteria>({
    eventTypes: [],
    minConfidence: 0.6,
  });

  // Lifestyle state
  const [lifestyleCriteria, setLifestyleCriteria] = useState<LifestyleCriteria>({
    pillars: [],
    spendingThreshold: "top_20",
  });

  // Product state
  const [productCriteria, setProductCriteria] = useState<ProductCriteria>({
    hasProducts: [],
    lacksProducts: [],
  });

  // Calculate audience size based on current mode
  const estimatedSize = useMemo(() => {
    switch (targetingMode) {
      case "life_event":
        return estimateAudienceSize(lifeEventCriteria, undefined, undefined);
      case "lifestyle":
        return estimateAudienceSize(undefined, lifestyleCriteria, undefined);
      case "product":
        return estimateAudienceSize(undefined, undefined, productCriteria);
      default:
        return 0;
    }
  }, [targetingMode, lifeEventCriteria, lifestyleCriteria, productCriteria]);

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

  const handleSaveSegment = () => {
    const segment: Partial<SavedSegment> = {
      targetingMode,
      estimatedSize,
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

    onSaveSegment(segment);
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
          Define your target audience using one of three targeting approaches
        </p>
      </CardHeader>
      <CardContent>
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

        {/* Audience Preview */}
        {hasSelections && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <AudiencePreview 
              targetingMode={targetingMode}
              estimatedSize={estimatedSize}
              lifeEventCriteria={targetingMode === "life_event" ? lifeEventCriteria : undefined}
              lifestyleCriteria={targetingMode === "lifestyle" ? lifestyleCriteria : undefined}
              productCriteria={targetingMode === "product" ? productCriteria : undefined}
            />
            
            <div className="mt-4 flex justify-end gap-3">
              <SegmentExportControls
                targetingMode={targetingMode}
                estimatedSize={estimatedSize}
                lifeEventCriteria={targetingMode === "life_event" ? lifeEventCriteria : undefined}
                lifestyleCriteria={targetingMode === "lifestyle" ? lifestyleCriteria : undefined}
                productCriteria={targetingMode === "product" ? productCriteria : undefined}
              />
              <Button onClick={handleSaveSegment}>
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
