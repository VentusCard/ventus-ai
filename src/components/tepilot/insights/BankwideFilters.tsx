import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { CARD_PRODUCTS, GEOGRAPHIC_REGIONS, AGE_RANGES } from "@/lib/mockBankwideData";
import type { BankwideFilters } from "@/types/bankwide";

interface BankwideFiltersProps {
  filters: BankwideFilters;
  onChange: (filters: BankwideFilters) => void;
}

export function BankwideFilters({ filters, onChange }: BankwideFiltersProps) {
  const toggleCardProduct = (productName: string) => {
    const newProducts = filters.cardProducts.includes(productName)
      ? filters.cardProducts.filter(p => p !== productName)
      : [...filters.cardProducts, productName];
    onChange({ ...filters, cardProducts: newProducts });
  };

  const toggleRegion = (regionName: string) => {
    const newRegions = filters.regions.includes(regionName)
      ? filters.regions.filter(r => r !== regionName)
      : [...filters.regions, regionName];
    onChange({ ...filters, regions: newRegions });
  };

  const toggleAgeRange = (range: string) => {
    const newRanges = filters.ageRanges.includes(range)
      ? filters.ageRanges.filter(a => a !== range)
      : [...filters.ageRanges, range];
    onChange({ ...filters, ageRanges: newRanges });
  };

  const resetFilters = () => {
    onChange({ cardProducts: [], regions: [], ageRanges: [] });
  };

  const hasActiveFilters = 
    filters.cardProducts.length > 0 || 
    filters.regions.length > 0 || 
    filters.ageRanges.length > 0;

  return (
    <Card className="p-6 space-y-4 bg-white border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-8 text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        )}
      </div>

      {/* Card Products */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 min-w-[120px]">
            Card Products:
          </span>
          <div className="flex flex-wrap gap-2">
            {CARD_PRODUCTS.map((product) => {
              const isActive = filters.cardProducts.includes(product.name);
              return (
                <button
                  key={product.name}
                  onClick={() => toggleCardProduct(product.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {product.name}
                  {isActive && (
                    <span className="ml-1.5 opacity-70">
                      ({(product.accountCount / 1_000_000).toFixed(0)}M)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geographic Regions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 min-w-[120px]">
            Regions:
          </span>
          <div className="flex flex-wrap gap-2">
            {GEOGRAPHIC_REGIONS.map((region) => {
              const isActive = filters.regions.includes(region.name);
              return (
                <button
                  key={region.name}
                  onClick={() => toggleRegion(region.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {region.name}
                  {isActive && (
                    <span className="ml-1.5 opacity-70">
                      ({(region.userCount / 1_000_000).toFixed(0)}M)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Age Ranges */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 min-w-[120px]">
            Age Ranges:
          </span>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((ageRange) => {
              const isActive = filters.ageRanges.includes(ageRange.range);
              return (
                <button
                  key={ageRange.range}
                  onClick={() => toggleAgeRange(ageRange.range)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {ageRange.range}
                  <span className={`ml-1.5 text-xs ${isActive ? 'opacity-70' : ''}`}>
                    {ageRange.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Active:</span>
            <div className="flex flex-wrap gap-1">
              {filters.cardProducts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                  {filters.cardProducts.length} Card{filters.cardProducts.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.regions.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                  {filters.regions.length} Region{filters.regions.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.ageRanges.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                  {filters.ageRanges.length} Age Range{filters.ageRanges.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
