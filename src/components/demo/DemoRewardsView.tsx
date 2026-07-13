import { useState, useEffect, useMemo } from "react";
import { Loader2, MapPin, ChevronDown, ChevronUp, Gift, Star, Search, X, Sparkles, TrendingUp, Clock, Wallet, ChevronRight } from "lucide-react";
import { useSemanticDealSearch } from "@/hooks/useSemanticDealSearch";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { deriveCustomerProfile, getRelevantDeals, formatCurrency, convertToBankDeal, type BankDeal, type DerivedCustomerProfile } from "@/lib/dealSelectionUtils";
import { DEAL_CATEGORIES, availableDeals as AVAILABLE_DEALS, type DealCategory } from "@/lib/availableDealsData";
import { supabase } from "@/integrations/supabase/client";
import type { PersonalizedDealData } from "@/hooks/useDemoEnrichment";
import { getCityFromZip, getPerksForCity, CATEGORY_CONFIG, TIER_COLORS, type LocationPerk, type PerkCategory } from "@/lib/locationPerksData";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

const CATEGORY_HEX: Record<string, string> = {
  Sports: "#16a34a",
  Art: "#4f46e5",
  Dining: "#ea580c",
  Entertainment: "#9333ea",
  Culture: "#2563eb",
  Shopping: "#db2777",
  Fitness: "#dc2626",
  Travel: "#0284c7",
};

const DEAL_CATEGORY_PILLS: { key: DealCategory; emoji: string; short: string }[] = [
  { key: "Food & Dining", emoji: "🍕", short: "Dining" },
  { key: "Travel & Exploration", emoji: "✈️", short: "Travel" },
  { key: "Health & Wellness", emoji: "💪", short: "Wellness" },
  { key: "Sports & Active Living", emoji: "⚽", short: "Sports" },
  { key: "Style & Beauty", emoji: "👗", short: "Style" },
  { key: "Entertainment & Culture", emoji: "🎬", short: "Entertainment" },
  { key: "Technology & Digital Life", emoji: "💻", short: "Tech" },
  { key: "Home & Living", emoji: "🏠", short: "Home" },
  { key: "Pets", emoji: "🐾", short: "Pets" },
  { key: "Family & Community", emoji: "👨‍👩‍👧", short: "Family" },
];

function getFallbackMessage(deal: BankDeal): string {
  return `Unlock exclusive savings: ${deal.rewardValue} at ${deal.merchantName}, save today!`;
}

interface Props {
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  precomputed?: PersonalizedDealData | null;
  travelCity?: string;
}

async function fetchPersonalization(
  deals: BankDeal[],
  profile: DerivedCustomerProfile,
  customer: DemoCustomer
): Promise<Record<string, { msg: string; cta: string }>> {
  try {
    const payload = {
      deals: deals.map(d => ({ id: d.id, m: d.merchantName, c: d.merchantCategory, r: d.rewardValue })),
      profile: {
        pillars: profile.topPillars.map(p => ({ name: p.pillar, spend: Math.round(p.annualSpend), pct: Math.round((p.annualSpend / (profile.totalSpend || 1)) * 100) })),
        signals: profile.lifestyleSignals,
      },
      ctx: {
        demo: {
          occ: customer.profile.demographics.occupation,
          fam: customer.profile.demographics.familyStatus,
          inc: customer.profile.aum,
          tier: customer.profile.segment,
        },
        persona: {
          traits: profile.lifestyleSignals,
          interests: profile.topPillars.map(p => p.pillar),
        },
      },
      txCount: profile.topPillars.reduce((s, p) => s + p.transactionCount, 0),
    };

    const { data, error } = await supabase.functions.invoke("deal-personalization", { body: payload });
    if (error) throw error;

    const map: Record<string, { msg: string; cta: string }> = {};
    (data?.recs || []).forEach((r: any) => { map[r.id] = { msg: r.msg, cta: r.cta }; });
    return map;
  } catch (err) {
    console.warn("[DemoRewardsView] personalization failed:", err);
    return {};
  }
}

