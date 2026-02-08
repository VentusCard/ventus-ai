import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LIFESTYLE_PILLARS, PILLAR_COLORS } from "@/lib/sampleData";
import type { LifestyleCriteria } from "@/types/campaign";

interface LifestyleTargetingProps {
  criteria: LifestyleCriteria;
  onChange: (criteria: LifestyleCriteria) => void;
}

const THRESHOLD_OPTIONS = [
  { value: 'top_10', label: 'Top 10%', description: 'Highest spenders' },
  { value: 'top_20', label: 'Top 20%', description: 'High spenders' },
  { value: 'top_30', label: 'Top 30%', description: 'Above average' },
  { value: 'above_average', label: 'Above Average', description: '50th percentile+' },
];

export function LifestyleTargeting({ criteria, onChange }: LifestyleTargetingProps) {
  const togglePillar = (pillar: string) => {
    const newPillars = criteria.pillars.includes(pillar)
      ? criteria.pillars.filter(p => p !== pillar)
      : [...criteria.pillars, pillar];
    onChange({ ...criteria, pillars: newPillars });
  };

  const updateThreshold = (value: string) => {
    onChange({ ...criteria, spendingThreshold: value as LifestyleCriteria['spendingThreshold'] });
  };

  return (
    <div className="space-y-6">
      {/* Threshold Selection */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Spending Threshold
        </Label>
        <Select value={criteria.spendingThreshold} onValueChange={updateThreshold}>
          <SelectTrigger className="w-full md:w-72">
            <SelectValue placeholder="Select threshold" />
          </SelectTrigger>
          <SelectContent>
            {THRESHOLD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-500 text-sm">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pillar Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium text-slate-700">
            Select Lifestyle Pillars
          </Label>
          {criteria.pillars.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {criteria.pillars.length} selected
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {LIFESTYLE_PILLARS.map((pillar) => {
            const isSelected = criteria.pillars.includes(pillar);
            const color = PILLAR_COLORS[pillar] || '#64748b';
            
            return (
              <div
                key={pillar}
                onClick={() => togglePillar(pillar)}
                className={`
                  flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <Checkbox 
                  checked={isSelected} 
                  onCheckedChange={() => togglePillar(pillar)}
                  className="pointer-events-none"
                />
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className={`truncate ${isSelected ? 'text-primary font-medium' : 'text-slate-700'}`}>
                  {pillar.replace(' & ', ' / ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combination Info */}
      {criteria.pillars.length > 1 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Selecting multiple pillars creates an intersection — customers must be in the 
            {' '}{THRESHOLD_OPTIONS.find(t => t.value === criteria.spendingThreshold)?.label.toLowerCase()} 
            {' '}for <strong>all</strong> selected pillars. This significantly reduces audience size.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Tip:</strong> Lifestyle pillars are derived from the 12-category spending analysis.
          Combine pillars to create behavioral cohorts like "Travel + Dining enthusiasts" or 
          "Fitness + Wellness devotees".
        </p>
      </div>
    </div>
  );
}
