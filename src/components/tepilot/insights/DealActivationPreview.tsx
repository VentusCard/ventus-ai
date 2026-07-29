import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, Sparkles, TrendingUp, Heart, Music, Plane, 
  UtensilsCrossed, Dumbbell, ShoppingBag, ArrowRight,
  Target, DollarSign, Percent, Users, MapPin, AlertCircle,
  Home, Tv, Cpu, Baby, PawPrint, Wallet, Car, ChevronDown, ChevronUp, ChevronRight,
  Search, X, Loader2, Globe, Navigation, CheckCircle2, Palette, Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedTransaction } from "@/types/transaction";
import { availableDeals as AVAILABLE_DEALS, AvailableDeal, DEAL_CATEGORIES, DealCategory } from "@/lib/availableDealsData";
import { useSemanticDealSearch } from "@/hooks/useSemanticDealSearch";
import { useCityDeals } from "@/hooks/useCityDeals";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// Bank-defined deal format for personalization
export interface BankDeal {
  id: string;
  merchantName: string;
  merchantCategory: string;
  dealTitle: string;
  dealDescription: string;
  headlineTemplate: string;
  bodyTemplate: string;
  targetPillars: string[];
  rewardValue: string;
  validityPeriod: string;
  subcategory: string;
  popularity: string;
  activationCount: number;
}

// Customer profile derived from transactions
interface DerivedCustomerProfile {
  topPillars: Array<{ pillar: string; annualSpend: number; topMerchant: string; transactionCount: number; dominantTier?: string }>;
  topMerchants: Array<{ merchant: string; totalSpend: number; visits: number; pillar: string }>;
  lifestyleSignals: string[];
  pillarTiers: Record<string, string>;
  locationContext: {
    homeCity?: string;
    homeState?: string;
    travelDestinations: string[];
  };
  totalSpend: number;
  avgTransactionSize: number;
}

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'Entertainment & Culture': return Music;
    case 'Travel & Exploration': return Plane;
    case 'Food & Dining': return UtensilsCrossed;
    case 'Sports & Active Living': return Dumbbell;
    case 'Style & Beauty': return ShoppingBag;
    case 'Health & Wellness': return Heart;
    case 'Home & Living': return Home;
    case 'Technology & Digital Life': return Cpu;
    case 'Family & Community': return Baby;
    case 'Pets': return PawPrint;
    case 'Financial & Aspirational': return Wallet;
    case 'Automotive': return Car;
    default: return Target;
  }
};

const formatCurrency = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

// Generate personalized headline template based on deal category
function generateHeadlineTemplate(deal: AvailableDeal): string {
  const templates: Record<string, string> = {
    'Food & Dining': `Fuel your {{food_habit}} with ${deal.merchantName}`,
    'Travel & Exploration': `Your next adventure with ${deal.merchantName}{{location_hint}}`,
    'Style & Beauty': `Upgrade your look at ${deal.merchantName}`,
    'Entertainment & Culture': `More entertainment with ${deal.merchantName}`,
    'Sports & Active Living': `Elevate your fitness with ${deal.merchantName}`,
    'Health & Wellness': `Invest in your wellness at ${deal.merchantName}`,
    'Home & Living': `Transform your space with ${deal.merchantName}`,
    'Technology & Digital Life': `Level up your tech with ${deal.merchantName}`,
    'Family & Community': `Family time made better with ${deal.merchantName}`,
    'Pets': `Spoil your pet with ${deal.merchantName}`,
    'Financial & Aspirational': `Grow your wealth with ${deal.merchantName}`,
    'Automotive': `Hit the road with ${deal.merchantName}`,
  };
  return templates[deal.category] || `${deal.dealTitle}`;
}

// Generate personalized body template based on deal category
function generateBodyTemplate(deal: AvailableDeal): string {
  const templates: Record<string, string> = {
    'Food & Dining': `Based on your {{top_pillar}} lifestyle and spending at {{top_merchant}}, enjoy ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Travel & Exploration': `Your {{travel_spending}} in travel spending shows you love to explore{{destinations}}. Earn ${deal.rewardValue} at ${deal.merchantName} and make your next trip more rewarding.`,
    'Style & Beauty': `Your style-forward purchases at {{style_merchant}} inspired this offer. With {{style_spending}} in Style & Beauty, get ${deal.rewardValue} at ${deal.merchantName}.`,
    'Entertainment & Culture': `Your love for entertainment and spending of {{entertainment_spending}} caught our attention. Enjoy ${deal.rewardValue} at ${deal.merchantName}.`,
    'Sports & Active Living': `Your {{fitness_spending}} investment in {{fitness_activity}} inspired this offer. Enjoy ${deal.rewardValue} at ${deal.merchantName} - perfect for your active lifestyle.`,
    'Health & Wellness': `Your focus on health and wellness inspired this offer. Get ${deal.rewardValue} at ${deal.merchantName} and continue investing in yourself.`,
    'Home & Living': `Based on your home improvement interests, enjoy ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Technology & Digital Life': `Your tech-savvy spending habits qualify you for ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Family & Community': `For your family-focused lifestyle, enjoy ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Pets': `For pet lovers like you, get ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Financial & Aspirational': `Based on your financial goals, enjoy ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
    'Automotive': `Your automotive spending qualifies you for ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`,
  };
  return templates[deal.category] || `Based on your spending profile, enjoy ${deal.rewardValue} at ${deal.merchantName}. ${deal.dealDescription}`;
}

