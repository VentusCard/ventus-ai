import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { 
  AGE_RANGES, 
  REGIONS, 
  INCOME_BANDS, 
  ACCOUNT_TENURE_OPTIONS,
  type DemographicFilters as DemographicFiltersType,
  type AccountTenure
} from "@/types/segment";

interface ApplicableDemographics {
  ageRanges?: string[];
  regions?: string[];
  incomeBands?: string[];
  accountTenure?: string[];
}

interface DemographicFiltersProps {
  filters: DemographicFiltersType;
  onChange: (filters: DemographicFiltersType) => void;
  applicable?: ApplicableDemographics;
}

export function DemographicFilters({ filters, onChange, applicable }: DemographicFiltersProps) {
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Refine Audience (Optional)</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2">
              {activeFilterCount}
            </Badge>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-3">
          {/* Age Ranges */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Age Ranges</p>
            <div className="flex flex-wrap gap-1.5">
              {AGE_RANGES.map((age) => {
                const isSelected = filters.ageRanges.includes(age);
                return (
                  <button
                    key={age}
                    onClick={() => toggleAgeRange(age)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-muted-foreground/30'}`} />
                    {age}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Regions</p>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((region) => {
                const isSelected = filters.regions.includes(region);
                return (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-muted-foreground/30'}`} />
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Income & Tenure Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income Bands */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Income Bands</p>
              <div className="flex flex-wrap gap-1.5">
                {INCOME_BANDS.map((income) => {
                  const isSelected = filters.incomeBands.includes(income.value);
                  return (
                    <button
                      key={income.value}
                      onClick={() => toggleIncomeBand(income.value)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-muted-foreground/30'}`} />
                      {income.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Tenure */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Account Tenure</p>
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

        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
