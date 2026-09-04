import { useState, useEffect, useMemo } from "react";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { cn } from "@/lib/utils";
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

  const [priorityIndex, setPriorityIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || priorityCards.length < 2) return;
    const t = window.setInterval(() => {
      setPriorityIndex((i) => (i + 1) % priorityCards.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [paused, priorityCards.length]);

  const activeCard = priorityCards[priorityIndex % Math.max(priorityCards.length, 1)];

  const renderSliver = () => (
    <button
      type="button"
      onClick={() => onOpenChat?.()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative w-full text-left rounded-xl border border-indigo-200/70 bg-gradient-to-r from-sky-100/90 via-indigo-100/80 to-violet-100/70 shadow-sm hover:shadow-md hover:border-indigo-300 hover:from-sky-100 hover:via-indigo-100 hover:to-violet-100 transition-all overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-500 via-indigo-500 to-violet-500" />
      <div className="pl-5 pr-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 border border-indigo-600/30 shadow-sm shrink-0">
            <span className="text-sm font-black text-white leading-none">V</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700 truncate">
                {priorityCards.length} priorities in your book right now
              </span>
              <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                Delivered by Ventus AI
              </span>
            </div>
            <div className="h-[18px] overflow-hidden mt-0.5">
              {activeCard && (
                <span
                  key={activeCard.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat?.(getPriorityPrompt(activeCard));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenChat?.(getPriorityPrompt(activeCard));
                    }
                  }}
                  className="ventus-roll-in flex items-center gap-2 h-[18px] cursor-pointer group/item"
                >
                  <span className="text-[11.5px] font-medium text-slate-700 truncate group-hover/item:text-indigo-600 group-hover/item:underline">
                    {activeCard.headline}
                  </span>
                  <span className="text-[10.5px] text-slate-600 tabular-nums truncate shrink-0">
                    {activeCard.metric}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {priorityCards.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
                {priorityCards.map((card, i) => (
                  <span
                    key={card.id}
                    role="button"
                    tabIndex={-1}
                    aria-label={card.headline}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPriorityIndex(i);
                    }}
                    className={cn(
                      "block w-1.5 h-1.5 rounded-full transition-colors cursor-pointer",
                      i === priorityIndex ? "bg-indigo-500" : "bg-indigo-200 hover:bg-indigo-400",
                    )}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 text-indigo-500 group-hover:text-indigo-600 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
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
          onOpenSignalSegment={(seed) => {
            setSignalSegment(seed);
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
