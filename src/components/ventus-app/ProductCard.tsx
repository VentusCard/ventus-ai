import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMerchantLogoUrl, VentusProduct } from '@/lib/ventusApi';

interface ProductCardProps {
  product: VentusProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logoUrl = getMerchantLogoUrl(product.domain);
  const hasDiscount = product.original_price && product.original_price > product.price;

  const handleViewDeal = () => {
    window.open(product.url, '_blank');
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={product.merchant} 
              className="w-14 h-14 rounded-lg object-contain bg-white p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">
                {product.merchant?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-2xl font-bold text-[#0064E0]">
                  ${product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ${product.original_price?.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-foreground mt-2 line-clamp-2">
              {product.name}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mt-3 pt-3 border-t border-border text-muted-foreground"
        >
          <span className="text-sm">{product.merchant || 'Unknown'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {product.description && (
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
            <Button 
              onClick={handleViewDeal}
              className="w-full bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
            >
              View Deal <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
