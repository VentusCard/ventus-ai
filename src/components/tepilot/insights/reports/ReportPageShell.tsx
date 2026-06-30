import { ReactNode } from "react";
import { ArrowLeft, Download, CalendarClock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { DashboardToolbar } from "../dashboard/DashboardToolbar";
import { useDashboardRange, type DashboardRange } from "../dashboard/useDashboardRange";

export interface ReportPageRange {
  range: DashboardRange;
}

interface ReportPageShellProps {
  title: string;
  category: string;
  description: string;
  onBack: () => void;
  children: (ctx: ReportPageRange) => ReactNode;
  defaultPreset?: "7d" | "30d" | "90d" | "qtd" | "ytd";
}

export function ReportPageShell({
  title,
  category,
  description,
  onBack,
  children,
  defaultPreset = "30d",
}: ReportPageShellProps) {
  const { range, preset, setPreset, setCustom, compare, setCompare } =
    useDashboardRange(defaultPreset);

  const lastRun = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0 mt-0.5"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                Reports / {category}
              </span>
            </div>
            <h2 className="text-[16px] font-semibold text-slate-900 leading-tight mt-0.5">
              {title}
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[12px] bg-white border-slate-200 text-slate-700"
            onClick={() => toast({ title: "Export queued", description: `${title}.csv will download shortly.` })}
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[12px] bg-white border-slate-200 text-slate-700"
            onClick={() => toast({ title: "Scheduling", description: "Report scheduling will open in a future release." })}
          >
            <CalendarClock className="w-3 h-3 mr-1" />
            Schedule
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-slate-500 hover:bg-slate-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
        <DashboardToolbar
          range={range}
          preset={preset}
          setPreset={setPreset}
          setCustom={setCustom}
          compare={compare}
          setCompare={setCompare}
        />
        <span className="text-[11px] text-slate-400">Last run: {lastRun}</span>
      </div>

      {/* Content */}
      <div className="space-y-3">{children({ range })}</div>
    </div>
  );
}
