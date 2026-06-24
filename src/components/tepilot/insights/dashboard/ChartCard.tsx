import { ReactNode } from "react";
import { MoreHorizontal, ExternalLink, Download, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  value?: string;
  hint?: string;
  className?: string;
  bodyClassName?: string;
  onOpenDetail?: () => void;
  openDetailLabel?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  value,
  hint,
  className,
  bodyClassName,
  onOpenDetail,
  openDetailLabel = "Open detail view",
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white flex flex-col min-h-0",
        className,
      )}
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-slate-600 truncate">{title}</div>
          {value && (
            <div className="text-[20px] font-semibold text-slate-900 leading-tight mt-0.5">
              {value}
            </div>
          )}
          {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 -mr-1"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-slate-200 w-48">
            {onOpenDetail && (
              <>
                <DropdownMenuItem onClick={onOpenDetail} className="text-[12px]">
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  {openDetailLabel}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-[12px]"
              onClick={() => toast({ title: "Export queued", description: `${title}.csv will download shortly.` })}
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[12px]"
              onClick={() => toast({ title: "Query copied", description: "SQL definition copied to clipboard." })}
            >
              <Code2 className="w-3.5 h-3.5 mr-2" />
              View query
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={cn("px-4 pb-4 flex-1 min-h-0", bodyClassName)}>{children}</div>
    </div>
  );
}
