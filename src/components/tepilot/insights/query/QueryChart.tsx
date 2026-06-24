import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QueryResult } from "./queryDslEngine";

interface Props {
  result: QueryResult;
}

export function QueryChart({ result }: Props) {
  const viz = result.query.visualize;
  if (!viz) return null;
  if (!result.rows.length) return null;
  const dim = result.columns[0];
  const data = result.rows.map((r) => ({ ...r, [viz.metric]: Number(r[viz.metric]) || 0 }));

  const common = (
    <>
      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
      <XAxis dataKey={dim} stroke="#94a3b8" tick={{ fontSize: 11 }} />
      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
      <Tooltip
        contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12 }}
        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
      />
    </>
  );

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">{viz.metric}</div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viz.type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Line type="monotone" dataKey={viz.metric} stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          ) : viz.type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Bar dataKey={viz.metric} fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Area type="monotone" dataKey={viz.metric} stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
