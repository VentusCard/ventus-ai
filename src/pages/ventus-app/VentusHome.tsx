import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useVentusAuth } from '@/contexts/VentusAuthContext';
import { VentusSidebar } from '@/components/ventus-app/VentusSidebar';
import { SubcategoryChip } from '@/components/ventus-app/SubcategoryChip';
import { DealCategoryChip } from '@/components/ventus-app/DealCategoryChip';
import { MerchantCard } from '@/components/ventus-app/MerchantCard';
import { offersApi, categoriesApi, profileApi, VentusOffer, VentusCategory } from '@/lib/ventusApi';
import { Card, CardContent } from '@/components/ui/card';
import { AppStoreBadges } from '@/components/ventus-app/AppStoreBadges';
import { getSubcategoryIcon } from '@/lib/categoryIcons';

interface GroupedMerchant {
  merchantName: string;
  domain: string;
  offers: VentusOffer[];
  isPartner: boolean;
}

const ROTATING_PLACEHOLDERS = [
  'Search "basketball shoes under $100"',
  'Search "golf clubs on sale"',
  'Search "running gear deals"',
  'Search "fitness equipment"',
];

export default function VentusHome() {
  const navigate = useNavigate();
  const { user, setUser } = useVentusAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<VentusOffer[]>([]);
  const [categories, setCategories] = useState<VentusCategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [selectedDealCategory, setSelectedDealCategory] = useState<string>('All');
  const [expandedMerchants, setExpandedMerchants] = useState<Set<string>>(new Set());
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Debug: log user object to see what's available
  console.log('VentusHome user:', user);

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersData, categoriesData] = await Promise.all([
        offersApi.getOffers(),
        categoriesApi.getCategories(),
      ]);
      setOffers(offersData.offers || []);
      setCategories(categoriesData.categories || categoriesData || []);
      
      // Fetch profile to get first_name
      if (user?.id) {
        try {
          const profile = await profileApi.getProfile(user.id);
          setUser({ ...user, ...profile });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Build subcategory list with offer counts
  const subcategoryOptions = useMemo(() => {
    const userSubcategories = user?.subcategories || [];
    const counts: Record<string, number> = { All: offers.length };
    
    // Count offers per subcategory
    const availableSubcategories = new Set<string>();
    offers.forEach((offer) => {
      if (offer.subcategory) {
        counts[offer.subcategory] = (counts[offer.subcategory] || 0) + 1;
        availableSubcategories.add(offer.subcategory);
      }
    });

    // Start with "All" option
    const options = [
      { name: 'All', emoji: getSubcategoryIcon('All'), count: counts.All },
    ];

    // Always add General first
    if (counts['General'] || availableSubcategories.has('General')) {
      options.push({
        name: 'General',
        emoji: getSubcategoryIcon('General'),
        count: counts['General'] || 0,
      });
    }

    // If user has subcategories, use those
    if (userSubcategories.length > 0) {
      userSubcategories
        .filter((sub) => sub !== 'General')
        .forEach((sub) => {
          options.push({
            name: sub,
            emoji: getSubcategoryIcon(sub),
            count: counts[sub] || 0,
          });
        });
    } else {
      // Fallback: show all available subcategories from offers
      Array.from(availableSubcategories)
        .filter((sub) => sub !== 'General')
        .sort()
        .forEach((sub) => {
          options.push({
            name: sub,
            emoji: getSubcategoryIcon(sub),
            count: counts[sub] || 0,
          });
        });
    }

    return options;
  }, [offers, user]);

  // Build deal category options from offers in the selected subcategory (or all offers if "All")
  const dealCategoryOptions = useMemo(() => {
    // Get offers based on selected subcategory
    const filteredOffers = selectedSubcategory === 'All' 
      ? offers 
      : offers.filter((o) => o.subcategory === selectedSubcategory);
    
    const dealCatsSet = new Set<string>();
    
    filteredOffers.forEach((offer) => {
      if (offer.deal_categories && offer.deal_categories.length > 0) {
        offer.deal_categories.forEach((cat) => dealCatsSet.add(cat));
      }
      if (offer.deal_category) {
        dealCatsSet.add(offer.deal_category);
      }
    });
    
    const dealCats = Array.from(dealCatsSet).sort();
    return dealCats.length > 0 ? ['All', ...dealCats] : ['All'];
  }, [offers, selectedSubcategory]);

  // Filter and group offers by merchant
  const groupedMerchants = useMemo(() => {
    let filtered = offers;

    // Filter by subcategory
    if (selectedSubcategory !== 'All') {
      filtered = filtered.filter((o) => o.subcategory === selectedSubcategory);
    }

    // Filter by deal category
    if (selectedDealCategory !== 'All') {
      filtered = filtered.filter((o) => 
        o.deal_categories?.includes(selectedDealCategory) || 
        o.deal_category === selectedDealCategory
      );
    }

    // Group by merchant
    const grouped: Record<string, GroupedMerchant> = {};
    filtered.forEach((offer) => {
      const key = offer.merchant_name;
      if (!grouped[key]) {
        grouped[key] = {
          merchantName: offer.merchant_name,
          domain: offer.domain,
          offers: [],
          isPartner: offer.source === 'merchant_offers',
        };
      }
      grouped[key].offers.push(offer);
      if (offer.source === 'merchant_offers') {
        grouped[key].isPartner = true;
      }
    });

    // Sort: partners first, then by offer count
    return Object.values(grouped).sort((a, b) => {
      if (a.isPartner && !b.isPartner) return -1;
      if (!a.isPartner && b.isPartner) return 1;
      return b.offers.length - a.offers.length;
    });
  }, [offers, selectedSubcategory, selectedDealCategory]);

  const handleSearchClick = () => {
    navigate('/app/search');
  };

  const toggleMerchant = (merchantName: string) => {
    setExpandedMerchants((prev) => {
      const next = new Set(prev);
      if (next.has(merchantName)) {
        next.delete(merchantName);
      } else {
        next.add(merchantName);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <VentusSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </VentusSidebar>
    );
  }

  return (
    <VentusSidebar>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome, {user?.first_name || 'there'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's your personalized offers</p>
          </div>
        </header>

        <div className="px-8 py-6 space-y-6 max-w-6xl">
          {/* App Download CTA */}
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-base">Get the Ventus App</h3>
                  <p className="text-sm text-muted-foreground">Wishlist, notifications & more</p>
                </div>
                <AppStoreBadges compact />
              </div>
            </CardContent>
          </Card>

          {/* Search bar */}
          <div 
            onClick={handleSearchClick}
            className="relative cursor-pointer group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              readOnly
              placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
              className="pl-11 h-12 text-base cursor-pointer bg-card border-border group-hover:border-primary/50 transition-colors"
            />
          </div>

          {/* Browse by Sport */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Browse by Sport</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                {subcategoryOptions.map((opt) => (
                  <SubcategoryChip
                    key={opt.name}
                    label={opt.name}
                    emoji={opt.emoji}
                    count={opt.count}
                    isActive={selectedSubcategory === opt.name}
                    onClick={() => {
                      setSelectedSubcategory(opt.name);
                      setSelectedDealCategory('All');
                    }}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Deal Categories - show under subcategory filters */}
            {dealCategoryOptions.length > 1 && (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                  {dealCategoryOptions.map((cat) => (
                    <DealCategoryChip
                      key={cat}
                      label={cat}
                      isActive={selectedDealCategory === cat}
                      onClick={() => setSelectedDealCategory(cat)}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>

          {/* Merchant grouped offers */}
          <div className="space-y-4">
            {groupedMerchants.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-base">No offers match your filters</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              groupedMerchants.map((merchant) => (
                <MerchantCard
                  key={merchant.merchantName}
                  merchantName={merchant.merchantName}
                  domain={merchant.domain}
                  offers={merchant.offers}
                  isExpanded={expandedMerchants.has(merchant.merchantName)}
                  onToggle={() => toggleMerchant(merchant.merchantName)}
                  showSubcategory={selectedSubcategory === 'All'}
                  showDealCategory={selectedDealCategory === 'All'}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </VentusSidebar>
  );
}
