import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/formatHelper";

interface CategoryData {
  category: string;
  volume: number;
  color: string;
}

interface Props {
  data: CategoryData[];
}

export function OutflowByCategoryChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.volume - a.volume);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Outflow by Product Category</h3>
      <p className="text-xs text-muted-foreground mb-4">Total estimated annual outflow volume per product category</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => `$${(v / 1_000_000_000).toFixed(1)}B`}
              tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="category"
              type="category"
              width={110}
              tick={{ fill: 'hsl(0 0% 80%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Outflow']}
              contentStyle={{
                backgroundColor: 'hsl(0 0% 8%)',
                border: '1px solid hsl(0 0% 15%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 95%)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={28}>
              {sorted.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
