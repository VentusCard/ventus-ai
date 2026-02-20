import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { 
  AGE_RANGES, 
  REGIONS, 
  INCOME_BANDS, 
  ACCOUNT_TENURE_OPTIONS,
  type DemographicFilters as DemographicFiltersType,
  type AccountTenure
} from "@/types/segment";

interface DemographicFiltersProps {
  filters: DemographicFiltersType;
  onChange: (filters: DemographicFiltersType) => void;
}

export function DemographicFilters({ filters, onChange }: DemographicFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAgeRange = (age: string) => {
    const newAges = filters.ageRanges.includes(age)
      ? filters.ageRanges.filter(a => a !== age)
      : [...filters.ageRanges, age];
    onChange({ ...filters, ageRanges: newAges });
  };

  const toggleRegion = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter(r => r !== region)
      : [...filters.regions, region];
    onChange({ ...filters, regions: newRegions });
  };

  const toggleIncomeBand = (income: string) => {
    const newIncome = filters.incomeBands.includes(income)
      ? filters.incomeBands.filter(i => i !== income)
      : [...filters.incomeBands, income];
    onChange({ ...filters, incomeBands: newIncome });
  };

  const updateTenure = (value: string) => {
    onChange({ ...filters, accountTenure: value as AccountTenure });
  };

  const hasActiveFilters = 
    filters.ageRanges.length > 0 || 
    filters.regions.length > 0 || 
    filters.incomeBands.length > 0 || 
    filters.accountTenure !== 'all';

  const activeFilterCount = 
    filters.ageRanges.length + 
    filters.regions.length + 
    filters.incomeBands.length + 
    (filters.accountTenure !== 'all' ? 1 : 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-slate-200 rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Refine Audience (Optional)</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4 space-y-5">
        {/* Age Ranges */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">Age Ranges</Label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((age) => {
              const isSelected = filters.ageRanges.includes(age);
              return (
                <div
                  key={age}
                  onClick={() => toggleAgeRange(age)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-all text-sm
                    ${isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => toggleAgeRange(age)}
                    className="pointer-events-none h-3.5 w-3.5"
                  />
                  <span>{age}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regions */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">Regions</Label>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => {
              const isSelected = filters.regions.includes(region);
              return (
                <div
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-all text-sm
                    ${isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => toggleRegion(region)}
                    className="pointer-events-none h-3.5 w-3.5"
                  />
                  <span>{region}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income & Tenure Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income Bands */}
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Income Bands</Label>
            <div className="flex flex-wrap gap-2">
              {INCOME_BANDS.map((income) => {
                const isSelected = filters.incomeBands.includes(income.value);
                return (
                  <div
                    key={income.value}
                    onClick={() => toggleIncomeBand(income.value)}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer transition-all text-xs
                      ${isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }
                    `}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => toggleIncomeBand(income.value)}
                      className="pointer-events-none h-3 w-3"
                    />
                    <span>{income.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Tenure */}
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Account Tenure</Label>
            <Select value={filters.accountTenure} onValueChange={updateTenure}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TENURE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">
              <strong>Active filters:</strong>{' '}
              {filters.ageRanges.length > 0 && `Ages: ${filters.ageRanges.join(', ')}. `}
              {filters.regions.length > 0 && `Regions: ${filters.regions.join(', ')}. `}
              {filters.incomeBands.length > 0 && `Income: ${filters.incomeBands.map(i => INCOME_BANDS.find(b => b.value === i)?.label).join(', ')}. `}
              {filters.accountTenure !== 'all' && `Tenure: ${ACCOUNT_TENURE_OPTIONS.find(o => o.value === filters.accountTenure)?.label}.`}
            </p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
