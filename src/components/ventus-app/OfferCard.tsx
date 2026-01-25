import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VentusOffer, trackingApi } from '@/lib/ventusApi';

interface OfferCardProps {
  offer: VentusOffer;
  className?: string;
  showSubcategory?: boolean;
  showDealCategory?: boolean;
}

export function OfferCard({ offer, className, showSubcategory = true, showDealCategory = true }: OfferCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDeal = async () => {
    try {
      await trackingApi.trackClick(offer.id);
    } catch {
      // Silent fail
    }
    window.open(offer.url, '_blank');
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl overflow-hidden",
      className
    )}>
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Offer Title */}
        <h3 className={cn(
          "font-semibold text-[15px] text-foreground leading-tight",
          !isExpanded && "line-clamp-2"
        )}>
          {offer.title}
        </h3>
        
        {/* Tags Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-[13px]">
            {/* Subcategory - only show if not filtered */}
            {showSubcategory && offer.subcategory && (
              <>
                <span className="text-muted-foreground">{offer.subcategory}</span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            
            {/* Deal Category - only show if not filtered */}
            {showDealCategory && offer.deal_category && (
              <>
                <span className="text-muted-foreground">{offer.deal_category}</span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            
            {/* Redemption Type - Purple with globe icon */}
            {offer.redemption_type && (
              <span className="flex items-center gap-1 text-purple-500">
                <Globe className="w-3.5 h-3.5" />
                {offer.redemption_type.charAt(0).toUpperCase() + offer.redemption_type.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Description */}
          {offer.description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {offer.description}
            </p>
          )}

          {/* View Deal Button */}
          <Button
            onClick={handleViewDeal}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 h-auto"
          >
            View Deal
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
