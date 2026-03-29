import { useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, TrendingUp, DollarSign, Users, ShieldCheck, Activity } from "lucide-react";
import {
  sensitivityTiers,
  matrixThresholds,
  getMatrixCellRisk,
  RISK_COLORS,
  type RiskLevel,
} from "@/lib/fviData";

const DIMENSIONS = [
  { key: 'flaggedCustomers' as const, label: 'Flagged Customers', shortLabel: 'Flagged', icon: Users, format: (v: number) => v.toLocaleString(), desc: 'Customers with active signals' },
  { key: 'avgMonthlySpend' as const, label: 'Avg Monthly Spend', shortLabel: 'Avg Spend', icon: DollarSign, format: (v: number) => `$${v.toLocaleString()}`, desc: 'Average $ per flagged customer' },
  { key: 'momVelocity' as const, label: 'MoM Velocity', shortLabel: 'Velocity', icon: TrendingUp, format: (v: number) => `${v > 0 ? '+' : ''}${v}%`, desc: 'Month-over-month acceleration' },
  { key: 'pctOfIncome' as const, label: '% of Income', shortLabel: '% Income', icon: Activity, format: (v: number) => `${v}%`, desc: 'Category spend as % of income' },
  { key: 'escalationRate' as const, label: 'Escalation Rate', shortLabel: 'Escalation', icon: AlertTriangle, format: (v: number) => `${v}%`, desc: 'Risk level increased in 90 days' },
  { key: 'interventionCoverage' as const, label: 'Intervention Coverage', shortLabel: 'Coverage', icon: ShieldCheck, format: (v: number) => `${v}%`, desc: 'Active intervention in progress' },
];

const TIER_STYLES: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: 'bg-red-50/70', border: 'border-l-red-500', text: 'text-red-900', badge: 'bg-red-100 text-red-700 border-red-200' },
  2: { bg: 'bg-amber-50/70', border: 'border-l-amber-500', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  3: { bg: 'bg-slate-100/70', border: 'border-l-slate-400', text: 'text-slate-700', badge: 'bg-slate-200 text-slate-600 border-slate-300' },
};

const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  monitor: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  alert: 'bg-orange-50 text-orange-700 border-orange-300',
  critical: 'bg-red-50 text-red-700 border-red-300',
};

function getThresholdContext(dimKey: keyof typeof matrixThresholds): string {
  const t = matrixThresholds[dimKey];
  const inverted = dimKey === 'interventionCoverage';
  if (inverted) {
    return `≥${t.green}% = safe · ≥${t.yellow}% = monitor · ≥${t.orange}% = alert · <${t.orange}% = critical`;
  }
  return `≤${t.green} = safe · ≤${t.yellow} = monitor · ≤${t.orange} = alert · >${t.orange} = critical`;
}

function getWorstRiskInRow(cat: typeof sensitivityTiers[0]['categories'][0]): RiskLevel {
  let worst: RiskLevel = 'green';
  const order: RiskLevel[] = ['green', 'monitor', 'alert', 'critical'];
  for (const dim of DIMENSIONS) {
    const risk = getMatrixCellRisk(dim.key, cat[dim.key]);
    if (order.indexOf(risk) > order.indexOf(worst)) worst = risk;
  }
  return worst;
}

