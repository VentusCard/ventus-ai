import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, Inbox, Building2, Radio, SlidersHorizontal } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { AdvisorNotificationsView } from "@/components/tepilot/advisor-console/AdvisorNotificationsView";
import { LeadershipNotificationsView } from "@/components/tepilot/advisor-console/LeadershipNotificationsView";
import { CoworkerInboxView } from "@/components/tepilot/coworker-inbox/CoworkerInboxView";
import { CoworkerLiveStreamView } from "@/components/tepilot/coworker-inbox/CoworkerLiveStreamView";
import { CoworkerPersonaSettingsView } from "@/components/tepilot/coworker-inbox/CoworkerPersonaSettingsView";

import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "inbox" | "persona" | "stream" | "advisor" | "leadership";

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
    { key: "persona", label: "Persona Settings", icon: <SlidersHorizontal className="h-4 w-4 mr-2" /> },
    { key: "stream", label: "Live Work Stream", icon: <Radio className="h-4 w-4 mr-2" /> },
    { key: "advisor", label: "Advisor Conv. Demo", icon: <Mail className="h-4 w-4 mr-2" /> },
    { key: "leadership", label: "Leadership Conv. Demo", icon: <Building2 className="h-4 w-4 mr-2" /> },
  ];



  return (
    <div className="flex flex-col h-full">
      {!hideHeader && <TabHeader
        icon={<Briefcase className="w-4 h-4" />}
        title="Ventus AI Coworker"
        subtitle="An email-based Ventus AI teammate for every bank colleague"
        howItWorks="Ventus AI scans behavior across 3M+ households and emails personalized intelligence briefs to the bank employees who need them — advisors, leaders, product teams, risk, rewards, and marketing. It replies instantly when anyone writes back."
        whyItMatters="Enterprise-scale coverage without adding headcount. Every colleague gets the right insight at the right time, delivered straight to their inbox."
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
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "stream" && <CoworkerLiveStreamView />}
        {viewMode === "inbox" && <CoworkerInboxView />}
        {viewMode === "persona" && <CoworkerPersonaSettingsView />}


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
