import { useState, useMemo, useCallback, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { DimensionChipCloud } from "./DimensionChipCloud";
import { DemographicFilters as DemographicFiltersPanel } from "./DemographicFilters";
import { AudienceEstimateBar } from "./AudienceEstimateBar";
import { SegmentOutputPanel, type GeneratedPersona } from "./SegmentOutputPanel";
import { PRODUCT_FLOWS, getProductFlow } from "@/lib/productAutomatedFlows";
import { estimateAssetSignalAudience, type LifestyleAssetSignal } from "@/lib/lifestyleAssetSignals";
import { LIFE_EVENTS } from "@/types/segment";
import type { DemographicFilters as DemographicFiltersType } from "@/types/segment";
import { Megaphone, Gem, Sparkles, Wand2, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  const [generatedSignals, setGeneratedSignals] = useState<LifestyleAssetSignal[]>([]);
  const [applicableLifeEvents, setApplicableLifeEvents] = useState<string[]>([]);
  const [applicableDemographics, setApplicableDemographics] = useState<{
    ageRanges: string[];
    regions: string[];
    incomeBands: string[];
    accountTenure: string[];
  } | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsError, setSignalsError] = useState<string | null>(null);

  const [generatedPersonas, setGeneratedPersonas] = useState<GeneratedPersona[] | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [segmentError, setSegmentError] = useState<string | null>(null);

  const product = getProductFlow(productId);

  const toggle = useCallback((list: string[], id: string) => {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }, []);

  // Reset everything tied to a product when product changes
  useEffect(() => {
    setGeneratedSignals([]);
    setApplicableLifeEvents([]);
    setApplicableDemographics(null);
    setAssetSignals([]);
    setLifeEvents([]);
    setDemographics({ ageRanges: [], regions: [], incomeBands: [], accountTenure: "all" });
    setGeneratedPersonas(null);
    setSignalsError(null);
    setSegmentError(null);
  }, [productId]);


  const selectedSignalObjects = useMemo(
    () => generatedSignals.filter((s) => assetSignals.includes(s.id)),
    [generatedSignals, assetSignals],
  );

  const estimatedSize = useMemo(
    () => estimateAssetSignalAudience({
      productId,
      selectedSignals: selectedSignalObjects,
      lifeEvents,
      pillars,
      demographics,
    }),
    [productId, selectedSignalObjects, lifeEvents, pillars, demographics]
  );

  const hasSelections =
    assetSignals.length > 0 || lifeEvents.length > 0 || pillars.length > 0 ||
    demographics.ageRanges.length > 0 || demographics.incomeBands.length > 0 || demographics.regions.length > 0;

  const handleApiError = (status: number | undefined, fallback: string) => {
    if (status === 429) return "Rate limit reached — please try again in a moment.";
    if (status === 402) return "AI credits exhausted — add credits in workspace settings.";
    return fallback;
  };

  const generateSignals = async () => {
    if (!product) return;
    setSignalsLoading(true);
    setSignalsError(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-lifestyle-signals", {
        body: {
          productId,
          productName: product.name,
          productCategory: product.category,
          productPositioning: product.positioning,
          curatedSignals: product.signals?.map((s) => ({ label: s.label, evidence: s.evidence })) ?? [],
        },
      });
      if (error) throw new Error(error.message);
      if (data?.status === 429 || data?.status === 402) {
        const msg = handleApiError(data.status, data.error ?? "AI error");
        setSignalsError(msg);
        toast({ title: "Couldn't generate signals", description: msg });
        return;
      }
      if (!data?.signals?.length) throw new Error("No signals returned");
      setGeneratedSignals(data.signals);
      const nextLE: string[] = Array.isArray(data.applicableLifeEvents) ? data.applicableLifeEvents : [];
      setApplicableLifeEvents(nextLE);
      // Drop any prior selection IDs that don't exist in the new set
      setAssetSignals((prev) => prev.filter((id) => data.signals.some((s: LifestyleAssetSignal) => s.id === id)));
      setLifeEvents((prev) => prev.filter((id) => nextLE.includes(id)));
      const nextDem = data.applicableDemographics ?? { ageRanges: [], regions: [], incomeBands: [], accountTenure: [] };
      const ageArr: string[] = Array.isArray(nextDem.ageRanges) ? nextDem.ageRanges : [];
      const regionArr: string[] = Array.isArray(nextDem.regions) ? nextDem.regions : [];
      const incomeArr: string[] = Array.isArray(nextDem.incomeBands) ? nextDem.incomeBands : [];
      const tenureArr: string[] = Array.isArray(nextDem.accountTenure) ? nextDem.accountTenure : [];
      setApplicableDemographics({
        ageRanges: ageArr,
        regions: regionArr,
        incomeBands: incomeArr,
        accountTenure: tenureArr,
      });
      // Pre-select the AI-suggested values; user can still adjust afterward.
      setDemographics({
        ageRanges: ageArr,
        regions: regionArr,
        incomeBands: incomeArr,
        accountTenure: (tenureArr[0] as DemographicFiltersType["accountTenure"]) ?? "all",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setSignalsError(msg);
      toast({ title: "Couldn't generate signals", description: msg });
    } finally {
      setSignalsLoading(false);
    }
  };

  const generateSegment = async () => {
    if (!product) return;
    setSegmentLoading(true);
    setSegmentError(null);
    setGeneratedPersonas(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-campaign-segment", {
        body: {
          productName: product.name,
          productPositioning: product.positioning,
          selectedSignals: selectedSignalObjects.map((s) => ({ label: s.label, description: s.description })),
          lifeEvents: lifeEvents.map((id) => LIFE_EVENTS.find((e) => e.id === id)?.name ?? id),
          pillars,
          demographics,
          audienceSize: estimatedSize,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.status === 429 || data?.status === 402) {
        const msg = handleApiError(data.status, data.error ?? "AI error");
        setSegmentError(msg);
        toast({ title: "Couldn't generate segment", description: msg });
        return;
      }
      if (!data?.personas?.length) throw new Error("No personas returned");
      setGeneratedPersonas(data.personas);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setSegmentError(msg);
      toast({ title: "Couldn't generate segment", description: msg });
    } finally {
      setSegmentLoading(false);
    }
  };

  const signalChips = generatedSignals.map((s) => ({ id: s.id, label: s.label, description: s.description }));

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Megaphone className="w-4 h-4" />}
        title="Campaign Builder"
        subtitle="Product-first segment workflow — pick a product, layer lifestyle signals, generate personalized output"
        howItWorks="Choose the product you want to upsell. Ventus generates a fresh set of lifestyle signals tuned to that product. Layer in life events, pillars, and demographics, then generate a sized segment with personalized message variants per persona."
        whyItMatters="Lets relationship managers run targeted, one-off campaigns for specific products like Wealth Management with bespoke behavioral evidence and AI-drafted creative per microsegment."
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
            <Select value={productId} onValueChange={setProductId}>
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

            {/* Lifestyle Asset Signals — generative */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 mb-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-slate-900">
                    Lifestyle Asset Signals {product ? `· ${product.name}` : ""}
                  </p>
                  {generatedSignals.length > 0 && (
                    <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
                      {generatedSignals.length}
                    </Badge>
                  )}
                </div>
                {generatedSignals.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] text-slate-600"
                    onClick={generateSignals}
                    disabled={signalsLoading}
                  >
                    {signalsLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                    Regenerate
                  </Button>
                )}
              </div>

              {signalsLoading && generatedSignals.length === 0 && (
                <div className="flex flex-wrap gap-1.5 py-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 w-24 rounded-full bg-slate-200/70 animate-pulse" />
                  ))}
                </div>
              )}

              {!signalsLoading && generatedSignals.length === 0 && !signalsError && (
                <div className="flex items-center justify-between gap-3 py-2">
                  <p className="text-xs text-slate-500 leading-snug">
                    No lifestyle signals yet. Ventus will generate a fresh set tuned to {product?.name ?? "the product"}.
                  </p>
                  <Button size="sm" onClick={generateSignals} disabled={signalsLoading} className="shrink-0">
                    <Wand2 className="w-3.5 h-3.5 mr-1" />
                    Generate signals
                  </Button>
                </div>
              )}

              {signalsError && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{signalsError}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={generateSignals} disabled={signalsLoading}>
                    Retry
                  </Button>
                </div>
              )}

              {generatedSignals.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {signalChips.map((chip) => {
                    const selected = assetSignals.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setAssetSignals((prev) => toggle(prev, chip.id))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          selected
                            ? "bg-blue-50 border-blue-400 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-slate-900"
                        }`}
                        title={chip.description}
                      >
                        <span className={`w-2 h-2 rounded-full ${selected ? "bg-blue-600" : "bg-slate-300"}`} />
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {applicableLifeEvents.length > 0 && (() => {
              const chips = LIFE_EVENTS
                .filter((e) => applicableLifeEvents.includes(e.id))
                .map((e) => ({ id: e.id, label: e.name }));
              return (
                <DimensionChipCloud
                  title="Life Events"
                  icon={<Sparkles className="w-4 h-4 text-blue-600" />}
                  chips={chips}
                  selectedChips={lifeEvents}
                  onToggle={(id) => setLifeEvents((prev) => toggle(prev, id))}
                  badge={`${chips.length}`}
                />
              );
            })()}

            {(() => {
              const dem = applicableDemographics;
              const totalApplicable = dem
                ? dem.ageRanges.length + dem.regions.length + dem.incomeBands.length + dem.accountTenure.length
                : null;
              if (dem && totalApplicable === 0) return null;
              return (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <DemographicFiltersPanel
                    filters={demographics}
                    onChange={setDemographics}
                    applicable={dem ?? undefined}
                  />
                </div>
              );
            })()}
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
              <p className="text-sm font-semibold text-slate-900">Generate segment + personalized output</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Ventus drafts 3 microsegment personas with subject, body, CTA, and stock-image brief for each.
              </p>
              <Button
                onClick={generateSegment}
                disabled={!hasSelections || segmentLoading}
                className="shrink-0"
              >
                {segmentLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Wand2 className="w-4 h-4" />}
                {generatedPersonas ? "Regenerate segment" : "Generate segment"}
              </Button>
            </div>
          </div>

          {segmentLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
                  <div className="h-4 w-1/3 bg-slate-200 rounded mb-3" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
                    <div className="h-24 bg-slate-100 rounded" />
                    <div className="h-24 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {segmentError && !segmentLoading && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{segmentError}</span>
              </div>
              <Button size="sm" variant="outline" onClick={generateSegment}>Retry</Button>
            </div>
          )}

          {generatedPersonas && !segmentLoading && (
            <SegmentOutputPanel
              productId={productId}
              audienceSize={estimatedSize}
              personas={generatedPersonas}
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
              {applicableLifeEvents.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Life events</span>
                  <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">{lifeEvents.length}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
