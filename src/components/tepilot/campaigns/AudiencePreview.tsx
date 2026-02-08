import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar } from "lucide-react";
import { LIFE_EVENTS, type LifeEventCriteria, type LifestyleCriteria, type ProductCriteria, type TargetingMode } from "@/types/campaign";

interface AudiencePreviewProps {
  targetingMode: TargetingMode;
  estimatedSize: number;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
}

export function AudiencePreview({
  targetingMode,
  estimatedSize,
  lifeEventCriteria,
  lifestyleCriteria,
  productCriteria,
}: AudiencePreviewProps) {
  // Mock demographic breakdown based on segment type
  const getDemographicBreakdown = () => {
    if (targetingMode === 'life_event' && lifeEventCriteria?.eventTypes.includes('retirement')) {
      return { '55-64': 45, '45-54': 35, '65+': 15, 'Other': 5 };
    }
    if (targetingMode === 'life_event' && lifeEventCriteria?.eventTypes.includes('family')) {
      return { '25-34': 48, '35-44': 38, '18-24': 10, 'Other': 4 };
    }
    if (targetingMode === 'lifestyle') {
      return { '25-34': 32, '35-44': 28, '45-54': 22, '18-24': 12, 'Other': 6 };
    }
    return { '35-44': 28, '25-34': 26, '45-54': 24, '55-64': 14, 'Other': 8 };
  };

  const getRegionalBreakdown = () => {
    return [
      { region: 'West', pct: 26 },
      { region: 'Southeast', pct: 24 },
      { region: 'Midwest', pct: 20 },
      { region: 'Northeast', pct: 18 },
      { region: 'Southwest', pct: 12 },
    ];
  };

  const demographics = getDemographicBreakdown();
  const regions = getRegionalBreakdown();

  const getCriteriaDescription = () => {
    if (targetingMode === 'life_event' && lifeEventCriteria) {
      const eventNames = lifeEventCriteria.eventTypes.map(
        id => LIFE_EVENTS.find(e => e.id === id)?.name || id
      );
      return `${eventNames.join(', ')} at ${(lifeEventCriteria.minConfidence * 100).toFixed(0)}%+ confidence`;
    }
    if (targetingMode === 'lifestyle' && lifestyleCriteria) {
      const thresholdLabel = lifestyleCriteria.spendingThreshold.replace('_', ' ');
      return `${thresholdLabel} in ${lifestyleCriteria.pillars.join(', ')}`;
    }
    if (targetingMode === 'product' && productCriteria) {
      const parts = [];
      if (productCriteria.hasProducts.length > 0) {
        parts.push(`Has: ${productCriteria.hasProducts.join(', ')}`);
      }
      if (productCriteria.lacksProducts.length > 0) {
        parts.push(`Lacks: ${productCriteria.lacksProducts.join(', ')}`);
      }
      return parts.join(' • ');
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Audience Preview
        </h4>
        <Badge className="bg-primary text-white">
          {(estimatedSize / 1_000_000).toFixed(2)}M estimated users
        </Badge>
      </div>

      {/* Criteria Summary */}
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Targeting:</strong> {getCriteriaDescription()}
        </p>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Age Breakdown */}
        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">Age Distribution</span>
          </div>
          <div className="space-y-2">
            {Object.entries(demographics).map(([age, pct]) => (
              <div key={age} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-14">{age}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">Regional Distribution</span>
          </div>
          <div className="space-y-2">
            {regions.map(({ region, pct }) => (
              <div key={region} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-20">{region}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400/60 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
