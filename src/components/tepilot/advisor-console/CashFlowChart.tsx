import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine } from "recharts";
import { FundingSource, CostCategory } from "@/types/lifestyle-signals";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface CashFlowChartProps {
  years: number[];
  costCategories: CostCategory[];
  fundingSources: FundingSource[];
  currentSavings: number;
  monthlyContribution: number;
}

export function CashFlowChart({ years, costCategories, fundingSources, currentSavings, monthlyContribution }: CashFlowChartProps) {
  // Prepare data for the chart
  let cumulativeSavings = currentSavings;
  
  const chartData = years.map((year, index) => {
    const yearData: any = { year: year.toString() };
    
    // Add cost categories (negative values for visual representation)
    let totalCosts = 0;
    costCategories.forEach(cat => {
      const amount = cat.amounts[year] || 0;
      yearData[`cost_${cat.id}`] = -amount; // Negative for bottom bars
      totalCosts += amount;
    });
    
    // Add funding sources (positive values)
    let totalFunding = 0;
    fundingSources.forEach(source => {
      const amount = source.amounts[year] || 0;
      yearData[`funding_${source.id}`] = amount;
      totalFunding += amount;
    });

    // Calculate cumulative savings
    const monthsInYear = 12;
    const savingsContribution = monthlyContribution * monthsInYear;
    cumulativeSavings = cumulativeSavings + savingsContribution + totalFunding - totalCosts;
    
    yearData.totalCosts = totalCosts;
    yearData.totalFunding = totalFunding;
    yearData.cumulative = cumulativeSavings;
    yearData.netPosition = totalFunding - totalCosts;
    
    return yearData;
  });

  const colors = {
    costs: ['#ef4444', '#f97316', '#f59e0b'],
    funding: ['#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Cash Flow Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(Math.abs(value))}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value: any) => formatCurrency(Math.abs(value))}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
            
            {/* Cost bars (negative, stacked) */}
            {costCategories.map((cat, idx) => (
              <Bar 
                key={`cost_${cat.id}`}
                dataKey={`cost_${cat.id}`}
                stackId="costs"
                fill={colors.costs[idx % colors.costs.length]}
                name={cat.label}
              />
            ))}
            
            {/* Funding bars (positive, stacked) */}
            {fundingSources.map((source, idx) => (
              <Bar 
                key={`funding_${source.id}`}
                dataKey={`funding_${source.id}`}
                stackId="funding"
                fill={colors.funding[idx % colors.funding.length]}
                name={source.label}
              />
            ))}
            
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Total Costs</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.totalCosts, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Total Funding</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.totalFunding, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Final Position</p>
            <p className={`text-lg font-semibold ${chartData[chartData.length - 1]?.cumulative >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(chartData[chartData.length - 1]?.cumulative || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
