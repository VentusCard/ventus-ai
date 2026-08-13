import { useState, useEffect } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { AnalystDashboardView } from "./dashboard/AnalystDashboardView";
import { FVIDashboard } from "./fvi/FVIDashboard";
import { CustomersDirectoryView } from "./customers/CustomersDirectoryView";
import { SubTabBar, type SubTabItem } from "./SubTabBar";
import { ReportsAndQueryView } from "./reports/ReportsAndQueryView";
import { QueryConsoleView } from "./QueryConsoleView";
import { ApiAccessView } from "./api/ApiAccessView";
import { VENTUS_QUICK_ACTIONS } from "./VentusAIChatPage";
import type { InteractiveReportId } from "./reports/interactiveReportsRegistry";
import { ShieldAlert, LayoutDashboard, FileBarChart, Terminal, Users, Plug } from "lucide-react";
import type { TabValue } from "./AnalyticsContainer";

const DASHBOARD_SECTIONS: SubTabItem[] = [
  { value: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { value: "customers", label: "Customers", icon: <Users className="w-3.5 h-3.5" /> },
  { value: "reports", label: "Reports", icon: <FileBarChart className="w-3.5 h-3.5" /> },
  { value: "query", label: "Query", icon: <Terminal className="w-3.5 h-3.5" /> },
  { value: "risk", label: "Risk", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { value: "api", label: "API", icon: <Plug className="w-3.5 h-3.5" /> },
];

const SLIVER_CHIPS = VENTUS_QUICK_ACTIONS.slice(0, 2);

interface VentusAIDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
  onOpenInteractiveReport?: (id: InteractiveReportId, payload?: { opportunityId?: string }) => void;
  onOpenChat?: (prompt?: string) => void;
  initialSection?: "overview" | "customers" | "reports" | "query" | "risk" | "api";
}

export function VentusAIDashboardView({ onNavigate, onOpenOpportunity, onOpenInteractiveReport, onOpenChat, initialSection = "overview" }: VentusAIDashboardViewProps) {

  const [section, setSection] = useState<string>(initialSection);
  const [consoleQuery, setConsoleQuery] = useState<string | undefined>(undefined);
  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const renderSliver = () => (
    <button
      type="button"
      onClick={() => onOpenChat?.()}
      className="group w-full text-left rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 shrink-0">
          <span className="text-sm font-black text-blue-300 leading-none">V</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-white truncate">
              Ask Ventus AI
            </span>
            <span className="text-[11px] text-blue-200/80 truncate hidden sm:inline">
              Leadership briefing — your bankwide book
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            Ask about outflow, growth pillars, life-event signals…
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          {SLIVER_CHIPS.map((chip) => (
            <span
              key={chip}
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat?.(chip);
              }}
              className="px-2 py-1 text-[11px] rounded-md bg-white/10 text-blue-100 hover:bg-white/20 border border-white/10 transition-colors cursor-pointer"
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-blue-200 group-hover:text-white transition-colors shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      <SubTabBar items={DASHBOARD_SECTIONS} value={section} onChange={setSection} />
      {section === "overview" && (
        <AnalystDashboardView onNavigate={onNavigate} onOpenOpportunity={onOpenOpportunity} renderVentusSliver={onOpenChat ? renderSliver : undefined} />
      )}
      {section === "customers" && <CustomersDirectoryView />}
      {section === "reports" && (
        <ReportsAndQueryView
          onOpenInteractiveReport={onOpenInteractiveReport}
          onRunInConsole={(sql) => { setConsoleQuery(sql); setSection("query"); }}
        />
      )}
      {section === "query" && <QueryConsoleView initialQuery={consoleQuery} />}
      {section === "risk" && <FVIDashboard />}
    </div>
  );
}
