import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface ProjectionData {
  year: number;
  age: number;
  expected: number;
  optimistic: number;
  conservative: number;
  inflationAdjusted?: number;
}

interface NetWorthProjectionChartProps {
  data: { year: number; value: number }[];
  currentNetWorth: number;
  currentAge?: number;
  retirementAge?: number;
  inflationRate?: number;
  milestones?: { year: number; label: string }[];
}

export function NetWorthProjectionChart({ 
  data, 
  currentNetWorth,
  currentAge = 45,
  retirementAge = 65,
  inflationRate = 3,
  milestones = [],
}: NetWorthProjectionChartProps) {
  const currentYear = new Date().getFullYear();
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true);

  // Generate multi-scenario projection data
  const projectionData = useMemo(() => {
    const optimisticReturn = 0.08; // 8%
    const expectedReturn = 0.06; // 6% 
    const conservativeReturn = 0.04; // 4%
    const inflation = inflationRate / 100;
    
    // Estimate annual savings from the expected growth pattern
    const annualSavings = data.length > 1 
      ? (data[1].value - data[0].value * 1.07) / 1 // Rough estimate
      : currentNetWorth * 0.1;

    return data.map((d, i) => {
      const years = i;
      const age = currentAge + years;
      
      // Calculate different scenarios
      const optimistic = currentNetWorth * Math.pow(1 + optimisticReturn, years) +
        annualSavings * ((Math.pow(1 + optimisticReturn, years) - 1) / optimisticReturn || 0);
      
      const expected = d.value; // Use provided expected value
      
      const conservative = currentNetWorth * Math.pow(1 + conservativeReturn, years) +
        annualSavings * ((Math.pow(1 + conservativeReturn, years) - 1) / (conservativeReturn || 0.001));
      
      // Inflation-adjusted (real) values
      const inflationFactor = Math.pow(1 + inflation, years);
      const inflationAdjusted = expected / inflationFactor;
      
      return {
        year: d.year,
        age,
        expected: Math.round(expected),
        optimistic: Math.round(optimistic),
        conservative: Math.round(conservative),
        inflationAdjusted: Math.round(inflationAdjusted),
      };
    });
  }, [data, currentNetWorth, currentAge, inflationRate]);

  // Find key milestones
  const autoMilestones = useMemo(() => {
    const result: { year: number; label: string }[] = [...milestones];
    
    // First million
    const millionIndex = projectionData.findIndex(d => d.expected >= 1000000);
    if (millionIndex > 0 && projectionData[0].expected < 1000000) {
      result.push({ year: projectionData[millionIndex].year, label: "$1M" });
    }
    
    // Retirement year
    const retirementYear = currentYear + (retirementAge - currentAge);
    if (retirementYear > currentYear && retirementYear <= projectionData[projectionData.length - 1]?.year) {
      result.push({ year: retirementYear, label: "Retire" });
    }
    
    return result;
  }, [projectionData, currentAge, retirementAge, currentYear, milestones]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const dataPoint = projectionData.find(d => d.year === label);
    if (!dataPoint) return null;
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold">{label} (Age {dataPoint.age})</p>
        <div className="space-y-1 mt-2 text-sm">
          {showScenarios && (
            <>
              <p className="text-green-600">
                Optimistic (8%): {formatCurrency(dataPoint.optimistic)}
              </p>
              <p className="text-primary font-medium">
                Expected (6%): {formatCurrency(dataPoint.expected)}
              </p>
              <p className="text-yellow-600">
                Conservative (4%): {formatCurrency(dataPoint.conservative)}
              </p>
            </>
          )}
          {showInflationAdjusted && (
            <p className="text-slate-500 border-t pt-1 mt-1">
              Real (inflation-adj): {formatCurrency(dataPoint.inflationAdjusted || 0)}
            </p>
          )}
        </div>
        {currentNetWorth > 0 && (
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t">
            Growth: +{((dataPoint.expected / currentNetWorth - 1) * 100).toFixed(0)}% from today
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Switch
            id="scenarios"
            checked={showScenarios}
            onCheckedChange={setShowScenarios}
          />
          <Label htmlFor="scenarios" className="cursor-pointer">Show Scenarios</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="inflation"
            checked={showInflationAdjusted}
            onCheckedChange={setShowInflationAdjusted}
          />
          <Label htmlFor="inflation" className="cursor-pointer">
            Inflation-Adjusted ({inflationRate}%)
          </Label>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              width={70}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Milestone markers */}
            {autoMilestones.map((milestone, idx) => (
              <ReferenceLine 
                key={idx}
                x={milestone.year} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="3 3"
                label={{ 
                  value: milestone.label, 
                  position: "top", 
                  fontSize: 10,
                  fill: "hsl(var(--primary))"
                }}
              />
            ))}
            
            {/* Today marker */}
            <ReferenceLine 
              x={currentYear} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              label={{ value: "Today", position: "top", fontSize: 10 }}
            />
            
            {/* Scenario lines */}
            {showScenarios && (
              <>
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  stroke="hsl(150, 60%, 45%)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Optimistic (8%)"
                />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  stroke="hsl(45, 80%, 50%)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Conservative (4%)"
                />
              </>
            )}
            
            {/* Main expected line with area fill */}
            <Area
              type="monotone"
              dataKey="expected"
              stroke="none"
              fill="url(#expectedGradient)"
            />
            <Line
              type="monotone"
              dataKey="expected"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Expected (6%)"
            />
            
            {/* Inflation-adjusted line */}
            {showInflationAdjusted && (
              <Line
                type="monotone"
                dataKey="inflationAdjusted"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                name="Real Value"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend / Key Stats */}
      <div className="flex flex-wrap justify-between gap-4 text-sm pt-2 border-t">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Expected (6%)</span>
          </div>
          {showScenarios && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Optimistic (8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Conservative (4%)</span>
              </div>
            </>
          )}
          {showInflationAdjusted && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Real Value</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-slate-500 text-xs">Starting</p>
            <p className="font-semibold">{formatCurrency(projectionData[0]?.expected || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 text-xs">At Retirement</p>
            <p className="font-semibold text-primary">
              {formatCurrency(projectionData.find(d => d.age === retirementAge)?.expected || projectionData[projectionData.length - 1]?.expected || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 text-xs">End of Projection</p>
            <p className="font-semibold">
              {formatCurrency(projectionData[projectionData.length - 1]?.expected || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
