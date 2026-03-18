import type { DemoCustomer } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, ArrowUpCircle, CreditCard, Home, PiggyBank, BarChart3, Plane, UtensilsCrossed, Dumbbell, ShoppingBag } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

interface ProductRecommendation {
  product: string;
  match: number;
  signalType: "Life Event" | "Spending Pattern" | "Upgrade";
  rationale: string;
  annualValue: string;
}

function deriveRecommendations(customer: DemoCustomer): ProductRecommendation[] {
  const recs: ProductRecommendation[] = [];
  const holdings = customer.profile.holdings;
  const pillars = customer.topPillars;
  const events = customer.lifeEvents;

  // Life-event-driven
  for (const event of events) {
    if (event.name.toLowerCase().includes("home purchase")) {
      if (holdings.mortgage === "$0") {
        recs.push({ product: "Mortgage Pre-Approval", match: Math.min(event.confidence + 5, 98), signalType: "Life Event", rationale: `"${event.name}" detected (${event.confidence}% confidence) — no existing mortgage on file.`, annualValue: "$2,400" });
      }
      recs.push({ product: "Home Equity Line of Credit", match: Math.min(event.confidence - 2, 95), signalType: "Life Event", rationale: `Home purchase timeline ${event.timing} — HELOC pre-qualification opportunity.`, annualValue: "$1,800" });
    }
    if (event.name.toLowerCase().includes("family") || event.name.toLowerCase().includes("baby") || event.name.toLowerCase().includes("child")) {
      recs.push({ product: "529 Education Savings Plan", match: Math.min(event.confidence + 3, 96), signalType: "Life Event", rationale: `"${event.name}" signals detected — early college savings maximizes compound growth.`, annualValue: "$1,200" });
    }
    if (event.name.toLowerCase().includes("career") || event.name.toLowerCase().includes("advancement")) {
      recs.push({ product: "Investment Advisory Account", match: Math.min(event.confidence + 1, 94), signalType: "Life Event", rationale: `Career advancement likely increases income — advisory relationship captures new wealth.`, annualValue: "$3,200" });
    }
    if (event.name.toLowerCase().includes("retirement")) {
      recs.push({ product: "Retirement Planning Suite", match: Math.min(event.confidence + 4, 97), signalType: "Life Event", rationale: `Retirement planning signals detected — comprehensive wealth transfer opportunity.`, annualValue: "$4,500" });
    }
  }

  // Spending-pattern-driven
  const travelPillar = pillars.find(p => p.name.toLowerCase() === "travel");
  if (travelPillar && travelPillar.pct >= 15) {
    recs.push({ product: "Travel Rewards Card", match: 78 + Math.round(travelPillar.pct * 0.5), signalType: "Spending Pattern", rationale: `Travel is ${travelPillar.pct}% of spend (${travelPillar.spend}) — currently on non-travel card.`, annualValue: `$${Math.round(parseInt(travelPillar.spend.replace(/[^0-9]/g, "")) * 0.03)}` });
  }
  const diningPillar = pillars.find(p => p.name.toLowerCase() === "dining");
  if (diningPillar && diningPillar.pct >= 15) {
    recs.push({ product: "Dining Cash Back Card", match: 74 + Math.round(diningPillar.pct * 0.4), signalType: "Spending Pattern", rationale: `Dining represents ${diningPillar.pct}% of monthly spend (${diningPillar.spend}) — high category concentration.`, annualValue: `$${Math.round(parseInt(diningPillar.spend.replace(/[^0-9]/g, "")) * 0.04)}` });
  }
  const fitnessPillar = pillars.find(p => ["fitness", "wellness"].includes(p.name.toLowerCase()));
  if (fitnessPillar && fitnessPillar.pct >= 12) {
    recs.push({ product: "Wellness Benefits Card", match: 70 + Math.round(fitnessPillar.pct * 0.4), signalType: "Spending Pattern", rationale: `${fitnessPillar.name} spend at ${fitnessPillar.pct}% (${fitnessPillar.spend}) — wellness rewards card unlocks 5x points.`, annualValue: `$${Math.round(parseInt(fitnessPillar.spend.replace(/[^0-9]/g, "")) * 0.05)}` });
  }

  // Upgrade signals
  const totalSpendNum = parseInt(customer.txnTotal.replace(/[^0-9]/g, "")) || 0;
  const annualizedSpend = totalSpendNum * 4; // quarterly → annual estimate
  if (annualizedSpend > 40000 && customer.profile.segment === "Preferred") {
    recs.push({ product: "Premium Card Upgrade", match: 74 + Math.min(Math.round((annualizedSpend - 40000) / 2000), 20), signalType: "Upgrade", rationale: `Annualized spend ~$${(annualizedSpend / 1000).toFixed(0)}K qualifies for Premium tier — 3x rewards multiplier.`, annualValue: `$${Math.round(annualizedSpend * 0.01)}` });
  }
  if (holdings.investments !== "$0" && parseInt(holdings.investments.replace(/[^0-9]/g, "")) >= 25000) {
    const invAmt = parseInt(holdings.investments.replace(/[^0-9]/g, ""));
    recs.push({ product: "Private Wealth Advisory", match: 68 + Math.min(Math.round(invAmt / 10000), 25), signalType: "Upgrade", rationale: `Investment portfolio at ${holdings.investments} — qualifies for dedicated advisory and reduced fees.`, annualValue: `$${Math.round(invAmt * 0.005)}` });
  }

  // Sort by match descending, deduplicate by product
  const seen = new Set<string>();
  return recs
    .sort((a, b) => b.match - a.match)
    .filter(r => { if (seen.has(r.product)) return false; seen.add(r.product); return true; })
    .slice(0, 5);
}

