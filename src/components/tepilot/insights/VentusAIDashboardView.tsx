import { useState, useEffect, useMemo } from "react";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { AnalystDashboardView } from "./dashboard/AnalystDashboardView";
import { FVIDashboard } from "./fvi/FVIDashboard";
import { CustomersDirectoryView } from "./customers/CustomersDirectoryView";
import { SubTabBar, type SubTabItem } from "./SubTabBar";
import { ReportsAndQueryView } from "./reports/ReportsAndQueryView";
import { QueryConsoleView } from "./QueryConsoleView";
import { ApiAccessView } from "./api/ApiAccessView";
import { getVentusPriorityCards, getPriorityPrompt } from "@/lib/ventusPriorityCards";
import { getRevenueOpportunities } from "@/lib/mockBankwideData";
import type { InteractiveReportId } from "./reports/interactiveReportsRegistry";
import { ShieldAlert, LayoutDashboard, FileBarChart, Terminal, Users, Plug } from "lucide-react";
import type { TabValue } from "./AnalyticsContainer";

const DASHBOARD_SECTIONS: SubTabItem[] = [
  { value: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { value: "customers", label: "Segments", icon: <Users className="w-3.5 h-3.5" /> },
  { value: "risk", label: "Risk", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { value: "reports", label: "Reports", icon: <FileBarChart className="w-3.5 h-3.5" /> },
  { value: "query", label: "Query", icon: <Terminal className="w-3.5 h-3.5" /> },
  { value: "api", label: "API", icon: <Plug className="w-3.5 h-3.5" /> },
];

const EMPTY_FILTERS = { cardProducts: [], regions: [], ageRanges: [] };

interface VentusAIDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
  onOpenInteractiveReport?: (id: InteractiveReportId, payload?: { opportunityId?: string }) => void;
  onOpenChat?: (prompt?: string) => void;
  initialSection?: "overview" | "customers" | "risk" | "reports" | "query" | "api";
}

export function VentusAIDashboardView({ onNavigate, onOpenOpportunity, onOpenInteractiveReport, onOpenChat, initialSection = "overview" }: VentusAIDashboardViewProps) {

  const [section, setSection] = useState<string>(initialSection);
  const [consoleQuery, setConsoleQuery] = useState<string | undefined>(undefined);
  const [signalSegment, setSignalSegment] = useState<{ family: SignalFamily; label: string } | null>(null);
  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const priorityCards = useMemo(
    () => getVentusPriorityCards(getRevenueOpportunities(EMPTY_FILTERS)),
    [],
  );

  const renderSliver = () => (
    <button
      type="button"
      onClick={() => onOpenChat?.()}
      className="group w-full text-left rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 shrink-0">
            <span className="text-sm font-black text-blue-300 leading-none">V</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white truncate">
                {priorityCards.length} priorities in your book right now
              </span>
              <span className="text-[11px] text-blue-200/80 truncate hidden sm:inline">
                Delivered by Ventus AI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Open the chat for the full briefing — segment, addressable value and next step.
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-200 group-hover:text-white transition-colors shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-1.5">
          {priorityCards.map((card) => (
            <span
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat?.(getPriorityPrompt(card));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenChat?.(getPriorityPrompt(card));
                }
              }}
              className="min-w-0 rounded-md border border-white/10 bg-white/10 px-2.5 py-1.5 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <span className="block text-[11.5px] font-medium text-white truncate">
                {card.headline}
              </span>
              <span className="block text-[10.5px] text-blue-100/80 tabular-nums truncate">
                {card.metric}
              </span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      <SubTabBar items={DASHBOARD_SECTIONS} value={section} onChange={setSection} />
      {section === "overview" && (
        <AnalystDashboardView
          onNavigate={onNavigate}
          onOpenOpportunity={onOpenOpportunity}
          onOpenSection={(s) => setSection(s)}
          onOpenSignalSegment={(family, label) => {
            if (family === "risk") {
              setSignalSegment(null);
              setSection("risk");
              return;
            }
            setSignalSegment({ family, label });
            setSection("customers");
          }}
          renderVentusSliver={onOpenChat ? renderSliver : undefined}
        />
      )}

      {section === "customers" && (
        <CustomersDirectoryView
          segment={signalSegment}
          onClearSegment={() => setSignalSegment(null)}
        />
      )}
      {section === "reports" && (
        <ReportsAndQueryView
          onOpenInteractiveReport={onOpenInteractiveReport}
          onRunInConsole={(sql) => { setConsoleQuery(sql); setSection("query"); }}
        />
      )}
      {section === "query" && <QueryConsoleView initialQuery={consoleQuery} />}
      {section === "risk" && <FVIDashboard />}
      {section === "api" && <ApiAccessView />}

    </div>
  );
}