export default function DemoRewardsView({ customer, enriched, precomputed, travelCity }: Props) {
  const hasEnriched = (enriched?.length ?? 0) > 0;

  const profile = useMemo(() => hasEnriched && enriched ? deriveCustomerProfile(enriched) : null, [enriched, hasEnriched]);
  const deals = useMemo(() => precomputed?.deals ?? (profile ? getRelevantDeals(profile, 11) : []), [precomputed, profile]);

  const [personalized, setPersonalized] = useState<Record<string, { msg: string; cta: string }>>({});
  const [loading, setLoading] = useState(false);

  const effectivePersonalized = precomputed?.personalized ?? personalized;

  useEffect(() => {
    if (!precomputed && deals.length > 0 && profile) {
      setLoading(true);
      fetchPersonalization(deals, profile, customer).then(r => { setPersonalized(r); setLoading(false); });
    }
  }, [deals, profile, customer, precomputed]);

  const homeCity = getCityFromZip(customer.zip);
  const city = travelCity || homeCity;
  const perks = useMemo(() => getPerksForCity(city), [city]);
  const color = "#3b82f6";

  return (
    <div className="flex justify-center">
      <RewardsPhoneMockup
        customer={customer}
        color={color}
        deals={deals}
        profile={profile}
        personalized={effectivePersonalized}
        loading={!precomputed && loading}
        hasEnriched={hasEnriched}
        city={city}
        perks={perks}
        enriched={enriched}
      />
    </div>
  );
}

// ─── Savings Summary Bar ──────────────────────────────────────────────
function SavingsSummaryBar({ profile, color, hasEnriched, city, firstName }: { profile: DerivedCustomerProfile | null; color: string; hasEnriched: boolean; city: string; firstName: string }) {
  const monthlySaved = useMemo(() => {
    if (!profile) return 420;
    // Seed a stable per-customer number near ~$500 based on their spend fingerprint
    const base = 420 + Math.round((profile.totalSpend % 200));
    return Math.min(Math.max(base, 380), 580);
  }, [profile]);

  return (
    <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2">
      <p className="text-sm font-bold text-slate-900">Welcome to {city}, {firstName}!</p>
      <div className="flex items-center gap-1">
        <TrendingUp className="w-2.5 h-2.5" style={{ color }} />
        <p className="text-[10px] text-slate-600">
          Yearly savings to date: <span className="font-bold text-slate-900">${monthlySaved}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Hero Spotlight Deal ──────────────────────────────────────────────
function HeroSpotlightDeal({
  deal,
  personalized,
  color,
  loading,
}: {
  deal: BankDeal;
  personalized?: { msg: string; cta: string };
  color: string;
  loading: boolean;
}) {
  const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];
  return (
    <div
      className="rounded-xl border-2 overflow-hidden animate-fade-in"
      style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}08, ${color}03)` }}
    >
      <div className="px-3 py-0.5 flex items-center gap-1" style={{ background: `${color}10` }}>
        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>Top Pick For You</span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{catConfig?.icon || "🎁"}</span>
            <div>
              <p className="text-[13px] font-bold text-slate-900">{deal.merchantName}</p>
              <p className="text-[9px] text-slate-500">{deal.merchantCategory}</p>
            </div>
          </div>
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-md"
            style={{ background: `${color}15`, color }}
          >
            {deal.rewardValue}
          </span>
        </div>
        {personalized?.msg ? (
          <p className="text-[11px] leading-relaxed text-slate-600 italic mb-2">"{personalized.msg}"</p>
        ) : loading ? (
          <div className="flex items-center gap-1.5 mb-2">
            <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
            <span className="text-[9px] text-slate-400">Personalizing your top deal…</span>
          </div>
        ) : (
          <p className="text-[11px] leading-relaxed text-slate-600 italic mb-2">"{getFallbackMessage(deal)}"</p>
        )}
        <button
          className="w-full text-[11px] font-semibold py-1.5 rounded-lg text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${color}, #4f46e5)` }}
          onClick={() => toast.info(`Demo — ${deal.merchantName} deal would activate here`)}
        >
          {personalized?.cta || "Activate Deal"}
        </button>
      </div>
    </div>
  );
}

