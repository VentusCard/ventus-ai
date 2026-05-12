import { useEffect, useState } from "react";
import { Sparkles, ListChecks, Paperclip, FileText, X, Send } from "lucide-react";
import { resolveBrief, type SelectedSignal } from "./NextConversationRationale";
import { FinancialTimelineTool } from "@/components/tepilot/advisor-console/FinancialTimelineTool";
import { supabase } from "@/integrations/supabase/client";
import type { LifeEvent } from "@/types/lifestyle-signals";

type ProjectType = NonNullable<LifeEvent["financial_projection"]>["project_type"];

const PROJECT_TYPE_MAP: Record<string, ProjectType> = {
  "College Preparation for Dependent": "education",
  "Home Purchase": "home",
  "Wedding Planning": "wedding",
  "New Baby": "family_formation",
  "Retirement Planning": "retirement",
};

const PROJECT_DURATION_DEFAULTS: Record<ProjectType, number> = {
  education: 4,
  home: 2,
  retirement: 25,
  business: 5,
  wedding: 1,
  wealth_transfer: 2,
  liquidity_event: 2,
  family_formation: 1,
  charitable_giving: 1,
  elder_care: 5,
  other: 3,
};

const SHORT_MAP: Record<string, string> = {
  "College Preparation for Dependent": "College_Prep",
  "Home Purchase": "Home_Purchase",
  "Wedding Planning": "Wedding",
  "New Baby": "New_Baby",
  "Retirement Planning": "Retirement",
  "Hawaiian Vacations": "Hawaii_Trip",
  "Annual Hawaiian Vacations": "Hawaii_Trip",
  "Winter Ski Trips": "Ski_Trip",
};

function shortSlug(label: string) {
  return (
    SHORT_MAP[label] ??
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("_")
  );
}

function buildMockEvent(label: string): LifeEvent {
  const projectType: ProjectType = PROJECT_TYPE_MAP[label] ?? "other";
  return {
    event_name: label,
    confidence: 0.9,
    evidence: [],
    talking_points: [],
    financial_projection: {
      project_type: projectType,
      estimated_start_year: new Date().getFullYear() + 1,
      duration_years: PROJECT_DURATION_DEFAULTS[projectType] ?? 3,
      estimated_total_cost: 0,
      estimated_current_savings: 0,
      recommended_monthly_contribution: 0,
      cost_breakdown: [],
      recommended_funding_sources: [],
    },
  };
}

interface Props {
  customerName: string;
  selectedSignal: SelectedSignal | null;
  /** Optional secondary signal label to merge into the customer header summary. */
  secondarySignalLabel?: string | null;
  /** Persona title used to personalize AI outreach pointers. */
  personaTitle?: string;
  /** Optional longer persona description for additional AI context. */
  personaSummary?: string;
  onClose: () => void;
}

interface FilePacketCardProps {
  fileName: string;
  actionCount: number;
  sensitive?: boolean;
  onOpen: () => void;
}

