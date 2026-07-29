import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb, Zap } from "lucide-react";

interface TabHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  howItWorks: string;
  whyItMatters: string;
}

export function TabHeader({ icon, title, subtitle, howItWorks, whyItMatters }: TabHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 text-slate-500">{icon}</div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 leading-tight truncate">{title}</h2>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 hover:bg-slate-50 transition-colors">
              <Lightbulb className="w-3 h-3" />
              How It Works
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-3">
            <p className="text-xs text-slate-600 leading-relaxed">{howItWorks}</p>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 hover:bg-slate-50 transition-colors">
              <Zap className="w-3 h-3" />
              Why It Matters
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-3">
            <p className="text-xs text-slate-600 leading-relaxed">{whyItMatters}</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
