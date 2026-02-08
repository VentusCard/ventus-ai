import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Users, 
  ArrowUpRight, 
  Calendar,
  LayoutGrid 
} from "lucide-react";
import { SegmentTemplateCard } from "./SegmentTemplateCard";
import { SEGMENT_TEMPLATES } from "@/lib/segmentData";
import type { SegmentTemplate } from "@/types/segment";

interface SegmentTemplateGridProps {
  onSelectTemplate: (template: SegmentTemplate) => void;
}

type CategoryFilter = 'all' | 'life_event' | 'lifestyle' | 'cross_sell' | 'seasonal';

const CATEGORY_CONFIG: Record<CategoryFilter, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: 'All Templates', icon: LayoutGrid },
  life_event: { label: 'Life Events', icon: Sparkles },
  lifestyle: { label: 'Lifestyle', icon: Users },
  cross_sell: { label: 'Cross-Sell', icon: ArrowUpRight },
  seasonal: { label: 'Seasonal', icon: Calendar },
};

export function SegmentTemplateGrid({ onSelectTemplate }: SegmentTemplateGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filteredTemplates = categoryFilter === 'all' 
    ? SEGMENT_TEMPLATES 
    : SEGMENT_TEMPLATES.filter(t => t.category === categoryFilter);

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return SEGMENT_TEMPLATES.length;
    return SEGMENT_TEMPLATES.filter(t => t.category === category).length;
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Segment Templates</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {SEGMENT_TEMPLATES.length} templates
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Start from pre-built targeting strategies to quickly build segments
        </p>
      </CardHeader>
      <CardContent>
        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-transparent p-0">
            {(Object.keys(CATEGORY_CONFIG) as CategoryFilter[]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const count = getCategoryCount(category);
              
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white px-3 py-1.5 rounded-full border border-slate-200 data-[state=active]:border-primary"
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {config.label}
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 h-5 px-1.5 text-xs bg-slate-100 data-[state=active]:bg-white/20"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={categoryFilter} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <SegmentTemplateCard 
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No templates in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
