import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Landmark, HandCoins, TrendingUp, ShieldCheck,
  Smartphone, Crown, Scale, Package, Users, DollarSign, ArrowRightLeft,
  ChevronDown, ChevronUp,
} from "lucide-react";
import {
  JOURNEY_CATEGORIES,
  getJourneyProductsByCategory,
  getCategorySummary,
  getJourneySummaryStats,
  type JourneyCategory,
} from "@/lib/financialJourneyData";
import { formatNumber, formatCurrency } from "@/lib/formatHelper";

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard, Landmark, HandCoins, TrendingUp, ShieldCheck,
  Smartphone, Crown, Scale,
};

export function FinancialJourneyHeader() {
  const stats = useMemo(() => getJourneySummaryStats(), []);
  const [expanded, setExpanded] = useState<JourneyCategory | null>(null);

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Package} label="Total Products" value={String(stats.totalProducts)} />
        <MetricCard icon={Users} label="Avg Products / Customer" value={stats.avgProductsPerCustomer.toFixed(1)} />
        <MetricCard icon={ArrowRightLeft} label="Top Cross-Sell" value={stats.topCrossSellProduct} sub={`${formatNumber(stats.topCrossSellVolume)} eligible`} />
        <MetricCard icon={DollarSign} label="Revenue Pipeline" value={formatCurrency(stats.totalRevenuePipeline)} sub="est. annual" />
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {JOURNEY_CATEGORIES.map((cat) => {
          const summary = getCategorySummary(cat.id);
          const Icon = ICON_MAP[cat.iconName] || Package;
          const isOpen = expanded === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setExpanded(isOpen ? null : cat.id)}
              className={`text-left rounded-xl border p-4 transition-all ${isOpen ? 'ring-2 ring-primary/30 shadow-md' : 'hover:shadow-sm'} ${cat.color}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${cat.color}`}>
                  <Icon className={`w-5 h-5 ${cat.textColor}`} />
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="font-semibold text-sm text-slate-900 mt-2">{cat.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{summary.productCount} products</Badge>
                <span className="text-[11px] text-slate-500">{formatNumber(summary.totalCustomers)} customers</span>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5">
                  {getJourneyProductsByCategory(cat.id).map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 truncate mr-2">{p.name}</span>
                      <span className="text-slate-500 whitespace-nowrap">{p.penetrationRate}%</span>
                    </div>
                  ))}
                  {summary.topOpportunity && (
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/40">
                      Top opportunity → <span className="font-medium text-slate-700">{summary.topOpportunity.nextProductOpportunities[0]}</span>
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-50">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500 leading-tight">{label}</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
          {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
