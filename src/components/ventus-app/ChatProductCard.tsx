import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VentusProduct, trackClickApi } from '@/lib/ventusApi';

const LOGO_DEV_TOKEN = 'pk_JIfjg8dCRT-5dWEXFy01YQ';

interface ChatProductCardProps {
  product: VentusProduct;
}

export const ChatProductCard = ({ product }: ChatProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Use merchant_name or merchant, fallback to "Merchant"
  const merchantName = product.merchant_name || product.merchant || 'Merchant';
  // Use merchant_domain or domain
  const merchantDomain = product.merchant_domain || product.domain;
  const logoUrl = merchantDomain ? `https://img.logo.dev/${merchantDomain}?token=${LOGO_DEV_TOKEN}` : null;
  const hasDiscount = product.original_price && product.original_price > product.price;

  const handleViewDeal = async () => {
    // Track click
    try {
      await trackClickApi.trackProductClick(product.url, product.name);
    } catch (e) {
      console.error('Failed to track click:', e);
    }
    window.open(product.url, '_blank');
  };

  // Get merchant initial for fallback
  const merchantInitial = merchantName.charAt(0).toUpperCase();

  return (
    <Card className="bg-[#0064E0]/10 border border-[#0064E0]/20 rounded-xl overflow-hidden">
      <CardContent className="p-4">
        {/* Header: Logo + Price */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Merchant Logo */}
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt={merchantName}
                className="w-12 h-12 rounded-lg object-contain bg-white p-1.5 flex-shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `hsl(${merchantName.length * 30 % 360}, 60%, 90%)` }}
              >
                <span 
                  className="text-lg font-bold"
                  style={{ color: `hsl(${merchantName.length * 30 % 360}, 60%, 40%)` }}
                >
                  {merchantInitial}
                </span>
              </div>
            )}

            {/* Product Name */}
            <h3 className={`text-base font-semibold text-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
              {product.name}
            </h3>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-[#0064E0]">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="text-xs text-muted-foreground line-through">
                ${product.original_price?.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Merchant name + Expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mt-3 pt-3 border-t border-[#0064E0]/20 text-muted-foreground"
        >
          <span className="text-sm">{merchantName}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {product.description && (
              <div className="bg-background/50 rounded-md p-2">
                <p className="text-xs text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}
            
            <div className="flex items-start gap-1.5 text-[10px] text-[#0064E0] bg-[#0064E0]/20 rounded-md p-2">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Link may take you to product category - search by name on site</span>
            </div>

            <Button 
              onClick={handleViewDeal}
              size="sm"
              className="w-full h-8 text-xs bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
            >
              View Deal <ExternalLink className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