export function FVISensitivityMatrix() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allCategories = sensitivityTiers.flatMap(t => t.categories);

  const summaryRow = DIMENSIONS.map(dim => {
    if (dim.key === 'flaggedCustomers') {
      return allCategories.reduce((s, c) => s + c[dim.key], 0);
    }
    const total = allCategories.reduce((s, c) => s + c[dim.key], 0);
    return Math.round((total / allCategories.length) * 10) / 10;
  });

  // Count risk levels across all cells
  const riskCounts = { green: 0, monitor: 0, alert: 0, critical: 0 };
  allCategories.forEach(cat => {
    DIMENSIONS.forEach(dim => {
      const risk = getMatrixCellRisk(dim.key, cat[dim.key]);
      riskCounts[risk]++;
    });
  });
  const totalCells = allCategories.length * DIMENSIONS.length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { level: 'critical' as const, label: 'Critical Signals', color: RISK_COLORS.critical },
          { level: 'alert' as const, label: 'Alert Signals', color: RISK_COLORS.alert },
          { level: 'monitor' as const, label: 'Monitoring', color: RISK_COLORS.monitor },
          { level: 'green' as const, label: 'Healthy', color: RISK_COLORS.green },
        ]).map(item => (
          <Card key={item.level} className="border-l-4 py-3" style={{ borderLeftColor: item.color }}>
            <CardContent className="p-0 px-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold font-mono" style={{ color: item.color }}>
                  {riskCounts[item.level]}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((riskCounts[item.level] / totalCells) * 100)}% of signals
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Vulnerability Sensitivity Matrix</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {allCategories.length} categories across {sensitivityTiers.length} sensitivity tiers · {DIMENSIONS.length} analytical dimensions
              </p>
            </div>
            {/* Legend inline */}
            <div className="flex items-center gap-3">
              {(['green', 'monitor', 'alert', 'critical'] as const).map(level => (
                <div key={level} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS[level] }} />
                  <span className="text-[10px] text-muted-foreground capitalize">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 overflow-x-auto">
          <TooltipProvider delayDuration={150}>
            <table className="w-full border-collapse">
              {/* Column headers */}
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 w-56" />
                  <th className="text-center px-1 w-16">
                    <span className="text-[10px] text-muted-foreground font-medium">Status</span>
                  </th>
                  {DIMENSIONS.map(dim => {
                    const Icon = dim.icon;
                    return (
                      <th key={dim.key} className="text-center py-2 px-1 min-w-[90px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-0.5 cursor-help">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-[10px] font-medium text-muted-foreground leading-tight">{dim.shortLabel}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="font-semibold text-xs">{dim.label}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">{dim.desc}</p>
                            <p className="text-[10px] opacity-50 mt-1">{getThresholdContext(dim.key)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sensitivityTiers.map(tier => {
                  const style = TIER_STYLES[tier.tier];
                  return (
                    <Fragment key={`tier-${tier.tier}`}>
                      {/* Tier header row */}
                      <tr>
                        <td
                          colSpan={DIMENSIONS.length + 2}
                          className={`py-1.5 px-3 text-[11px] font-semibold border-l-4 ${style.bg} ${style.border} ${style.text}`}
                        >
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}>
                            TIER {tier.tier}
                          </span>
                          <span className="ml-2 font-medium">{tier.label.replace(/Tier \d — /, '')}</span>
                          <span className="ml-2 font-normal opacity-60">— {tier.description}</span>
                        </td>
                      </tr>
                      {/* Category rows */}
                      {tier.categories.map(cat => {
                        const worstRisk = getWorstRiskInRow(cat);
                        return (
                          <tr
                            key={cat.id}
                            className={`border-b border-slate-100/80 transition-all duration-150 ${
                              hoveredRow === cat.id ? 'bg-slate-50/80' : ''
                            }`}
                            onMouseEnter={() => setHoveredRow(cat.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            {/* Category name */}
                            <td className="py-2 px-3">
                              <span className="text-sm font-medium text-foreground">{cat.name}</span>
                            </td>
                            {/* Worst risk badge */}
                            <td className="py-2 px-1 text-center">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: RISK_COLORS[worstRisk] }}
                              />
                            </td>
                            {/* Dimension cells */}
                            {DIMENSIONS.map(dim => {
                              const value = cat[dim.key];
                              const risk = getMatrixCellRisk(dim.key, value);
                              const cellId = `${cat.id}-${dim.key}`;
                              const isHovered = hoveredCell === cellId;

                              return (
                                <td key={dim.key} className="py-1.5 px-1 text-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span
                                        className={`inline-flex items-center justify-center px-2 py-1 rounded-md font-mono text-[11px] font-semibold min-w-[68px] border transition-all duration-150 cursor-default ${
                                          RISK_BG_CLASSES[risk]
                                        } ${isHovered ? 'ring-2 ring-offset-1 ring-slate-300 scale-105' : ''}`}
                                        onMouseEnter={() => setHoveredCell(cellId)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                      >
                                        {dim.format(value)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[220px]">
                                      <div className="space-y-1">
                                        <p className="font-semibold text-xs">{cat.name}</p>
                                        <p className="text-[11px]">{dim.label}: <span className="font-mono font-bold">{dim.format(value)}</span></p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLORS[risk] }} />
                                          <span className="text-[10px] capitalize font-medium">{risk}</span>
                                        </div>
                                        <p className="text-[10px] opacity-50 pt-0.5 border-t border-slate-200 mt-1">
                                          {getThresholdContext(dim.key)}
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
                {/* Summary row */}
                <tr className="border-t-2 border-slate-200 bg-slate-50/60">
                  <td className="py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    Portfolio Totals
                  </td>
                  <td />
                  {DIMENSIONS.map((dim, i) => (
                    <td key={dim.key} className="py-2.5 px-1 text-center">
                      <span className="font-mono text-[11px] font-bold text-foreground">
                        {dim.format(summaryRow[i])}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
