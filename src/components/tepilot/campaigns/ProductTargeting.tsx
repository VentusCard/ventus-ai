import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, X, Plus } from "lucide-react";
import { CARD_PRODUCTS } from "@/lib/mockBankwideData";
import type { ProductCriteria } from "@/types/campaign";

interface ProductTargetingProps {
  criteria: ProductCriteria;
  onChange: (criteria: ProductCriteria) => void;
}

export function ProductTargeting({ criteria, onChange }: ProductTargetingProps) {
  const toggleHasProduct = (product: string) => {
    const newHas = criteria.hasProducts.includes(product)
      ? criteria.hasProducts.filter(p => p !== product)
      : [...criteria.hasProducts, product];
    
    // Remove from lacksProducts if adding to hasProducts
    const newLacks = criteria.lacksProducts.filter(p => p !== product);
    
    onChange({ ...criteria, hasProducts: newHas, lacksProducts: newLacks });
  };

  const toggleLacksProduct = (product: string) => {
    const newLacks = criteria.lacksProducts.includes(product)
      ? criteria.lacksProducts.filter(p => p !== product)
      : [...criteria.lacksProducts, product];
    
    // Remove from hasProducts if adding to lacksProducts
    const newHas = criteria.hasProducts.filter(p => p !== product);
    
    onChange({ ...criteria, hasProducts: newHas, lacksProducts: newLacks });
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CARD_PRODUCTS.map((product) => {
            const isSelected = criteria.hasProducts.includes(product.name);
            const isExcluded = criteria.lacksProducts.includes(product.name);
            
            return (
              <div
                key={product.name}
                onClick={() => !isExcluded && toggleHasProduct(product.name)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                  ${isExcluded ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
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
        </p>
      </div>
    </div>
  );
}
