import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";
import type { AgeRange } from "@/types/bankwide";
import { CollapsibleCard } from "./CollapsibleCard";

interface DemographicBreakdownProps {
  ageRanges: AgeRange[];
}

export function DemographicBreakdown({ ageRanges }: DemographicBreakdownProps) {
  // Transform data for stacked chart
  const chartData = ageRanges.map(age => ({
    name: `${age.range}\n(${age.label})`,
    totalSpend: (age.accountCount * age.avgSpendPerAccount) / 1_000_000_000, // in billions
    avgSpend: age.avgSpendPerAccount,
    accounts: age.accountCount / 1_000_000, // in millions
  }));

  const formatBillions = (value: number) => `$${value.toFixed(1)}B`;
  const formatMillions = (value: number) => `${value.toFixed(1)}M`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-lg space-y-2">
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="text-sm">
            <span className="text-slate-500">Total Spend: </span>
            <span className="font-medium text-slate-900">{formatBillions(payload[0].value)}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">Accounts: </span>
            <span className="font-medium text-slate-900">{formatMillions(payload[0].payload.accounts)}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">Avg Spend/Account: </span>
            <span className="font-medium text-slate-900">${payload[0].payload.avgSpend.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate insights for preview
  const sortedBySpend = [...chartData].sort((a, b) => b.totalSpend - a.totalSpend);
  const topGroup = sortedBySpend[0];
  const topGroupOriginal = ageRanges.find(a => chartData.find(c => c.name.includes(a.range))?.name === topGroup?.name);
  const highestAvgSpend = [...ageRanges].sort((a, b) => b.avgSpendPerAccount - a.avgSpendPerAccount)[0];
  
  const previewContent = (
    <div className="text-sm">
      <span className="text-slate-900 font-medium">{topGroup?.name.split('\n')[0]}</span>
      <span className="text-slate-500"> drives </span>
      <span className="text-primary font-medium">{formatBillions(topGroup?.totalSpend || 0)}</span>
      <span className="text-slate-500"> in spend. </span>
      <span className="text-slate-900 font-medium">{highestAvgSpend?.range}</span>
      <span className="text-slate-500"> has highest per-account spend at </span>
      <span className="text-primary font-medium">${highestAvgSpend?.avgSpendPerAccount.toLocaleString()}</span>
      <span className="text-slate-500">.</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="Age Demographic Spending Patterns"
      description="Total annual spending and account distribution across age groups"
      icon={<Users className="h-5 w-5 text-primary" />}
      previewContent={previewContent}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Total Annual Spend ($B)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="totalSpend" 
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </CollapsibleCard>
  );
}
