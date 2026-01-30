import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Shuffle, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";

interface SimulationResult {
  year: number;
  median: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
}

interface MonteCarloResults {
  successRate: number;
  medianOutcome: number;
  worstCase: number;
  bestCase: number;
  targetGoal: number;
}

interface MonteCarloSimulatorProps {
  initialPortfolio?: number;
  annualContribution?: number;
  yearsToRetirement?: number;
  targetGoal?: number;
  onResultsChange?: (results: MonteCarloResults | null) => void;
}

export function MonteCarloSimulator({
  initialPortfolio = 500000,
  annualContribution = 24000,
  yearsToRetirement = 20,
  targetGoal = 2000000,
  onResultsChange,
}: MonteCarloSimulatorProps) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [contribution, setContribution] = useState(annualContribution);
  const [years, setYears] = useState(yearsToRetirement);
  const [goal, setGoal] = useState(targetGoal);
  const [expectedReturn, setExpectedReturn] = useState(7); // 7% average
  const [volatility, setVolatility] = useState(15); // 15% standard deviation
  const [simulations, setSimulations] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);

  // Box-Muller transform for generating normal random numbers
  const randomNormal = (mean: number, stdDev: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  };

  const runSimulation = () => {
    setIsRunning(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const allPaths: number[][] = [];
      const meanReturn = expectedReturn / 100;
      const stdDev = volatility / 100;

      // Run simulations
      for (let sim = 0; sim < simulations; sim++) {
        const path: number[] = [portfolio];
        let currentValue = portfolio;

        for (let year = 1; year <= years; year++) {
          // Generate random annual return using log-normal distribution
          const annualReturn = randomNormal(meanReturn, stdDev);
          currentValue = currentValue * (1 + annualReturn) + contribution;
          path.push(Math.max(0, currentValue));
        }
        allPaths.push(path);
      }

      // Calculate percentiles for each year
      const simulationResults: SimulationResult[] = [];
      for (let year = 0; year <= years; year++) {
        const yearValues = allPaths.map(path => path[year]).sort((a, b) => a - b);
        const getPercentile = (p: number) => yearValues[Math.floor(yearValues.length * p)];
        
        simulationResults.push({
          year: new Date().getFullYear() + year,
          median: getPercentile(0.5),
          p10: getPercentile(0.1),
          p25: getPercentile(0.25),
          p75: getPercentile(0.75),
          p90: getPercentile(0.9),
        });
      }

      // Calculate success rate (probability of meeting goal)
      const finalValues = allPaths.map(path => path[path.length - 1]);
      const successCount = finalValues.filter(v => v >= goal).length;
      const rate = (successCount / simulations) * 100;

      setResults(simulationResults);
      setSuccessRate(rate);
      setIsRunning(false);
      
      // Notify parent of results
      if (onResultsChange) {
        onResultsChange({
          successRate: rate,
          medianOutcome: simulationResults[simulationResults.length - 1]?.median || 0,
          worstCase: simulationResults[simulationResults.length - 1]?.p10 || 0,
          bestCase: simulationResults[simulationResults.length - 1]?.p90 || 0,
          targetGoal: goal,
        });
      }
    }, 100);
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getSuccessBadge = (rate: number) => {
    if (rate >= 80) return { variant: "default" as const, label: "High Confidence", icon: CheckCircle2 };
    if (rate >= 60) return { variant: "secondary" as const, label: "Moderate Risk", icon: Target };
    return { variant: "destructive" as const, label: "At Risk", icon: AlertTriangle };
  };

  const finalMedian = results?.[results.length - 1]?.median || 0;
  const finalP10 = results?.[results.length - 1]?.p10 || 0;
  const finalP90 = results?.[results.length - 1]?.p90 || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Monte Carlo Simulator</CardTitle>
          </div>
          {successRate !== null && (
            <Badge variant={getSuccessBadge(successRate).variant} className="gap-1">
              {(() => {
                const BadgeIcon = getSuccessBadge(successRate).icon;
                return <BadgeIcon className="w-3 h-3" />;
              })()}
              {getSuccessBadge(successRate).label}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Simulate {simulations.toLocaleString()} possible market scenarios to estimate retirement outcomes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm">Starting Portfolio</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <Input
                type="number"
                value={portfolio}
                onChange={(e) => setPortfolio(parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm">Annual Contribution</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <Input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm">Years to Retirement</Label>
            <Input
              type="number"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
              min={1}
              max={50}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Target Goal</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <Input
                type="number"
                value={goal}
                onChange={(e) => setGoal(parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        {/* Market Assumptions */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <Label className="text-sm font-medium">Market Assumptions</Label>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Expected Return</span>
                <span className="font-medium">{expectedReturn}%</span>
              </div>
              <Slider
                value={[expectedReturn]}
                onValueChange={(v) => setExpectedReturn(v[0])}
                min={2}
                max={12}
                step={0.5}
              />
              <p className="text-xs text-slate-500">Historical S&P 500: ~10%</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volatility (Std Dev)</span>
                <span className="font-medium">{volatility}%</span>
              </div>
              <Slider
                value={[volatility]}
                onValueChange={(v) => setVolatility(v[0])}
                min={5}
                max={30}
                step={1}
              />
              <p className="text-xs text-slate-500">Historical S&P 500: ~15-16%</p>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <Button onClick={runSimulation} disabled={isRunning} className="w-full">
          <Shuffle className="w-4 h-4 mr-2" />
          {isRunning ? "Running Simulation..." : `Run ${simulations.toLocaleString()} Simulations`}
        </Button>

        {/* Results */}
        {results && successRate !== null && (
          <>
            {/* Success Rate */}
            <div className="p-4 bg-primary/5 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Probability of Reaching Goal</span>
                <span className={`text-2xl font-bold ${getSuccessColor(successRate)}`}>
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={successRate} className="h-3" />
              <p className="text-sm text-slate-500">
                Target: {formatCurrency(goal)} by {new Date().getFullYear() + years}
              </p>
            </div>

            {/* Outcome Distribution */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">10th Percentile (Bad)</p>
                <p className="font-semibold text-red-600">{formatCurrency(finalP10)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">50th Percentile (Median)</p>
                <p className="font-semibold text-primary">{formatCurrency(finalMedian)}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">90th Percentile (Good)</p>
                <p className="font-semibold text-green-600">{formatCurrency(finalP90)}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Projected Portfolio Range</Label>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => v.toString()}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="p90"
                      stackId="1"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      name="90th %ile"
                    />
                    <Area
                      type="monotone"
                      dataKey="p75"
                      stackId="2"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      name="75th %ile"
                    />
                    <Area
                      type="monotone"
                      dataKey="p25"
                      stackId="3"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      name="25th %ile"
                    />
                    <Area
                      type="monotone"
                      dataKey="p10"
                      stackId="4"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      name="10th %ile"
                    />
                    <Line
                      type="monotone"
                      dataKey="median"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Median"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Shaded area shows range between 10th and 90th percentile outcomes
              </p>
            </div>

            {/* Recommendations */}
            {successRate < 80 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-700 dark:text-amber-400">Suggestions to Improve Success Rate</span>
                </div>
                <ul className="text-sm text-slate-500 space-y-1 ml-7 list-disc">
                  {successRate < 60 && <li>Consider increasing annual contributions by {formatCurrency(contribution * 0.25)}</li>}
                  {years < 30 && <li>Delaying retirement by 2-3 years could significantly improve outcomes</li>}
                  <li>Review asset allocation to ensure appropriate risk level</li>
                  {goal > finalMedian * 1.5 && <li>The target goal may be aggressive given current inputs</li>}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
