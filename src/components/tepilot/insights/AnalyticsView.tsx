import { useState } from "react";
import { SubTabBar } from "./SubTabBar";
import { WalletShareView } from "./WalletShareView";
import { BankwideView } from "./BankwideView";
import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";
import { ReportsAndQueryView } from "./reports/ReportsAndQueryView";
import { QueryConsoleView } from "./QueryConsoleView";
import { Wallet, Layers, Repeat, FileBarChart } from "lucide-react";
import type { InteractiveReportId } from "./reports/interactiveReportsRegistry";

type AnalyticsSubTab = "outflow" | "pillars" | "subscriptions" | "reports" | "query";

const SUB_TABS = [
  { value: "outflow", label: "Outflow & Wallet Share", icon: <Wallet className="w-3.5 h-3.5" /> },
  { value: "pillars", label: "Portfolio Pillars", icon: <Layers className="w-3.5 h-3.5" /> },
  { value: "subscriptions", label: "Subscription Analytics", icon: <Repeat className="w-3.5 h-3.5" /> },
  { value: "reports", label: "Reports", icon: <FileBarChart className="w-3.5 h-3.5" /> },
];

interface AnalyticsViewProps {
  initialSubTab?: AnalyticsSubTab;
  onOpenInteractiveReport?: (id: InteractiveReportId, payload?: { opportunityId?: string }) => void;
}

export function AnalyticsView({ initialSubTab = "outflow", onOpenInteractiveReport }: AnalyticsViewProps) {
  const [subTab, setSubTab] = useState<AnalyticsSubTab>(initialSubTab);
  const [consoleQuery, setConsoleQuery] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-4">
      <SubTabBar items={SUB_TABS} value={subTab} onChange={(v) => setSubTab(v as AnalyticsSubTab)} />
      {subTab === "outflow" && <WalletShareView groupOutflowsByType />}
      {subTab === "pillars" && <BankwideView />}
      {subTab === "subscriptions" && <SubscriptionAnalyticsView />}
      {subTab === "reports" && (
        <ReportsAndQueryView
          onOpenInteractiveReport={onOpenInteractiveReport}
          onRunInConsole={(sql) => { setConsoleQuery(sql); setSubTab("query"); }}
        />
      )}
      {subTab === "query" && <QueryConsoleView initialQuery={consoleQuery} />}
    </div>
  );
}
