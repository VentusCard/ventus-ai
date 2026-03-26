import { useState, useMemo } from "react";
import { Microscope, TrendingUp, TrendingDown, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LIFESTYLE_PILLARS, PILLAR_COLORS } from "@/lib/sampleData";
import { getPillarDeepDive } from "@/lib/mockBankwideData";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import type { PillarDeepDiveCell } from "@/types/bankwide";

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];
const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"];

export function PillarDeepDiveHeatmap() {
  const [selectedPillar, setSelectedPillar] = useState("Sports & Active Living");
  const [isExpanded, setIsExpanded] = useState(true);
  const [fromDate, setFromDate] = useState<Date>(new Date(2025, 0, 1));
  const [toDate, setToDate] = useState<Date>(new Date(2025, 11, 31));

  const cells = useMemo(() => getPillarDeepDive(selectedPillar), [selectedPillar]);
  const pillarColor = PILLAR_COLORS[selectedPillar] || "#64748b";

  // Find the cell with highest subcategory growth for the key insight banner
  const topCell = useMemo(() => {
    return cells.reduce((best, c) => (c.subcategoryGrowth > best.subcategoryGrowth ? c : best), cells[0]);
  }, [cells]);

  // Min/max spend index for color interpolation
  const { minIdx, maxIdx } = useMemo(() => {
    const indices = cells.map((c) => c.spendIndex);
    return { minIdx: Math.min(...indices), maxIdx: Math.max(...indices) };
  }, [cells]);

  const getCell = (age: string, region: string): PillarDeepDiveCell | undefined =>
    cells.find((c) => c.ageGroup === age && c.region === region);

  // Interpolate from white to pillar color based on spend index
  const getCellBg = (idx: number) => {
    const t = maxIdx === minIdx ? 0.5 : (idx - minIdx) / (maxIdx - minIdx);
    const alpha = 0.08 + t * 0.55;
    return `color-mix(in srgb, ${pillarColor} ${Math.round(alpha * 100)}%, white)`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: pillarColor }}
            >
              <Microscope className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg">Pillar Deep Dive</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1 text-xs text-muted-foreground"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>

        {isExpanded && <>
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Lifestyle Pillar
            </label>
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIFESTYLE_PILLARS.filter((p) => p !== "Miscellaneous & Unclassified").map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: PILLAR_COLORS[p] }}
                      />
                      {p}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-[140px] justify-start text-left text-xs">
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                  {format(fromDate, "MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(d) => d && setFromDate(d)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-[140px] justify-start text-left text-xs">
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                  {format(toDate, "MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(d) => d && setToDate(d)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        </>}
      </CardHeader>

      {isExpanded && <CardContent className="space-y-4">
        {/* Key Insight Banner */}
        {topCell && (
          <div
            className="rounded-lg px-4 py-3 text-sm font-medium border"
            style={{
              backgroundColor: `color-mix(in srgb, ${pillarColor} 8%, white)`,
              borderColor: `color-mix(in srgb, ${pillarColor} 25%, transparent)`,
              color: "#1e293b",
            }}
          >
            <span className="font-semibold">{topCell.generationLabel}</span> in the{" "}
            <span className="font-semibold">{topCell.region}</span> are driving a{" "}
            <span className="font-bold" style={{ color: pillarColor }}>
              {topCell.subcategoryGrowth}% surge
            </span>{" "}
            in <span className="font-semibold">{topCell.topSubcategory}</span> spending — the
            strongest subcategory growth in {selectedPillar}.
          </div>
        )}

        {/* Heatmap Grid */}
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Column headers */}
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "140px repeat(5, 1fr)" }}>
                <div /> {/* empty corner */}
                {REGIONS.map((r) => (
                  <div key={r} className="text-center text-xs font-semibold text-slate-600 pb-1.5">
                    {r}
                  </div>
                ))}

                {/* Rows */}
                {AGE_GROUPS.map((age) => {
                  const gen = cells.find((c) => c.ageGroup === age)?.generationLabel ?? "";
                  return (
                    <>
                      {/* Row label */}
                      <div
                        key={`label-${age}`}
                        className="flex flex-col justify-center pr-2 text-right"
                      >
                        <span className="text-xs font-semibold text-slate-700">{gen}</span>
                        <span className="text-[10px] text-slate-400">{age}</span>
                      </div>

                      {/* Cells */}
                      {REGIONS.map((region) => {
                        const cell = getCell(age, region);
                        if (!cell) return <div key={`${age}-${region}`} />;
                        const isHot = cell.spendIndex > 130;

                        return (
                          <Tooltip key={`${age}-${region}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "rounded-lg p-2.5 cursor-default transition-all duration-200 border",
                                  isHot ? "ring-1 shadow-md" : "border-slate-100"
                                )}
                                style={{
                                  backgroundColor: getCellBg(cell.spendIndex),
                                  borderColor: isHot
                                    ? `color-mix(in srgb, ${pillarColor} 50%, transparent)`
                                    : undefined,
                                  boxShadow: isHot
                                    ? `0 0 12px color-mix(in srgb, ${pillarColor} 20%, transparent)`
                                    : undefined,
                                  
                                }}
                              >
                                <div className="text-sm font-bold text-slate-800">
                                  {formatCurrency(cell.totalSpend)}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] font-medium text-slate-500">
                                    Index {cell.spendIndex}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[10px] font-semibold flex items-center gap-0.5",
                                      cell.yoyGrowth >= 0 ? "text-emerald-600" : "text-red-500"
                                    )}
                                  >
                                    {cell.yoyGrowth >= 0 ? (
                                      <TrendingUp className="h-2.5 w-2.5" />
                                    ) : (
                                      <TrendingDown className="h-2.5 w-2.5" />
                                    )}
                                    {cell.yoyGrowth > 0 ? "+" : ""}
                                    {cell.yoyGrowth}%
                                  </span>
                                </div>
                                {/* Subcategory callout */}
                                <div
                                  className="mt-1.5 text-[10px] font-semibold rounded px-1.5 py-0.5 inline-block"
                                  style={{
                                    backgroundColor: `color-mix(in srgb, ${pillarColor} 15%, white)`,
                                    color: pillarColor,
                                  }}
                                >
                                  {cell.topSubcategory} ↑{cell.subcategoryGrowth}%
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[220px]">
                              <div className="space-y-1">
                                <p className="font-semibold text-xs">
                                  {cell.generationLabel} ({cell.ageGroup}) × {cell.region}
                                </p>
                                <p className="text-xs">
                                  Total Spend: <strong>{formatCurrency(cell.totalSpend)}</strong>
                                </p>
                                <p className="text-xs">
                                  Spend Index: <strong>{cell.spendIndex}</strong> (100 = avg)
                                </p>
                                <p className="text-xs">
                                  YoY Growth: <strong>{cell.yoyGrowth > 0 ? "+" : ""}{cell.yoyGrowth}%</strong>
                                </p>
                                <p className="text-xs">
                                  Top Subcategory: <strong>{cell.topSubcategory}</strong> ↑{cell.subcategoryGrowth}%
                                </p>
                                <p className="text-xs">
                                  Users: <strong>{formatNumber(cell.userCount)}</strong>
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
          <span>Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: getCellBg(minIdx) }} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: getCellBg((minIdx + maxIdx) / 2) }} />
            <span>Avg</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: getCellBg(maxIdx) }} />
            <span>High</span>
          </div>
          <span className="ml-2">| Cells with index &gt;130 are highlighted</span>
        </div>
      </CardContent>}
    </Card>
  );
}
