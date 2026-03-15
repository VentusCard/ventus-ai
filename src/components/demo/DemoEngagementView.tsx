import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { calculateAchievements, calculateHealthScore, getLevel } from "@/lib/achievementEngine";
import { generateFinancialTip } from "@/lib/wellnessIntelligenceEngine";
import { PiggyBank, Shield, TrendingDown, LayoutGrid, Plane, Heart, Lightbulb, Trophy, Star } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  PiggyBank, Shield, TrendingDown, LayoutGrid, Plane, Heart, Lightbulb, Trophy, Star,
};

export default function DemoEngagementView({ customerA, customerB, enrichedA, enrichedB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PhoneMockup customer={customerA} color="#3b82f6" enrichedTransactions={enrichedA} />
      <PhoneMockup customer={customerB} color="#10b981" enrichedTransactions={enrichedB} />
    </div>
  );
}

interface SpendingItem {
  name: string;
  icon: string;
  spend: number;
  budget: number;
}

function computeSpending(customer: DemoCustomer, enriched?: EnrichedTransaction[]): SpendingItem[] {
  if (enriched && enriched.length > 0) {
    const pillarMap = new Map<string, number>();
    enriched.forEach((t) => {
      const current = pillarMap.get(t.pillar) || 0;
      pillarMap.set(t.pillar, current + Math.abs(t.amount));
    });
    const pillarIcons: Record<string, string> = {
      "Travel": "✈️", "Dining": "🍽️", "Shopping": "🛍️", "Wellness": "💪",
      "Entertainment": "🎬", "Home": "🏠", "Transportation": "🚗", "Subscriptions": "📱",
      "Health": "❤️", "Education": "📚", "Groceries": "🛒", "Personal Care": "💆",
    };
    return Array.from(pillarMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, spend]) => ({
        name,
        icon: pillarIcons[name] || "📊",
        spend: Math.round(spend),
        budget: Math.round(spend * (1 + Math.random() * 0.3)),
      }));
  }
  return customer.topPillars.map((p) => ({
    name: p.name,
    icon: p.icon,
    spend: parseInt(p.spend.replace(/[$,]/g, "")),
    budget: Math.round(parseInt(p.spend.replace(/[$,]/g, "")) * (1 + Math.random() * 0.3)),
  }));
}

function PhoneMockup({ customer, color, enrichedTransactions }: { customer: DemoCustomer; color: string; enrichedTransactions?: EnrichedTransaction[] }) {
  const firstName = customer.profile.name.split(" ")[0];
  const budgets = computeSpending(customer, enrichedTransactions);

  const achievements = enrichedTransactions?.length ? calculateAchievements(enrichedTransactions) : [];
  const healthScore = calculateHealthScore(achievements);
  const level = getLevel(healthScore);
  const featuredAchievement = achievements.find((a) => a.status === "in_progress") || achievements.find((a) => a.status === "unlocked") || achievements[0];

  const tip = enrichedTransactions?.length ? generateFinancialTip(enrichedTransactions) : null;
  const TipIcon = tip ? ICON_MAP[tip.icon] || Lightbulb : Lightbulb;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[340px]">
        {/* Phone frame */}
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
                yourbank.com/app
              </span>
            </div>
          </div>

          {/* App content */}
          <div className="p-4 space-y-3 bg-white">
            <div>
              <p className="text-base font-bold text-slate-900">Good morning, {firstName}</p>
              <p className="text-[10px] text-slate-400">Your personalized banking experience</p>
            </div>

            {/* Lifestyle banner */}
            <div
              className="rounded-lg px-3 py-3"
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

            {/* Lifestyle Spending — main content */}
            <div>
              <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase mb-2">Your Lifestyle Spending</p>
              <div className="grid grid-cols-2 gap-1.5">
                {budgets.slice(0, 4).map((b) => {
                  const pct = Math.min((b.spend / b.budget) * 100, 100);
                  const isOver = b.spend > b.budget;
                  const barColor = isOver ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e";
                  return (
                    <div key={b.name} className="rounded-lg px-2.5 py-2 bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{b.icon}</span>
                        <span className="text-[10px] font-semibold text-slate-900">{b.name}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 mb-1">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      <p className="text-[8px] text-slate-400">${b.spend.toLocaleString()} / ${b.budget.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievement Card */}
            {featuredAchievement && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-3">
                <div className="flex items-center justify-between mb-1.5">
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
                <p className="text-[8px] text-slate-500 mb-1.5">{featuredAchievement.description}</p>
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
            {tip && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
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
                <p className="text-[10px] text-slate-700 leading-relaxed mb-2">{tip.message}</p>
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
    </div>
  );
}
