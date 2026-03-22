import { useState, useEffect, useMemo } from "react";
import { Loader2, MapPin, ChevronDown, ChevronUp, Gift, Star } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { deriveCustomerProfile, getRelevantDeals, formatCurrency, type BankDeal, type DerivedCustomerProfile } from "@/lib/dealSelectionUtils";
import { DEAL_CATEGORIES, type DealCategory } from "@/lib/availableDealsData";
import { supabase } from "@/integrations/supabase/client";
import type { PersonalizedDealData } from "@/hooks/useDemoEnrichment";
import { getCityFromZip, getPerksForCity, CATEGORY_CONFIG, TIER_COLORS, type LocationPerk, type PerkCategory } from "@/lib/locationPerksData";
import { cn } from "@/lib/utils";

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

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
  precomputedA?: PersonalizedDealData | null;
  precomputedB?: PersonalizedDealData | null;
}

// Call edge function for AI personalization
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

export default function DemoRewardsView({ customerA, customerB, enrichedA, enrichedB, precomputedA, precomputedB }: Props) {
  const hasEnriched = (enrichedA?.length ?? 0) > 0 || (enrichedB?.length ?? 0) > 0;

  const profileA = useMemo(() => hasEnriched && enrichedA ? deriveCustomerProfile(enrichedA) : null, [enrichedA, hasEnriched]);
  const profileB = useMemo(() => hasEnriched && enrichedB ? deriveCustomerProfile(enrichedB) : null, [enrichedB, hasEnriched]);

  const dealsA = useMemo(() => precomputedA?.deals ?? (profileA ? getRelevantDeals(profileA, 10) : []), [precomputedA, profileA]);
  const dealsB = useMemo(() => precomputedB?.deals ?? (profileB ? getRelevantDeals(profileB, 10) : []), [precomputedB, profileB]);

  const [personalizedA, setPersonalizedA] = useState<Record<string, { msg: string; cta: string }>>({});
  const [personalizedB, setPersonalizedB] = useState<Record<string, { msg: string; cta: string }>>({});
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const effectivePersonalizedA = precomputedA?.personalized ?? personalizedA;
  const effectivePersonalizedB = precomputedB?.personalized ?? personalizedB;

  useEffect(() => {
    if (!precomputedA && dealsA.length > 0 && profileA) {
      setLoadingA(true);
      fetchPersonalization(dealsA, profileA, customerA).then(r => { setPersonalizedA(r); setLoadingA(false); });
    }
  }, [dealsA, profileA, customerA, precomputedA]);

  useEffect(() => {
    if (!precomputedB && dealsB.length > 0 && profileB) {
      setLoadingB(true);
      fetchPersonalization(dealsB, profileB, customerB).then(r => { setPersonalizedB(r); setLoadingB(false); });
    }
  }, [dealsB, profileB, customerB, precomputedB]);

  const cityA = getCityFromZip(customerA.zip);
  const cityB = getCityFromZip(customerB.zip);
  const perksA = useMemo(() => getPerksForCity(cityA), [cityA]);
  const perksB = useMemo(() => getPerksForCity(cityB), [cityB]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <RewardsPhoneMockup
        customer={customerA}
        color="#3b82f6"
        deals={dealsA}
        profile={profileA}
        personalized={effectivePersonalizedA}
        loading={!precomputedA && loadingA}
        hasEnriched={hasEnriched}
        city={cityA}
        perks={perksA}
      />
      <RewardsPhoneMockup
        customer={customerB}
        color="#10b981"
        deals={dealsB}
        profile={profileB}
        personalized={effectivePersonalizedB}
        loading={!precomputedB && loadingB}
        hasEnriched={hasEnriched}
        city={cityB}
        perks={perksB}
      />
    </div>
  );
}

// ─── Perk Card (compact) ──────────────────────────────────────────────
function PerkCard({ perk, color }: { perk: LocationPerk; color: string }) {
  const cc = CATEGORY_CONFIG[perk.category];
  const CatIcon = cc.icon;

  const catHex = CATEGORY_HEX[perk.category] || color;

  return (
    <div className="flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-slate-50 transition-colors">
      <div className={cn("h-5 w-5 rounded flex items-center justify-center shrink-0 border", cc.color)}>
        <CatIcon className="h-2.5 w-2.5" />
      </div>
      <div className="min-w-0 flex-1 flex items-center gap-1">
        <span className="text-[10px] font-semibold text-slate-900 truncate">{perk.title}</span>
        <span className="text-[9px] text-slate-400 truncate">· {perk.partner}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded"
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
  const [open, setOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => [...new Set(perks.map(p => p.category))], [perks]);

  const filtered = activeCategory === "all" ? perks : perks.filter(p => p.category === activeCategory);

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" style={{ color }} />
          <span className="text-[10px] font-semibold text-slate-700">Local Experiences</span>
          <span className="text-[9px] text-slate-400">{city}</span>
        </div>
        {open ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
      </button>
      {open && (
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
          <div className="space-y-0.5">
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
}) {
  const firstName = customer.profile.name.split(" ")[0];
  const personalizedCount = Object.keys(personalized).length;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-300" />
              <span className="w-2 h-2 rounded-full bg-yellow-300" />
              <span className="w-2 h-2 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-[8px] text-slate-400 font-mono bg-white rounded px-2 py-0.5 border border-slate-200">
                yourbank.com/rewards
              </span>
            </div>
          </div>

          {/* App content */}
          <div className="p-3 space-y-2 bg-white">
            {/* Header */}
            <div className="flex items-baseline justify-between">
              <p className="text-base font-bold text-slate-900">Your Rewards, {firstName}</p>
            </div>

            {/* Local Perks (static from locationPerksData) */}
            {perks.length > 0 && (
              <LocalPerksSection city={city} perks={perks} color={color} />
            )}

            {/* Deal Cards (scrollable) */}
            <div className="max-h-[400px] overflow-y-auto space-y-1.5 -mx-1 px-1">
              {hasEnriched && deals.length > 0 ? (
                deals.map((deal, i) => {
                  const p = personalized[deal.id];
                  const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];

                  return (
                    <div
                      key={deal.id}
                      className="rounded-lg border border-slate-200 bg-white animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms` }}
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

                        {/* AI Message + CTA */}
                        {p ? (
                          <div className="flex items-end justify-between gap-2 mt-0.5">
                            <p className="text-[10px] leading-relaxed text-slate-600 italic line-clamp-2 flex-1">"{p.msg}"</p>
                            <button
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0"
                              style={{ background: color }}
                            >
                              {p.cta}
                            </button>
                          </div>
                        ) : loading ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
                            <span className="text-[9px] text-slate-300">Personalizing…</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Static fallback */
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
                    <p className="text-[10px] text-slate-500">{deal.offer}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
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
      </div>
    </div>
  );
}
