import { Settings, CreditCard, Users, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabHeader } from "./TabHeader";
import { SettingsView } from "./SettingsView";
import { BillingView } from "./BillingView";
import { TeamView } from "./TeamView";
import { TargetingGuardrailsPanel } from "../settings/TargetingGuardrailsPanel";

export function SettingsContainer() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Settings className="w-4 h-4" />}
        title="Settings"
        subtitle="Manage your workspace, billing, and team"
        howItWorks="Configure institution preferences, monitor subscription usage, and control who has access to Ventus — all from one place."
        whyItMatters="A single source of truth for workspace administration keeps your team aligned and your data compliant."
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="guardrails" className="gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Targeting Guardrails
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
