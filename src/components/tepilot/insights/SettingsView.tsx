import { Building2, Bell, Plug, ShieldCheck, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSaveSequence, CONTENT_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";

const integrations = [
  { name: "Core Banking System", desc: "FIS Profile · Real-time transaction sync", connected: true },
  { name: "CRM", desc: "Salesforce Financial Services Cloud", connected: true },
  { name: "Email & SMS", desc: "Twilio · Customer outreach delivery", connected: true },
  { name: "Data Warehouse", desc: "Snowflake · Nightly enrichment exports", connected: false },
  { name: "Marketing Automation", desc: "Braze · Campaign orchestration", connected: false },
  { name: "Card Processor", desc: "TSYS · Card-linked offer activation", connected: true },
];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export function SettingsView() {
  const save = useSaveSequence({ stages: CONTENT_STAGES, doneLabel: "Settings saved" });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Institution Profile" icon={Building2}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <Button variant="outline" size="sm">Upload Logo</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Display Name</Label>
                <Input defaultValue="Our Bank" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Short Name</Label>
                <Input defaultValue="OB" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Timezone</Label>
                <Select defaultValue="et">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="et">Eastern Time (ET)</SelectItem>
                    <SelectItem value="ct">Central Time (CT)</SelectItem>
                    <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Region</Label>
                <Select defaultValue="us">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" icon={Bell}>
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Weekly digest" desc="Summary of new insights every Monday morning" defaultChecked />
            <ToggleRow label="Life event alerts" desc="Email when high-confidence life events are detected" defaultChecked />
            <ToggleRow label="Wallet share anomalies" desc="Notify when outbound transfers spike vs baseline" defaultChecked />
            <ToggleRow label="Campaign performance" desc="Daily campaign activation and conversion summary" />
            <ToggleRow label="Product updates" desc="New Ventus features and improvements" defaultChecked />
          </div>
        </SectionCard>

        <SectionCard title="Integrations" icon={Plug}>
          <div className="grid grid-cols-1 gap-2">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{i.name}</p>
                  <p className="text-xs text-slate-500 truncate">{i.desc}</p>
                </div>
                {i.connected ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
                    <Check className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline">Connect</Button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security & Access" icon={ShieldCheck}>
          <div className="divide-y divide-slate-100">
            <ToggleRow label="SAML Single Sign-On" desc="Okta · Provisioned for all team accounts" defaultChecked />
            <ToggleRow label="Enforce multi-factor auth" desc="Required for all admin and owner roles" defaultChecked />
            <ToggleRow label="IP allowlist" desc="Restrict console access to corporate network ranges" />
            <div className="flex items-center justify-between gap-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800">Session timeout</p>
                <p className="text-xs text-slate-500 mt-0.5">Auto sign-out after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end items-center gap-3">
        <SaveSequence status={save.status} label={save.stageLabel} />
        <Button variant="outline">Cancel</Button>
        <Button onClick={() => save.run()} disabled={save.isBusy}>Save Changes</Button>
      </div>
    </div>
  );
}