const holdingIcons: Record<string, typeof CreditCard> = {
  deposit: PiggyBank,
  credit: CreditCard,
  mortgage: Home,
  investments: BarChart3,
};

const signalColors: Record<string, { bg: string; text: string; border: string }> = {
  "Life Event": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "Spending Pattern": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Upgrade": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

const signalIcons: Record<string, typeof Zap> = {
  "Life Event": Zap,
  "Spending Pattern": TrendingUp,
  "Upgrade": ArrowUpCircle,
};

export default function DemoFinancialJourneyView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <CustomerJourney customer={customerA} color="#3b82f6" />
      <CustomerJourney customer={customerB} color="#10b981" />
    </div>
  );
}

function CustomerJourney({ customer, color }: { customer: DemoCustomer; color: string }) {
  const holdings = customer.profile.holdings;
  const recommendations = deriveRecommendations(customer);

  const holdingEntries = Object.entries(holdings).filter(([, val]) => val !== "$0");

  return (
    <div className="space-y-4">
      {/* Current Holdings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Current Products</p>
        <div className="flex flex-wrap gap-2">
          {holdingEntries.map(([key, val]) => {
            const Icon = holdingIcons[key] || CreditCard;
            return (
              <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 capitalize">{key}</p>
                  <p className="text-[9px] text-slate-500">{val}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Best Product Recommendations */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>
          Next Best Product
        </p>
        {recommendations.map((rec, idx) => {
          const signalStyle = signalColors[rec.signalType];
          const SignalIcon = signalIcons[rec.signalType];
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{rec.product}</p>
                  <Badge variant="outline" className={`text-[9px] ${signalStyle.bg} ${signalStyle.text} ${signalStyle.border}`}>
                    <SignalIcon className="w-2.5 h-2.5 mr-1" />
                    {rec.signalType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2" style={{
                    borderColor: rec.match >= 85 ? "#22c55e" : rec.match >= 70 ? "#f59e0b" : "#94a3b8",
                    background: rec.match >= 85 ? "#f0fdf4" : rec.match >= 70 ? "#fffbeb" : "#f8fafc",
                  }}>
                    <span className="text-xs font-bold" style={{
                      color: rec.match >= 85 ? "#16a34a" : rec.match >= 70 ? "#d97706" : "#64748b",
                    }}>{rec.match}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{rec.rationale}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400">Est. Annual Value:</span>
                <span className="text-[11px] font-semibold text-emerald-600">{rec.annualValue}</span>
              </div>
            </div>
          );
        })}
        {recommendations.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center">
            <p className="text-sm text-slate-400">No recommendations available</p>
          </div>
        )}
      </div>
    </div>
  );
}
