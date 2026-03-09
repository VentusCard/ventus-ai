import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap, ChevronDown, ChevronRight, Users, ArrowRight, Sparkles, Calendar,
  ArrowUpRight, LayoutGrid, CreditCard, Play,
} from "lucide-react";
import { PersonalizationPreviewPanel } from "./PersonalizationPreviewPanel";
import { TierProductSelector, type TierProductMap } from "./TierProductSelector";
import { AudienceFiltersPanel } from "./AudienceFiltersPanel";
import { SEGMENT_TEMPLATES } from "@/lib/segmentData";
import { DEMO_PRODUCTS, LIFE_EVENT_PRODUCT_TIERS } from "@/lib/samplePersonaGenerator";
import type { SegmentTemplate } from "@/types/segment";
import type { DemographicFilters } from "@/types/segment";
import type { WealthTier } from "@/lib/samplePersonaGenerator";

type CategoryFilter = 'all' | 'life_event' | 'lifestyle' | 'cross_sell';

const CATEGORY_CONFIG: Record<CategoryFilter, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: 'All Flows', icon: LayoutGrid },
  life_event: { label: 'Life Events', icon: Sparkles },
  lifestyle: { label: 'Lifestyle', icon: Users },
  cross_sell: { label: 'Cross-Sell', icon: ArrowUpRight },
};

// Only show templates with strong financial product upsell affinity
const AUTOMATION_TEMPLATE_IDS = new Set([
  'new-parent-segment',
  'pre-retiree-segment',
  'home-buyers-segment',
  'travel-enthusiasts-segment',
  'foodies-segment',
  'cashback-high-travel-segment',
  'travel-card-no-hotel-segment',
  'premium-upgrade-eligible-segment',
  'holiday-travelers-segment',
]);

const DEFAULT_TIER_PRODUCTS: TierProductMap = {
  "Mass Market": [],
  "Affluent": [],
  "HNW": [],
};

function getDefaultTierProducts(template: SegmentTemplate): TierProductMap {
  // For life event templates, pre-fill from LIFE_EVENT_PRODUCT_TIERS
  if (template.category === 'life_event') {
    const eventMap: Record<string, string> = {
      'new-parent-segment': 'family',
      'pre-retiree-segment': 'retirement',
      'home-buyers-segment': 'home',
      'back-to-school-parents-segment': 'education',
    };
    const eventKey = eventMap[template.id];
    if (eventKey && LIFE_EVENT_PRODUCT_TIERS[eventKey]) {
      const tiers = LIFE_EVENT_PRODUCT_TIERS[eventKey];
      const result: TierProductMap = { "Mass Market": [], "Affluent": [], "HNW": [] };
      tiers.forEach(tc => {
        result[tc.tier] = [{ id: tc.productId, name: tc.productName }];
      });
      return result;
    }
  }

  // For non-life-event templates, put the recommended product in all tiers
  if (template.recommendedProductId) {
    const product = DEMO_PRODUCTS.find(p => p.id === template.recommendedProductId);
    if (product) {
      return {
        "Mass Market": [{ id: product.id, name: product.name }],
        "Affluent": [{ id: product.id, name: product.name }],
        "HNW": [{ id: product.id, name: product.name }],
      };
    }
  }

  return { ...DEFAULT_TIER_PRODUCTS };
}

