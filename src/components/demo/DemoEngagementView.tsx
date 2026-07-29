import { useState, useEffect } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import type { FinancialTip } from "@/lib/wellnessIntelligenceEngine";
import { calculateAchievements, calculateHealthScore, getLevel } from "@/lib/achievementEngine";
import { hashString, getBudgetStatus, initializeBudgets } from "@/lib/budgetUtils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PiggyBank, Shield, TrendingDown, LayoutGrid, Plane, Heart, Lightbulb, Trophy, Star, ChevronDown, ChevronUp, MapPin } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  PiggyBank, Shield, TrendingDown, LayoutGrid, Plane, Heart, Lightbulb, Trophy, Star,
};

interface Props {
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  tip?: FinancialTip | null;
}

export default function DemoEngagementView({ customer, enriched, tip: prefetchedTip }: Props) {
  return (
    <div className="flex justify-center">
      <PhoneMockup customer={customer} color="#3b82f6" enrichedTransactions={enriched} prefetchedTip={prefetchedTip} />
    </div>
  );
}

interface SpendingItem {
  name: string;
  icon: string;
  spend: number;
  pct: number;
  subcategories: { category: string; count: number; total: number }[];
}

function computeSpending(customer: DemoCustomer, enriched?: EnrichedTransaction[]): SpendingItem[] {
  if (enriched && enriched.length > 0) {
    const pillarMap = new Map<string, { total: number; categories: Map<string, { count: number; total: number }> }>();
    let grandTotal = 0;
    enriched.forEach((t) => {
      const amt = Math.abs(t.amount);
      grandTotal += amt;
      const entry = pillarMap.get(t.pillar) || { total: 0, categories: new Map() };
      entry.total += amt;
      const catKey = t.category || "General";
      const cat = entry.categories.get(catKey) || { count: 0, total: 0 };
      cat.count += 1;
      cat.total += amt;
      entry.categories.set(catKey, cat);
      pillarMap.set(t.pillar, entry);
    });
    const pillarIcons: Record<string, string> = {
      "Travel": "✈️", "Dining": "🍽️", "Shopping": "🛍️", "Wellness": "💪",
      "Entertainment": "🎬", "Home": "🏠", "Transportation": "🚗", "Subscriptions": "📱",
      "Health": "❤️", "Education": "📚", "Groceries": "🛒", "Personal Care": "💆",
      "Food": "🍽️", "Active Living": "🏃",
    };
    return Array.from(pillarMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 4)
      .map(([name, data]) => ({
        name,
        icon: pillarIcons[name] || "📊",
        spend: Math.round(data.total),
        pct: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0,
        subcategories: Array.from(data.categories.entries())
          .map(([category, s]) => ({ category, count: s.count, total: Math.round(s.total) }))
          .sort((a, b) => b.total - a.total),
      }));
  }
  return customer.topPillars.map((p) => ({
    name: p.name,
    icon: p.icon,
    spend: parseInt(p.spend.replace(/[$,]/g, "")),
    pct: p.pct,
    subcategories: [],
  }));
}

function computeTripRows(customer: DemoCustomer, enriched?: EnrichedTransaction[]): { destination: string; spend: number }[] {
  if (enriched && enriched.length > 0) {
    const tripMap = new Map<string, number>();
    enriched.forEach((t) => {
      if (t.trip_label) {
        const labelParts = t.trip_label.split(" ");
        const dest = labelParts.slice(1).join(" ");
        if (dest) {
          tripMap.set(dest, (tripMap.get(dest) || 0) + Math.abs(t.amount));
        }
      }
    });
    if (tripMap.size > 0) {
      return Array.from(tripMap.entries())
        .map(([destination, spend]) => ({ destination, spend: Math.round(spend) }))
        .sort((a, b) => b.spend - a.spend);
    }
  }
  if (customer.trips.length > 0) {
    return customer.trips.map((t) => ({
      destination: t.destination,
      spend: parseInt(t.spend.replace(/[$,]/g, "")),
    }));
  }
  return [];
}

