import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Baby, 
  Plane, 
  Home, 
  Dumbbell, 
  UtensilsCrossed, 
  PawPrint,
  ArrowUpRight,
  Building2,
  Crown,
  Snowflake,
  GraduationCap,
  Calculator,
  TrendingUp,
  DollarSign
} from "lucide-react";
import type { CampaignTemplate } from "@/types/campaign";

interface CampaignTemplateCardProps {
  template: CampaignTemplate;
  onSelect: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  Plane,
  Home,
  Dumbbell,
  UtensilsCrossed,
  PawPrint,
  ArrowUpRight,
  Building2,
  Crown,
  Snowflake,
  GraduationCap,
  Calculator,
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  life_event: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  lifestyle: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  cross_sell: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  seasonal: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

export function CampaignTemplateCard({ template, onSelect }: CampaignTemplateCardProps) {
  const Icon = ICON_MAP[template.iconHint] || TrendingUp;
  const categoryStyle = CATEGORY_STYLES[template.category] || CATEGORY_STYLES.lifestyle;
  const priorityStyle = PRIORITY_STYLES[template.priority];

  const formatImpact = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  return (
    <Card 
      className="bg-white border-slate-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2.5 rounded-lg ${categoryStyle.bg}`}>
            <Icon className={`w-5 h-5 ${categoryStyle.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors">
              {template.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`text-xs ${categoryStyle.badge}`}>
                {template.category.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={`text-xs ${priorityStyle}`}>
                {template.priority}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-slate-700">
                {formatImpact(template.estimatedImpact)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-slate-700">
                {template.conversionRate}%
              </span>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Use Template
          </Button>
        </div>

        {/* Seasonal Window */}
        {template.seasonalWindow && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-amber-600 font-medium">
              📅 {template.seasonalWindow}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
