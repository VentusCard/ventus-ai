import { useState, useMemo, useCallback, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { DimensionChipCloud } from "./DimensionChipCloud";
import { DemographicFilters as DemographicFiltersPanel } from "./DemographicFilters";
import { AudienceEstimateBar } from "./AudienceEstimateBar";
import { SegmentOutputPanel } from "./SegmentOutputPanel";
import { PRODUCT_FLOWS, getProductFlow } from "@/lib/productAutomatedFlows";
import { getAssetSignalsForProduct, estimateAssetSignalAudience } from "@/lib/lifestyleAssetSignals";
import { LIFESTYLE_PILLARS } from "@/lib/campaignStudioData";
import { LIFE_EVENTS } from "@/types/segment";
import type { DemographicFilters as DemographicFiltersType } from "@/types/segment";
import { Megaphone, Gem, Heart, Sparkles, Wand2 } from "lucide-react";

export function ProductCampaignBuilderView() {
  const [productId, setProductId] = useState<string>("wealth-management");
  const [assetSignals, setAssetSignals] = useState<string[]>([]);
  const [lifeEvents, setLifeEvents] = useState<string[]>([]);
  const [pillars, setPillars] = useState<string[]>([]);
  const [demographics, setDemographics] = useState<DemographicFiltersType>({
    ageRanges: [],
    regions: [],
    incomeBands: [],
    accountTenure: "all",
  });
  const [generated, setGenerated] = useState(false);

  const product = getProductFlow(productId);

  const toggle = useCallback((list: string[], id: string) => {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }, []);

  const estimatedSize = useMemo(
    () => estimateAssetSignalAudience({ productId, assetSignals, lifeEvents, pillars, demographics }),
    [productId, assetSignals, lifeEvents, pillars, demographics]
  );

  const hasSelections =
    assetSignals.length > 0 || lifeEvents.length > 0 || pillars.length > 0 ||
    demographics.ageRanges.length > 0 || demographics.incomeBands.length > 0 || demographics.regions.length > 0;

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Megaphone className="w-4 h-4" />}
        title="Campaign Builder"
        subtitle="Product-first segment workflow — pick a product, layer lifestyle signals, generate personalized output"
        howItWorks="Choose the product you want to upsell, then narrow the eligible base using lifestyle asset signals, life events, lifestyle pillars, and demographics. Ventus generates a sized segment with personalized message variants per persona."
        whyItMatters="Lets relationship managers run targeted, one-off campaigns for specific products like Wealth Management with the same behavioral evidence as always-on flows, but with custom messaging."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        {/* Builder column */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
              <p className="text-sm font-semibold text-slate-900">Pick the product to upsell</p>
            </div>
            <Select value={productId} onValueChange={(v) => { setProductId(v); setGenerated(false); }}>
              <SelectTrigger className="w-full max-w-md bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_FLOWS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} <span className="text-slate-400 ml-2 text-xs">· {p.category}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {product && (
              <p className="text-xs text-slate-500 mt-2 leading-snug">{product.positioning}</p>
            )}
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
              <p className="text-sm font-semibold text-slate-900">Layer targeting signals</p>
            </div>

            <div className="space-y-1">
              <DimensionChipCloud
                title="Lifestyle Asset Signals"
                icon={<Gem className="w-4 h-4 text-blue-600" />}
                chips={LIFESTYLE_ASSET_SIGNALS.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
                selectedChips={assetSignals}
                onToggle={(id) => setAssetSignals((prev) => toggle(prev, id))}
                badge={`${LIFESTYLE_ASSET_SIGNALS.length}`}
                defaultOpen
              />
              <DimensionChipCloud
                title="Life Events"
                icon={<Sparkles className="w-4 h-4 text-blue-600" />}
                chips={LIFE_EVENTS.map((e) => ({ id: e.id, label: e.name }))}
                selectedChips={lifeEvents}
                onToggle={(id) => setLifeEvents((prev) => toggle(prev, id))}
                badge={`${LIFE_EVENTS.length}`}
              />
              <DimensionChipCloud
                title="Lifestyle Pillars"
                icon={<Heart className="w-4 h-4 text-blue-600" />}
                chips={LIFESTYLE_PILLARS.map((p) => ({ id: p, label: p }))}
                selectedChips={pillars}
                onToggle={(id) => setPillars((prev) => toggle(prev, id))}
                badge={`${LIFESTYLE_PILLARS.length}`}
              />
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <DemographicFiltersPanel filters={demographics} onChange={setDemographics} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
              <p className="text-sm font-semibold text-slate-900">Generate segment + personalized output</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Ventus builds the sized segment, splits it into representative personas, and drafts the message, CTA, and imagery direction per persona.
              </p>
              <Button onClick={() => setGenerated(true)} disabled={!hasSelections} className="shrink-0">
                <Wand2 className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </div>

          {generated && hasSelections && (
            <SegmentOutputPanel
              productId={productId}
              audienceSize={estimatedSize}
              selectedAssetSignals={assetSignals}
            />
          )}
        </div>

        {/* Sticky right strip */}
        <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Campaign target</p>
            {product && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900">
                  <product.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-500">{product.category}</p>
                </div>
              </div>
            )}
            <AudienceEstimateBar estimatedSize={estimatedSize} hasSelections={hasSelections} />
            {!hasSelections && (
              <p className="text-xs text-slate-400 italic">Select at least one signal to size the audience.</p>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Asset signals</span>
                <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">{assetSignals.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Life events</span>
                <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">{lifeEvents.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Lifestyle pillars</span>
                <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">{pillars.length}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
