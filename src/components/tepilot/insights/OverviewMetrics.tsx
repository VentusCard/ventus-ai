import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, Target, Layers, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { Transaction, EnrichedTransaction } from "@/types/transaction";
import { calculateAverageConfidence, calculateMiscRate, aggregateByPillar } from "@/lib/aggregations";
import { LIFESTYLE_PILLARS, PILLAR_COLORS } from "@/lib/sampleData";
import { getBudgetStatus } from "@/lib/budgetUtils";

interface OverviewMetricsProps {
  originalTransactions: Transaction[];
  enrichedTransactions: EnrichedTransaction[];
  budgetMode?: boolean;
  budgets?: Record<string, number>;
  setBudgets?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function OverviewMetrics({ originalTransactions, enrichedTransactions, budgetMode = false, budgets = {}, setBudgets }: OverviewMetricsProps) {
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  const totalSpend = enrichedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgConfidence = calculateAverageConfidence(enrichedTransactions);
  const miscRate = calculateMiscRate(enrichedTransactions);
  
  const pillarsUsed = new Set(enrichedTransactions.map(t => t.pillar)).size;
  const dominantPillar = enrichedTransactions.reduce((acc, t) => {
    acc[t.pillar] = (acc[t.pillar] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  const topPillar = Object.entries(dominantPillar).sort((a, b) => b[1] - a[1])[0];
  
  const travelSpend = enrichedTransactions
    .filter(t => t.pillar === "Travel & Exploration")
    .reduce((sum, t) => sum + t.amount, 0);
  const travelPercent = (travelSpend / totalSpend) * 100;

  // Budget totals
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  const overallBudgetStatus = totalBudget > 0 ? getBudgetStatus(totalSpend, totalBudget) : null;

  // Pillar aggregates for editor
  const pillarAggregates = aggregateByPillar(enrichedTransactions);

  const budgetUsedPercent = totalBudget > 0 ? ((totalSpend / totalBudget) * 100) : 0;

  const metrics = [
    {
      title: budgetMode ? "Total Spend vs Budget" : "Total Spend",
      value: budgetMode && totalBudget > 0 
        ? `$${totalSpend.toFixed(0)} / $${totalBudget}` 
        : `$${totalSpend.toFixed(2)}`,
      subtitle: budgetMode && overallBudgetStatus
        ? `${overallBudgetStatus.label} · ${budgetUsedPercent.toFixed(1)}% used`
        : `${enrichedTransactions.length} transactions`,
      icon: TrendingUp,
      color: budgetMode && overallBudgetStatus ? "" : "text-primary",
      bgColor: budgetMode && overallBudgetStatus ? "" : "bg-primary/10",
      budgetStatusColor: budgetMode && overallBudgetStatus ? overallBudgetStatus.color : undefined,
      budgetStatusIcon: budgetMode && overallBudgetStatus ? overallBudgetStatus.icon : undefined,
      clickable: budgetMode,
    },
    {
      title: "Classification Accuracy",
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      subtitle: `${miscRate.toFixed(1)}% miscellaneous`,
      icon: Target,
      color: avgConfidence > 0.8 ? "text-green-500" : "text-yellow-500",
      bgColor: avgConfidence > 0.8 ? "bg-green-500/10" : "bg-yellow-500/10",
    },
    {
      title: "Lifestyle Insights",
      value: `${pillarsUsed}/${LIFESTYLE_PILLARS.length} Pillars`,
      subtitle: topPillar ? `Top: ${topPillar[0]}` : "No data",
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Travel Insight",
      value: `${travelPercent.toFixed(1)}%`,
      subtitle: `$${travelSpend.toFixed(2)} travel spend`,
      icon: Plane,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card 
            key={idx} 
            className={`hover-scale bg-white border-slate-200 relative ${metric.clickable ? 'cursor-pointer' : 'cursor-pointer'}`}
            onClick={() => {
              if (metric.clickable) setShowBudgetEditor(prev => !prev);
            }}
          >
            {/* Budget status badge */}
            {metric.budgetStatusIcon && (
              <div
                className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 bg-white shadow-md"
                style={{ borderColor: metric.budgetStatusColor }}
              >
                <metric.budgetStatusIcon className="w-3.5 h-3.5" style={{ color: metric.budgetStatusColor }} />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {metric.title}
                    {metric.clickable && (
                      showBudgetEditor 
                        ? <ChevronUp className="inline w-3.5 h-3.5 ml-1" /> 
                        : <ChevronDown className="inline w-3.5 h-3.5 ml-1" />
                    )}
                  </p>
                  <p className="text-2xl font-bold mb-1 text-slate-900">{metric.value}</p>
                  <p 
                    className="text-xs" 
                    style={metric.budgetStatusColor ? { color: metric.budgetStatusColor } : undefined}
                  >
                    <span className={metric.budgetStatusColor ? '' : 'text-slate-600'}>{metric.subtitle}</span>
                  </p>
                </div>
                <div 
                  className={`p-3 rounded-lg ${metric.bgColor}`}
                  style={metric.budgetStatusColor ? { backgroundColor: `${metric.budgetStatusColor}15` } : undefined}
                >
                  <metric.icon 
                    className={`w-5 h-5 ${metric.color}`} 
                    style={metric.budgetStatusColor ? { color: metric.budgetStatusColor } : undefined}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expandable per-pillar budget editor */}
      {budgetMode && showBudgetEditor && (
        <Card className="animate-fade-in bg-white border-slate-200">
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Per-Pillar Budget Editor</h4>
            <div className="space-y-3">
              {pillarAggregates.map((pillar) => {
                const budget = budgets[pillar.pillar] || 0;
                const status = getBudgetStatus(pillar.totalSpend, budget);
                const color = PILLAR_COLORS[pillar.pillar] || "#64748b";
                const spendRatio = budget > 0 ? Math.min(100, (pillar.totalSpend / budget) * 100) : 0;

                return (
                  <div key={pillar.pillar} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{pillar.pillar}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${spendRatio}%`, backgroundColor: status.color }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-900">${pillar.totalSpend.toFixed(0)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-slate-500">Budget: $</span>
                      <Input
                        type="number"
                        className="w-20 h-7 text-xs px-1.5"
                        value={budget}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setBudgets?.(prev => ({ ...prev, [pillar.pillar]: val }));
                        }}
                      />
                    </div>
                    <div className="shrink-0" title={status.label}>
                      <status.icon className="w-4 h-4" style={{ color: status.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
