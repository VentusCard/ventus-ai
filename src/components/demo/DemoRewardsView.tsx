import { useState, useEffect, useMemo } from "react";
import { Sparkles, Loader2, Target, MapPin, ChevronDown, ChevronUp, Gift } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { deriveCustomerProfile, getRelevantDeals, formatCurrency, type BankDeal, type DerivedCustomerProfile } from "@/lib/dealSelectionUtils";
import { DEAL_CATEGORIES, type DealCategory } from "@/lib/availableDealsData";
import { supabase } from "@/integrations/supabase/client";
import type { PersonalizedDealData, LocalExperienceDeal } from "@/hooks/useDemoEnrichment";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
  precomputedA?: PersonalizedDealData | null;
  precomputedB?: PersonalizedDealData | null;
  localExperiencesA?: { destination: string; deals: LocalExperienceDeal[] }[];
  localExperiencesB?: { destination: string; deals: LocalExperienceDeal[] }[];
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

export default function DemoRewardsView({ customerA, customerB, enrichedA, enrichedB, precomputedA, precomputedB, localExperiencesA, localExperiencesB }: Props) {
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <RewardsPhoneMockup
        customer={customerA}
        color="#3b82f6"
        deals={dealsA}
        profile={profileA}
        personalized={effectivePersonalizedA}
        loading={!precomputedA && loadingA}
        localExperiences={localExperiencesA}
        hasEnriched={hasEnriched}
      />
      <RewardsPhoneMockup
        customer={customerB}
        color="#10b981"
        deals={dealsB}
        profile={profileB}
        personalized={effectivePersonalizedB}
        loading={!precomputedB && loadingB}
        localExperiences={localExperiencesB}
        hasEnriched={hasEnriched}
      />
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
  localExperiences,
  hasEnriched,
}: {
  customer: DemoCustomer;
  color: string;
  deals: BankDeal[];
  profile: DerivedCustomerProfile | null;
  personalized: Record<string, { msg: string; cta: string }>;
  loading: boolean;
  localExperiences?: { destination: string; deals: LocalExperienceDeal[] }[];
  hasEnriched: boolean;
}) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [localOpen, setLocalOpen] = useState(true);
  const firstName = customer.profile.name.split(" ")[0];
  const personalizedCount = Object.keys(personalized).length;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[380px]">
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
          <div className="p-4 space-y-2.5 bg-white">
            {/* Header */}
            <div>
              <p className="text-base font-bold text-slate-900">Your Rewards, {firstName}</p>
              <p className="text-[10px] text-slate-400">Personalized offers based on your lifestyle</p>
            </div>

            {/* Lifestyle banner */}
            <div className="rounded-lg px-3 py-2.5" style={{ background: `linear-gradient(135deg, ${color}, ${color}90)` }}>
              <p className="text-[8px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
                Your Lifestyle
              </p>
              <p className="text-sm font-bold text-white uppercase">{customer.lifestyleType}</p>
              {profile && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {profile.topPillars.slice(0, 3).map(p => {
                    const catConfig = DEAL_CATEGORIES[p.pillar as DealCategory];
                    return (
                      <span key={p.pillar} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                        {catConfig?.icon || "📊"} {p.pillar.split(" ")[0]}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Local Experiences */}
            {localExperiences && localExperiences.length > 0 && (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                  onClick={() => setLocalOpen(!localOpen)}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" style={{ color }} />
                    <span className="text-[10px] font-semibold text-slate-700">Local Experiences</span>
                    <span className="text-[9px] text-slate-400">
                      {localExperiences.map(le => le.destination).join(", ")}
                    </span>
                  </div>
                  {localOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                </button>
                {localOpen && (
                  <div className="px-3 py-2 space-y-2">
                    {localExperiences.map(le => (
                      <div key={le.destination}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color }}>
                          📍 {le.destination}
                        </p>
                        <div className="space-y-1">
                          {le.deals.slice(0, 4).map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-700 font-medium truncate">{d.merchantExample}</span>
                              <span className="text-slate-400 text-[9px] ml-auto shrink-0">{d.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deal count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">{deals.length} deals</span> matched to you
                </span>
              </div>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
              {!loading && personalizedCount > 0 && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${color}10`, color }}>
                  {personalizedCount} personalized
                </span>
              )}
            </div>

            {/* Deal Cards (scrollable) */}
            <div className="max-h-[400px] overflow-y-auto space-y-1.5 -mx-1 px-1">
              {hasEnriched && deals.length > 0 ? (
                deals.map((deal, i) => {
                  const p = personalized[deal.id];
                  const isExpanded = expandedDeal === deal.id;
                  const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];

                  return (
                    <div
                      key={deal.id}
                      className="rounded-lg border border-slate-200 bg-white animate-fade-in cursor-pointer transition-all hover:shadow-sm"
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                    >
                      <div className="p-2.5 pb-1.5">
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

                        <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">{deal.dealTitle}</p>

                        {/* AI Message */}
                        {p ? (
                          <div className="flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 shrink-0 mt-0.5" style={{ color }} />
                            <p className="text-[10px] leading-relaxed text-slate-700 italic line-clamp-2">"{p.msg}"</p>
                          </div>
                        ) : loading ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
                            <span className="text-[9px] text-slate-300">Personalizing…</span>
                          </div>
                        ) : null}

                        {/* CTA */}
                        {p && (
                          <div className="mt-1.5 flex items-center justify-between">
                            <button
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white"
                              style={{ background: color }}
                            >
                              {p.cta}
                            </button>
                            <span className="text-[8px] text-slate-400">{deal.subcategory}</span>
                          </div>
                        )}
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-2.5 pb-2 pt-1 border-t border-slate-100">
                          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                            <div>
                              <span className="text-slate-400">Category</span>
                              <p className="font-medium text-slate-700">{deal.merchantCategory}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Popularity</span>
                              <p className="font-medium text-slate-700 capitalize">{deal.popularity}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Activations</span>
                              <p className="font-medium text-slate-700">{deal.activationCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Match Reason</span>
                              <p className="font-medium text-slate-700">
                                {profile?.topPillars.some(tp => tp.pillar === deal.merchantCategory)
                                  ? `${deal.merchantCategory.split(" ")[0]} spending`
                                  : "Discovery pick"
                                }
                              </p>
                            </div>
                          </div>
                          {p && (
                            <div className="mt-1.5 rounded-md p-2" style={{ background: `${color}06` }}>
                              <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
                                ✨ AI Personalization
                              </p>
                              <p className="text-[10px] text-slate-600 leading-relaxed">{p.msg}</p>
                            </div>
                          )}
                        </div>
                      )}
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
