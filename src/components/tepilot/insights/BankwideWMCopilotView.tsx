import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Briefcase, Mail, Inbox } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { LifeEventsAlertDashboard } from "@/components/tepilot/advisor-console/LifeEventsAlertDashboard";
import { AdvisorNotificationsView } from "@/components/tepilot/advisor-console/AdvisorNotificationsView";
import { CoworkerInboxView } from "@/components/tepilot/coworker-inbox/CoworkerInboxView";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { EventPreparationData } from "@/types/dashboardClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMemo } from "react";

type ViewMode = "inbox" | "dashboard" | "notifications";

export function BankwideWMCopilotView() {
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");

  const dashboardClients = useMemo(() => generateDashboardClients(60), []);

  const handleOpenClient = useCallback(() => {
    toast.info("Client detail view is disabled in this demo.");
  }, []);

  const handleScheduleCall = useCallback((clientId: string) => {
    const client = dashboardClients.find(c => c.id === clientId);
    toast.success(`Scheduling call with ${client?.profile.name || 'client'}...`);
  }, [dashboardClients]);

  const handlePrepareWithVentus = useCallback((_data: EventPreparationData) => {
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
            Coworker Inbox
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("dashboard")}
            className={cn(
              "h-8 px-3 rounded-md",
              viewMode === "dashboard"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
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
            Notifications
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
        ) : viewMode === "dashboard" ? (
          <LifeEventsAlertDashboard
            clients={dashboardClients}
            onOpenClient={handleOpenClient}
            onScheduleCall={handleScheduleCall}
            onPrepareWithVentus={handlePrepareWithVentus}
          />
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
