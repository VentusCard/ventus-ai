import { useState, useEffect, useMemo } from "react";
import { Sparkles, Loader2, Target, TrendingUp, Zap } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { deriveCustomerProfile, getRelevantDeals, formatCurrency, type BankDeal, type DerivedCustomerProfile } from "@/lib/dealSelectionUtils";
import { DEAL_CATEGORIES, type DealCategory } from "@/lib/availableDealsData";
import { supabase } from "@/integrations/supabase/client";
import type { PersonalizedDealData } from "@/hooks/useDemoEnrichment";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}

interface PersonalizedDeal extends BankDeal {
  aiMessage?: string;
  aiCta?: string;
  isPersonalized?: boolean;
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

export default function DemoRewardsView({ customerA, customerB, enrichedA, enrichedB }: Props) {
  const hasEnriched = (enrichedA?.length ?? 0) > 0 || (enrichedB?.length ?? 0) > 0;

  // Derive profiles from enriched transactions
  const profileA = useMemo(() => hasEnriched && enrichedA ? deriveCustomerProfile(enrichedA) : null, [enrichedA, hasEnriched]);
  const profileB = useMemo(() => hasEnriched && enrichedB ? deriveCustomerProfile(enrichedB) : null, [enrichedB, hasEnriched]);

  // Select deals from library based on profiles
  const dealsA = useMemo(() => profileA ? getRelevantDeals(profileA, 10) : [], [profileA]);
  const dealsB = useMemo(() => profileB ? getRelevantDeals(profileB, 10) : [], [profileB]);

  // AI personalization state
  const [personalizedA, setPersonalizedA] = useState<Record<string, { msg: string; cta: string }>>({});
  const [personalizedB, setPersonalizedB] = useState<Record<string, { msg: string; cta: string }>>({});
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch AI personalization when deals are ready
  useEffect(() => {
    if (dealsA.length > 0 && profileA) {
      setLoadingA(true);
      fetchPersonalization(dealsA, profileA, customerA).then(r => { setPersonalizedA(r); setLoadingA(false); });
    }
  }, [dealsA, profileA, customerA]);

  useEffect(() => {
    if (dealsB.length > 0 && profileB) {
      setLoadingB(true);
      fetchPersonalization(dealsB, profileB, customerB).then(r => { setPersonalizedB(r); setLoadingB(false); });
    }
  }, [dealsB, profileB, customerB]);

  // Find shared merchants between the two deal sets
  const sharedMerchants = useMemo(() => {
    const merchantsA = new Set(dealsA.map(d => d.merchantName));
    return new Set(dealsB.filter(d => merchantsA.has(d.merchantName)).map(d => d.merchantName));
  }, [dealsA, dealsB]);

  // Fallback: if no enriched data, show static deals
  if (!hasEnriched) {
    return <StaticFallback customerA={customerA} customerB={customerB} />;
  }

  return (
    <div className="space-y-4">
      {/* Concept Header */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">AI Deal Selection & Personalization</span>
        </div>
        <p className="text-[11px] text-emerald-600/80 leading-relaxed">
          Deals auto-selected from a library of <span className="font-semibold text-emerald-700">100+ merchant offers</span> based on each customer's enriched transaction profile. 
          AI generates unique messaging per customer — same deal, different story.
          {sharedMerchants.size > 0 && (
            <span className="ml-1">
              <span className="font-semibold text-emerald-700">{sharedMerchants.size} shared merchant{sharedMerchants.size > 1 ? "s" : ""}</span> highlighted below.
            </span>
          )}
        </p>
      </div>

      {/* Side-by-side Columns */}
      <div className="grid grid-cols-2 gap-5">
        <CustomerDealsColumn
          customer={customerA}
          profile={profileA!}
          deals={dealsA}
          personalized={personalizedA}
          loading={loadingA}
          color="#3b82f6"
          sharedMerchants={sharedMerchants}
        />
        <CustomerDealsColumn
          customer={customerB}
          profile={profileB!}
          deals={dealsB}
          personalized={personalizedB}
          loading={loadingB}
          color="#10b981"
          sharedMerchants={sharedMerchants}
        />
      </div>
    </div>
  );
}

// ─── Customer Column ──────────────────────────────────────────────────
function CustomerDealsColumn({
  customer,
  profile,
  deals,
  personalized,
  loading,
  color,
  sharedMerchants,
}: {
  customer: DemoCustomer;
  profile: DerivedCustomerProfile;
  deals: BankDeal[];
  personalized: Record<string, { msg: string; cta: string }>;
  loading: boolean;
  color: string;
  sharedMerchants: Set<string>;
}) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Lifestyle Pills */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1.5">Top Lifestyle Pillars</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.topPillars.slice(0, 4).map(p => {
            const catConfig = DEAL_CATEGORIES[p.pillar as DealCategory];
            return (
              <span
                key={p.pillar}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  background: `${color}08`,
                  borderColor: `${color}20`,
                  color: color,
                }}
              >
                {catConfig?.icon || "📊"} {p.pillar.split(" ")[0]} · {formatCurrency(p.annualSpend)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Deal count + selection method */}
      <div className="flex items-center gap-2">
        <Target className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-500">
          <span className="font-semibold text-slate-700">{deals.length} deals</span> selected from library
        </span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
      </div>

