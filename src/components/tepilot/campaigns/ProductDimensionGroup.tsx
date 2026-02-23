import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import { PRODUCT_CATALOG, PRODUCT_CATEGORY_LABELS, getProductsByCategory } from "@/lib/campaignStudioData";
import type { ProductCategory, ProductMode } from "@/types/campaign-studio";

interface ProductDimensionGroupProps {
  selectedProducts: Record<string, ProductMode>;
  onToggle: (productName: string, mode: ProductMode) => void;
  onRemove: (productName: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  'credit_cards', 'deposit_accounts', 'loans', 'investments', 'insurance', 'digital_services'
];

export function ProductDimensionGroup({ selectedProducts, onToggle, onRemove }: ProductDimensionGroupProps) {
  const [open, setOpen] = useState(false);
  const totalSelected = Object.keys(selectedProducts).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Banking Products</span>
          <span className="text-xs text-muted-foreground">({PRODUCT_CATALOG.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {totalSelected > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2">
              {totalSelected}
            </Badge>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-3">
          {CATEGORIES.map(cat => {
            const products = getProductsByCategory(cat);
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  {PRODUCT_CATEGORY_LABELS[cat]} ({products.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {products.map(product => {
                    const mode = selectedProducts[product.name];
                    return (
                      <ProductChip
                        key={product.name}
                        name={product.name}
                        mode={mode}
                        onToggle={(m) => onToggle(product.name, m)}
                        onRemove={() => onRemove(product.name)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProductChip({
  name,
  mode,
  onToggle,
  onRemove,
}: {
  name: string;
  mode?: ProductMode;
  onToggle: (mode: ProductMode) => void;
  onRemove: () => void;
}) {
  const handleClick = () => {
    if (!mode) {
      onToggle('has');
    } else if (mode === 'has') {
      onToggle('lacks');
    } else {
      onRemove();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border transition-all cursor-pointer
        ${mode === 'has'
          ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400'
          : mode === 'lacks'
            ? 'bg-destructive/15 border-destructive/60 text-destructive'
            : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
        }
      `}
      title={mode === 'has' ? 'Must Have — click to switch to Must NOT Have' : mode === 'lacks' ? 'Must NOT Have — click to deselect' : 'Click to set Must Have'}
    >
      {mode && (
        <span className={`text-[10px] font-bold ${mode === 'has' ? 'text-emerald-400' : 'text-destructive'}`}>
          {mode === 'has' ? '✓' : '✕'}
        </span>
      )}
      {name}
    </button>
  );
}
