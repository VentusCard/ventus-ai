import { useMemo } from "react";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";
import { cn } from "@/lib/utils";

const TIERS = ["Essential", "Comfort", "Premium", "Luxury"] as const;
type Tier = (typeof TIERS)[number];

const NEXT_PRODUCT: Record<string, string> = {
  "Essential→Comfort": "Rewards Plus card upgrade",
  "Comfort→Premium": "Cashback Signature card",
  "Premium→Luxury": "Private Client onboarding",
  "Luxury→Premium": "Retention call + fee waiver",
  "Premium→Comfort": "Budgeting insights nudge",
  "Comfort→Essential": "Hardship outreach",
};

function fmtNum(n: number) {
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function TierMigrationReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Behavioral tier migration"
      category="Lifestyle"
      description="Customers shifting between Essential, Comfort, Premium and Luxury behavioral tiers — an early signal of upmarket or downmarket drift before income data confirms it."
      onBack={onBack}
      defaultPreset="90d"
    >
      {({ range }) => {
        const matrix = useMemo(() => {
          // rows = from tier, cols = to tier
          return TIERS.map((from, fi) =>
            TIERS.map((to, ti) => {
              const baseStay = fi === ti ? 8200 : 0;
              const drift = Math.abs(fi - ti);
              const base = drift === 0 ? baseStay : Math.max(40, 1400 / (drift * drift));
              const wobble = 0.55 + seededRand(range.seed + fi * 17, ti * 11) * 0.9;
              return Math.round(base * wobble);
            }),
          );
        }, [range.seed]);

        const rowTotals = matrix.map((row) => row.reduce((a, b) => a + b, 0));
        const max = Math.max(...matrix.flat().filter((v, i) => i % 5 !== 0));

        const jumps = useMemo(() => {
          const out: { from: Tier; to: Tier; n: number; magnitude: number; next: string }[] = [];
          TIERS.forEach((from, fi) =>
            TIERS.forEach((to, ti) => {
              if (fi === ti) return;
              const n = matrix[fi][ti];
              out.push({
                from,
                to,
                n,
                magnitude: Math.abs(fi - ti),
                next: NEXT_PRODUCT[`${from}→${to}`] ?? "Monitor",
              });
            }),
          );
          return out.sort((a, b) => b.n - a.n).slice(0, 8);
        }, [matrix]);

        const upmoves = jumps.filter((j) => TIERS.indexOf(j.to) > TIERS.indexOf(j.from)).reduce((a, b) => a + b.n, 0);
        const downmoves = jumps.filter((j) => TIERS.indexOf(j.to) < TIERS.indexOf(j.from)).reduce((a, b) => a + b.n, 0);
        const totalMoved = upmoves + downmoves;

        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Customers shifting tier</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{fmtNum(totalMoved)}</div>
                <div className="text-[11px] text-slate-400">{range.label}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Trending upmarket</div>
                <div className="text-[20px] font-semibold text-emerald-600 tabular-nums">{fmtNum(upmoves)}</div>
                <div className="text-[11px] text-slate-400">Premiumization signal</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Trending downmarket</div>
                <div className="text-[20px] font-semibold text-rose-600 tabular-nums">{fmtNum(downmoves)}</div>
                <div className="text-[11px] text-slate-400">Retention risk</div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-[12px] font-medium text-slate-700 mb-3">Migration matrix — rows: starting tier, columns: ending tier</div>
              <div className="inline-block">
                <table className="text-[11px] border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-slate-400 font-medium text-left">From ↓ / To →</th>
                      {TIERS.map((t) => (
                        <th key={t} className="p-2 text-slate-500 font-medium">{t}</th>
                      ))}
                      <th className="p-2 text-slate-400 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIERS.map((from, fi) => (
                      <tr key={from}>
                        <td className="p-2 text-slate-600 font-medium">{from}</td>
                        {TIERS.map((to, ti) => {
                          const v = matrix[fi][ti];
                          const isStay = fi === ti;
                          const isUp = ti > fi;
                          const intensity = isStay ? 0 : Math.min(1, v / max);
                          const color = isUp ? `rgba(16,185,129,${0.08 + intensity * 0.6})` : `rgba(244,63,94,${0.08 + intensity * 0.6})`;
                          return (
                            <td
                              key={to}
                              className={cn(
                                "p-2 text-center tabular-nums w-[80px]",
                                isStay ? "text-slate-400 bg-slate-50" : "text-slate-800",
                              )}
                              style={isStay ? undefined : { background: color }}
                            >
                              {isStay ? `${fmtNum(v)}*` : fmtNum(v)}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center text-slate-500 tabular-nums">{fmtNum(rowTotals[fi])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">* Stayed in tier. Green = upmarket, red = downmarket.</div>
            </div>

            <ReportDataTable
              caption="Largest tier transitions — recommended next action"
              rows={jumps}
              rowKey={(r) => `${r.from}-${r.to}`}
              columns={[
                { key: "from", header: "From", render: (r) => r.from },
                { key: "to", header: "To", render: (r) => r.to },
                { key: "n", header: "Customers", align: "right", render: (r) => fmtNum(r.n) },
                {
                  key: "dir",
                  header: "Direction",
                  render: (r) => {
                    const up = TIERS.indexOf(r.to) > TIERS.indexOf(r.from);
                    return (
                      <span className={up ? "text-emerald-600" : "text-rose-600"}>
                        {up ? "Upmarket" : "Downmarket"} · {r.magnitude} tier
                      </span>
                    );
                  },
                },
                { key: "next", header: "Suggested next product", render: (r) => r.next },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
