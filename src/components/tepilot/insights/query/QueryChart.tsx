import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface ChartSpec {
  type: "line" | "bar" | "area";
  metric: string;
  dim: string;
}

interface Props {
  rows: Record<string, unknown>[];
  spec: ChartSpec;
}

export function QueryChart({ rows, spec }: Props) {
  if (!rows.length) return null;
  const data = rows.map((r) => ({ ...r, [spec.metric]: Number(r[spec.metric]) || 0 }));

  const common = (
    <>
      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
      <XAxis dataKey={spec.dim} stroke="#94a3b8" tick={{ fontSize: 11 }} />
      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
      <Tooltip
        contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12 }}
        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
      />
    </>
  );

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
        {spec.metric} <span className="text-slate-300">by</span> {spec.dim}
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Line type="monotone" dataKey={spec.metric} stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          ) : spec.type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Bar dataKey={spec.metric} fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {common}
              <Area type="monotone" dataKey={spec.metric} stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Auto-pick a chart spec from a result set:
 * - first numeric column = metric
 * - first column = dimension
 * - line if dimension looks like a date, bar otherwise
 * - honor a `-- @chart line|bar|area:<column>` override anywhere in the SQL
 */
export function pickChartSpec(
  sql: string,
  columns: string[],
  rows: Record<string, unknown>[],
): ChartSpec | null {
  if (!rows.length || columns.length < 2) return null;
  const override = sql.match(/--\s*@chart\s+(line|bar|area)(?::(\w+))?/i);
  const firstNumeric = columns.slice(1).find((c) => typeof rows[0][c] === "number");
  if (!firstNumeric) return null;
  const dim = columns[0];
  const dimVal = String(rows[0][dim] ?? "");
  const looksLikeDate = /^\d{4}-\d{2}(-\d{2})?$/.test(dimVal);
  return {
    type: (override?.[1]?.toLowerCase() as ChartSpec["type"]) || (looksLikeDate ? "line" : "bar"),
    metric: override?.[2] || firstNumeric,
    dim,
  };
}