// ─── Expiring Soon Row ────────────────────────────────────────────────
function ExpiringSoonRow({ deals, color }: { deals: BankDeal[]; color: string }) {
  // Pick 3 deals and assign fake expiry hours
  const expiringDeals = useMemo(() => {
    const subset = deals.slice(0, 3);
    return subset.map((d, i) => ({
      ...d,
      hoursLeft: [4, 12, 23][i] || 24,
    }));
  }, [deals]);

  if (expiringDeals.length === 0) return null;

  return (
    <div
      className="rounded-xl border-2 overflow-hidden animate-fade-in h-full flex flex-col"
      style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}08, ${color}03)` }}
    >
      <div className="px-2 py-0.5 flex items-center gap-1" style={{ background: `${color}10` }}>
        <Clock className="w-2.5 h-2.5 text-amber-500" />
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color }}>Expiring Soon</span>
      </div>
      <div className="flex flex-col justify-between flex-1 gap-0.5 p-1.5">
        {expiringDeals.map((deal) => {
          const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];
          const urgent = deal.hoursLeft <= 6;
          return (
            <button
              key={`exp-${deal.id}`}
              className={cn(
                "rounded-md border px-1.5 py-0.5 flex items-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex-1",
                urgent ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
              )}
              onClick={() => toast.info(`Demo — ${deal.merchantName} deal would activate here`)}
            >
              <span className="text-xs">{catConfig?.icon || "🎁"}</span>
              <span className="text-[9px] font-semibold text-slate-800 whitespace-nowrap">{deal.merchantName}</span>
              <span className={cn("text-[7px] font-bold", urgent ? "text-red-500" : "text-amber-600")}>{deal.hoursLeft}h left</span>
              <span className={cn(
                "ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap",
                urgent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              )}>
                {deal.rewardValue}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Category Quick-Filter Pills ──────────────────────────────────────
function CategoryFilterPills({
  deals,
  activeCategory,
  onSelectCategory,
  color,
  profile,
}: {
  deals: BankDeal[];
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  color: string;
  profile: DerivedCustomerProfile | null;
}) {
  const personalizedCats = useMemo(() => new Set(deals.map(d => d.merchantCategory)), [deals]);

  const sortedPills = useMemo(() => {
    const spendByPillar: Record<string, number> = {};
    if (profile) {
      profile.topPillars.forEach(p => { spendByPillar[p.pillar] = p.annualSpend; });
    }
    return [...DEAL_CATEGORY_PILLS].sort((a, b) => {
      const aPersonalized = personalizedCats.has(a.key) ? 1 : 0;
      const bPersonalized = personalizedCats.has(b.key) ? 1 : 0;
      if (bPersonalized !== aPersonalized) return bPersonalized - aPersonalized;
      return (spendByPillar[b.key] || 0) - (spendByPillar[a.key] || 0);
    });
  }, [personalizedCats, profile]);

  return (
    <div className="flex gap-1 overflow-x-auto hide-scrollbar items-center">
      <button
        className={cn(
          "shrink-0 text-[9px] font-medium px-2 py-1 rounded-full transition-colors flex items-center gap-0.5",
          !activeCategory ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        )}
        style={!activeCategory ? { background: color } : undefined}
        onClick={() => { onSelectCategory(null); }}
      >
        All
      </button>
      {sortedPills.map(cat => {
        const isPersonalized = personalizedCats.has(cat.key);
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            className={cn(
              "shrink-0 text-[9px] font-medium px-2 py-1 rounded-full transition-colors flex items-center gap-0.5 whitespace-nowrap",
              isActive
                ? "text-white"
                : isPersonalized
                  ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
            style={isActive ? { background: color } : undefined}
            onClick={() => { onSelectCategory(isActive ? null : cat.key); }}
          >
            <span className="text-[10px]">{cat.emoji}</span> {cat.short}
          </button>
        );
      })}
    </div>
  );
}

// ─── Perk Card (compact) ──────────────────────────────────────────────
function PerkCard({ perk, color }: { perk: LocationPerk; color: string }) {
  const cc = CATEGORY_CONFIG[perk.category];
  const CatIcon = cc.icon;
  const catHex = CATEGORY_HEX[perk.category] || color;

  return (
    <div className="rounded-md border border-slate-100 p-1.5 hover:bg-slate-50 transition-colors flex flex-col gap-1">
      <div className="flex items-center gap-1 min-w-0">
        <div className={cn("h-4 w-4 rounded flex items-center justify-center shrink-0 border", cc.color)}>
          <CatIcon className="h-2 w-2" />
        </div>
        <span className="text-[9px] font-semibold text-slate-900 truncate">{perk.title}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[8px] text-slate-400 truncate">{perk.partner}</span>
        <span
          className="text-[7px] font-bold px-1 py-0.5 rounded shrink-0"
          style={{ background: `${catHex}12`, color: catHex }}
        >
          {perk.value}
        </span>
      </div>
    </div>
  );
}

// ─── Local Perks Section ──────────────────────────────────────────────
function LocalPerksSection({ city, perks, color }: { city: string; perks: LocationPerk[]; color: string }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [collapsed, setCollapsed] = useState(false);

  const categories = useMemo(() => [...new Set(perks.map(p => p.category))], [perks]);
  const filtered = activeCategory === "all" ? perks : perks.filter(p => p.category === activeCategory);

  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}08, ${color}03)` }}>
      <button
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" style={{ color }} />
          <span className="text-[10px] font-semibold text-slate-700">Local Deals & Perks</span>
          <span className="text-[9px] text-slate-400">{city}</span>
        </div>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", collapsed ? "-rotate-90" : "")} />
      </button>
      {!collapsed && (
        <div className="px-2 py-1.5 space-y-1.5">
          <div className="flex flex-wrap gap-1">
            <button
              className={cn(
                "text-[8px] font-medium px-1.5 py-0.5 rounded-full transition-colors",
                activeCategory === "all" ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              style={activeCategory === "all" ? { background: color } : undefined}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={cn(
                  "text-[8px] font-medium px-1.5 py-0.5 rounded-full transition-colors",
                  activeCategory === cat ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
                style={activeCategory === cat ? { background: CATEGORY_HEX[cat] || color } : undefined}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {filtered.map(perk => (
              <PerkCard key={perk.id} perk={perk} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Phone Mockup ─────────────────────────────────────────────────────
function RewardsPhoneMockup({
  customer,
  color,
  deals,
  profile,
  personalized,
  loading,
  hasEnriched,
  city,
  perks,
  enriched,
}: {
  customer: DemoCustomer;
  color: string;
  deals: BankDeal[];
  profile: DerivedCustomerProfile | null;
  personalized: Record<string, { msg: string; cta: string }>;
  loading: boolean;
  hasEnriched: boolean;
  city: string;
  perks: LocationPerk[];
  enriched?: EnrichedTransaction[];
}) {
  const firstName = "{firstname}";
  const { searchQuery, isSearching, handleSearchChange, clearSearch, matchingDealIds, searchReasoning } = useSemanticDealSearch();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  

  const isSearchActive = searchQuery.trim().length > 0;
  const queryLower = searchQuery.toLowerCase();

  // Separate hero deal (first deal) from grid deals
  const heroDeal = hasEnriched && deals.length > 0 ? deals[0] : null;
  const gridDeals = hasEnriched ? deals.slice(1) : deals;


  const filteredDeals = useMemo(() => {
    // When a category or subcategory filter is active, search the FULL deal library
    const personalizedIds = new Set(deals.map(d => d.id));
    if (categoryFilter) {
      let result = AVAILABLE_DEALS.filter(d => d.category === categoryFilter).map(convertToBankDeal);
      if (isSearchActive && matchingDealIds.length > 0) result = result.filter(d => matchingDealIds.includes(d.id));
      else if (isSearchActive && !isSearching) result = [];
      result.sort((a, b) => (personalizedIds.has(b.id) ? 1 : 0) - (personalizedIds.has(a.id) ? 1 : 0));
      return result;
    }
    // Default: use customer-specific deals — but when searching, expand to the full catalog
    if (isSearchActive) {
      let result: BankDeal[] = [];
      if (matchingDealIds.length > 0) {
        result = AVAILABLE_DEALS.map(convertToBankDeal).filter(d => matchingDealIds.includes(d.id));
        result.sort((a, b) => (personalizedIds.has(b.id) ? 1 : 0) - (personalizedIds.has(a.id) ? 1 : 0));
      }
      return result;
    }
    return gridDeals;
  }, [gridDeals, deals, isSearchActive, matchingDealIds, isSearching, categoryFilter]);


  const filteredPerks = useMemo(() => {
    if (!isSearchActive) return perks;
    return perks.filter(p =>
      p.title.toLowerCase().includes(queryLower) ||
      p.partner.toLowerCase().includes(queryLower) ||
      p.category.toLowerCase().includes(queryLower) ||
      p.value.toLowerCase().includes(queryLower)
    );
  }, [perks, isSearchActive, queryLower]);

  // Hide hero deal if search is active and it doesn't match
  const showHero = heroDeal && !isSearchActive;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-2">
          {/* Savings Summary (includes welcome greeting) */}
          <SavingsSummaryBar profile={profile} color={color} hasEnriched={hasEnriched} city={city} firstName={firstName} />

          {/* Semantic search bar */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              placeholder="Semantic search for deals, experience and perks..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
              ) : searchQuery ? (
                <button onClick={clearSearch} className="p-0"><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>
              ) : null}
            </div>
          </div>

          {/* AI reasoning chip */}
          {searchReasoning && !isSearching && (
            <div className="flex items-start gap-1.5 rounded-md bg-blue-50 border border-blue-100 px-2 py-1">
              <Sparkles className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[9px] leading-relaxed text-blue-700">{searchReasoning}</p>
            </div>
          )}

          {/* Category quick-filter pills */}
          {hasEnriched && deals.length > 0 && !isSearchActive && (
            <CategoryFilterPills
              deals={deals}
              activeCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
              color={color}
              profile={profile}
            />
          )}

          {/* Hero Spotlight + Expiring Soon Row */}
          <div className="flex gap-2">
            {showHero && heroDeal && (
              <div className="w-2/3">
                <HeroSpotlightDeal
                  deal={heroDeal}
                  personalized={personalized[heroDeal.id]}
                  color={color}
                  loading={loading}
                />
              </div>
            )}
            {hasEnriched && deals.length > 2 && !isSearchActive && (
              <div className={showHero && heroDeal ? "w-1/3" : "w-full"}>
                <ExpiringSoonRow deals={deals.slice(Math.max(deals.length - 4, 3))} color={color} />
              </div>
            )}
          </div>

          {filteredPerks.length > 0 && (
            <LocalPerksSection city={city} perks={filteredPerks} color={color} />
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {hasEnriched && filteredDeals.length > 0 ? (
              filteredDeals.map((deal, i) => {
                const p = personalized[deal.id];
                const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];
                const isForYou = deals.some(d => d.id === deal.id);

                return (
                  <div
                    key={deal.id}
                    className={cn(
                      "rounded-lg border bg-white animate-fade-in relative",
                      isForYou ? "border-blue-200 border-l-2" : "border-slate-200"
                    )}
                    style={{
                      animationDelay: `${i * 60}ms`,
                      ...(isForYou ? { borderLeftColor: color, borderLeftWidth: 2 } : {}),
                    }}
                  >
                    <div className="p-2 pb-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{catConfig?.icon || "🎁"}</span>
                          <span className="text-[12px] font-semibold text-slate-900 truncate">{deal.merchantName}</span>
                        </div>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: `${color}12`, color }}
                        >
                          {deal.rewardValue}
                        </span>
                      </div>

                      {p?.msg ? (
                        <div className="flex items-end justify-between gap-2 mt-0.5">
                          <p className="text-[10px] leading-relaxed text-slate-600 italic line-clamp-2 flex-1">"{p.msg}"</p>
                          <button
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 cursor-pointer transition-all hover:opacity-90 active:scale-95"
                            style={{ background: color }}
                            onClick={() => toast.info(`Demo — ${deal.merchantName} deal would activate here`)}
                          >
                            {p.cta || "View Deal"}
                          </button>
                        </div>
                      ) : loading ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
                          <span className="text-[9px] text-slate-300">Personalizing…</span>
                        </div>
                      ) : (
                        <div className="flex items-end justify-between gap-2 mt-0.5">
                          <p className="text-[10px] leading-relaxed text-slate-600 italic line-clamp-2 flex-1">"{getFallbackMessage(deal)}"</p>
                          <button
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 cursor-pointer transition-all hover:opacity-90 active:scale-95"
                            style={{ background: color }}
                            onClick={() => toast.info(`Demo — ${deal.merchantName} deal would activate here`)}
                          >
                            Save Today
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : !hasEnriched ? (
              customer.deals.map((deal, i) => (
                <div key={deal.brand} className="rounded-lg p-2.5 border border-slate-200 bg-white animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" style={{ color }} />
                      <p className="text-[12px] font-semibold text-slate-900">{deal.brand}</p>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}10`, color }}>{deal.tag}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${deal.match}%`, background: color }} />
                      </div>
                      <span className="text-[8px] font-semibold text-slate-400">{deal.match}%</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-[10px] text-slate-500 flex-1">{deal.offer}</p>
                    <button
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 cursor-pointer transition-all hover:opacity-90 active:scale-95"
                      style={{ background: color }}
                      onClick={() => toast.info(`Demo — ${deal.brand} deal would activate here`)}
                    >
                      View Deal
                    </button>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {hasEnriched && profile && (
            <div className="rounded-lg p-2.5 border" style={{ background: `${color}04`, borderColor: `${color}20` }}>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Matched from <span className="text-slate-900 font-medium">100+ deals</span> using{" "}
                <span className="font-medium text-slate-700">{profile.lifestyleSignals.slice(0, 3).join(", ")}</span> signals
                · {formatCurrency(profile.totalSpend)} spend
              </p>
            </div>
          )}

          {!hasEnriched && (
            <div className="rounded-lg p-2.5 border border-dashed border-slate-300 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400">
                Run <span className="font-semibold text-slate-500">Enrich</span> to activate AI deal selection
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
