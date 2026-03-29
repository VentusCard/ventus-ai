import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  sensitivityTiers,
  matrixThresholds,
  getMatrixCellRisk,
  RISK_COLORS,
  type SensitivityCategory,
} from "@/lib/fviData";

const DIMENSIONS = [
  { key: 'flaggedCustomers' as const, label: 'Flagged Customers', format: (v: number) => v.toLocaleString(), unit: '' },
  { key: 'avgMonthlySpend' as const, label: 'Avg Monthly Spend', format: (v: number) => `$${v.toLocaleString()}`, unit: '/mo' },
  { key: 'momVelocity' as const, label: 'MoM Velocity', format: (v: number) => `${v > 0 ? '+' : ''}${v}%`, unit: '' },
  { key: 'pctOfIncome' as const, label: '% of Income', format: (v: number) => `${v}%`, unit: '' },
  { key: 'escalationRate' as const, label: 'Escalation Rate', format: (v: number) => `${v}%`, unit: '' },
  { key: 'interventionCoverage' as const, label: 'Intervention Coverage', format: (v: number) => `${v}%`, unit: '' },
];

const TIER_BG: Record<number, string> = {
  1: 'bg-red-50 border-red-200',
  2: 'bg-amber-50 border-amber-200',
  3: 'bg-slate-50 border-slate-200',
};

const TIER_TEXT: Record<number, string> = {
  1: 'text-red-800',
  2: 'text-amber-800',
  3: 'text-slate-700',
};

function getCellBg(risk: string): string {
  const color = RISK_COLORS[risk as keyof typeof RISK_COLORS] || '#22C55E';
  return color;
}

function getThresholdContext(dimKey: keyof typeof matrixThresholds, value: number): string {
  const t = matrixThresholds[dimKey];
  const inverted = dimKey === 'interventionCoverage';
  if (inverted) {
    return `Thresholds: ≥${t.green}% green, ≥${t.yellow}% monitor, ≥${t.orange}% alert, <${t.orange}% critical`;
  }
  return `Thresholds: ≤${t.green} green, ≤${t.yellow} monitor, ≤${t.orange} alert, >${t.orange} critical`;
}

export function FVISensitivityMatrix() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allCategories = sensitivityTiers.flatMap(t => t.categories);

  const summaryRow = DIMENSIONS.map(dim => {
    if (dim.key === 'flaggedCustomers') {
      return allCategories.reduce((s, c) => s + c[dim.key], 0);
    }
    if (dim.key === 'interventionCoverage' || dim.key === 'escalationRate' || dim.key === 'pctOfIncome' || dim.key === 'momVelocity') {
      const total = allCategories.reduce((s, c) => s + c[dim.key], 0);
      return Math.round((total / allCategories.length) * 10) / 10;
    }
    const total = allCategories.reduce((s, c) => s + c[dim.key], 0);
    return Math.round(total / allCategories.length);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Sensitivity Matrix — Risk Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Heat-map view of vulnerability signal intensity across sensitivity tiers and analytical dimensions.
          Cells are color-coded by severity threshold.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider delayDuration={200}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground w-52">Category</th>
                {DIMENSIONS.map(dim => (
                  <th key={dim.key} className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[110px]">
                    {dim.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivityTiers.map(tier => (
                <>
                  {/* Tier header */}
                  <tr key={`tier-${tier.tier}`}>
                    <td
                      colSpan={DIMENSIONS.length + 1}
                      className={`py-2 px-3 font-semibold text-xs border-t ${TIER_BG[tier.tier]} ${TIER_TEXT[tier.tier]}`}
                    >
                      {tier.label}
                      <span className="font-normal ml-2 opacity-70">— {tier.description}</span>
                    </td>
                  </tr>
                  {/* Category rows */}
                  {tier.categories.map(cat => (
                    <tr
                      key={cat.id}
                      className={`border-b border-slate-100 transition-colors cursor-default ${
                        hoveredRow === cat.id ? 'bg-slate-50' : ''
                      }`}
                      onMouseEnter={() => setHoveredRow(cat.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-2 px-3 font-medium text-slate-800">{cat.name}</td>
                      {DIMENSIONS.map(dim => {
                        const value = cat[dim.key];
                        const risk = getMatrixCellRisk(dim.key, value);
                        const bgColor = getCellBg(risk);
                        return (
                          <td key={dim.key} className="py-1.5 px-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="inline-block px-2.5 py-1 rounded font-mono text-xs font-semibold min-w-[70px]"
                                  style={{
                                    backgroundColor: `${bgColor}20`,
                                    color: bgColor,
                                    border: `1px solid ${bgColor}40`,
                                  }}
                                >
                                  {dim.format(value)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="font-semibold">{cat.name} — {dim.label}</p>
                                <p className="text-xs mt-1">{dim.format(value)}{dim.unit}</p>
                                <p className="text-xs mt-1 opacity-80">
                                  Risk level: <span className="font-semibold capitalize">{risk}</span>
                                </p>
                                <p className="text-xs mt-0.5 opacity-60">
                                  {getThresholdContext(dim.key, value)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
              {/* Summary row */}
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                <td className="py-2 px-3 text-slate-600">Portfolio Summary</td>
                {DIMENSIONS.map((dim, i) => (
                  <td key={dim.key} className="py-2 px-2 text-center">
                    <span className="font-mono text-xs text-slate-700">
                      {dim.format(summaryRow[i])}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-muted-foreground font-medium">Risk Level:</span>
          {(['green', 'monitor', 'alert', 'critical'] as const).map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: RISK_COLORS[level] }}
              />
              <span className="text-xs text-muted-foreground capitalize">{level === 'monitor' ? 'Monitor' : level === 'green' ? 'Green' : level === 'alert' ? 'Alert' : 'Critical'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
