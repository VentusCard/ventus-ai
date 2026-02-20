import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, X, Plus, TrendingUp } from "lucide-react";
import { CARD_PRODUCTS } from "@/lib/mockBankwideData";
import type { ProductCriteria, SpendingLevel } from "@/types/segment";

interface ProductTargetingProps {
  criteria: ProductCriteria;
  onChange: (criteria: ProductCriteria) => void;
}

const SPENDING_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-green-100 text-green-700' },
] as const;

export function ProductTargeting({ criteria, onChange }: ProductTargetingProps) {
  const toggleHasProduct = (product: string) => {
    const newHas = criteria.hasProducts.includes(product)
      ? criteria.hasProducts.filter(p => p !== product)
      : [...criteria.hasProducts, product];
    
    // Remove from lacksProducts if adding to hasProducts
    const newLacks = criteria.lacksProducts.filter(p => p !== product);
    
    // Remove spending pattern if removing product
    const newPatterns = { ...criteria.spendingPatterns };
    if (!newHas.includes(product)) {
      delete newPatterns[product];
    }
    
    onChange({ ...criteria, hasProducts: newHas, lacksProducts: newLacks, spendingPatterns: newPatterns });
  };

  const toggleLacksProduct = (product: string) => {
    const newLacks = criteria.lacksProducts.includes(product)
      ? criteria.lacksProducts.filter(p => p !== product)
      : [...criteria.lacksProducts, product];
    
    // Remove from hasProducts if adding to lacksProducts
    const newHas = criteria.hasProducts.filter(p => p !== product);
    
    // Remove spending pattern if moving to lacks
    const newPatterns = { ...criteria.spendingPatterns };
    delete newPatterns[product];
    
    onChange({ ...criteria, hasProducts: newHas, lacksProducts: newLacks, spendingPatterns: newPatterns });
  };

  const updateSpendingPattern = (product: string, level: SpendingLevel) => {
    const newPatterns = { ...criteria.spendingPatterns, [product]: level };
    onChange({ ...criteria, spendingPatterns: newPatterns });
  };

  return (
    <div className="space-y-6">
      {/* Has Products */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-green-600" />
          <Label className="text-sm font-medium text-slate-700">
            Must Have Products
          </Label>
          {criteria.hasProducts.length > 0 && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              {criteria.hasProducts.length} selected
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CARD_PRODUCTS.map((product) => {
            const isSelected = criteria.hasProducts.includes(product.name);
            const isExcluded = criteria.lacksProducts.includes(product.name);
            const spendingLevel = criteria.spendingPatterns?.[product.name];
            
            return (
              <div
                key={product.name}
                className={`
                  rounded-lg border transition-all
                  ${isExcluded ? 'opacity-40' : ''}
                  ${isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <div
                  onClick={() => !isExcluded && toggleHasProduct(product.name)}
                  className={`flex items-center gap-2 p-3 cursor-pointer ${isExcluded ? 'cursor-not-allowed' : ''}`}
                >
                  <Checkbox 
                    checked={isSelected} 
                    disabled={isExcluded}
                    onCheckedChange={() => !isExcluded && toggleHasProduct(product.name)}
                    className="pointer-events-none"
                  />
                  <CreditCard className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-green-700' : 'text-slate-700'}`}>
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(product.uniqueUsers / 1_000_000).toFixed(1)}M users
                    </p>
                  </div>
                </div>
                
                {/* Spending Pattern Selector - only show when product is selected */}
                {isSelected && (
                  <div className="px-3 pb-3 pt-1 border-t border-green-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">Usage level:</span>
                      <Select 
                        value={spendingLevel || ''} 
                        onValueChange={(v) => updateSpendingPattern(product.name, v as SpendingLevel)}
                      >
                        <SelectTrigger className="h-7 text-xs w-24">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lacks Products */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <X className="w-4 h-4 text-red-600" />
          <Label className="text-sm font-medium text-slate-700">
            Must NOT Have Products (Cross-sell targets)
          </Label>
          {criteria.lacksProducts.length > 0 && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              {criteria.lacksProducts.length} excluded
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CARD_PRODUCTS.map((product) => {
            const isExcluded = criteria.lacksProducts.includes(product.name);
            const isRequired = criteria.hasProducts.includes(product.name);
            
            return (
              <div
                key={product.name}
                onClick={() => !isRequired && toggleLacksProduct(product.name)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                  ${isRequired ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isExcluded 
                    ? 'border-red-400 bg-red-50' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <Checkbox 
                  checked={isExcluded} 
                  disabled={isRequired}
                  onCheckedChange={() => !isRequired && toggleLacksProduct(product.name)}
                  className="pointer-events-none"
                />
                <CreditCard className={`w-4 h-4 ${isExcluded ? 'text-red-500' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isExcluded ? 'text-red-700' : 'text-slate-700'}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(100 - product.penetrationRate).toFixed(0)}% don't have
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Patterns Summary */}
      {criteria.spendingPatterns && Object.keys(criteria.spendingPatterns).length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Usage Filters:</strong>{' '}
            {Object.entries(criteria.spendingPatterns).map(([product, level]) => (
              <span key={product} className="inline-flex items-center gap-1 mr-2">
                {product}: <Badge variant="secondary" className={SPENDING_LEVELS.find(l => l.value === level)?.color}>{level}</Badge>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Cross-sell Example */}
      {criteria.hasProducts.length > 0 && criteria.lacksProducts.length > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Cross-sell Target:</strong> Customers who have {criteria.hasProducts.join(', ')} 
            {' '}but don't have {criteria.lacksProducts.join(', ')}.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Tip:</strong> Product targeting is ideal for cross-sell and upgrade campaigns.
          Select products customers currently have, then exclude products you want to offer them.
          Add usage level filters to target high-value users.
        </p>
      </div>
    </div>
  );
}