// Convert AvailableDeal to BankDeal format
function convertToBankDeal(deal: AvailableDeal): BankDeal {
  return {
    id: deal.id,
    merchantName: deal.merchantName,
    merchantCategory: deal.category,
    dealTitle: deal.dealTitle,
    dealDescription: deal.dealDescription,
    headlineTemplate: generateHeadlineTemplate(deal),
    bodyTemplate: generateBodyTemplate(deal),
    targetPillars: [deal.category],
    rewardValue: deal.rewardValue,
    validityPeriod: `Until ${deal.validUntil}`,
    subcategory: deal.subcategory,
    popularity: deal.popularity,
    activationCount: deal.activationCount,
  };
}

// Get relevant deals from the library based on customer's spending pillars
function getRelevantDeals(profile: DerivedCustomerProfile): { deals: BankDeal[]; dealsByCategory: Record<string, BankDeal[]> } {
  const customerPillars = profile.topPillars.map(p => p.pillar);
  
  // If no customer data, return featured deals from all categories
  if (customerPillars.length === 0) {
    const featuredDeals = AVAILABLE_DEALS
      .filter(d => d.popularity === 'featured' || d.popularity === 'trending')
      .slice(0, 20)
      .map(convertToBankDeal);
    
    const dealsByCategory: Record<string, BankDeal[]> = {};
    featuredDeals.forEach(deal => {
      if (!dealsByCategory[deal.merchantCategory]) {
        dealsByCategory[deal.merchantCategory] = [];
      }
      dealsByCategory[deal.merchantCategory].push(deal);
    });
    
    return { deals: featuredDeals, dealsByCategory };
  }

  // Get deals matching customer's top 3 pillars
  const topPillarNames = customerPillars.slice(0, 3);
  
  // Popularity ranking for sorting
  const popularityOrder = { trending: 0, featured: 1, popular: 2, new: 3 };
  
  const relevantDeals = AVAILABLE_DEALS
    .filter(deal => topPillarNames.includes(deal.category))
    .sort((a, b) => popularityOrder[a.popularity] - popularityOrder[b.popularity])
    .map(convertToBankDeal);

  // Also add some featured deals from other categories for variety
  const otherFeaturedDeals = AVAILABLE_DEALS
    .filter(deal => !topPillarNames.includes(deal.category) && (deal.popularity === 'trending' || deal.popularity === 'featured'))
    .slice(0, 5)
    .map(convertToBankDeal);

  const allDeals = [...relevantDeals, ...otherFeaturedDeals];
  
  // Group by category
  const dealsByCategory: Record<string, BankDeal[]> = {};
  allDeals.forEach(deal => {
    if (!dealsByCategory[deal.merchantCategory]) {
      dealsByCategory[deal.merchantCategory] = [];
    }
    dealsByCategory[deal.merchantCategory].push(deal);
  });

  return { deals: allDeals, dealsByCategory };
}

