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
    <Card className="px-4 py-3 bg-white border-slate-200">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Title + Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-6 px-2 text-xs text-slate-700 hover:bg-slate-100"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 shrink-0" />

        {/* Card Products */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Cards:</span>
          {CARD_PRODUCTS.map((product) => {
            const isActive = filters.cardProducts.includes(product.name);
            return (
              <button
                key={product.name}
                onClick={() => toggleCardProduct(product.name)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {product.name}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-slate-200 shrink-0" />

        {/* Regions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Regions:</span>
          {GEOGRAPHIC_REGIONS.map((region) => {
            const isActive = filters.regions.includes(region.name);
            return (
              <button
                key={region.name}
                onClick={() => toggleRegion(region.name)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-slate-200 shrink-0" />

        {/* Age Ranges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Age:</span>
          {AGE_RANGES.map((ageRange) => {
            const isActive = filters.ageRanges.includes(ageRange.range);
            return (
              <button
                key={ageRange.range}
                onClick={() => toggleAgeRange(ageRange.range)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ageRange.range}
                <span className={`ml-1 text-[10px] ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                  {ageRange.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active summary badges */}
        {hasActiveFilters && (
          <>
            <div className="h-5 w-px bg-slate-200 shrink-0" />
            <div className="flex items-center gap-1">
              {filters.cardProducts.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-700 border-slate-200">
                  {filters.cardProducts.length} Card{filters.cardProducts.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.regions.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-700 border-slate-200">
                  {filters.regions.length} Region{filters.regions.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.ageRanges.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-700 border-slate-200">
                  {filters.ageRanges.length} Age{filters.ageRanges.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
