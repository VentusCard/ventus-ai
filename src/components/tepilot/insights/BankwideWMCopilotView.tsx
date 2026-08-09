import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, Inbox, Building2 } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { AdvisorNotificationsView } from "@/components/tepilot/advisor-console/AdvisorNotificationsView";
import { LeadershipNotificationsView } from "@/components/tepilot/advisor-console/LeadershipNotificationsView";
import { CoworkerInboxView } from "@/components/tepilot/coworker-inbox/CoworkerInboxView";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "inbox" | "advisor" | "leadership";

export function BankwideWMCopilotView({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");

  const dashboardClients = useMemo(() => generateDashboardClients(60), []);

  const handleOpenClient = useCallback(() => {
    toast.info("Client detail view is disabled in this demo.");
  }, []);

  const handlePrepareWithVentus = useCallback(() => {
    toast.info("Client detail view is disabled in this demo.");
  }, []);

  const toggles: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "inbox", label: "Coworker Dashboard", icon: <Inbox className="h-4 w-4 mr-2" /> },
    { key: "advisor", label: "Advisor Conv. Demo", icon: <Mail className="h-4 w-4 mr-2" /> },
    { key: "leadership", label: "Leadership Conv. Demo", icon: <Building2 className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && <TabHeader
        icon={<Briefcase className="w-4 h-4" />}
        title="WM Coworker"
        subtitle="An email-based Ventus AI teammate for advisors and wealth leadership"
        howItWorks="Ventus AI is an email-based coworker to the wealth team. It continuously scans behavior across 3M+ households, sends personalized signal briefs to individual advisors, delivers portfolio-wide trends and campaign recommendations to leadership, and replies instantly when anyone writes back."
        whyItMatters="Enterprise-scale coverage without adding headcount. Every advisor gets a personal research assistant, every leader gets a real-time chief of staff — inside the tool they already use."
      />}
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {toggles.map((t) => (
            <Button
              key={t.key}
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(t.key)}
              className={cn(
                "h-8 px-3 rounded-md",
                viewMode === t.key
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>
        <span className="text-sm text-slate-500 ml-2">
          Wealth Management Coworker
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "inbox" && <CoworkerInboxView />}
        {viewMode === "advisor" && (
          <AdvisorNotificationsView
            clients={dashboardClients}
            onOpenClient={handleOpenClient}
            onPrepareWithVentus={handlePrepareWithVentus}
          />
        )}
        {viewMode === "leadership" && <LeadershipNotificationsView />}
      </div>
    </div>
  );
}