function FilePacketCard({ fileName, actionCount, sensitive, onOpen }: FilePacketCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full text-left rounded-lg border px-3 py-2.5 flex items-center gap-2.5 shadow-sm transition-all hover:shadow-md hover:ring-2 ${
        sensitive
          ? "bg-rose-50 border-rose-200 hover:ring-rose-300"
          : "bg-amber-50/70 border-amber-200 hover:ring-purple-300"
      }`}
    >
      <div
        className={`shrink-0 w-8 h-9 rounded flex items-center justify-center ${
          sensitive ? "bg-rose-100 text-rose-700" : "bg-white text-amber-700 border border-amber-200"
        }`}
      >
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[12.5px] font-semibold text-slate-800 truncate leading-tight">
          {fileName}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 leading-tight">
          Timeline · {actionCount} action items
        </p>
      </div>
      <Paperclip className={`w-3.5 h-3.5 shrink-0 ${sensitive ? "text-rose-400" : "text-amber-500"}`} />
    </button>
  );
}

export default function WMCopilotPhoneView({ customerName, selectedSignal, secondarySignalLabel, personaTitle, personaSummary, onClose }: Props) {
  const displayName = customerName || "Client";

  const fallbackSignal: SelectedSignal = selectedSignal ?? { kind: "lifeEvent", label: "College Preparation for Dependent" };
  const brief = resolveBrief(fallbackSignal);

  const [plannerSignal, setPlannerSignal] = useState<SelectedSignal | null>(null);
  const [pointers, setPointers] = useState<string[] | null>(null);
  const [pointersLoading, setPointersLoading] = useState(false);

  // Build summary line
  const summaryParts = [fallbackSignal.label];
  if (secondarySignalLabel && secondarySignalLabel !== fallbackSignal.label) {
    summaryParts.push(secondarySignalLabel);
  }
  const summary = `${summaryParts.join(" + ")} detected`;

  // Derive a stable mock first name
  const FIRST_NAMES = [
    "Sarah", "Michael", "Priya", "James", "Emily", "David", "Olivia",
    "Daniel", "Sophia", "Liam", "Ava", "Noah", "Mia", "Ethan", "Isabella",
  ];
  const seedSrc = displayName.replace(/[^A-Za-z0-9]/g, "");
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  const looksLikeRealName = /^[A-Za-z]+\s+[A-Za-z]+/.test(displayName) && !/^User\b/i.test(displayName);
  const firstName = looksLikeRealName ? displayName.split(/\s+/)[0] : FIRST_NAMES[seed % FIRST_NAMES.length];

  // Build packet entries (1 or 2)
  const secondarySignal: SelectedSignal | null =
    secondarySignalLabel && secondarySignalLabel !== fallbackSignal.label
      ? { kind: "lifeEvent", label: secondarySignalLabel }
      : null;

  const packets = [
    { signal: fallbackSignal, brief },
    ...(secondarySignal ? [{ signal: secondarySignal, brief: resolveBrief(secondarySignal) }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b border-purple-200 bg-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-purple-700">WM CoPilot</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close WM CoPilot"
          className="w-6 h-6 rounded-full hover:bg-purple-100 flex items-center justify-center text-purple-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Customer summary line */}
      <div className="shrink-0 px-3 py-2.5 border-b border-slate-100">
        <p className="text-[13.5px] font-bold text-slate-900">{displayName}</p>
        <p className="text-[12px] text-slate-600 mt-0.5">{summary}</p>
      </div>

      {/* Scrollable brief content */}
      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-3 space-y-3">
        {/* INSIGHT */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ventus AI Insight</h4>
          </div>
          <p className="text-[13px] leading-snug text-slate-700">{brief.insight}</p>
        </section>

        {/* NEXT STEPS */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <ListChecks className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next Steps</h4>
          </div>
          <ul className="space-y-1">
            {brief.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-[13px] leading-snug text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-purple-400"}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* TASKS AUTOMATED — file packet(s) attached */}
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className={`w-3 h-3 ${brief.sensitive ? "text-rose-500" : "text-purple-500"}`} />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tasks Automated</h4>
          </div>
          <p className="text-[13px] leading-snug text-slate-700 mb-2">
            I've prepped the timeline and action list — see {packets.length > 1 ? "attachments" : "attachment"} below.
          </p>
          <div className="space-y-2">
            {packets.map((p) => (
              <FilePacketCard
                key={p.signal.label}
                fileName={`${firstName}_${shortSlug(p.signal.label)}.pdf`}
                actionCount={p.brief.nextSteps.length}
                sensitive={p.brief.sensitive}
                onOpen={() => setPlannerSignal(p.signal)}
              />
            ))}
          </div>
        </section>
      </div>
      <FinancialTimelineTool
        open={plannerSignal !== null}
        onOpenChange={(open) => { if (!open) setPlannerSignal(null); }}
        detectedEvent={plannerSignal ? buildMockEvent(plannerSignal.label) : undefined}
      />
    </div>
  );
}
