import { EnrichedTransaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { aggregateByPillarWithTravelBreakdown, calculateMiscRate, calculateAverageConfidence } from "@/lib/aggregations";
import { PILLAR_COLORS, LIFESTYLE_PILLARS } from "@/lib/sampleData";
import { Plane } from "lucide-react";

interface AfterInsightsPanelProps {
  transactions: EnrichedTransaction[];
  allTransactions: EnrichedTransaction[];
}

export function AfterInsightsPanel({ transactions, allTransactions }: AfterInsightsPanelProps) {
  const pillarAggregates = aggregateByPillarWithTravelBreakdown(allTransactions);
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const miscRate = calculateMiscRate(transactions);
  const avgConfidence = calculateAverageConfidence(transactions);
  
  // Calculate travel metrics
  const travelTransactions = transactions.filter(t => t.travel_context?.is_travel_related);
  const travelSpend = travelTransactions.reduce((sum, t) => sum + t.amount, 0);
  const reclassifiedCount = travelTransactions.filter(t => t.travel_context?.original_pillar && 
    t.travel_context.original_pillar !== t.pillar).length;
  
  // Aggregate travel transactions by subcategory with original pillar segments
  const travelSubcategoryMap = new Map<string, {
    totalSpend: number;
    segments: Map<string, number>;
  }>();

  travelTransactions.forEach(t => {
    const subcat = t.subcategory;
    const existing = travelSubcategoryMap.get(subcat) || {
      totalSpend: 0,
      segments: new Map()
    };
    
    existing.totalSpend += t.amount;
    
    const originalPillar = t.travel_context?.original_pillar || t.pillar;
    existing.segments.set(
      originalPillar, 
      (existing.segments.get(originalPillar) || 0) + t.amount
    );
    
    travelSubcategoryMap.set(subcat, existing);
  });

  // Get all unique segment pillars in sorted order
  const travelSegmentPillars = Array.from(
    new Set(
      travelTransactions
        .map(t => t.travel_context?.original_pillar || t.pillar)
        .filter(Boolean)
    )
  ).sort();

  const travelSubcategoryData = Array.from(travelSubcategoryMap.entries())
    .map(([subcategory, data]) => {
      const dataPoint: any = { 
        subcategory, 
        totalSpend: data.totalSpend,
        segments: [] // For tooltip
      };
      
      // Initialize ALL segment keys with 0 for consistency
      travelSegmentPillars.forEach((pillar, idx) => {
        const amount = data.segments.get(pillar) || 0;
        dataPoint[`segment_${idx}`] = amount;
        
        if (amount > 0) {
          dataPoint.segments.push({
            originalPillar: pillar,
            amount,
            color: PILLAR_COLORS[pillar] || "#64748b"
          });
        }
      });
      
      return dataPoint;
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);
  
  // Get all unique segment pillars in consistent order
  const allSegmentPillars = Array.from(
    new Set(
      pillarAggregates.flatMap(agg => 
        agg.segments.map(seg => seg.originalPillar)
      )
    )
  ).sort();

  // Prepare data with consistent segment keys
  const chartData = pillarAggregates.map(agg => {
    const dataPoint: any = { 
      pillar: agg.pillar,
      segments: agg.segments // For tooltip
    };
    
    // Initialize ALL segment keys for every bar
    allSegmentPillars.forEach((segPillar, idx) => {
      const segment = agg.segments.find(s => s.originalPillar === segPillar);
      dataPoint[`segment_${idx}`] = segment ? segment.amount : 0;
    });
    
    return dataPoint;
  });

  return (
    <div className="space-y-6">
      {travelSpend > 0 && (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Plane className="h-5 w-5" />
              Travel Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">Travel Spend</p>
                <p className="text-2xl font-bold text-slate-900">${travelSpend.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Travel Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{travelTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Reclassified</p>
                <p className="text-2xl font-bold text-slate-900">{reclassifiedCount}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-4 text-slate-900">Travel Spending by Category</h4>
              <ResponsiveContainer width="100%" height={Math.max(300, travelSubcategoryData.length * 50)}>
                <BarChart data={travelSubcategoryData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="subcategory" width={200} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="square"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const subcategory = payload[0].payload.subcategory;
                        const data = travelSubcategoryData.find(d => d.subcategory === subcategory);
                        
                        if (!data) return null;
                        
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2 text-slate-900">{subcategory}</p>
                            <p className="text-sm text-slate-500 mb-2">
                              Total: ${data.totalSpend.toFixed(2)}
                            </p>
                            {data.segments.length > 1 && (
                              <div className="space-y-1 pt-2 border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Original Categories:</p>
                                {data.segments.map((seg: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div 
                                      className="w-3 h-3 rounded-sm" 
                                      style={{ backgroundColor: seg.color }}
                                    />
                                    <span className="text-xs">
                                      {seg.originalPillar}: ${seg.amount.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {travelSegmentPillars.map((pillar, idx) => (
                    <Bar 
                      key={pillar}
                      dataKey={`segment_${idx}`}
                      stackId="travel"
                      fill={PILLAR_COLORS[pillar] || "#64748b"}
                      name={pillar}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 mt-4">
                * Colors show which spending category transactions were originally classified as before travel detection
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">After: Lifestyle Pillar Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Total Spend</p>
              <p className="text-2xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Misc Rate</p>
              <p className="text-2xl font-bold text-slate-900">{miscRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Confidence</p>
              <p className="text-2xl font-bold text-slate-900">{(avgConfidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-slate-900">Spend by Lifestyle Pillar</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="pillar" width={250} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  iconType="square"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const pillar = payload[0].payload.pillar;
                      const aggregate = pillarAggregates.find(a => a.pillar === pillar);
                      
                      if (!aggregate) return null;
                      
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                          <p className="font-semibold mb-2 text-slate-900">{pillar}</p>
                          <p className="text-sm text-slate-500 mb-2">
                            Total: ${aggregate.totalSpend.toFixed(2)}
                          </p>
                          {aggregate.segments.length > 1 && (
                            <div className="space-y-1 pt-2 border-t border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Composition:</p>
                              {aggregate.segments.map((seg, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: seg.color }}
                                  />
                                  <span className="text-xs">
                                    {seg.originalPillar}: ${seg.amount.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {allSegmentPillars.map((pillar, idx) => (
                  <Bar 
                    key={pillar}
                    dataKey={`segment_${idx}`}
                    stackId="pillar-stack"
                    fill={PILLAR_COLORS[pillar] || "#64748b"}
                    name={pillar}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-4">
              * Colored segments in Travel & Exploration show original spending categories reclassified during detected travel periods
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
