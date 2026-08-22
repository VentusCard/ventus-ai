import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import type { SubTabItem } from "./SubTabBar";

interface TabHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  howItWorks?: string;
  whyItMatters?: string;
  sections?: SubTabItem[];
  sectionValue?: string;
  onSectionChange?: (value: string) => void;
}

export function TabHeader({
  icon,
  title,
  subtitle,
  sections,
  sectionValue,
  onSectionChange,
}: TabHeaderProps) {
  const activeSection = sections?.find((s) => s.value === sectionValue) ?? sections?.[0];
  return (
    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 min-h-[52px]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 text-slate-500 [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight shrink-0">
          {title}
        </h2>
        <span className="shrink-0 h-5 w-px bg-slate-200" />
        <p className="text-[14.5px] font-medium text-slate-700 leading-tight truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        {sections && sections.length > 0 && activeSection && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-full px-2.5 py-1 hover:bg-slate-50 transition-colors">
                {activeSection.icon}
                {activeSection.label}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-slate-200 text-slate-700 min-w-[220px]"
            >
              {sections.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onSelect={() => onSectionChange?.(s.value)}
                  className="text-xs gap-2 cursor-pointer focus:bg-slate-50 focus:text-slate-900"
                >
                  {s.icon}
                  <span className="flex-1">{s.label}</span>
                  {s.value === activeSection.value && (
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
