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

function scoreColor(score: number) {
  // 0..10
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-emerald-300";
  if (score >= 4) return "bg-amber-300";
  if (score >= 2) return "bg-rose-300";
  return "bg-slate-200";
}

export function CrossSellReport({ onBack }: { onBack: () => void }) {
  const matrix = useMemo(() => getCrossSellMatrix(), []);
  const rowProducts = CARD_PRODUCTS;
  const colProducts = CARD_PRODUCTS;

  // Flatten for table
  const rows = useMemo(() => {
    const out: {
      from: string;
      to: string;
      users: number;
      uplift: number;
      conv: number;
      score: number;
    }[] = [];
    matrix.forEach((row) =>
      row.forEach((cell) => {
        if (cell.fromCard === cell.toCard) return;
        out.push({
          from: cell.fromCard,
          to: cell.toCard,
          users: cell.userCount,
          uplift: cell.estimatedAnnualIncrease,
          conv: cell.conversionProbability,
          score: cell.propensityScore,
        });
      }),
    );
    return out.sort((a, b) => b.uplift - a.uplift);
  }, [matrix]);

  return (
    <ReportPageShell
      title="Cross-sell propensity matrix"
      category="Lifestyle"
      description="Card-to-card cross-sell propensity scores with estimated annual uplift."
      onBack={onBack}
    >
      {() => (
        <>
          {/* Heatmap */}
          <div className="rounded-md border border-slate-200 bg-white p-3 overflow-auto">
            <table className="text-[11px] w-full">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 font-medium p-1">From ↓ / To →</th>
                  {colProducts.map((p) => (
                    <th
                      key={p.name}
                      className="text-slate-500 font-medium p-1 align-bottom"
                      style={{ minWidth: 80 }}
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
                            <div className="h-7 rounded bg-slate-50 text-slate-300 flex items-center justify-center">
                              —
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={cp.name} className="p-0.5">
                          <div
                            className={`h-7 rounded flex items-center justify-center text-white text-[10px] font-medium ${scoreColor(cell.propensityScore)}`}
                            title={`${rp.name} → ${cp.name}: ${cell.propensityScore.toFixed(1)}/10, ${fmtNum(cell.userCount)} users`}
                          >
                            {cell.propensityScore.toFixed(1)}
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
              { key: "users", header: "Users", align: "right", render: (r) => fmtNum(r.users) },
              { key: "uplift", header: "Est. annual uplift", align: "right", render: (r) => fmtMoney(r.uplift) },
              { key: "conv", header: "Conv %", align: "right", render: (r) => `${r.conv.toFixed(1)}%` },
              { key: "score", header: "Score", align: "right", render: (r) => r.score.toFixed(1) },
            ]}
          />
        </>
      )}
    </ReportPageShell>
  );
}