      {/* Deal Cards */}
      <div className="space-y-2">
        {deals.map((deal, i) => {
          const p = personalized[deal.id];
          const isShared = sharedMerchants.has(deal.merchantName);
          const isExpanded = expandedDeal === deal.id;
          const catConfig = DEAL_CATEGORIES[deal.merchantCategory as DealCategory];

          return (
            <div
              key={deal.id}
              className="rounded-lg border bg-white animate-fade-in cursor-pointer transition-all hover:shadow-sm"
              style={{
                animationDelay: `${i * 80}ms`,
                borderColor: isShared ? `${color}40` : "#e2e8f0",
                boxShadow: isShared ? `0 0 0 1px ${color}15` : undefined,
              }}
              onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
            >
              {/* Card Header */}
              <div className="p-2.5 pb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{catConfig?.icon || "🎁"}</span>
                    <span className="text-sm font-semibold text-slate-900 truncate">{deal.merchantName}</span>
                    {isShared && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium shrink-0">
                        SHARED
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: `${color}12`, color }}
                  >
                    {deal.rewardValue}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1">{deal.dealTitle}</p>

                {/* AI Message */}
                {p ? (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 shrink-0 mt-0.5" style={{ color }} />
                    <p className="text-[11px] leading-relaxed text-slate-700 italic">"{p.msg}"</p>
                  </div>
                ) : loading ? (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
                    <span className="text-[10px] text-slate-300">Personalizing…</span>
                  </div>
                ) : null}

                {/* CTA */}
                {p && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <button
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                      style={{ background: color, color: "white" }}
                    >
                      {p.cta}
                    </button>
                    <span className="text-[9px] text-slate-400">{deal.subcategory}</span>
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
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
                      <span className="text-slate-400">Selection Reason</span>
                      <p className="font-medium text-slate-700">
                        {profile.topPillars.some(p => p.pillar === deal.merchantCategory)
                          ? `Matches ${deal.merchantCategory.split(" ")[0]} spending`
                          : "Discovery pick"
                        }
                      </p>
                    </div>
                  </div>
                  {p && (
                    <div className="mt-2 rounded-md p-2" style={{ background: `${color}06` }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
                        AI Personalization
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{p.msg}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Profile Summary */}
      <div className="rounded-lg p-3 border" style={{ background: `${color}04`, borderColor: `${color}20` }}>
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-3 h-3" style={{ color }} />
          <p className="text-[10px] font-semibold" style={{ color }}>Selection Intelligence</p>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Deals matched from <span className="text-slate-900 font-medium">100+ merchant library</span> based on{" "}
          <span className="font-medium text-slate-700">{profile.lifestyleSignals.slice(0, 3).join(", ")}</span> signals 
          across {formatCurrency(profile.totalSpend)} total spend.
        </p>
      </div>
    </div>
  );
}

// ─── Static Fallback (pre-enrichment) ───────────────────────────────────
function StaticFallback({ customerA, customerB }: { customerA: DemoCustomer; customerB: DemoCustomer }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StaticColumn customer={customerA} color="#3b82f6" />
      <StaticColumn customer={customerB} color="#10b981" />
    </div>
  );
}

function StaticColumn({ customer, color }: { customer: DemoCustomer; color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-3.5 h-3.5" style={{ color }} />
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>Static Deals (Run Enrichment for AI)</p>
      </div>

      {customer.deals.map((deal, i) => (
        <div key={deal.brand} className="rounded-lg p-3 border border-slate-200 bg-white animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{deal.brand}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}10`, color }}>{deal.tag}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${deal.match}%`, background: color }} />
              </div>
              <span className="text-[9px] font-semibold text-slate-400">{deal.match}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">{deal.offer}</p>
        </div>
      ))}

      <div className="rounded-lg p-3 border border-dashed border-slate-300 bg-slate-50 text-center">
        <p className="text-[11px] text-slate-400">
          Run <span className="font-semibold text-slate-500">Enrich</span> to activate AI deal selection from the 100+ deal library
        </p>
      </div>
    </div>
  );
}