function PhoneMockup({ customer, color, enrichedTransactions, prefetchedTip }: { customer: DemoCustomer; color: string; enrichedTransactions?: EnrichedTransaction[]; prefetchedTip?: FinancialTip | null }) {
  const firstName = "{firstname}";
  const spending = computeSpending(customer, enrichedTransactions);
  const tripRows = computeTripRows(customer, enrichedTransactions);
  const hasTravel = spending.some((b) => b.name === "Travel");
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(() => new Set(spending.slice(0, 4).map(s => s.name)));
  const [tripViewOn, setTripViewOn] = useState(true);

  const budgetMap = initializeBudgets(spending.map((s) => ({ pillar: s.name, totalSpend: s.spend })));
  const budgets = spending.map((s) => ({
    ...s,
    budget: budgetMap[s.name] || Math.round(s.spend * 1.2),
  }));

  const achievements = enrichedTransactions?.length ? calculateAchievements(enrichedTransactions) : [];
  const healthScore = calculateHealthScore(achievements);
  const level = getLevel(healthScore);
  const featuredAchievement = achievements.find((a) => a.status === "in_progress") || achievements.find((a) => a.status === "unlocked") || achievements[0];

  const [tip, setTip] = useState<FinancialTip | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  useEffect(() => {
    if (prefetchedTip !== undefined) {
      setTip(prefetchedTip);
      setIsLoadingTip(false);
      return;
    }
    if (!enrichedTransactions?.length) {
      setTip(null);
      return;
    }
    let cancelled = false;
    const fetchTip = async () => {
      setIsLoadingTip(true);
      try {
        const customerContext = {
          name: customer.profile.name,
          lifestyleType: customer.lifestyleType,
          segment: customer.profile.segment,
          demographics: customer.profile.demographics,
          holdings: customer.profile.holdings,
        };
        const { data, error } = await supabase.functions.invoke('generate-financial-tip', {
          body: { transactions: enrichedTransactions, customer: customerContext },
        });
        if (!cancelled && data && !error) {
          setTip(data);
        }
      } catch (e) {
        console.error('Failed to generate financial tip:', e);
      } finally {
        if (!cancelled) setIsLoadingTip(false);
      }
    };
    fetchTip();
    return () => { cancelled = true; };
  }, [enrichedTransactions, customer, prefetchedTip]);

  const TipIcon = tip ? ICON_MAP[tip.icon] || Lightbulb : Lightbulb;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-2.5">
          <div>
            <p className="text-base font-bold text-slate-900">Good morning, {firstName}</p>
            
          </div>

          {/* Lifestyle banner */}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}90)` }}
          >
            <p className="text-[8px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
              Your Lifestyle
            </p>
            <p className="text-sm font-bold text-white uppercase">{customer.lifestyleType}</p>
            <p className="text-[10px] text-white/70 mt-0.5">
              Top spending: {budgets[0]?.name} & {budgets[1]?.name}
            </p>
          </div>

          {/* Lifestyle Spending */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase mb-1.5">Your Lifestyle Spending</p>
            <div className="grid grid-cols-2 gap-2.5">
              {budgets.slice(0, 4).map((b) => {
                const isTravel = b.name === "Travel";
                const isExpanded = expandedPillars.has(b.name);
                const hasSubcats = b.subcategories.length > 0;
                const showTripView = isTravel && tripViewOn && tripRows.length > 0;
                const ratio = b.budget > 0 ? b.spend / b.budget : 0;
                const { color: barColor, label: statusLabel } = getBudgetStatus(b.spend, b.budget);

                return (
                  <div
                    key={b.name}
                    className={`rounded-lg px-3.5 py-3 bg-slate-50 border border-slate-200 transition-all ${hasSubcats || isTravel ? "cursor-pointer hover:border-slate-300" : ""}`}
                    onClick={() => (hasSubcats || isTravel) && setExpandedPillars(prev => { const next = new Set(prev); if (next.has(b.name)) next.delete(b.name); else next.add(b.name); return next; })}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{b.icon}</span>
                      <span className="text-[13px] font-semibold text-slate-900 flex-1">{b.name}</span>
                      {isTravel && tripRows.length > 0 && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] text-slate-400">Trips</span>
                          <Switch
                            checked={tripViewOn}
                            onCheckedChange={setTripViewOn}
                            className="h-3 w-6 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300"
                          />
                        </div>
                      )}
                      {(hasSubcats || isTravel) && (
                        isExpanded
                          ? <ChevronUp className="w-3 h-3 text-slate-400" />
                          : <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>

                    {/* Budget bar */}
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] text-slate-500">${b.spend.toLocaleString()} / ${b.budget.toLocaleString()}</p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${barColor}18`, color: barColor }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 mb-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(ratio * 100, 100)}%`, background: barColor }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                        {showTripView ? (
                          tripRows.slice(0, 4).map((trip) => (
                            <div key={trip.destination} className="flex items-center gap-1.5 text-[11px]">
                              <MapPin className="w-3 h-3 shrink-0" style={{ color }} />
                              <span className="text-slate-600 truncate flex-1">{trip.destination}</span>
                              <span className="text-slate-900 font-semibold whitespace-nowrap">${trip.spend.toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          b.subcategories.slice(0, 5).map((sub) => (
                            <div key={sub.category} className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 truncate mr-1">{sub.category}</span>
                              <span className="text-slate-400 whitespace-nowrap">{sub.count}x · ${sub.total.toLocaleString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement + Coaching Tip — side by side */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Achievement Card */}
            {featuredAchievement && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold tracking-[0.1em] text-slate-400 uppercase">Achievement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {level.label}
                    </span>
                    <span className="text-[8px] font-semibold text-amber-600">{healthScore}/100</span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-900">{featuredAchievement.title}</p>
                <p className="text-[8px] text-slate-500 mb-1">{featuredAchievement.description}</p>
                <div className="w-full h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(featuredAchievement.progress.current / featuredAchievement.progress.target) * 100}%`,
                      background: featuredAchievement.status === "unlocked" ? "#22c55e" : color,
                    }}
                  />
                </div>
                <p className="text-[7px] text-slate-400 mt-0.5">
                  {featuredAchievement.progress.current}/{featuredAchievement.progress.target}
                  {featuredAchievement.status === "unlocked" && " ✓ Complete"}
                </p>
              </div>
            )}

            {/* Coaching Tip Card */}
            {isLoadingTip && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-2.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-16 h-4 rounded-full" />
                </div>
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-3/4 h-3" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="w-12 h-5 rounded-full" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
              </div>
            )}
            {!isLoadingTip && tip && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${color}15` }}>
                    <TipIcon className="w-3 h-3" style={{ color }} />
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
                    {tip.category}
                  </span>
                  {tip.potentialSavings && (
                    <span className="text-[8px] font-semibold text-emerald-600 ml-auto">Save {tip.potentialSavings}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-700 leading-relaxed mb-1.5">{tip.message}</p>
                <div className="flex gap-1.5">
                  <button className="text-[8px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                    Got it
                  </button>
                  <button className="text-[8px] font-semibold px-2.5 py-1 rounded-full text-white transition-colors" style={{ background: color }}>
                    Need help
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
