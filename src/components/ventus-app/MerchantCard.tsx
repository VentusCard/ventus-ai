import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OfferCard } from '@/components/ventus-app/OfferCard';
import { VentusOffer, getMerchantLogoUrl } from '@/lib/ventusApi';
import { cn } from '@/lib/utils';

interface MerchantCardProps {
  merchantName: string;
  domain: string;
  offers: VentusOffer[];
  isExpanded: boolean;
  onToggle: () => void;
  showSubcategory?: boolean;
  showDealCategory?: boolean;
}

export function MerchantCard({ merchantName, domain, offers, isExpanded, onToggle, showSubcategory = true, showDealCategory = true }: MerchantCardProps) {
  const [logoError, setLogoError] = useState(false);

  // Get merchant initial for fallback
  const getMerchantInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';

  // Generate a consistent color based on merchant name
  const getInitialColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Merchant Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            {/* Logo */}
            {!logoError ? (
              <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src={getMerchantLogoUrl(domain)} 
                  alt={merchantName}
                  className="w-10 h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
                getInitialColor(merchantName)
              )}>
                {getMerchantInitial(merchantName)}
              </div>
            )}

            {/* Merchant Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                {merchantName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {offers.length} deal{offers.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Chevron */}
            <div className="flex-shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Offers List */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {offers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                showSubcategory={showSubcategory}
                showDealCategory={showDealCategory}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
