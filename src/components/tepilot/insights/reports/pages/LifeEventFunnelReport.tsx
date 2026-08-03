import { useMemo } from "react";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

const STAGES = [
  { key: "raised", label: "Signals raised", tone: "bg-slate-200" },
  { key: "corroborated", label: "Corroborated by evidence", tone: "bg-blue-300" },
  { key: "confirmed", label: "Confirmed event", tone: "bg-blue-500" },
  { key: "actioned", label: "Outreach actioned", tone: "bg-emerald-500" },
] as const;

const EVENT_TYPES = [
  { key: "new_baby", label: "New baby", outreach: "Education savings + life insurance" },
  { key: "home_purchase", label: "Home purchase", outreach: "Mortgage review + HELOC pre-approval" },
  { key: "job_change", label: "Job change", outreach: "401k rollover + direct-deposit switch" },
  { key: "relocation", label: "Relocation", outreach: "Branch transfer + local rewards refresh" },
  { key: "retirement", label: "Retirement", outreach: "Advisor intro + decumulation plan" },
  { key: "marriage", label: "Marriage", outreach: "Joint account + insurance bundle" },
  { key: "inheritance", label: "Inheritance / liquidity", outreach: "Wealth Management referral" },
];

function fmtNum(n: number) {
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function LifeEventFunnelReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Life event detection funnel"
      category="Retention"
      description="How many behavioral signals become confirmed life events, by stage and event type. Identifies where outreach is leaking value."
      onBack={onBack}
      defaultPreset="90d"
    >
      {({ range }) => {
        const stageTotals = useMemo(() => {
          const raised = Math.round(48000 * (0.7 + seededRand(range.seed, 1) * 0.6));
          const corroborated = Math.round(raised * (0.42 + seededRand(range.seed, 2) * 0.12));
          const confirmed = Math.round(corroborated * (0.58 + seededRand(range.seed, 3) * 0.1));
          const actioned = Math.round(confirmed * (0.46 + seededRand(range.seed, 4) * 0.14));
          return { raised, corroborated, confirmed, actioned };
        }, [range.seed]);

        const max = stageTotals.raised;

        const recent = useMemo(
          () =>
            EVENT_TYPES.map((e, i) => {
              const confirmed = Math.round(220 * (0.4 + seededRand(range.seed + i * 7, i) * 1.5));
              const evidence = 3 + Math.floor(seededRand(range.seed, i * 3) * 7);
              const actionRate = Math.round((35 + seededRand(range.seed, i * 5) * 50) * 10) / 10;
              return {
                ...e,
                confirmed,
                evidence,
                actionRate,
              };
            }).sort((a, b) => b.confirmed - a.confirmed),
          [range.seed],
        );

        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-[12px] font-medium text-slate-700 mb-4">Detection funnel — {range.label}</div>
              <div className="space-y-2">
                {STAGES.map((s, i) => {
                  const v = (stageTotals as Record<string, number>)[s.key];
                  const width = (v / max) * 100;
                  const prev = i === 0 ? v : (stageTotals as Record<string, number>)[STAGES[i - 1].key];
                  const conv = i === 0 ? 100 : Math.round((v / prev) * 1000) / 10;
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className="w-44 text-[12px] text-slate-700 shrink-0">{s.label}</div>
                      <div className="flex-1 h-7 bg-slate-50 rounded overflow-hidden relative">
                        <div className={`${s.tone} h-full transition-all`} style={{ width: `${width}%` }} />
                        <div className="absolute inset-0 flex items-center px-2 text-[11px] text-slate-800 font-medium tabular-nums">
                          {fmtNum(v)}
                        </div>
                      </div>
                      <div className="w-28 text-right text-[11px] text-slate-500 tabular-nums shrink-0">
                        {i === 0 ? "—" : `${conv}% conv.`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                End-to-end conversion: {fmtNum(stageTotals.actioned)} of {fmtNum(stageTotals.raised)} signals actioned
                ({((stageTotals.actioned / stageTotals.raised) * 100).toFixed(1)}%).
              </div>
            </div>

            <ReportDataTable
              caption={`Confirmed events by type (${range.label})`}
              rows={recent}
              rowKey={(r) => r.key}
              columns={[
                { key: "label", header: "Event type", render: (r) => r.label },
                { key: "confirmed", header: "Confirmed", align: "right", render: (r) => fmtNum(r.confirmed) },
                { key: "evidence", header: "Avg evidence txns", align: "right", render: (r) => r.evidence.toString() },
                {
                  key: "actionRate",
                  header: "Actioned",
                  align: "right",
                  render: (r) => (
                    <span className={r.actionRate >= 50 ? "text-emerald-600" : "text-amber-600"}>
                      {r.actionRate.toFixed(1)}%
                    </span>
                  ),
                },
                { key: "outreach", header: "Recommended outreach", render: (r) => r.outreach },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
