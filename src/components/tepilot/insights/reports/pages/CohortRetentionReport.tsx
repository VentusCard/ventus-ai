import { useMemo } from "react";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

const COHORTS = [
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
];

interface CohortRow {
  cohort: string;
  size: number;
  retention: (number | null)[]; // M0..M11
}

function build(seed: number): CohortRow[] {
  return COHORTS.map((cohort, ci) => {
    const size = 50_000 + Math.round(seededRand(seed, ci * 13) * 80_000);
    const monthsAvailable = COHORTS.length - ci;
    const retention: (number | null)[] = [];
    for (let m = 0; m < 12; m++) {
      if (m >= monthsAvailable) {
        retention.push(null);
      } else if (m === 0) {
        retention.push(100);
      } else {
        // monotone decay seeded
        const prev = retention[m - 1] as number;
        const drop = 1 + seededRand(seed + ci, m * 7) * 6;
        retention.push(Math.max(20, prev - drop));
      }
    }
    return { cohort, size, retention };
  });
}

function cellColor(v: number | null) {
  if (v === null) return "bg-slate-50 text-slate-300";
  if (v >= 90) return "bg-emerald-600 text-white";
  if (v >= 75) return "bg-emerald-400 text-white";
  if (v >= 60) return "bg-emerald-200 text-emerald-900";
  if (v >= 45) return "bg-amber-200 text-amber-900";
  if (v >= 30) return "bg-amber-300 text-amber-900";
  return "bg-rose-300 text-rose-900";
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

export function CohortRetentionReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Cohort retention (sign-up month)"
      category="Retention"
      description="Retention triangle by sign-up month cohort and tenure in months."
      onBack={onBack}
      defaultPreset="ytd"
    >
      {({ range }) => {
        const data = useMemo(() => build(range.seed), [range.seed]);
        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-3 overflow-auto">
              <table className="text-[11px] w-full">
                <thead>
                  <tr>
                    <th className="text-left text-slate-400 font-medium p-1">Cohort</th>
                    <th className="text-right text-slate-400 font-medium p-1">Size</th>
                    {Array.from({ length: 12 }).map((_, m) => (
                      <th key={m} className="text-center text-slate-400 font-medium p-1" style={{ minWidth: 44 }}>
                        M{m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.cohort}>
                      <td className="p-1 text-slate-700 font-medium whitespace-nowrap">{r.cohort}</td>
                      <td className="p-1 text-right text-slate-500 tabular-nums">{fmtNum(r.size)}</td>
                      {r.retention.map((v, m) => (
                        <td key={m} className="p-0.5">
                          <div
                            className={`h-7 rounded flex items-center justify-center text-[10px] font-medium ${cellColor(v)}`}
                          >
                            {v === null ? "—" : `${Math.round(v)}%`}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ReportDataTable
              caption="Cohort summary"
              rows={data}
              rowKey={(r) => r.cohort}
              columns={[
                { key: "c", header: "Cohort", render: (r) => r.cohort },
                { key: "s", header: "Size", align: "right", render: (r) => fmtNum(r.size) },
                {
                  key: "m1",
                  header: "M1",
                  align: "right",
                  render: (r) => (r.retention[1] === null ? "—" : `${r.retention[1].toFixed(1)}%`),
                },
                {
                  key: "m3",
                  header: "M3",
                  align: "right",
                  render: (r) => (r.retention[3] === null ? "—" : `${r.retention[3].toFixed(1)}%`),
                },
                {
                  key: "m6",
                  header: "M6",
                  align: "right",
                  render: (r) => (r.retention[6] === null ? "—" : `${r.retention[6].toFixed(1)}%`),
                },
                {
                  key: "m12",
                  header: "M11",
                  align: "right",
                  render: (r) => (r.retention[11] === null ? "—" : `${r.retention[11].toFixed(1)}%`),
                },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
