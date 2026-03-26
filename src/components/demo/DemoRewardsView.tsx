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

interface Props {
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  precomputed?: PersonalizedDealData | null;
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

export default function DemoRewardsView({ customer, enriched, precomputed }: Props) {
  const hasEnriched = (enriched?.length ?? 0) > 0;

  const profile = useMemo(() => hasEnriched && enriched ? deriveCustomerProfile(enriched) : null, [enriched, hasEnriched]);
  const deals = useMemo(() => precomputed?.deals ?? (profile ? getRelevantDeals(profile, 10) : []), [precomputed, profile]);

  const [personalized, setPersonalized] = useState<Record<string, { msg: string; cta: string }>>({});
  const [loading, setLoading] = useState(false);

  const effectivePersonalized = precomputed?.personalized ?? personalized;

  useEffect(() => {
    if (!precomputed && deals.length > 0 && profile) {
      setLoading(true);
      fetchPersonalization(deals, profile, customer).then(r => { setPersonalized(r); setLoading(false); });
    }
  }, [deals, profile, customer, precomputed]);

  const city = getCityFromZip(customer.zip);
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

  return (
    <div className="w-full max-w-[820px]">
      {/* iPad frame */}
      <div className="rounded-[2rem] border-[10px] border-slate-300 overflow-hidden bg-slate-200" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        {/* Camera */}
        <div className="flex justify-center py-1 bg-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
        </div>

        {/* Screen */}
        <div className="bg-slate-50 rounded-sm overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1 bg-white border-b border-slate-100">
            <span className="text-[9px] font-semibold text-slate-500">9:41 AM</span>
            <span className="text-[9px] text-slate-400 font-mono">TCBY Bank</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2 rounded-sm border border-slate-400 relative">
                <div className="absolute inset-0.5 bg-green-500 rounded-[1px]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="p-4">
            <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-bold text-slate-900">Welcome to {city}, {firstName}!</p>
          </div>

          {perks.length > 0 && (
            <LocalPerksSection city={city} perks={perks} color={color} />
          )}

          <div className="grid grid-cols-2 gap-1.5">
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

                      {p ? (
                        <div className="flex items-end justify-between gap-2 mt-0.5">
                          <p className="text-[10px] leading-relaxed text-slate-600 italic line-clamp-2 flex-1">"{p.msg}"</p>
                          <button
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 cursor-pointer transition-all hover:opacity-90 active:scale-95"
                            style={{ background: color }}
                            onClick={() => toast.info(`Demo — ${deal.merchantName} deal would activate here`)}
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
            )}
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
        </div>
      </div>
    </div>
  );
}
