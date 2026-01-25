import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, LayoutGrid, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getPillarDetails } from "@/lib/mockBankwideData";
import type { BankwideFilters } from "@/types/bankwide";
import { CollapsibleCard } from "./CollapsibleCard";
import { PILLAR_COLORS } from "@/lib/sampleData";

interface BankwidePillarExplorerProps {
  filters: BankwideFilters;
}

const PILLAR_COLOR_MAP: Record<string, string> = {
  "Food & Dining": "#f59e0b",
  "Travel & Exploration": "#8b5cf6",
  "Style & Beauty": "#f43f5e",
  "Home & Living": "#ec4899",
  "Entertainment & Culture": "#6366f1",
  "Health & Wellness": "#10b981",
  "Learning & Growth": "#3b82f6",
  "Family & Relationships": "#14b8a6",
  "Professional & Career": "#a855f7",
  "Technology & Innovation": "#ef4444",
  "Transportation": "#06b6d4",
  "Miscellaneous & Unclassified": "#64748b",
  ...PILLAR_COLORS
};

export function BankwidePillarExplorer({ filters }: BankwidePillarExplorerProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const pillarDetails = getPillarDetails(filters);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handlePillarClick = (pillarName: string) => {
    setSelectedPillar(selectedPillar === pillarName ? null : pillarName);
  };

  const selectedPillarData = pillarDetails.find(p => p.pillarName === selectedPillar);

  const totalSpend = pillarDetails.reduce((sum, p) => sum + p.totalSpend, 0);
  const sortedPillars = [...pillarDetails].sort((a, b) => b.totalSpend - a.totalSpend);
  const top1 = sortedPillars[0];
  const top3Combined = sortedPillars.slice(0, 3).reduce((sum, p) => sum + p.percentageOfTotal, 0);
  const lowestPillar = sortedPillars[sortedPillars.length - 1];

  // Chart data for bar chart view
  const chartData = pillarDetails
    .map(p => ({
      name: p.pillarName,
      value: p.percentageOfTotal,
      color: p.color,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].payload.name}</p>
          <p className="text-sm text-slate-500">
            {payload[0].value.toFixed(1)}% of total spend
          </p>
        </div>
      );
    }
    return null;
  };

  const previewContent = (
    <div className="text-sm">
      <span className="text-slate-900 font-medium" style={{ color: top1?.color }}>{top1?.pillarName}</span>
      <span className="text-slate-500"> leads at </span>
      <span className="text-primary font-medium">{top1?.percentageOfTotal.toFixed(1)}%</span>
      <span className="text-slate-500"> of spend. Top 3 pillars = </span>
      <span className="text-slate-900 font-medium">{top3Combined.toFixed(0)}%</span>
      <span className="text-slate-500"> of total. </span>
      <span className="text-amber-600 font-medium">{lowestPillar?.pillarName}</span>
      <span className="text-slate-500"> underperforms — expansion opportunity.</span>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-4">
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(val) => val && setViewMode(val as 'grid' | 'chart')}
        className="border rounded-lg p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <ToggleGroupItem value="grid" className="gap-2 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Grid</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="chart" className="gap-2 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Chart</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="text-right">
        <div className="text-xl font-bold text-primary">{formatCurrency(totalSpend)}</div>
        <div className="text-xs text-slate-500">Total Spend</div>
      </div>
    </div>
  );

  return (
    <CollapsibleCard
      title="Spending Distribution by Lifestyle Pillar"
      description={viewMode === 'grid' 
        ? "Click any pillar to explore detailed breakdown by card product, region, and demographics"
        : "Percentage of total spending across lifestyle categories"
      }
      icon={<LayoutGrid className="h-5 w-5 text-primary" />}
      headerRight={headerRight}
      previewContent={previewContent}
    >
      <div className="space-y-6">
        {viewMode === 'chart' ? (
          /* Bar Chart View */
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                label={{ value: '% of Total Spend', angle: -90, position: 'insideLeft', fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PILLAR_COLOR_MAP[entry.name] || entry.color || "#64748b"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  style={{ fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: '500' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Grid View */
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {pillarDetails.map((pillar) => {
                const isSelected = selectedPillar === pillar.pillarName;
                return (
                  <button
                    key={pillar.pillarName}
                    onClick={() => handlePillarClick(pillar.pillarName)}
                    className={`relative flex flex-col p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary shadow-lg scale-105 bg-primary/5'
                        : 'border-slate-200 hover:border-primary/50 hover:scale-105 hover:shadow-md bg-white'
                    }`}
                    style={{
                      borderTopColor: isSelected ? pillar.color : undefined,
                      borderTopWidth: isSelected ? '4px' : undefined,
                    }}
                  >
                    {/* Color Bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                      style={{ backgroundColor: pillar.color }}
                    />

                    {/* Pillar Name */}
                    <div className="text-xs font-semibold text-slate-500 mt-2 mb-2 line-clamp-2">
                      {pillar.pillarName}
                    </div>

                    {/* Total Spend */}
                    <div
                      className="text-2xl font-bold mb-1"
                      style={{ color: pillar.color }}
                    >
                      {formatCurrency(pillar.totalSpend)}
                    </div>

                    {/* Account Count & Percentage */}
                    <div className="text-xs text-slate-500">
                      {formatNumber(pillar.accountCount)} accounts
                    </div>
                    <div className="text-xs font-medium mt-1 text-slate-700">
                      {pillar.percentageOfTotal.toFixed(1)}% of total
                    </div>

                    {/* Visual Bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(pillar.percentageOfTotal * 3, 100)}%`,
                          backgroundColor: pillar.color,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded Details Panel */}
            {selectedPillarData && (
              <div className="mt-6 p-6 rounded-lg border-2 border-primary/30 bg-primary/5 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: selectedPillarData.color }}>
                      {selectedPillarData.pillarName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Detailed breakdown across card products, regions, and demographics
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPillar(null)}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top Card Products */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Top Card Products
                    </h4>
                    {selectedPillarData.topCardProducts.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedPillarData.color }}
                          />
                        <span className="text-sm font-medium text-slate-900">{product.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(product.spend)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Top Regions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Top Regions
                    </h4>
                    {selectedPillarData.topRegions.map((region, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedPillarData.color }}
                          />
                        <span className="text-sm font-medium text-slate-900">{region.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(region.spend)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Age Demographics */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Age Demographics
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPillarData.ageBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([age, percentage]) => (
                          <div key={age} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-900">{age}</span>
                              <span className="text-slate-500">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: selectedPillarData.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">Total Spend</div>
                    <div className="text-lg font-bold" style={{ color: selectedPillarData.color }}>
                      {formatCurrency(selectedPillarData.totalSpend)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Accounts</div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatNumber(selectedPillarData.accountCount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Transactions</div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatNumber(selectedPillarData.transactionCount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Avg per Account</div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatCurrency(selectedPillarData.avgSpendPerAccount)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}
