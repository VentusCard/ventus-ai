import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  COMPARE_OPTIONS,
  RANGE_OPTIONS,
  type CompareMode,
  type DashboardRange,
  type RangePreset,
} from "./useDashboardRange";
import { cn } from "@/lib/utils";

interface DashboardToolbarProps {
  range: DashboardRange;
  preset: RangePreset;
  setPreset: (p: RangePreset) => void;
  setCustom: (c: { start: Date; end: Date } | undefined) => void;
  compare: CompareMode;
  setCompare: (c: CompareMode) => void;
}

export function DashboardToolbar({
  range,
  preset,
  setPreset,
  setCustom,
  compare,
  setCompare,
}: DashboardToolbarProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(range.start);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(range.end);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Range */}
      <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-[12px] gap-2"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            {range.label}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto p-0 bg-white border-slate-200 shadow-lg"
        >
          <div className="flex">
            <div className="border-r border-slate-100 py-2 min-w-[160px]">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value !== "custom") {
                      setPreset(opt.value);
                      setCustom(undefined);
                      setRangeOpen(false);
                    } else {
                      setPreset("custom");
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-[12px] hover:bg-slate-50",
                    preset === opt.value
                      ? "text-blue-700 font-medium"
                      : "text-slate-700",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {preset === "custom" && (
              <div className="p-3 pointer-events-auto">
                <div className="text-[11px] text-slate-500 mb-1">Start</div>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={(d) => setCustomStart(d ?? undefined)}
                  className={cn("p-0 pointer-events-auto")}
                />
                <div className="text-[11px] text-slate-500 mb-1 mt-3">End</div>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={(d) => setCustomEnd(d ?? undefined)}
                  className={cn("p-0 pointer-events-auto")}
                />
                <div className="flex justify-end gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[12px]"
                    onClick={() => setRangeOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[12px] bg-slate-900 hover:bg-slate-800"
                    disabled={!customStart || !customEnd}
                    onClick={() => {
                      if (customStart && customEnd) {
                        setCustom({ start: customStart, end: customEnd });
                        setRangeOpen(false);
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Compare */}
      <Popover open={compareOpen} onOpenChange={setCompareOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-[12px] gap-2"
          >
            <GitCompareArrows className="w-3.5 h-3.5 text-slate-500" />
            Compare: {range.compareLabel}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[200px] p-1 bg-white border-slate-200">
          {COMPARE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setCompare(opt.value);
                setCompareOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[12px] rounded hover:bg-slate-50",
                compare === opt.value ? "text-blue-700 font-medium" : "text-slate-700",
              )}
            >
              {opt.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
