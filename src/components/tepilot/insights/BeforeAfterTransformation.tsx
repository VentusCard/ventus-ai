import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction, EnrichedTransaction, PillarAggregateWithSegments } from "@/types/transaction";
import { aggregateByMCC, aggregateByPillarWithTravelBreakdown, buildSankeyFlow } from "@/lib/aggregations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { useState } from "react";
import { ArrowRight, ChevronDown, BarChart3 } from "lucide-react";
interface BeforeAfterTransformationProps {
  originalTransactions: Transaction[];
  enrichedTransactions: EnrichedTransaction[];
}
export function BeforeAfterTransformation({
  originalTransactions,
  enrichedTransactions
}: BeforeAfterTransformationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const mccData = aggregateByMCC(originalTransactions).slice(0, 10);
  const pillarData = aggregateByPillarWithTravelBreakdown(enrichedTransactions)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  // Get all unique segment pillars in consistent order
  const allSegmentPillars = Array.from(
    new Set(
      pillarData.flatMap(agg => 
        agg.segments.map(seg => seg.originalPillar)
      )
    )
  ).sort();

  // Prepare chart data with consistent segment keys
  const chartData = pillarData.map(agg => {
    const dataPoint: any = { 
      pillar: agg.pillar,
      totalSpend: agg.totalSpend,
      segments: agg.segments // Keep for tooltip
    };
    
    // Initialize ALL segment keys for every bar
    allSegmentPillars.forEach((segPillar, idx) => {
      const segment = agg.segments.find(s => s.originalPillar === segPillar);
      dataPoint[`segment_${idx}`] = segment ? segment.amount : 0;
    });
    
    return dataPoint;
  });

  const sankeyData = buildSankeyFlow(enrichedTransactions);

  // Get top MCCs and pillars for transformation flow
  const mccTotals = new Map<string, number>();
  const pillarTotals = new Map<string, number>();
  sankeyData.links.forEach(link => {
    mccTotals.set(link.source, (mccTotals.get(link.source) || 0) + link.value);
    pillarTotals.set(link.target, (pillarTotals.get(link.target) || 0) + link.value);
  });
  const topMCCs = Array.from(mccTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topPillars = Array.from(pillarTotals.entries()).sort((a, b) => b[1] - a[1]);
  return <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white border-slate-200">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-slate-900">MCC vs Lifestyle Pillar Visualization</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>See AI transformation</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
        <Tabs defaultValue="side-by-side">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 text-slate-600">
            <TabsTrigger value="side-by-side" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Side-by-Side</TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Transformation Flow</TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Side-by-Side Charts */}
          <TabsContent value="side-by-side">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Before (MCC) */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-slate-900">Before: MCCs</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Raw merchant category codes - limited insight
                </p>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mccData}>
                    <XAxis dataKey="mcc" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} interval={0} />
                    <YAxis />
                    <Tooltip formatter={value => `$${Number(value).toFixed(2)}`} />
                    <Bar dataKey="totalSpend" fill="#64748b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Right: After (Lifestyle) - Stacked */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-slate-900">After: Lifestyle Pillars</h4>
                <p className="text-xs text-slate-500 mb-4">
                  AI-organized spending categories with breakdown
                </p>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="pillar" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} interval={0} />
                    <YAxis />
                    <Tooltip content={({
                    active,
                    payload
                  }) => {
                    if (active && payload && payload.length > 0) {
                      const pillar = payload[0].payload.pillar;
                      const data = chartData.find(p => p.pillar === pillar);
                      if (!data) return null;
                      return <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                              <p className="font-semibold mb-2 text-slate-900">{pillar}</p>
                              <p className="text-sm text-slate-500 mb-2">
                                Total: ${data.totalSpend.toFixed(2)}
                              </p>
                              {data.segments.length > 1 && <div className="space-y-1 pt-2 border-t border-slate-200">
                                  <p className="text-xs text-slate-500 mb-1">Original Categories:</p>
                                  {data.segments.map((seg, idx) => <div key={idx} className="flex items-center gap-2 text-sm">
                                      <div className="w-3 h-3 rounded-sm" style={{
                              backgroundColor: seg.color
                            }} />
                                      <span className="text-xs">
                                        {seg.originalPillar}: ${seg.amount.toFixed(2)}
                                      </span>
                                    </div>)}
                                </div>}
                            </div>;
                    }
                    return null;
                  }} />
                    {allSegmentPillars.map((pillar, idx) => (
                      <Bar 
                        key={pillar}
                        dataKey={`segment_${idx}`}
                        stackId="pillar"
                        fill={PILLAR_COLORS[pillar] || "#64748b"}
                        name={pillar}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-4">
                  * Stacked segments show original spending categories before travel reclassification
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 2: Transformation Flow */}
          <TabsContent value="flow">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-start">
              {/* Left: MCCs */}
              <div className="space-y-2">
                <p className="text-sm font-medium mb-4 text-slate-900">Merchant Category Codes</p>
                {topMCCs.map(([mcc, amount]) => {
                const isHighlighted = highlightedNode === mcc;
                const connectedLinks = sankeyData.links.filter(l => l.source === mcc);
                return <div key={mcc} className={`p-3 rounded-lg border cursor-pointer transition-all ${isHighlighted ? 'bg-primary/10 border-primary shadow-lg' : 'bg-white border-slate-200 hover:bg-slate-50'}`} onMouseEnter={() => setHighlightedNode(mcc)} onMouseLeave={() => setHighlightedNode(null)}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">{mcc}</p>
                        <p className="text-xs text-slate-500">${amount.toFixed(0)}</p>
                      </div>
                      {isHighlighted && <div className="mt-2 space-y-1">
                          {connectedLinks.map((link, idx) => <p key={idx} className="text-xs text-slate-500 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              {link.target}: ${link.value.toFixed(2)}
                            </p>)}
                        </div>}
                    </div>;
              })}
              </div>
              
              {/* Center: Visual flow */}
              <div className="flex items-center justify-center h-full">
                <ArrowRight className="w-8 h-8 text-slate-400" />
              </div>
              
              {/* Right: Pillars */}
              <div className="space-y-2">
                <p className="text-sm font-medium mb-4 text-slate-900">Lifestyle Pillars</p>
                {topPillars.map(([pillar, amount]) => {
                const isHighlighted = highlightedNode === pillar;
                const connectedLinks = sankeyData.links.filter(l => l.target === pillar);
                const color = PILLAR_COLORS[pillar] || "#64748b";
                return <div key={pillar} className={`p-3 rounded-lg border border-slate-200 cursor-pointer transition-all ${isHighlighted ? 'shadow-lg scale-105' : 'hover:scale-102 bg-white'}`} style={{
                  backgroundColor: isHighlighted ? `${color}20` : undefined,
                  borderColor: isHighlighted ? color : undefined
                }} onMouseEnter={() => setHighlightedNode(pillar)} onMouseLeave={() => setHighlightedNode(null)}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">{pillar}</p>
                        <p className="text-xs text-slate-500">${amount.toFixed(0)}</p>
                      </div>
                      {isHighlighted && <div className="mt-2 space-y-1">
                          <p className="text-xs text-slate-500">
                            From {connectedLinks.length} MCC{connectedLinks.length > 1 ? 's' : ''}
                          </p>
                        </div>}
                    </div>;
              })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>;
}