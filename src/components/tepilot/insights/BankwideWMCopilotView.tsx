import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, Inbox } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { AdvisorNotificationsView } from "@/components/tepilot/advisor-console/AdvisorNotificationsView";
import { CoworkerInboxView } from "@/components/tepilot/coworker-inbox/CoworkerInboxView";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "inbox" | "notifications";

export function BankwideWMCopilotView() {
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");

  const dashboardClients = useMemo(() => generateDashboardClients(60), []);

  const handleOpenClient = useCallback(() => {
    toast.info("Client detail view is disabled in this demo.");
  }, []);

  const handlePrepareWithVentus = useCallback(() => {
    toast.info("Client detail view is disabled in this demo.");
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TabHeader
        icon={<Briefcase className="w-4 h-4" />}
        title="WM Coworker"
        subtitle="An email-based Ventus AI teammate for advisors and wealth leadership"
        howItWorks="Ventus AI is an email-based coworker to the wealth team. It continuously scans behavior across 3M+ households, sends personalized signal briefs to individual advisors, delivers portfolio-wide trends and campaign recommendations to leadership, and replies instantly when anyone writes back."
        whyItMatters="Enterprise-scale coverage without adding headcount. Every advisor gets a personal research assistant, every leader gets a real-time chief of staff — inside the tool they already use."
      />
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("inbox")}
            className={cn(
              "h-8 px-3 rounded-md",
              viewMode === "inbox"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Coworker Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("notifications")}
            className={cn(
              "h-8 px-3 rounded-md",
              viewMode === "notifications"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Mail className="h-4 w-4 mr-2" />
            Advisor Conv. Demo
          </Button>
        </div>
        <span className="text-sm text-slate-500 ml-2">
          Wealth Management Coworker
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "inbox" ? (
          <CoworkerInboxView />
        ) : (
          <AdvisorNotificationsView
            clients={dashboardClients}
            onOpenClient={handleOpenClient}
            onPrepareWithVentus={handlePrepareWithVentus}
          />
        )}
      </div>
    </div>
  );
}
