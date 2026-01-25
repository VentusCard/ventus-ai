import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, ArrowRight } from "lucide-react";
import { AssetAllocation } from "@/types/financial-planning";

interface AssetAllocationEditorProps {
  currentAllocation: AssetAllocation;
  targetAllocation: AssetAllocation;
  onTargetChange: (allocation: AssetAllocation) => void;
}

const COLORS = {
  stocks: "hsl(var(--primary))",
  bonds: "hsl(210, 70%, 50%)",
  cash: "hsl(150, 60%, 45%)",
  realEstate: "hsl(45, 80%, 50%)",
  other: "hsl(280, 60%, 55%)",
};

const LABELS: Record<keyof AssetAllocation, string> = {
  stocks: "Stocks",
  bonds: "Bonds",
  cash: "Cash",
  realEstate: "Real Estate",
  other: "Other",
};

export function AssetAllocationEditor({
  currentAllocation,
  targetAllocation,
  onTargetChange,
}: AssetAllocationEditorProps) {
  
  const currentData = useMemo(() => 
    Object.entries(currentAllocation)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: LABELS[key as keyof AssetAllocation],
        value,
        color: COLORS[key as keyof AssetAllocation],
      })),
    [currentAllocation]
  );

  const targetData = useMemo(() => 
    Object.entries(targetAllocation)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: LABELS[key as keyof AssetAllocation],
        value,
        color: COLORS[key as keyof AssetAllocation],
      })),
    [targetAllocation]
  );

  const handleSliderChange = (key: keyof AssetAllocation, newValue: number) => {
    // Calculate total of other allocations
    const othersTotal = Object.entries(targetAllocation)
      .filter(([k]) => k !== key)
      .reduce((sum, [_, v]) => sum + v, 0);
    
    // Don't allow total > 100%
    const maxValue = 100 - (othersTotal - targetAllocation[key]);
    const clampedValue = Math.min(newValue, maxValue);
    
    onTargetChange({
      ...targetAllocation,
      [key]: clampedValue,
    });
  };

  // Check if allocations need rebalancing
  const needsRebalancing = useMemo(() => {
    return Object.keys(currentAllocation).some(
      (key) => Math.abs(
        currentAllocation[key as keyof AssetAllocation] - 
        targetAllocation[key as keyof AssetAllocation]
      ) > 5
    );
  }, [currentAllocation, targetAllocation]);

  const totalTarget = Object.values(targetAllocation).reduce((a, b) => a + b, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-primary">{payload[0].value}%</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Asset Allocation</CardTitle>
          </div>
          {needsRebalancing && (
            <Badge variant="destructive" className="text-xs">
              Rebalancing Recommended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Allocation Pie Chart */}
          <div>
            <h4 className="text-sm font-medium text-center mb-4">Current Allocation</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`current-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {currentData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-slate-500" />
          </div>

          {/* Target Allocation with Sliders */}
          <div>
            <h4 className="text-sm font-medium text-center mb-4">
              Target Allocation
              <span className={`ml-2 ${totalTarget === 100 ? 'text-green-600' : 'text-red-600'}`}>
                ({totalTarget}%)
              </span>
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {targetData.map((entry, index) => (
                      <Cell key={`target-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sliders for Target Allocation */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-4">Adjust Target Allocation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(targetAllocation) as Array<keyof AssetAllocation>).map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[key] }}
                    />
                    <Label className="text-sm">{LABELS[key]}</Label>
                  </div>
                  <span className="text-sm font-medium">{targetAllocation[key]}%</span>
                </div>
                <Slider
                  value={[targetAllocation[key]]}
                  onValueChange={([value]) => handleSliderChange(key, value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          
          {totalTarget !== 100 && (
            <p className="text-sm text-red-600 mt-3">
              Total allocation must equal 100% (currently {totalTarget}%)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
