import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, CreditCard, AlertTriangle, Repeat } from "lucide-react";
import {
  getSubscriptionMetrics,
  getTopSubscriptions,
  getSubscriptionCategories,
  getSubscriptionTrend,
  getChurnSignals,
} from "@/lib/mockSubscriptionData";
import { CollapsibleCard } from "./CollapsibleCard";
import { TabHeader } from "./TabHeader";

const categoryColorMap: Record<string, string> = Object.fromEntries(
  getSubscriptionCategories().map((c) => [c.category, c.color])
);

const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const fmtK = (n: number) => `${(n / 1_000).toFixed(1)}K`;

export function SubscriptionAnalyticsView() {
  const metrics = getSubscriptionMetrics();
  const topSubs = getTopSubscriptions();
  const categories = getSubscriptionCategories();
  const trend = getSubscriptionTrend();
  const churnSignals = getChurnSignals();

  const metricCards = [
    { label: "Total Monthly Spend", value: fmt(metrics.totalMonthlySpend), icon: DollarSign, color: "text-emerald-600" },
    { label: "Active Subscriptions", value: fmtK(metrics.totalActiveSubscriptions), icon: Repeat, color: "text-blue-600" },
    { label: "Avg per Customer", value: metrics.avgSubscriptionsPerCustomer.toFixed(1), icon: Users, color: "text-violet-600" },
    { label: "MoM Growth", value: `+${metrics.momGrowth}%`, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Churn Rate", value: `${metrics.churnRate}%`, icon: TrendingDown, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<CreditCard className="w-4 h-4" />}
        title="Subscription Analytics"
        subtitle="Recurring charge detection across merchant patterns and frequency signals"
        howItWorks="Ventus identifies recurring charges by analyzing frequency, amount stability, and merchant patterns — catching subscriptions that MCC codes misclassify."
        whyItMatters="Detects churn risk early, sizes subscription wallet share, and identifies bundling opportunities."
      />
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="bg-white border-slate-200">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  {m.label}
                </div>
                <span className="text-xl font-bold text-slate-900">{m.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <CollapsibleCard title="Spend by Category" icon={<CreditCard className="w-4 h-4" />} defaultExpanded>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="totalSpend" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {categories.map((c) => (
                    <Cell key={c.category} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleCard>

        {/* Monthly trend */}
        <CollapsibleCard title="Monthly Subscription Trend" icon={<TrendingUp className="w-4 h-4" />} defaultExpanded>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="spend" tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="subs" orientation="right" tickFormatter={(v: number) => `${(v / 1_000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number, name: string) => name === "totalSpend" ? fmt(v) : fmtK(v)} />
                <Legend />
                <Line yAxisId="spend" type="monotone" dataKey="totalSpend" name="Total Spend" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line yAxisId="subs" type="monotone" dataKey="newSubscribers" name="New Subscribers" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line yAxisId="subs" type="monotone" dataKey="churnedSubscribers" name="Churned" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleCard>
      </div>

      {/* Top subscriptions table */}
      <CollapsibleCard title="Top 20 Subscriptions" description="Ranked by subscriber count across the customer base" icon={<Users className="w-4 h-4" />} defaultExpanded>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Subscribers</TableHead>
                <TableHead className="text-right">Monthly Volume</TableHead>
                <TableHead className="text-right">MoM</TableHead>
                <TableHead className="text-right">Avg Tenure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSubs.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell className="font-medium text-slate-400">{s.rank}</TableCell>
                  <TableCell className="font-medium text-slate-900">{s.merchant}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs text-white" style={{ backgroundColor: categoryColorMap[s.category] || '#6B7280' }}>{s.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{s.subscriberCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${(s.monthlyVolume / 1_000_000).toFixed(2)}M</TableCell>
                  <TableCell className="text-right">
                    <span className={s.momChange >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {s.momChange >= 0 ? "+" : ""}{s.momChange}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">{s.avgTenureMonths}mo</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleCard>

      {/* Churn signals */}
      <CollapsibleCard title="Subscription Churn Signals" description="Subscriptions with rising cancellation patterns" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} defaultExpanded>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {churnSignals.map((sig) => (
            <Card key={sig.merchant} className="border-slate-200 bg-slate-50/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{sig.merchant}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">{sig.category}</Badge>
                  </div>
                  <Badge variant="destructive" className="text-xs">{sig.cancellationRate}% churn</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <TrendingUp className="w-3 h-3" />
                  +{sig.momCancellationChange}% MoM cancellation increase · {sig.affectedCustomers.toLocaleString()} customers
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{sig.context}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
