import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

const DESTINATIONS = [
  { name: "Fidelity Brokerage", type: "Brokerage ACH" },
  { name: "Charles Schwab", type: "Brokerage ACH" },
  { name: "Robinhood", type: "Brokerage ACH" },
  { name: "Chime", type: "Neobank funding" },
  { name: "SoFi", type: "Neobank funding" },
  { name: "Cash App", type: "P2P / Neobank" },
  { name: "Chase Card Pay", type: "Competitor card paydown" },
  { name: "Amex Card Pay", type: "Competitor card paydown" },
  { name: "Capital One Pay", type: "Competitor card paydown" },
  { name: "Zelle → External", type: "P2P to rival bank" },
  { name: "Wealthfront", type: "Brokerage ACH" },
];

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function WalletShareReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Wallet share & outbound funds"
      category="Outflow"
      description="Detects funds leaving the bank to brokerages, neobanks, competitor cards and rival banks. Surfaces AUM and deposits at risk per customer for win-back."
      onBack={onBack}
      defaultPreset="90d"
    >
      {({ range }) => {
        const rows = useMemo(
          () =>
            DESTINATIONS.map((d, i) => {
              const base = (12 - i) * 0.9e7;
              const outflow = Math.round(base * (0.5 + seededRand(range.seed + i * 11, i) * 1.4));
              const customers = Math.round(outflow / (1800 + seededRand(range.seed, i) * 1200));
              const winbackPct = Math.round((22 + seededRand(range.seed, i * 3) * 30) * 10) / 10;
              const winbackValue = Math.round((outflow * winbackPct) / 100);
              return { ...d, outflow, customers, winbackPct, winbackValue };
            }).sort((a, b) => b.outflow - a.outflow),
          [range.seed],
        );

        const totalOut = rows.reduce((a, b) => a + b.outflow, 0);
        const totalWinback = rows.reduce((a, b) => a + b.winbackValue, 0);
        const totalCustomers = rows.reduce((a, b) => a + b.customers, 0);

        const chartData = rows.slice(0, 10).map((r) => ({ name: r.name, outflow: r.outflow }));

        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Outbound funds detected</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{fmt(totalOut)}</div>
                <div className="text-[11px] text-slate-400">{range.label}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Customers affected</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{totalCustomers.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">With outbound flow this period</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Est. win-back opportunity</div>
                <div className="text-[20px] font-semibold text-emerald-600 tabular-nums">{fmt(totalWinback)}</div>
                <div className="text-[11px] text-slate-400">Addressable with outreach</div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="text-[12px] font-medium text-slate-700 mb-2 px-1">Outflow by destination</div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v as number)} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={140} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, background: "white" }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Bar dataKey="outflow" fill="#f59e0b" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ReportDataTable
              caption="Win-back opportunities by destination"
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                { key: "name", header: "Destination", render: (r) => r.name },
                { key: "type", header: "Type", render: (r) => <span className="text-slate-500">{r.type}</span> },
                { key: "outflow", header: "Outflow", align: "right", render: (r) => fmt(r.outflow) },
                { key: "customers", header: "Customers", align: "right", render: (r) => r.customers.toLocaleString() },
                { key: "wp", header: "Win-back rate", align: "right", render: (r) => `${r.winbackPct.toFixed(1)}%` },
                {
                  key: "wv",
                  header: "AUM at stake",
                  align: "right",
                  render: (r) => <span className="text-emerald-600">{fmt(r.winbackValue)}</span>,
                },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