export function AutomatedFlowsSection() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);
  const [tierSelectorOpenId, setTierSelectorOpenId] = useState<string | null>(null);
  const [audienceFilterOpenId, setAudienceFilterOpenId] = useState<string | null>(null);
  const [activeFlows, setActiveFlows] = useState<Set<string>>(
    () => new Set(['travel-enthusiasts-segment', 'cashback-high-travel-segment', 'new-parent-segment'])
  );
  const [flowTierProducts, setFlowTierProducts] = useState<Record<string, TierProductMap>>({});
  const [flowAudienceFilters, setFlowAudienceFilters] = useState<Record<string, DemographicFilters>>({});
  const allowedTemplates = useMemo(() =>
    SEGMENT_TEMPLATES.filter(t => AUTOMATION_TEMPLATE_IDS.has(t.id)),
  []);

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === 'all') return allowedTemplates;
    // Holiday Travelers is seasonal but we show it under lifestyle
    return allowedTemplates.filter(t => {
      const effectiveCategory = t.category === 'seasonal' ? 'lifestyle' : t.category;
      return effectiveCategory === categoryFilter;
    });
  }, [categoryFilter, allowedTemplates]);

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return allowedTemplates.length;
    return allowedTemplates.filter(t => {
      const effectiveCategory = t.category === 'seasonal' ? 'lifestyle' : t.category;
      return effectiveCategory === category;
    }).length;
  };

  const toggleFlowActive = (id: string) => {
    setActiveFlows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTierProducts = (template: SegmentTemplate): TierProductMap => {
    return flowTierProducts[template.id] || getDefaultTierProducts(template);
  };

  const updateTierProducts = (templateId: string, value: TierProductMap) => {
    setFlowTierProducts(prev => ({ ...prev, [templateId]: value }));
  };

  const getPillarsForTemplate = (template: SegmentTemplate): string[] => {
    if (template.category === 'lifestyle') {
      const pillarMap: Record<string, string[]> = {
        'travel-enthusiasts-segment': ['Travel & Exploration'],
        'fitness-wellness-segment': ['Health & Wellness'],
        'foodies-segment': ['Food & Dining'],
        'pet-parents-segment': ['Pets & Animals'],
        'holiday-travelers-segment': ['Travel & Exploration'],
        'tax-season-financial-segment': ['Financial Services'],
      };
      return pillarMap[template.id] || [];
    }
    return [];
  };

  const getLifeEventsForTemplate = (template: SegmentTemplate): string[] => {
    if (template.category === 'life_event') {
      const eventMap: Record<string, string[]> = {
        'new-parent-segment': ['family'],
        'pre-retiree-segment': ['retirement'],
        'home-buyers-segment': ['home'],
        'back-to-school-parents-segment': ['education'],
      };
      return eventMap[template.id] || [];
    }
    return [];
  };

  // Get a summary of products across all tiers for the header badge
  const getProductSummary = (tierProducts: TierProductMap): string => {
    const allProducts = new Set<string>();
    Object.values(tierProducts).forEach(products => {
      products.forEach(p => allProducts.add(p.name));
    });
    if (allProducts.size === 0) return "No products";
    if (allProducts.size === 1) return [...allProducts][0];
    return `${allProducts.size} products`;
  };

  const SIGNAL_CATEGORIES: Record<string, string> = {
    'travel-enthusiasts-segment': 'Travel & Hotels',
    'new-parent-segment': 'Baby & Kids',
    'pre-retiree-segment': 'Financial & Retirement',
    'home-buyers-segment': 'Home & Mortgage',
    'foodies-segment': 'Dining & Restaurants',
    'cashback-high-travel-segment': 'Travel & Airlines',
    'holiday-travelers-segment': 'Holiday Travel',
  };

  const getDefaultAudienceFilters = (template: SegmentTemplate): DemographicFilters => {
    const defaults: Record<string, DemographicFilters> = {
      'travel-enthusiasts-segment': {
        ageRanges: ['25-34', '35-44', '45-54'], regions: [], incomeBands: ['100k_150k', 'over_150k'],
        accountTenure: 'all', ficoRanges: ['good', 'excellent'],
        signalThreshold: { minAmount: 1000, lookbackMonths: 24 },
      },
      'new-parent-segment': {
        ageRanges: ['25-34', '35-44'], regions: [], incomeBands: ['50k_100k', '100k_150k'],
        accountTenure: 'established', ficoRanges: ['good', 'excellent'],
        signalThreshold: { minAmount: 500, lookbackMonths: 12 },
      },
      'pre-retiree-segment': {
        ageRanges: ['55-64', '65+'], regions: [], incomeBands: ['100k_150k', 'over_150k'],
        accountTenure: 'loyal', ficoRanges: ['excellent'],
        signalThreshold: { minAmount: 2000, lookbackMonths: 24 },
      },
      'home-buyers-segment': {
        ageRanges: ['25-34', '35-44'], regions: [], incomeBands: ['100k_150k', 'over_150k'],
        accountTenure: 'established', ficoRanges: ['good', 'excellent'],
        signalThreshold: { minAmount: 1500, lookbackMonths: 12 },
      },
      'foodies-segment': {
        ageRanges: ['25-34', '35-44'], regions: [], incomeBands: ['50k_100k', '100k_150k'],
        accountTenure: 'all', ficoRanges: [],
        signalThreshold: { minAmount: 800, lookbackMonths: 12 },
      },
      'cashback-high-travel-segment': {
        ageRanges: ['25-34', '35-44'], regions: [], incomeBands: ['50k_100k', '100k_150k'],
        accountTenure: 'established', ficoRanges: ['good', 'excellent'],
        signalThreshold: { minAmount: 1200, lookbackMonths: 24 },
      },
      'holiday-travelers-segment': {
        ageRanges: ['25-34', '35-44', '45-54'], regions: [], incomeBands: ['50k_100k', '100k_150k', 'over_150k'],
        accountTenure: 'all', ficoRanges: ['good', 'excellent'],
        signalThreshold: { minAmount: 1500, lookbackMonths: 24 },
      },
    };
    return defaults[template.id] || {
      ageRanges: [], regions: [], incomeBands: [], accountTenure: 'all' as const,
      ficoRanges: [], signalThreshold: { minAmount: 500, lookbackMonths: 12 },
    };
  };

  const getAudienceFilters = (template: SegmentTemplate): DemographicFilters => {
    return flowAudienceFilters[template.id] || getDefaultAudienceFilters(template);
  };

  const updateAudienceFilters = (templateId: string, value: DemographicFilters) => {
    setFlowAudienceFilters(prev => ({ ...prev, [templateId]: value }));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">Automated Flows</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Play className="w-3 h-3" />
              {activeFlows.size} active
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {allowedTemplates.length} flows
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Always-on campaigns triggered by transaction signals. Each flow auto-matches the right product and personalizes messaging per customer.
        </p>
      </CardHeader>
      <CardContent>
        {/* Category filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Object.keys(CATEGORY_CONFIG) as CategoryFilter[]).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            const count = getCategoryCount(category);
            return (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  categoryFilter === category
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {config.label}
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Flow cards */}
        <div className="space-y-2">
          {filteredTemplates.map(template => {
            const isActive = activeFlows.has(template.id);
            const isExpanded = expandedFlowId === template.id;
            const tierProducts = getTierProducts(template);
            const productSummary = getProductSummary(tierProducts);

            return (
              <div key={template.id} className="border border-border rounded-lg overflow-hidden">
                {/* Flow header row */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-muted/60' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setExpandedFlowId(isExpanded ? null : template.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{template.name}</span>
                        <Badge
                          variant={template.priority === 'high' ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 shrink-0"
                        >
                          {template.priority}
                        </Badge>
                        {template.seasonalWindow && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            <Calendar className="w-2.5 h-2.5 mr-0.5" />
                            {template.seasonalWindow}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{template.description}</p>
                    </div>
                  </div>

                  {/* Product summary badge */}
                  <Badge variant="outline" className="text-xs gap-1 shrink-0 bg-background">
                    <CreditCard className="w-3 h-3" />
                    {productSummary}
                  </Badge>

                  {/* Audience */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(template.estimatedSize / 1_000_000).toFixed(1)}M
                  </span>

                  {/* Active toggle */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleFlowActive(template.id)}
                      className="shrink-0"
                    />
                  </div>
                </div>

                {/* Collapsed tier-product preview */}
                {!isExpanded && (
                  <div
                    className="flex items-center gap-3 px-4 py-2 border-t border-border bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors overflow-x-auto"
                    onClick={() => setExpandedFlowId(template.id)}
                  >
                    {([
                      { tier: "Mass Market" as const, color: "hsl(var(--primary))" },
                      { tier: "Affluent" as const, color: "#f59e0b" },
                      { tier: "HNW" as const, color: "#8b5cf6" },
                    ]).map(({ tier, color }) => {
                      const products = tierProducts[tier];
                      return (
                        <div key={tier} className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: `${color}15`, color }}
                          >
                            {tier}
                          </span>
                          {products.length === 0 ? (
                            <span className="text-[10px] text-muted-foreground italic">None</span>
                          ) : (
                            products.map(p => (
                              <Badge key={p.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                                <CreditCard className="w-2.5 h-2.5" />
                                {p.name}
                              </Badge>
                            ))
                          )}
                          <span className="text-muted-foreground/30 last:hidden">|</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                    {/* Trigger info */}
                    <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
                      <Zap className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Trigger Condition</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {template.automatedTrigger || 'Criteria-based audience detection'}
                        </p>
                      </div>
                    </div>

                    {/* Flow diagram */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Sparkles className="w-3 h-3" />
                        Signal Detected
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge
                        className={`gap-1 text-xs cursor-pointer transition-all bg-primary/75 text-primary-foreground border border-primary/80 hover:bg-primary/85 hover:border-primary/90 ${
                          audienceFilterOpenId === template.id ? 'border-primary bg-primary/80 ring-1 ring-primary/60' : ''
                        }`}
                        onClick={() => setAudienceFilterOpenId(audienceFilterOpenId === template.id ? null : template.id)}
                      >
                        <Users className="w-3 h-3" />
                        Audience Matched
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge
                        className={`gap-1 text-xs cursor-pointer transition-all bg-primary/75 text-primary-foreground border border-primary/80 hover:bg-primary/85 hover:border-primary/90 ${
                          tierSelectorOpenId === template.id ? 'border-primary bg-primary/80 ring-1 ring-primary/60' : ''
                        }`}
                        onClick={() => setTierSelectorOpenId(tierSelectorOpenId === template.id ? null : template.id)}
                      >
                        <CreditCard className="w-3 h-3" />
                        Tier-Matched Product
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge className="gap-1 text-xs bg-primary text-primary-foreground">
                        Personalized Message
                      </Badge>
                    </div>

                    {audienceFilterOpenId === template.id && (
                      <AudienceFiltersPanel
                        filters={getAudienceFilters(template)}
                        onChange={(val) => updateAudienceFilters(template.id, val)}
                        signalCategory={SIGNAL_CATEGORIES[template.id] || 'General Spending'}
                      />
                    )}

                    {tierSelectorOpenId === template.id && (
                      <TierProductSelector
                        value={tierProducts}
                        onChange={(val) => updateTierProducts(template.id, val)}
                      />
                    )}

                    {/* Personalization Preview */}
                    <PersonalizationPreviewPanel
                      key={template.id}
                      selectedProduct={null}
                      selectedPillars={getPillarsForTemplate(template)}
                      selectedLifeEvents={getLifeEventsForTemplate(template)}
                      hasSelections={true}
                      tierProductOverrides={tierProducts}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
