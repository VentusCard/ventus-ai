import { useEffect, useState } from "react";
import { Settings, CreditCard, Users, ShieldCheck, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabHeader } from "./TabHeader";
import { SettingsView } from "./SettingsView";
import { BillingView } from "./BillingView";
import { TeamView } from "./TeamView";
import { ApiKeysView } from "./ApiKeysView";
import { TargetingGuardrailsPanel } from "../settings/TargetingGuardrailsPanel";

interface SettingsContainerProps {
  initialTab?: string;
}

export function SettingsContainer({ initialTab = "general" }: SettingsContainerProps) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Settings className="w-4 h-4" />}
        title="Settings"
        subtitle="Manage your workspace, billing, team, and API access"
        howItWorks="Configure institution preferences, monitor subscription usage, manage API keys, and control who has access to Ventus — all from one place."
        whyItMatters="A single source of truth for workspace administration keeps your team aligned and your data compliant."
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="guardrails" className="gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Targeting Guardrails
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5">
            <Users className="w-3.5 h-3.5" /> Team & Permissions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" forceMount className="mt-5 data-[state=inactive]:hidden">
          <SettingsView />
        </TabsContent>
        <TabsContent value="guardrails" forceMount className="mt-5 data-[state=inactive]:hidden">
          <TargetingGuardrailsPanel />
        </TabsContent>
        <TabsContent value="api-keys" forceMount className="mt-5 data-[state=inactive]:hidden">
          <ApiKeysView />
        </TabsContent>
        <TabsContent value="billing" forceMount className="mt-5 data-[state=inactive]:hidden">
          <BillingView />
        </TabsContent>
        <TabsContent value="team" forceMount className="mt-5 data-[state=inactive]:hidden">
          <TeamView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
