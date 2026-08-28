import { useMemo, useState } from "react";
import { ShieldCheck, History } from "lucide-react";
import { TabHeader } from "../insights/TabHeader";
import { PersonalizationDial } from "./PersonalizationDial";
import { SignalFamilyControls } from "./SignalFamilyControls";
import { GovernanceDocuments } from "./GovernanceDocuments";
import { TargetingGuardrailsPanel } from "../settings/TargetingGuardrailsPanel";
import {
  AUDIT_TRAIL,
  levelById,
  type PersonalizationLevelId,
  type SignalFamilyId,
} from "./personalizationLevels";

export function GovernanceView() {
  const [levelId, setLevelId] = useState<PersonalizationLevelId>("personalized");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const level = useMemo(() => levelById(levelId), [levelId]);

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<ShieldCheck className="w-4 h-4" />}
        title="Governance"
        subtitle="Set how far personalization goes, and the policies it runs inside"
        howItWorks="Choose a personalization level, enable the signal families your institution permits, upload the compliance and brand documents Ventus must respect, then set the operating guardrails."
        whyItMatters="Personalization only scales when leadership can see and change its limits. Everything below the line runs autonomously inside these rails."
      />

      <PersonalizationDial value={levelId} onChange={setLevelId} level={level} />

      <SignalFamilyControls
        level={level}
        overrides={overrides}
        onToggle={(id: SignalFamilyId, on) => setOverrides((prev) => ({ ...prev, [id]: on }))}
      />

      <GovernanceDocuments />

      <TargetingGuardrailsPanel />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-[13px] font-semibold text-slate-900">Change history</h3>
        </div>
        <p className="text-[11.5px] text-slate-500 mb-3">
          Every governance change is recorded with actor and timestamp.
        </p>
        <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {AUDIT_TRAIL.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[12.5px] text-slate-800 truncate">{a.action}</div>
                <div className="text-[11px] text-slate-400">{a.actor}</div>
              </div>
              <div className="text-[11px] text-slate-500 whitespace-nowrap font-mono">{a.at}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
