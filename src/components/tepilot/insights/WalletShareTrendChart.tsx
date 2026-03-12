import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WalletShareTrendPoint } from "@/types/bankwide";

interface Props {
  data: WalletShareTrendPoint[];
}

export function WalletShareTrendChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Deposit Flight Trend — 12 Months</h3>
      <p className="text-xs text-muted-foreground mb-4">Tracking outflow volume ($M), flight rate (%), and win-back rate (%)</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
            <XAxis
              dataKey="month"
              tickFormatter={(v: string) => v.split(' ')[0].slice(0, 3)}
              tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="volume"
              tickFormatter={(v) => `$${v}M`}
              tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 8%)',
                border: '1px solid hsl(0 0% 15%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 95%)',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                if (name === 'outflowVolume') return [`$${value}M`, 'Outflow Volume'];
                if (name === 'flightRate') return [`${value}%`, 'Flight Rate'];
                return [`${value}%`, 'Win-Back Rate'];
              }}
            />
            <Line yAxisId="volume" type="monotone" dataKey="outflowVolume" stroke="hsl(0, 62%, 50%)" strokeWidth={2} dot={false} />
            <Line yAxisId="rate" type="monotone" dataKey="flightRate" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} />
            <Line yAxisId="rate" type="monotone" dataKey="winBackRate" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-red-500 inline-block" /> Outflow Volume</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-orange-500 inline-block" /> Flight Rate</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-emerald-500 inline-block" /> Win-Back Rate</span>
      </div>
    </div>
  );
}
