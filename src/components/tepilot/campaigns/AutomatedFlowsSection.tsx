import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Zap, ChevronDown, ChevronRight, Users, ArrowRight, Sparkles, Calendar,
  ArrowUpRight, LayoutGrid, CreditCard, Play, Pause, MousePointerClick,
} from "lucide-react";
import { PersonalizationPreviewPanel, type CTAConfig } from "./PersonalizationPreviewPanel";
import { SEGMENT_TEMPLATES } from "@/lib/segmentData";
import { DEMO_PRODUCTS } from "@/lib/samplePersonaGenerator";
import type { SegmentTemplate } from "@/types/segment";

type CategoryFilter = 'all' | 'life_event' | 'lifestyle' | 'cross_sell' | 'seasonal';

const CATEGORY_CONFIG: Record<CategoryFilter, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: 'All Flows', icon: LayoutGrid },
  life_event: { label: 'Life Events', icon: Sparkles },
  lifestyle: { label: 'Lifestyle', icon: Users },
  cross_sell: { label: 'Cross-Sell', icon: ArrowUpRight },
  seasonal: { label: 'Seasonal', icon: Calendar },
};

export function AutomatedFlowsSection() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);
  const [activeFlows, setActiveFlows] = useState<Set<string>>(
    () => new Set(['travel-enthusiasts-segment', 'cashback-high-travel-segment', 'new-parent-segment'])
  );
  const [flowCTAs, setFlowCTAs] = useState<Record<string, CTAConfig>>({});

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === 'all') return SEGMENT_TEMPLATES;
    return SEGMENT_TEMPLATES.filter(t => t.category === categoryFilter);
  }, [categoryFilter]);

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return SEGMENT_TEMPLATES.length;
    return SEGMENT_TEMPLATES.filter(t => t.category === category).length;
  };

  const toggleFlowActive = (id: string) => {
    setActiveFlows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getProductForTemplate = (template: SegmentTemplate) => {
    return DEMO_PRODUCTS.find(p => p.id === template.recommendedProductId) || null;
  };

  const DEFAULT_FLOW_CTAS: Record<string, CTAConfig> = {
    'new-parent-segment': { text: 'Start Saving Today', link: '/savings', style: 'primary' },
    'pre-retiree-segment': { text: 'Plan Your Retirement', link: '/wealth', style: 'primary' },
    'home-buyers-segment': { text: 'Get Pre-Approved', link: '/mortgage', style: 'primary' },
    'back-to-school-parents-segment': { text: 'Open 529 Plan', link: '/education', style: 'primary' },
    'travel-enthusiasts-segment': { text: 'Explore Travel Cards', link: '/travel', style: 'primary' },
    'fitness-wellness-segment': { text: 'Earn Wellness Rewards', link: '/rewards', style: 'soft' },
    'foodies-segment': { text: 'Unlock Dining Perks', link: '/dining', style: 'soft' },
    'pet-parents-segment': { text: 'Save on Pet Care', link: '/cashback', style: 'outline' },
    'cashback-high-travel-segment': { text: 'Upgrade Your Card', link: '/travel-card', style: 'primary' },
    'holiday-travelers-segment': { text: 'Book with Points', link: '/travel', style: 'primary' },
    'tax-season-financial-segment': { text: 'Maximize Deductions', link: '/planning', style: 'outline' },
  };

  const getFlowCTA = (templateId: string): CTAConfig => {
    return flowCTAs[templateId] || DEFAULT_FLOW_CTAS[templateId] || { text: 'Learn More', link: '#', style: 'primary' as const };
  };

  const updateFlowCTA = (templateId: string, update: Partial<CTAConfig>) => {
    setFlowCTAs(prev => ({
      ...prev,
      [templateId]: { ...getFlowCTA(templateId), ...update },
    }));
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
              {SEGMENT_TEMPLATES.length} flows
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
            const product = getProductForTemplate(template);

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

                  {/* Product badge */}
                  {product && (
                    <Badge variant="outline" className="text-xs gap-1 shrink-0 bg-background">
                      <CreditCard className="w-3 h-3" />
                      {product.name}
                    </Badge>
                  )}

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
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        Audience Matched
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline" className="gap-1 text-xs">
                        <CreditCard className="w-3 h-3" />
                        {product?.name || 'Product'}
                      </Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge className="gap-1 text-xs bg-primary text-primary-foreground">
                        Personalized Message
                      </Badge>
                    </div>

                    {/* Personalization Preview — life event flows use per-persona products */}
                    <PersonalizationPreviewPanel
                      selectedProduct={template.category === 'life_event' ? null : product}
                      selectedPillars={getPillarsForTemplate(template)}
                      selectedLifeEvents={getLifeEventsForTemplate(template)}
                      hasSelections={true}
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
