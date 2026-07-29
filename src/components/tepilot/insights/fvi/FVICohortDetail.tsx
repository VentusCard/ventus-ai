import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, Percent, TrendingUp, Activity, Info, CheckCircle2, Clock, Circle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  cohorts, getCustomersForCohort, getCohortTrend, getSubSegmentBreakdown,
  getCohortMetrics, getMerchantMappingsForCohort, getRiskColor, getTrendIcon,
  getRiskLevel, type ActionStatus
} from "@/lib/fviData";

interface FVICohortDetailProps {
  cohortId: string;
  onBack: () => void;
}

const confidenceColors: Record<string, string> = {
  Confirmed: '#22C55E',
  High: '#3B82F6',
  Probable: '#EAB308',
};

export function FVICohortDetail({ cohortId, onBack }: FVICohortDetailProps) {
  const cohort = cohorts.find(c => c.id === cohortId);
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({});
  const [breakdownDimension, setBreakdownDimension] = useState<'income' | 'account' | 'geography' | 'tenure'>('income');

  if (!cohort) return null;

  const trendData = getCohortTrend(cohortId);
  const breakdown = getSubSegmentBreakdown(cohortId, breakdownDimension);
  const metrics = getCohortMetrics(cohortId);
  const merchantMappings = getMerchantMappingsForCohort(cohortId);
  const riskLevel = getRiskLevel(cohort.avgFviScore);

  const toggleActionStatus = (actionId: string) => {
    setActionStatuses(prev => {
      const current = prev[actionId] || 'pending';
      const next: ActionStatus = current === 'pending' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'pending';
      return { ...prev, [actionId]: next };
    });
  };

  const statusIcon = (status: ActionStatus) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-amber-500" />;
    return <Circle className="w-4 h-4 text-slate-300" />;
  };

  const dimensions = [
    { key: 'income' as const, label: 'Income Band' },
    { key: 'account' as const, label: 'Account Type' },
    { key: 'geography' as const, label: 'Geography' },
    { key: 'tenure' as const, label: 'Tenure' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 mt-1" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{cohort.name}</h2>
          <p className="text-sm text-slate-500">{cohort.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="font-medium text-slate-700">{cohort.customerCount.toLocaleString()} customers</span>
            <span className={`font-medium ${cohort.trend === 'growing' && cohort.avgFviScore > 50 ? 'text-red-600' : cohort.trend === 'growing' ? 'text-green-600' : 'text-slate-500'}`}>
              {getTrendIcon(cohort.trend)} {cohort.trendPercent > 0 ? `${cohort.trend === 'shrinking' ? '-' : '+'}${cohort.trendPercent}%` : 'Stable'} vs last month
            </span>
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-4xl font-bold" style={{ color: getRiskColor(cohort.avgFviScore) }}>{cohort.avgFviScore}</div>
          <div className="text-xs uppercase font-semibold tracking-wider" style={{ color: getRiskColor(cohort.avgFviScore) }}>Avg FVI Score • {riskLevel}</div>
        </div>
      </div>

      {/* Section A: Trend Chart */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Cohort Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Area yAxisId="left" type="monotone" dataKey="customerCount" fill="#3B82F620" stroke="#3B82F6" strokeWidth={2} name="Customer Count" />
                <Area yAxisId="right" type="monotone" dataKey="avgCategorySpend" fill="#F9731620" stroke="#F97316" strokeWidth={2} name="Avg Category Spend ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Breakdown */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Breakdown by Sub-Segment</CardTitle>
            <div className="flex gap-1">
              {dimensions.map(d => (
                <button
                  key={d.key}
                  onClick={() => setBreakdownDimension(d.key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    breakdownDimension === d.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Avg Monthly Spend', value: `$${metrics.avgMonthlySpend.toLocaleString()}`, sublabel: 'In primary vulnerability category', icon: DollarSign },
          { label: 'Avg % of Income', value: `${metrics.avgIncomePct}%`, sublabel: 'Of estimated monthly income', icon: Percent },
          { label: 'Avg MoM Velocity', value: `${metrics.avgVelocity > 0 ? '+' : ''}${metrics.avgVelocity}%`, sublabel: 'Month-over-month change', icon: TrendingUp },
          { label: 'Avg Transaction Frequency', value: `${metrics.avgFrequency}/mo`, sublabel: 'Transactions per month', icon: Activity },
        ].map(m => (
          <Card key={m.label} className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <m.icon className="w-3.5 h-3.5" /> {m.label}
              </div>
              <div className="text-xl font-bold text-slate-900">{m.value}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.sublabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section D: Merchant Intelligence */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Merchant Intelligence — How Ventus AI Identifies Hidden Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Raw Bank Statement Descriptor</TableHead>
                <TableHead className="text-xs">Ventus AI Identification</TableHead>
                <TableHead className="text-xs">Confidence</TableHead>
                <TableHead className="text-xs">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantMappings.map(m => (
                <TableRow key={m.rawDescriptor}>
                  <TableCell className="font-mono text-xs text-slate-500">{m.rawDescriptor}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-900">{m.ventusIdentification}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] text-white" style={{ backgroundColor: confidenceColors[m.confidence] }}>
                      {m.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{m.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Traditional bank systems see "Fenix International Ltd — $14.99" and classify it as MCC 5968 (Direct Marketing).
              Ventus AI identifies this as an OnlyFans subscription and routes it to the correct behavioral category — enabling
              the vulnerability detection that MCC codes make impossible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section E: Recommended Actions */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cohort.recommendedActions.map(action => {
              const status = actionStatuses[action.id] || 'pending';
              return (
                <div
                  key={action.id}
                  className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                    status === 'completed' ? 'bg-green-50 border-green-200' :
                    status === 'in_progress' ? 'bg-amber-50 border-amber-200' :
                    'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleActionStatus(action.id)}
                >
                  <div className="flex items-start gap-2">
                    {statusIcon(status)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">{action.owner}</Badge>
                        <Badge variant="secondary" className="text-[10px]" style={{
                          backgroundColor: action.priority === 'high' ? '#FEE2E2' : action.priority === 'medium' ? '#FEF3C7' : '#F1F5F9',
                          color: action.priority === 'high' ? '#DC2626' : action.priority === 'medium' ? '#D97706' : '#64748B',
                        }}>
                          {action.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Click an action to cycle its status: Pending → In Progress → Completed</p>
        </CardContent>
      </Card>
    </div>
  );
}
