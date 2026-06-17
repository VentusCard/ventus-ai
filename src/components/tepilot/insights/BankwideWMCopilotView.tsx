import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, Briefcase, Mail } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { AdvisorConsole } from "@/components/tepilot/advisor-console/AdvisorConsole";
import { LifeEventsAlertDashboard } from "@/components/tepilot/advisor-console/LifeEventsAlertDashboard";
import { AdvisorNotificationsView } from "@/components/tepilot/advisor-console/AdvisorNotificationsView";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { DashboardClient, EventPreparationData } from "@/types/dashboardClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { buildEventPreparationPrompt } from "@/lib/eventPreparationPromptBuilder";

type ViewMode = "dashboard" | "client" | "notifications";

export function BankwideWMCopilotView() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [pendingVentusMessage, setPendingVentusMessage] = useState<string | null>(null);

  const dashboardClients = useMemo(() => generateDashboardClients(60), []);

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return dashboardClients.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, dashboardClients]);

  const handleOpenClient = useCallback((clientId: string) => {
    const client = dashboardClients.find(c => c.id === clientId);
    if (client) {
      sessionStorage.setItem("tepilot_client_profile", JSON.stringify(client.profile));
      sessionStorage.setItem("tepilot_detected_events", JSON.stringify(client.detectedEvents));
      setSelectedClientId(clientId);
      setViewMode("client");
    }
  }, [dashboardClients]);

  const handleScheduleCall = useCallback((clientId: string) => {
    const client = dashboardClients.find(c => c.id === clientId);
    toast.success(`Scheduling call with ${client?.profile.name || 'client'}...`);
  }, [dashboardClients]);

  const handleBackToDashboard = useCallback(() => {
    sessionStorage.removeItem("tepilot_detected_events");
    setViewMode("dashboard");
    setSelectedClientId(null);
    setPendingVentusMessage(null);
  }, []);

  const handlePrepareWithVentus = useCallback((data: EventPreparationData) => {
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(data.client.profile));
    sessionStorage.setItem("tepilot_detected_events", JSON.stringify(data.client.detectedEvents));
    sessionStorage.setItem("tepilot_event_preparation", JSON.stringify(data));
    const prompt = buildEventPreparationPrompt(data);
    setPendingVentusMessage(prompt);
    setSelectedClientId(data.client.id);
    setViewMode("client");
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TabHeader
        icon={<Briefcase className="w-4 h-4" />}
        title="WM Copilot"
        subtitle="Real-time HNW client triggers and AI-powered advisor preparation"
        howItWorks="Ventus continuously monitors HNW client transactions for life events, risk signals, and opportunity triggers, surfacing them to advisors in real time."
        whyItMatters="Advisors spend less time on research and more on relationship building, with AI-powered preparation for every client interaction."
      />
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
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
            onClick={() => setViewMode("client")}
            className={cn(
              "h-8 px-3 rounded-md",
              viewMode === "client"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <User className="h-4 w-4 mr-2" />
            Client View
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
          Wealth Management Copilot
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "dashboard" ? (
          <LifeEventsAlertDashboard
            clients={dashboardClients}
            onOpenClient={handleOpenClient}
            onScheduleCall={handleScheduleCall}
            onPrepareWithVentus={handlePrepareWithVentus}
          />
        ) : (
          <AdvisorConsole
            enrichedTransactions={[]}
            aiInsights={null}
            isLoadingInsights={false}
            onBackToDashboard={handleBackToDashboard}
            initialPendingMessage={pendingVentusMessage}
            onPendingMessageConsumed={() => setPendingVentusMessage(null)}
            selectedClientProfile={selectedClient?.profile}
            selectedDashboardEvents={selectedClient?.detectedEvents}
          />
        )}
      </div>
    </div>
  );
}