// Derive customer profile from enriched transactions
function deriveCustomerProfile(transactions: EnrichedTransaction[]): DerivedCustomerProfile {
  if (transactions.length === 0) {
    return {
      topPillars: [],
      topMerchants: [],
      lifestyleSignals: [],
      pillarTiers: {},
      locationContext: { travelDestinations: [] },
      totalSpend: 0,
      avgTransactionSize: 0
    };
  }

  // Calculate pillar spending
  const pillarData: Record<string, { spend: number; merchants: Record<string, number>; count: number; tiers: Record<string, number> }> = {};
  transactions.forEach(t => {
    const pillar = t.pillar || 'Other';
    if (!pillarData[pillar]) {
      pillarData[pillar] = { spend: 0, merchants: {}, count: 0, tiers: {} };
    }
    pillarData[pillar].spend += t.amount;
    pillarData[pillar].count += 1;
    const merchant = t.merchant_name || 'Unknown';
    pillarData[pillar].merchants[merchant] = (pillarData[pillar].merchants[merchant] || 0) + t.amount;
    const tier = t.spending_tier || "N/A";
    if (tier !== "N/A") {
      pillarData[pillar].tiers[tier] = (pillarData[pillar].tiers[tier] || 0) + 1;
    }
  });

  const pillarTiers: Record<string, string> = {};
  const topPillars = Object.entries(pillarData)
    .map(([pillar, data]) => {
      const topMerchant = Object.entries(data.merchants)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various';
      const dominantTier = Object.entries(data.tiers).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (dominantTier) pillarTiers[pillar] = dominantTier;
      return {
        pillar,
        annualSpend: data.spend,
        topMerchant,
        transactionCount: data.count,
        dominantTier
      };
    })
    .sort((a, b) => b.annualSpend - a.annualSpend)
    .slice(0, 5);

  // Calculate top merchants
  const merchantData: Record<string, { spend: number; visits: number; pillar: string }> = {};
  transactions.forEach(t => {
    const merchant = t.merchant_name || 'Unknown';
    if (!merchantData[merchant]) {
      merchantData[merchant] = { spend: 0, visits: 0, pillar: t.pillar || 'Other' };
    }
    merchantData[merchant].spend += t.amount;
    merchantData[merchant].visits += 1;
  });

  const topMerchants = Object.entries(merchantData)
    .map(([merchant, data]) => ({
      merchant,
      totalSpend: data.spend,
      visits: data.visits,
      pillar: data.pillar
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  // Derive lifestyle signals from pillars and merchants
  const lifestyleSignals: string[] = [];
  const PILLAR_SHORT: Record<string, string> = {
    "Travel & Exploration": "traveler", "Sports & Active Living": "athlete",
    "Food & Dining": "diner", "Entertainment & Culture": "culture seeker",
    "Style & Beauty": "fashion spender", "Health & Wellness": "wellness spender",
    "Technology & Digital Life": "tech buyer", "Pets": "pet owner",
    "Home & Living": "home spender", "Family & Community": "family spender",
  };
  topPillars.forEach(p => {
    if (p.dominantTier && p.dominantTier !== "N/A" && PILLAR_SHORT[p.pillar]) {
      lifestyleSignals.push(`${p.dominantTier.toLowerCase()} ${PILLAR_SHORT[p.pillar]}`);
    }
    if (p.pillar === 'Travel & Exploration' && p.annualSpend > 2000) lifestyleSignals.push('frequent traveler');
    if (p.pillar === 'Sports & Active Living' && p.annualSpend > 1000) lifestyleSignals.push('fitness enthusiast');
    if (p.pillar === 'Food & Dining' && p.annualSpend > 3000) lifestyleSignals.push('food connoisseur');
    if (p.pillar === 'Entertainment & Culture' && p.annualSpend > 1500) lifestyleSignals.push('experience seeker');
    if (p.pillar === 'Style & Beauty' && p.annualSpend > 2000) lifestyleSignals.push('style-conscious');
    if (p.pillar === 'Health & Wellness' && p.annualSpend > 1500) lifestyleSignals.push('health-focused');
  });

  // Extract location context
  const travelDestinations: string[] = [];
  const homeZips: Record<string, number> = {};
  
  transactions.forEach(t => {
    if (t.travel_context?.is_travel_related && t.travel_context?.travel_destination && t.travel_context.travel_destination !== 'unknown') {
      if (!travelDestinations.includes(t.travel_context.travel_destination)) {
        travelDestinations.push(t.travel_context.travel_destination);
      }
    }
    if (t.zip_code) {
      homeZips[t.zip_code] = (homeZips[t.zip_code] || 0) + 1;
    }
  });

  // Most common zip is likely home
  const homeZip = Object.entries(homeZips).sort((a, b) => b[1] - a[1])[0]?.[0];

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTransactionSize = totalSpend / transactions.length;

  return {
    topPillars,
    topMerchants,
    lifestyleSignals: lifestyleSignals.length > 0 ? lifestyleSignals : ['active spender'],
    pillarTiers,
    locationContext: {
      homeCity: homeZip ? `ZIP ${homeZip}` : undefined,
      travelDestinations: travelDestinations.slice(0, 5)
    },
    totalSpend,
    avgTransactionSize
  };
}

// Personalize deal messaging based on derived customer profile
function personalizeDealMessage(deal: BankDeal, profile: DerivedCustomerProfile): { headline: string; body: string } {
  let headline = deal.headlineTemplate;
  let body = deal.bodyTemplate;

  // Replace top pillar
  const topPillar = profile.topPillars[0]?.pillar || 'lifestyle';
  body = body.replace('{{top_pillar}}', topPillar.toLowerCase());

  // Replace top merchant
  const topMerchant = profile.topPillars[0]?.topMerchant || 'your favorite stores';
  body = body.replace('{{top_merchant}}', topMerchant);

  // Replace top activity based on pillar
  const topActivity = profile.lifestyleSignals[0] || 'lifestyle';
  headline = headline.replace('{{top_activity}}', topActivity);

  // Replace travel info
  const travelPillar = profile.topPillars.find(p => p.pillar === 'Travel & Exploration');
  const travelSpending = travelPillar ? formatCurrency(travelPillar.annualSpend) : '$0';
  body = body.replace('{{travel_spending}}', travelSpending);

  // Replace destinations
  const destinations = profile.locationContext.travelDestinations.length > 0
    ? ` - we've seen you visit ${profile.locationContext.travelDestinations.slice(0, 2).join(' and ')}`
    : '';
  body = body.replace('{{destinations}}', destinations);

  // Replace location hint
  const locationHint = profile.locationContext.travelDestinations.length > 0
    ? ` - ${profile.locationContext.travelDestinations[0]} and beyond`
    : '';
  headline = headline.replace('{{location_hint}}', locationHint);

  // Replace food info
  const foodPillar = profile.topPillars.find(p => p.pillar === 'Food & Dining');
  const foodSpending = foodPillar ? formatCurrency(foodPillar.annualSpend) : '$0';
  body = body.replace('{{food_spending}}', foodSpending);
  body = body.replace('{{food_habit}}', foodPillar ? 'quality dining' : 'good food');

  // Replace fitness info
  const fitnessPillar = profile.topPillars.find(p => p.pillar === 'Sports & Active Living');
  const fitnessSpending = fitnessPillar ? formatCurrency(fitnessPillar.annualSpend) : '$0';
  body = body.replace('{{fitness_spending}}', fitnessSpending);
  body = body.replace('{{fitness_activity}}', fitnessPillar?.topMerchant || 'staying active');

  // Replace style info
  const stylePillar = profile.topPillars.find(p => p.pillar === 'Style & Beauty');
  const styleSpending = stylePillar ? formatCurrency(stylePillar.annualSpend) : '$0';
  body = body.replace('{{style_spending}}', styleSpending);
  body = body.replace('{{style_merchant}}', stylePillar?.topMerchant || 'favorite retailers');

  // Replace entertainment info
  const entertainmentPillar = profile.topPillars.find(p => p.pillar === 'Entertainment & Culture');
  const entertainmentSpending = entertainmentPillar ? formatCurrency(entertainmentPillar.annualSpend) : '$0';
  body = body.replace('{{entertainment_spending}}', entertainmentSpending);

  return { headline, body };
}

// Calculate deal impact for customer
function calculateDealImpact(deal: BankDeal, profile: DerivedCustomerProfile): {
  eligibility: 'high' | 'medium' | 'low';
  eligibilityReason: string;
  projectedNewSpend: number;
  walletShareIncrease: number;
  ltvImpact: number;
} {
  // Check pillar match
  const pillarMatch = profile.topPillars.some(p => deal.targetPillars.includes(p.pillar));
  const relevantSpend = profile.topPillars
    .filter(p => deal.targetPillars.includes(p.pillar))
    .reduce((sum, p) => sum + p.annualSpend, 0);

  // Determine eligibility
  let eligibility: 'high' | 'medium' | 'low' = 'low';
  let eligibilityReason = '';

  if (pillarMatch && relevantSpend > 2000) {
    eligibility = 'high';
    eligibilityReason = `Strong ${deal.targetPillars[0]} spending (${formatCurrency(relevantSpend)}/yr)`;
  } else if (pillarMatch && relevantSpend > 500) {
    eligibility = 'medium';
    eligibilityReason = `Moderate ${deal.targetPillars[0]} engagement (${formatCurrency(relevantSpend)}/yr)`;
  } else if (pillarMatch) {
    eligibility = 'low';
    eligibilityReason = `Category match but limited activity (${formatCurrency(relevantSpend)}/yr)`;
  } else {
    eligibility = 'low';
    eligibilityReason = `Outside target segments - no ${deal.targetPillars[0]} activity`;
  }

  // Project impact based on eligibility
  const baseImpact = eligibility === 'high' ? 0.15 : eligibility === 'medium' ? 0.08 : 0.03;
  const projectedNewSpend = relevantSpend * baseImpact;
  const walletShareIncrease = profile.totalSpend > 0 ? (projectedNewSpend / profile.totalSpend) * 100 : 0;
  const ltvImpact = projectedNewSpend * 5; // 5-year projection

  return {
    eligibility,
    eligibilityReason,
    projectedNewSpend,
    walletShareIncrease,
    ltvImpact
  };
}

// Selected deal type for personalization
export interface SelectedDealForPersonalization {
  id: string;
  merchantName: string;
  category: string;
  subcategory: string;
  dealTitle: string;
  dealDescription: string;
  rewardValue: string;
}

interface DealActivationPreviewProps {
  enrichedTransactions?: EnrichedTransaction[];
  personalContext?: {
    demographics?: {
      age?: string;
      occupation?: string;
      familyStatus?: string;
      incomeLevel?: string;
      industry?: string;
    };
    persona?: {
      summary?: string;
      lifestyle_traits?: string[];
      interests?: string[];
    };
  };
}

export function DealActivationPreview({ enrichedTransactions = [], personalContext }: DealActivationPreviewProps) {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [locationCity, setLocationCity] = useState<string>("San Francisco");
  const [localExperiencesExpanded, setLocalExperiencesExpanded] = useState(false);
  const [syntheticLocalDeal, setSyntheticLocalDeal] = useState<BankDeal | null>(null);
  const [localCategory, setLocalCategory] = useState<string>("entertainment");
  
  // Personalization state
  const [personalizedDeals, setPersonalizedDeals] = useState<Map<string, { message: string; cta: string }>>(new Map());
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [hasPersonalized, setHasPersonalized] = useState(false);
  
  // Location-based experiences from edge function - now uses selected category
  const { deals: locationDeals, loading: locationLoading } = useCityDeals(locationCity, localCategory);
  
  // Local experience category options
  const LOCAL_CATEGORIES = [
    { key: 'entertainment', label: 'Entertainment', icon: Music },
    { key: 'dining', label: 'Dining', icon: UtensilsCrossed },
    { key: 'artCulture', label: 'Arts', icon: Palette },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag },
  ];

  // Derive customer profile from real transaction data
  const customerProfile = useMemo(() => 
    deriveCustomerProfile(enrichedTransactions),
    [enrichedTransactions]
  );

  // Get relevant deals based on customer profile
  const { deals, dealsByCategory } = useMemo(() => 
    getRelevantDeals(customerProfile),
    [customerProfile]
  );

  // Prepare deals for semantic search (need merchantName for the hook)
  const dealsForSearch = useMemo(() => 
    deals.map(d => ({
      id: d.id,
      merchantName: d.merchantName,
      category: d.merchantCategory,
      subcategory: d.subcategory,
      dealTitle: d.dealTitle,
      rewardValue: d.rewardValue,
    })),
    [deals]
  );

  // Semantic search hook
  const {
    searchQuery,
    isSearching,
    handleSearchChange,
    clearSearch,
    matchingDealIds,
    searchReasoning,
  } = useSemanticDealSearch();

  // Filter deals based on semantic search results
  const filteredDealsByCategory = useMemo(() => {
    if (!matchingDealIds || matchingDealIds.length === 0) {
      return dealsByCategory;
    }
    
    // Filter each category to only include matching deals
    const filtered: Record<string, typeof deals> = {};
    Object.entries(dealsByCategory).forEach(([category, categoryDeals]) => {
      const matchingDeals = categoryDeals.filter(d => matchingDealIds.includes(d.id));
      if (matchingDeals.length > 0) {
        filtered[category] = matchingDeals;
      }
    });
    return filtered;
  }, [dealsByCategory, matchingDealIds]);

  // Get filtered deals list
  const filteredDeals = useMemo(() => {
    if (!matchingDealIds || matchingDealIds.length === 0) {
      return deals;
    }
    return deals.filter(d => matchingDealIds.includes(d.id));
  }, [deals, matchingDealIds]);

  // Set default selected deal
  const selectedDeal = useMemo(() => {
    if (selectedDealId?.startsWith('local-') && syntheticLocalDeal) {
      return syntheticLocalDeal;
    }
    if (selectedDealId) {
      return deals.find(d => d.id === selectedDealId) || deals[0];
    }
    return deals[0];
  }, [selectedDealId, deals, syntheticLocalDeal]);

  const personalizedMessage = useMemo(() => {
    if (!selectedDeal) return { headline: '', body: '' };
    
    // Check for AI-personalized message first
    const aiPersonalized = personalizedDeals.get(selectedDeal.id);
    if (aiPersonalized) {
      return { 
        headline: aiPersonalized.message, 
        body: aiPersonalized.cta 
      };
    }
    
    // Fallback to template-based personalization
    return personalizeDealMessage(selectedDeal, customerProfile);
  }, [selectedDeal, customerProfile, personalizedDeals]);

  const dealImpact = useMemo(() => 
    selectedDeal ? calculateDealImpact(selectedDeal, customerProfile) : null,
    [selectedDeal, customerProfile]
  );

  const eligibilityStyles = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200'
  };

  const hasData = enrichedTransactions.length > 0;
  const isSearchActive = searchQuery.length >= 2;
  const searchResultCount = matchingDealIds?.length || 0;

  // Get sorted categories (customer's top pillars first)
  const sortedCategories = useMemo(() => {
    const customerPillars = customerProfile.topPillars.map(p => p.pillar);
    const categoriesToShow = isSearchActive ? filteredDealsByCategory : dealsByCategory;
    const allCategories = Object.keys(categoriesToShow);
    
    // Sort: customer pillars first, then alphabetically
    return allCategories.sort((a, b) => {
      const aIndex = customerPillars.indexOf(a);
      const bIndex = customerPillars.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [dealsByCategory, filteredDealsByCategory, customerProfile.topPillars, isSearchActive]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Filter deals by selected category (respecting search)
  const displayedDeals = useMemo(() => {
    const baseDeals = isSearchActive ? filteredDeals : deals;
    if (selectedCategory) {
      const categoryDeals = (isSearchActive ? filteredDealsByCategory : dealsByCategory)[selectedCategory] || [];
      return categoryDeals;
    }
    return baseDeals;
  }, [selectedCategory, dealsByCategory, filteredDealsByCategory, deals, filteredDeals, isSearchActive]);

  // Auto-personalize ALL deals on mount when we have transaction data
  useEffect(() => {
    const autoPersonalize = async () => {
      if (displayedDeals.length === 0 || hasPersonalized || isPersonalizing || enrichedTransactions.length === 0) {
        return;
      }
      
      setIsPersonalizing(true);
      
      try {
        // Slim payload: only id, merchant, category, reward (no descriptions/subcategories)
        const slimDeals = displayedDeals.map(d => ({
          id: d.id,
          m: d.merchantName,
          c: d.merchantCategory,
          r: d.rewardValue
        }));

        // Build slim profile: top 3 pillars with spend only
        const totalSpend = enrichedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const pillarSpending = enrichedTransactions.reduce((acc, t) => {
          const pillar = t.pillar || "Other";
          acc[pillar] = (acc[pillar] || 0) + Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>);
        
        const slimProfile = {
          pillars: Object.entries(pillarSpending)
            .map(([name, spend]) => ({ n: name, s: Math.round(spend) }))
            .sort((a, b) => b.s - a.s)
            .slice(0, 3),
          signals: customerProfile.lifestyleSignals?.slice(0, 5) || [],
          pillarTiers: customerProfile.pillarTiers || {},
        };
        
        // Build slim personal context for AI personalization
        const slimContext = {
          demo: personalContext?.demographics ? {
            occ: personalContext.demographics.occupation,
            fam: personalContext.demographics.familyStatus,
            inc: personalContext.demographics.incomeLevel
          } : null,
          persona: personalContext?.persona ? {
            traits: personalContext.persona.lifestyle_traits?.slice(0, 3),
            interests: personalContext.persona.interests?.slice(0, 3)
          } : null
        };
        
        const { data, error } = await supabase.functions.invoke("deal-personalization", {
          body: { deals: slimDeals, profile: slimProfile, ctx: slimContext, txCount: enrichedTransactions.length },
        });
        
        if (error) throw error;
        
        // Store personalized messages
        const newPersonalized = new Map<string, { message: string; cta: string }>();
        (data.recs || []).forEach((rec: any) => {
          newPersonalized.set(rec.id, { message: rec.msg, cta: rec.cta });
        });
        setPersonalizedDeals(newPersonalized);
        setHasPersonalized(true);
        toast.success(`Personalized ${newPersonalized.size} of ${displayedDeals.length} deals!`);
      } catch (error) {
        console.error("Auto-personalization error:", error);
      } finally {
        setIsPersonalizing(false);
      }
    };

    autoPersonalize();
  }, [displayedDeals.length, enrichedTransactions.length]);

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p>No deals available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* No Data Warning */}
      {!hasData && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">No Transaction Data</h4>
            <p className="text-xs text-muted-foreground">
              Upload and enrich customer transactions to see personalized deal activation based on their real spending profile. Showing featured deals from all categories.
            </p>
          </div>
        </div>
      )}

      {/* Semantic Search Bar - Full Width */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            placeholder='Search deals semantically... (e.g., "t-shirt", "coffee", "gym", "vacation")'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 pr-12 h-14 text-base bg-white border-2 border-primary/20 focus:border-primary rounded-xl shadow-sm placeholder:text-slate-400"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {isSearchActive && !isSearching && matchingDealIds && (
          <div className="flex items-center gap-2 px-1 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-slate-700">
              {searchResultCount > 0 
                ? `${searchResultCount} deals match "${searchQuery}"` 
                : `No deals found for "${searchQuery}"`
              }
            </span>
            {searchReasoning && searchResultCount > 0 && (
              <span className="text-slate-400 text-xs">— {searchReasoning}</span>
            )}
          </div>
        )}
      </div>

      {/* Available Deals Section Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          Available Deals ({isSearchActive ? `${searchResultCount} results` : `${deals.length} from library`})
        </label>
        <div className="flex items-center gap-2">
          {(selectedCategory || isSearchActive) && (
            <Badge variant="outline" className="text-xs">
              {isSearchActive ? `"${searchQuery}"` : `Filtered: ${selectedCategory}`}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content: 2/3 Deal Cards + 1/3 Detail Panel */}
      <div className="flex gap-4">
        {/* Left: Deal Cards Grid (2/3 width) */}
        <div className="w-2/3 space-y-3">
          {/* Category Pills for quick filtering */}
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 text-xs bg-white text-black border-slate-200 hover:bg-slate-50",
                selectedCategory === null && "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
              )}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {sortedCategories.slice(0, 6).map(category => {
              const Icon = getPillarIcon(category);
              const isCustomerPillar = customerProfile.topPillars.some(p => p.pillar === category);
              return (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 text-xs gap-1 bg-white text-black border-slate-200 hover:bg-slate-50",
                    selectedCategory === category && "bg-blue-50 text-blue-700 border-blue-300 shadow-sm",
                    isCustomerPillar && selectedCategory !== category && "border-primary/30 bg-white"
                  )}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <Icon className="h-3 w-3" />
                  {category.split(' ')[0]}
                </Button>
              );
            })}
          </div>

          {/* Deal Cards Grid - 2 per row */}
          <div className="max-h-[500px] overflow-y-auto pr-1">
            {displayedDeals.length === 0 && isSearchActive && !isSearching && (
              <div className="text-center py-12 text-slate-400">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No matching deals found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {/* Local Experiences - AI-powered location based deals with category tabs */}
              <div className="col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                <button
                  onClick={() => setLocalExperiencesExpanded(!localExperiencesExpanded)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-slate-800">Local Experiences</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-blue-200" style={{ color: '#000000', backgroundColor: 'rgba(59,130,246,0.05)' }}>
                      <MapPin className="h-2.5 w-2.5 mr-0.5" style={{ color: '#000000' }} />
                      {locationCity}
                    </Badge>
                  </div>
                  {localExperiencesExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                
                {localExperiencesExpanded && (
                  <div className="px-3 pb-3 border-t border-slate-100">
                    {/* Category Pills */}
                    <div className="flex gap-1.5 py-2.5 overflow-x-auto">
                      {LOCAL_CATEGORIES.map((cat) => {
                        const CatIcon = cat.icon;
                        const isActive = localCategory === cat.key;
                        return (
                          <button
                            key={cat.key}
                            onClick={() => setLocalCategory(cat.key)}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap",
                              isActive
                                ? "bg-primary text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            <CatIcon className="h-3 w-3" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Deal List */}
                    {locationLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-slate-500">Discovering {LOCAL_CATEGORIES.find(c => c.key === localCategory)?.label.toLowerCase()} deals...</span>
                      </div>
                    ) : locationDeals.length === 0 ? (
                      <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                        No deals found for this category
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {locationDeals.slice(0, 4).map((deal, idx) => {
                          const categoryLabel = LOCAL_CATEGORIES.find(c => c.key === localCategory)?.label || 'Entertainment';
                          return (
                            <button
                              key={`${localCategory}-${idx}`}
                              onClick={() => {
                                const syntheticDeal: BankDeal = {
                                  id: `local-${localCategory}-${idx}`,
                                  merchantName: deal.merchantExample,
                                  merchantCategory: localCategory === 'artCulture' ? 'Entertainment & Culture' 
                                    : localCategory === 'dining' ? 'Food & Dining' 
                                    : localCategory === 'shopping' ? 'Style & Beauty'
                                    : 'Entertainment & Culture',
                                  dealTitle: deal.type,
                                  dealDescription: `Experience ${deal.type} at ${deal.merchantExample} in ${locationCity}`,
                                  headlineTemplate: `Discover ${deal.type} in ${locationCity}`,
                                  bodyTemplate: `Enjoy exclusive ${categoryLabel.toLowerCase()} experiences at ${deal.merchantExample}`,
                                  targetPillars: [localCategory === 'artCulture' ? 'Entertainment & Culture' 
                                    : localCategory === 'dining' ? 'Food & Dining' 
                                    : localCategory === 'shopping' ? 'Style & Beauty'
                                    : 'Entertainment & Culture'],
                                  rewardValue: '10% Back',
                                  validityPeriod: '30 days',
                                  subcategory: categoryLabel,
                                  activationCount: 1200 + (idx * 300),
                                  popularity: 'popular',
                                };
                                setSyntheticLocalDeal(syntheticDeal);
                                setSelectedDealId(syntheticDeal.id);
                              }}
                              className={cn(
                                "w-full p-2.5 rounded-lg text-left transition-all border flex items-center justify-between",
                                selectedDealId === `local-${localCategory}-${idx}`
                                  ? "bg-primary/10 border-primary shadow-sm"
                                  : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate">{deal.type}</p>
                                <p className="text-[10px] text-slate-500 truncate">{deal.merchantExample}</p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0 h-4 ml-2 shrink-0">
                                10% Back
                              </Badge>
                              <ChevronRight className="h-3 w-3 text-slate-400 ml-1 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {displayedDeals.map(deal => {
                const Icon = getPillarIcon(deal.merchantCategory);
                const isPreviewSelected = selectedDeal?.id === deal.id;
                const personalizedMsg = personalizeDealMessage(deal, customerProfile);
                const aiPersonalized = personalizedDeals.get(deal.id);
                
                return (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    className={cn(
                      "p-3 rounded-lg text-left transition-all border cursor-pointer",
                      isPreviewSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : aiPersonalized
                          ? "bg-violet-50/50 border-violet-200 hover:border-violet-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="w-full text-left">
                      {/* Top Row: Icon + Merchant + Popularity */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", isPreviewSelected ? "text-primary" : aiPersonalized ? "text-violet-500" : "text-slate-400")} />
                        <span className="text-[11px] text-slate-500 truncate flex-1">{deal.merchantName}</span>
                        {aiPersonalized && (
                          <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] px-1 py-0 h-4 shrink-0",
                            deal.merchantCategory === 'Travel & Exploration' && "border-sky-300 bg-sky-50 text-sky-700",
                            deal.merchantCategory === 'Food & Dining' && "border-orange-300 bg-orange-50 text-orange-700",
                            deal.merchantCategory === 'Entertainment & Culture' && "border-purple-300 bg-purple-50 text-purple-700",
                            deal.merchantCategory === 'Sports & Active Living' && "border-emerald-300 bg-emerald-50 text-emerald-700",
                            deal.merchantCategory === 'Style & Beauty' && "border-pink-300 bg-pink-50 text-pink-700",
                            deal.merchantCategory === 'Health & Wellness' && "border-teal-300 bg-teal-50 text-teal-700",
                            deal.merchantCategory === 'Home & Living' && "border-amber-300 bg-amber-50 text-amber-700",
                            deal.merchantCategory === 'Technology & Digital Life' && "border-indigo-300 bg-indigo-50 text-indigo-700",
                            deal.merchantCategory === 'Family & Community' && "border-rose-300 bg-rose-50 text-rose-700",
                            deal.merchantCategory === 'Pets' && "border-lime-300 bg-lime-50 text-lime-700",
                            deal.merchantCategory === 'Financial & Aspirational' && "border-slate-300 bg-slate-50 text-slate-700",
                            deal.merchantCategory === 'Automotive' && "border-red-300 bg-red-50 text-red-700"
                          )}
                        >
                          {deal.merchantCategory.split(' ')[0]}
                        </Badge>
                      </div>
                      
                      {/* Personalized Caption - AI or Template */}
                      <p className={cn(
                        "text-xs font-medium mb-1",
                        aiPersonalized ? "line-clamp-2 italic text-violet-700" : "line-clamp-1",
                        isPreviewSelected ? "text-primary" : !aiPersonalized && "text-slate-700"
                      )}>
                        {aiPersonalized ? `"${aiPersonalized.message}"` : deal.dealDescription}
                      </p>
                      
                      {/* Bottom Row: Reward + Activations or CTA */}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-4">
                          {deal.rewardValue}
                        </Badge>
                        {aiPersonalized ? (
                          <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[9px] px-1.5 py-0 h-4">
                            {aiPersonalized.cta}
                          </Badge>
                        ) : (
                          <span className="text-[9px] text-slate-400">
                            {deal.activationCount.toLocaleString()} active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Deal Detail Panel (1/3 width) */}
        <div className="w-1/3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full min-h-[500px]">
            {selectedDeal ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-rose-200 bg-rose-50 text-rose-700">
                    {selectedDeal.merchantCategory.split(' ')[0]}
                  </Badge>
                </div>

                {/* Deal Info */}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">{selectedDeal.merchantName}</p>
                  <h3 className="text-lg font-bold text-slate-900">{selectedDeal.dealTitle}</h3>
                </div>

                {/* Personalized Message */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <span className="text-[10px] font-medium text-rose-600 uppercase tracking-wide">
                    {personalizedDeals.get(selectedDeal.id) ? 'AI-Personalized Message' : 'Deal Details'}
                  </span>
                  {(() => {
                    const aiMsg = personalizedDeals.get(selectedDeal.id);
                    return aiMsg ? (
                      <>
                        <h4 className="text-base font-semibold text-slate-700 italic">"{aiMsg.message}"</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {selectedDeal.dealDescription}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-base font-semibold text-slate-700">{selectedDeal.dealTitle}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {selectedDeal.dealDescription}
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Deal Terms */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <span className="text-[10px] font-medium text-rose-600 uppercase tracking-wide">Deal Terms</span>
                  <div className="space-y-1.5 text-xs text-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Reward</span>
                      <span className="font-medium">{selectedDeal.rewardValue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Valid Until</span>
                      <span className="font-medium">{selectedDeal.validityPeriod.replace('Until ', '')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Min. Purchase</span>
                      <span className="font-medium">None</span>
                    </div>
                  </div>
                </div>

                {/* Activate Deal Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg"
                    onClick={() => {}}
                  >
                    {personalizedDeals.get(selectedDeal.id)?.cta || "Activate Deal"}
                  </Button>
                </div>

                {/* Activation Count */}
                <div className="pt-3 text-center">
                  <p className="text-xs text-slate-400">
                    {selectedDeal.activationCount.toLocaleString()} customers have activated this deal
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Target className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">Select a deal to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personalization Status - Fixed at bottom */}
      {displayedDeals.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          {isPersonalizing ? (
            <div className="flex items-center justify-center gap-2 py-3 text-violet-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Personalizing {Math.min(displayedDeals.length, 30)} deals...</span>
            </div>
          ) : hasPersonalized ? (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">{personalizedDeals.size} deals personalized</span>
            </div>
          ) : enrichedTransactions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-3 text-slate-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Upload transactions to enable AI personalization</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
