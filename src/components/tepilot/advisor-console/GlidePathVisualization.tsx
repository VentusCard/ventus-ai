import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AssetAllocation } from "@/types/financial-planning";

interface GlidePathVisualizationProps {
  currentAge: number;
  retirementAge: number;
  currentAllocation: AssetAllocation;
}

export function GlidePathVisualization({
  currentAge,
  retirementAge,
  currentAllocation,
}: GlidePathVisualizationProps) {
  // Generate glide path data from current age to retirement + 10 years
  const glidePathData = useMemo(() => {
    const data: { age: number; stocks: number; bonds: number; cash: number }[] = [];
    const endAge = Math.max(retirementAge + 15, currentAge + 30);
    
    for (let age = currentAge; age <= endAge; age++) {
      // Standard glide path: start aggressive, gradually shift to conservative
      // Target: 110 - age = stock allocation (common rule of thumb)
      // More aggressive before retirement, more conservative after
      
      let targetStocks: number;
      let targetBonds: number;
      let targetCash: number;
      
      if (age <= retirementAge - 10) {
        // 10+ years to retirement: aggressive
        targetStocks = Math.max(50, 110 - age);
        targetBonds = Math.min(40, 100 - targetStocks - 5);
        targetCash = 100 - targetStocks - targetBonds;
      } else if (age <= retirementAge) {
        // Approaching retirement: transition
        const yearsToRetire = retirementAge - age;
        targetStocks = Math.max(40, 50 + yearsToRetire * 2);
        targetBonds = Math.min(50, 45 - yearsToRetire);
        targetCash = 100 - targetStocks - targetBonds;
      } else {
        // In retirement: conservative
        const yearsInRetirement = age - retirementAge;
        targetStocks = Math.max(20, 40 - yearsInRetirement);
        targetBonds = Math.min(60, 50 + yearsInRetirement * 0.5);
        targetCash = 100 - targetStocks - targetBonds;
      }
      
      data.push({
        age,
        stocks: Math.round(targetStocks),
        bonds: Math.round(targetBonds),
        cash: Math.round(targetCash),
      });
    }
    
    return data;
  }, [currentAge, retirementAge]);

  // Find current position in glide path
  const currentPosition = glidePathData.find(d => d.age === currentAge);
  const targetPosition = currentPosition || { stocks: 60, bonds: 30, cash: 10 };

  // Check if current allocation matches glide path
  const allocationDiff = Math.abs(currentAllocation.stocks - targetPosition.stocks);
  const needsRebalancing = allocationDiff > 10;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold mb-2">Age {label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Stocks: {payload[2]?.value}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Bonds: {payload[1]?.value}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Cash: {payload[0]?.value}%</span>
          </div>
        </div>
        {label === currentAge && (
          <p className="text-xs text-slate-500 mt-2 border-t pt-2">
            ← You are here
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Glide Path - Asset Allocation Over Time</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {needsRebalancing && (
              <Badge variant="destructive" className="text-xs">
                Rebalancing Recommended
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Target at Age {currentAge}: {targetPosition.stocks}% Stocks
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={glidePathData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="stocksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="bondsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              
              <XAxis 
                dataKey="age" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'Age', position: 'bottom', offset: -5 }}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Current age marker */}
              <ReferenceLine 
                x={currentAge} 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: "Now", 
                  position: "top", 
                  fontSize: 11,
                  fill: "hsl(var(--foreground))"
                }}
              />
              
              {/* Retirement marker */}
              <ReferenceLine 
                x={retirementAge} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                label={{ 
                  value: "Retire", 
                  position: "top", 
                  fontSize: 11,
                  fill: "hsl(var(--primary))"
                }}
              />
              
              <Area
                type="monotone"
                dataKey="cash"
                stackId="1"
                stroke="hsl(150, 60%, 45%)"
                fill="url(#cashGradient)"
              />
              <Area
                type="monotone"
                dataKey="bonds"
                stackId="1"
                stroke="hsl(210, 70%, 50%)"
                fill="url(#bondsGradient)"
              />
              <Area
                type="monotone"
                dataKey="stocks"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="url(#stocksGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Current vs Target */}
        <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t gap-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-sm">Stocks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">Bonds</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">Cash</span>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-slate-500">Current: </span>
              <span className="font-medium">{currentAllocation.stocks}% stocks</span>
            </div>
            <div>
              <span className="text-slate-500">Target: </span>
              <span className="font-medium">{targetPosition.stocks}% stocks</span>
            </div>
            {needsRebalancing && (
              <div className="text-yellow-600 font-medium">
                Adjust by {allocationDiff}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
