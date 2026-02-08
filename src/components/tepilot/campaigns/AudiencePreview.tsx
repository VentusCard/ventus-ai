import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { 
  LIFE_EVENTS, 
  AGE_RANGES, 
  REGIONS as REGION_LIST,
  INCOME_BANDS,
  ACCOUNT_TENURE_OPTIONS,
  type LifeEventCriteria, 
  type LifestyleCriteria, 
  type ProductCriteria, 
  type TargetingMode,
  type DemographicFilters 
} from "@/types/segment";

interface AudiencePreviewProps {
  targetingMode: TargetingMode;
  estimatedSize: number;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
  demographicFilters?: DemographicFilters;
}

// Population distribution rates
const AGE_RANGE_RATES: Record<string, number> = {
  '18-24': 0.12, '25-34': 0.18, '35-44': 0.17,
  '45-54': 0.17, '55-64': 0.16, '65+': 0.20
};

const REGION_RATES: Record<string, number> = {
  'Northeast': 0.17, 'Southeast': 0.24, 'Midwest': 0.21,
  'Southwest': 0.12, 'West': 0.18, 'Northwest': 0.08
};

export function AudiencePreview({
  targetingMode,
  estimatedSize,
  lifeEventCriteria,
  lifestyleCriteria,
  productCriteria,
  demographicFilters,
}: AudiencePreviewProps) {
  // Calculate dynamic age distribution based on filters
  const getAgeBreakdown = () => {
    const selectedAges = demographicFilters?.ageRanges?.length 
      ? demographicFilters.ageRanges 
      : [...AGE_RANGES];
    
    // Apply life event skew if applicable
    let baseWeights = { ...AGE_RANGE_RATES };
    if (targetingMode === 'life_event' && lifeEventCriteria?.eventTypes.includes('retirement')) {
      baseWeights = { '18-24': 0.02, '25-34': 0.05, '35-44': 0.10, '45-54': 0.25, '55-64': 0.38, '65+': 0.20 };
    } else if (targetingMode === 'life_event' && lifeEventCriteria?.eventTypes.includes('family')) {
      baseWeights = { '18-24': 0.15, '25-34': 0.40, '35-44': 0.30, '45-54': 0.10, '55-64': 0.03, '65+': 0.02 };
    }
    
    // Filter to selected ages and normalize
    const filteredWeights = selectedAges.reduce((acc, age) => {
      acc[age] = baseWeights[age] || 0.15;
      return acc;
    }, {} as Record<string, number>);
    
    const total = Object.values(filteredWeights).reduce((sum, v) => sum + v, 0);
    return Object.entries(filteredWeights).map(([age, weight]) => ({
      label: age,
      pct: Math.round((weight / total) * 100)
    }));
  };

  // Calculate dynamic regional distribution based on filters
  const getRegionalBreakdown = () => {
    const selectedRegions = demographicFilters?.regions?.length 
      ? demographicFilters.regions 
      : [...REGION_LIST];
    
    const filteredWeights = selectedRegions.reduce((acc, region) => {
      acc[region] = REGION_RATES[region] || 0.15;
      return acc;
    }, {} as Record<string, number>);
    
    const total = Object.values(filteredWeights).reduce((sum, v) => sum + v, 0);
    return Object.entries(filteredWeights).map(([region, weight]) => ({
      region,
      pct: Math.round((weight / total) * 100)
    }));
  };

  const ageBreakdown = getAgeBreakdown();
  const regions = getRegionalBreakdown();

  const getCriteriaDescription = () => {
    const parts: string[] = [];
    
    if (targetingMode === 'life_event' && lifeEventCriteria) {
      const eventNames = lifeEventCriteria.eventTypes.map(
        id => LIFE_EVENTS.find(e => e.id === id)?.name || id
      );
      parts.push(`${eventNames.join(', ')} at ${(lifeEventCriteria.minConfidence * 100).toFixed(0)}%+ confidence`);
      if (lifeEventCriteria.timingWindow) {
        parts.push(`within ${lifeEventCriteria.timingWindow.replace('_', ' ')}`);
      }
    }
    if (targetingMode === 'lifestyle' && lifestyleCriteria) {
      const thresholdLabel = lifestyleCriteria.spendingThreshold.replace('_', ' ');
      parts.push(`${thresholdLabel} in ${lifestyleCriteria.pillars.join(', ')}`);
      if (lifestyleCriteria.minMonthlySpend) {
        parts.push(`min $${lifestyleCriteria.minMonthlySpend}/mo`);
      }
    }
    if (targetingMode === 'product' && productCriteria) {
      if (productCriteria.hasProducts.length > 0) {
        parts.push(`Has: ${productCriteria.hasProducts.join(', ')}`);
      }
      if (productCriteria.lacksProducts.length > 0) {
        parts.push(`Lacks: ${productCriteria.lacksProducts.join(', ')}`);
      }
    }
    return parts.join(' • ');
  };

  // Check for active demographic filters
  const hasActiveFilters = demographicFilters && (
    demographicFilters.ageRanges.length > 0 ||
    demographicFilters.regions.length > 0 ||
    demographicFilters.incomeBands.length > 0 ||
    demographicFilters.accountTenure !== 'all'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Audience Preview
        </h4>
        <Badge className="bg-primary text-primary-foreground">
          {(estimatedSize / 1_000_000).toFixed(2)}M estimated users
        </Badge>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {demographicFilters.ageRanges.map(age => (
            <Badge key={age} variant="secondary" className="text-xs bg-slate-100">
              {age}
            </Badge>
          ))}
          {demographicFilters.regions.map(region => (
            <Badge key={region} variant="secondary" className="text-xs bg-slate-100">
              {region}
            </Badge>
          ))}
          {demographicFilters.incomeBands.map(income => (
            <Badge key={income} variant="secondary" className="text-xs bg-slate-100">
              {INCOME_BANDS.find(b => b.value === income)?.label}
            </Badge>
          ))}
          {demographicFilters.accountTenure !== 'all' && (
            <Badge variant="secondary" className="text-xs bg-slate-100">
              {ACCOUNT_TENURE_OPTIONS.find(o => o.value === demographicFilters.accountTenure)?.label}
            </Badge>
          )}
        </div>
      )}

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
            <span className="text-xs font-medium text-slate-700">
              Age Distribution {demographicFilters?.ageRanges?.length ? '(filtered)' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {ageBreakdown.map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-14">{label}</span>
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
            <span className="text-xs font-medium text-slate-700">
              Regional Distribution {demographicFilters?.regions?.length ? '(filtered)' : ''}
            </span>
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

      {/* Income & Tenure Summary */}
      {hasActiveFilters && (demographicFilters.incomeBands.length > 0 || demographicFilters.accountTenure !== 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demographicFilters.incomeBands.length > 0 && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">Income Filter</span>
              </div>
              <p className="text-xs text-slate-600">
                {demographicFilters.incomeBands.map(i => INCOME_BANDS.find(b => b.value === i)?.label).join(', ')}
              </p>
            </div>
          )}
          {demographicFilters.accountTenure !== 'all' && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">Account Tenure</span>
              </div>
              <p className="text-xs text-slate-600">
                {ACCOUNT_TENURE_OPTIONS.find(o => o.value === demographicFilters.accountTenure)?.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
