import { useMemo } from "react";
import { CARD_PRODUCTS, getCrossSellMatrix } from "@/lib/mockBankwideData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";

function fmtMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

const LEVEL_COLOR: Record<string, string> = {
  high: "bg-emerald-500 text-white",
  medium: "bg-emerald-300 text-emerald-900",
  low: "bg-amber-200 text-amber-900",
  none: "bg-slate-100 text-slate-400",
};

const LEVEL_LABEL: Record<string, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
  none: "—",
};

export function CrossSellReport({ onBack }: { onBack: () => void }) {
  const matrix = useMemo(() => getCrossSellMatrix(), []);
  const rowProducts = CARD_PRODUCTS;
  const colProducts = CARD_PRODUCTS;

  const rows = useMemo(() => {
    const out: {
      from: string;
      to: string;
      users: number;
      uplift: number;
      level: string;
    }[] = [];
    matrix.forEach((row) =>
      row.forEach((cell) => {
        if (cell.fromCard === cell.toCard) return;
        if (cell.opportunityLevel === "none") return;
        out.push({
          from: cell.fromCard,
          to: cell.toCard,
          users: cell.potentialUsers,
          uplift: cell.annualOpportunity,
          level: cell.opportunityLevel,
        });
      }),
    );
    return out.sort((a, b) => b.uplift - a.uplift);
  }, [matrix]);

  return (
    <ReportPageShell
      title="Cross-sell propensity matrix"
      category="Lifestyle"
      description="Card-to-card cross-sell opportunity with estimated annual uplift."
      onBack={onBack}
    >
      {() => (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-3 overflow-auto">
            <table className="text-[11px] w-full">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 font-medium p-1">From ↓ / To →</th>
                  {colProducts.map((p) => (
                    <th
                      key={p.name}
                      className="text-slate-500 font-medium p-1 align-bottom"
                      style={{ minWidth: 96 }}
                    >
                      <div className="truncate">{p.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowProducts.map((rp, ri) => (
                  <tr key={rp.name}>
                    <td className="p-1 text-slate-700 font-medium whitespace-nowrap">{rp.name}</td>
                    {colProducts.map((cp, ci) => {
                      const cell = matrix[ri]?.[ci];
                      if (!cell || rp.name === cp.name) {
                        return (
                          <td key={cp.name} className="p-0.5">
                            <div className="h-8 rounded bg-slate-50 text-slate-300 flex items-center justify-center">
                              —
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={cp.name} className="p-0.5">
                          <div
                            className={`h-8 rounded flex flex-col items-center justify-center text-[9px] ${LEVEL_COLOR[cell.opportunityLevel] ?? "bg-slate-100"}`}
                            title={`${rp.name} → ${cp.name}: ${cell.opportunityLevel}, ${fmtMoney(cell.annualOpportunity)}`}
                          >
                            <span className="font-medium leading-none">
                              {LEVEL_LABEL[cell.opportunityLevel]}
                            </span>
                            <span className="leading-none opacity-80 mt-0.5">
                              {fmtMoney(cell.annualOpportunity)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ReportDataTable
            caption="Top cross-sell pairs by estimated annual uplift"
            rows={rows.slice(0, 25)}
            rowKey={(r) => `${r.from}->${r.to}`}
            columns={[
              { key: "from", header: "From", render: (r) => r.from },
              { key: "to", header: "To", render: (r) => r.to },
              { key: "users", header: "Potential users", align: "right", render: (r) => fmtNum(r.users) },
              { key: "uplift", header: "Est. annual uplift", align: "right", render: (r) => fmtMoney(r.uplift) },
              {
                key: "level",
                header: "Level",
                align: "right",
                render: (r) => (
                  <span
                    className={`inline-block text-[10px] uppercase px-1.5 py-0.5 rounded ${LEVEL_COLOR[r.level] ?? "bg-slate-100"}`}
                  >
                    {r.level}
                  </span>
                ),
              },
            ]}
          />
        </>
      )}
    </ReportPageShell>
  );
}
