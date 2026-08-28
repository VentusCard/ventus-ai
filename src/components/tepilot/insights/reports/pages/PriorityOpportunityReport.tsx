import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { ArrowLeft, ArrowRight, Sparkles, Users, DollarSign, Handshake, Target, Store, Megaphone, Route, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRevenueOpportunities } from "@/lib/mockBankwideData";
import type { RevenueOpportunity } from "@/types/bankwide";
import { ChartCard } from "../../dashboard/ChartCard";
import type { TabValue } from "../../AnalyticsContainer";

interface PriorityOpportunityReportProps {
  opportunityId: string | null;
  onBack: () => void;
  onNavigate: (tab: TabValue) => void;
  onSelectOpportunity: (id: string) => void;
}


const EMPTY = { cardProducts: [], regions: [], ageRanges: [] };

function fmtDollars(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtUsers(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

// Deterministic seasonality curve (12 months) that roughly sums to 12.
// Tuned to feel "revenue-shaped" — higher in Q1 and Q4.
const SEASONALITY = [1.15, 1.08, 1.02, 0.92, 0.86, 0.82, 0.88, 0.95, 0.98, 1.05, 1.12, 1.17];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Fixed tier split — deterministic breakdown of an opportunity across
// customer tiers so the chart is stable across renders.
const TIER_SPLIT: { name: string; share: number }[] = [
  { name: "Preferred Rewards — Platinum", share: 0.28 },
  { name: "Preferred Rewards — Gold", share: 0.34 },
  { name: "Everyday Rewards", share: 0.24 },
  { name: "Student / Starter", share: 0.14 },
];

const PRIORITY_BADGE: Record<RevenueOpportunity["priority"], string> = {
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

function buildMonthlySeries(op: RevenueOpportunity) {
  const monthlyAvg = op.totalOpportunityAmount / 12;
  // Currently captured = ~22% of opportunity today, rising 1pp / month
  return SEASONALITY.map((s, i) => {
    const opportunity = monthlyAvg * s;
    const capturedRate = 0.22 + i * 0.01;
    const captured = opportunity * capturedRate;
    return {
      month: MONTH_LABELS[i],
      opportunity: Math.round(opportunity),
      captured: Math.round(captured),
    };
  });
}

function buildTierSeries(op: RevenueOpportunity) {
  return TIER_SPLIT.map((t) => ({
    name: t.name,
    users: Math.round(op.affectedUsers * t.share),
    revenue: Math.round(op.totalOpportunityAmount * t.share),
  }));
}

function buildQuarterPipeline(op: RevenueOpportunity) {
  const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];
  const byQuarter: Record<string, { quarter: string; [merchant: string]: string | number }> = {};
  for (const q of quarters) byQuarter[q] = { quarter: q };
  const merchants = Array.from(new Set(op.merchantPartnerships.map((m) => m.merchantName)));
  for (const m of op.merchantPartnerships) {
    if (!byQuarter[m.peakQuarter]) byQuarter[m.peakQuarter] = { quarter: m.peakQuarter };
    byQuarter[m.peakQuarter][m.merchantName] =
      ((byQuarter[m.peakQuarter][m.merchantName] as number) ?? 0) + m.estimatedRevenueCapture;
  }
  return { rows: quarters.map((q) => byQuarter[q]), merchants };
}

const MERCHANT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

export function PriorityOpportunityReport({ opportunityId, onBack, onNavigate, onSelectOpportunity }: PriorityOpportunityReportProps) {
  const opportunities = useMemo(() => getRevenueOpportunities(EMPTY), []);
  const top = opportunities.slice(0, 3);
  const selected = useMemo(() => {
    return (
      opportunities.find((o) => o.id === opportunityId) ??
      opportunities.find((o) => o.priority === "high") ??
      opportunities[0]
    );
  }, [opportunities, opportunityId]);

  const monthlySeries = useMemo(() => (selected ? buildMonthlySeries(selected) : []), [selected]);
  const tierSeries = useMemo(() => (selected ? buildTierSeries(selected) : []), [selected]);
  const pipeline = useMemo(
    () => (selected ? buildQuarterPipeline(selected) : { rows: [], merchants: [] }),
    [selected],
  );

  if (!selected) {
    return (
      <div className="p-8 text-sm text-slate-500">No priority opportunity found.</div>
    );
  }


  const avgSpendGap = selected.totalOpportunityAmount / Math.max(1, selected.affectedUsers);
  const merchantCount = selected.merchantPartnerships.length;
  const totalPipelineValue = selected.merchantPartnerships.reduce(
    (sum, m) => sum + m.estimatedRevenueCapture,
    0,
  );

  const nextSteps = [
    {
      n: 1,
      icon: Store,
      title: "Lock in merchant terms",
      owner: "Deals team",
      timeframe: "This week",
      rationale: `${merchantCount} partnership pitches ready with a combined ${fmtDollars(totalPipelineValue)} capture potential. Move deals into negotiation before peak windows close.`,
      cta: "Open Deal Pipeline",
      onClick: () => window.open("/tepilot/rewards-pipeline", "_self"),
    },
    {
      n: 2,
      icon: Route,
      title: "Target the ready cohort",
      owner: "Segment marketing",
      timeframe: "Within 14 days",
      rationale: `${fmtUsers(selected.affectedUsers)} customers match the gap profile. Build the segment now so activation flows are ready when merchant terms land.`,
      cta: "Open Next Product",
      onClick: () => onNavigate("targeting"),
    },
    {
      n: 3,
      icon: Megaphone,
      title: "Launch personalized campaigns",
      owner: "Growth / CRM",
      timeframe: "30 days",
      rationale: `Use Campaign Builder to deploy the offer with the "vaguely specific" behavioral framing this cohort responds to.`,
      cta: "Open Campaign Builder",
      onClick: () => onNavigate("targeting-campaign-builder"),
    },
    {
      n: 4,
      icon: LineChart,
      title: "Track lift and share of wallet",
      owner: "Analytics",
      timeframe: "Ongoing",
      rationale:
        selected.gapType === "cross-sell"
          ? "Watch the Cross-Sell report to confirm the new card is capturing incremental spend, not cannibalizing."
          : "Watch the Wallet Share report to confirm outbound spend is coming back on-us in the target category.",
      cta:
        selected.gapType === "cross-sell"
          ? "Open Cross-Sell report"
          : "Open Wallet Share report",
      onClick: () =>
        onNavigate(selected.gapType === "cross-sell" ? "report-cross-sell" : "report-wallet-share"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0 mt-0.5"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                Reports / Opportunities · Interactive briefing
              </span>
              <Badge variant="outline" className={cn("text-[10px]", PRIORITY_BADGE[selected.priority])}>
                {selected.priority} priority
              </Badge>
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900 leading-tight mt-1">
              {selected.gapTitle}
            </h2>
            <p className="text-[13px] text-slate-600 mt-1 leading-snug max-w-3xl">
              {selected.strategicInsight}
            </p>
          </div>
        </div>
      </div>

      {/* Opportunity switcher */}
      {top.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Switch opportunity:</span>
          {top.map((op) => {
            const active = op.id === selected.id;
            return (
              <button
                key={op.id}
                onClick={() => onSelectOpportunity(op.id)}

                className={cn(
                  "h-7 px-3 rounded-full text-[12px] border transition truncate max-w-[240px]",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                )}
              >
                {op.gapTitle}
              </button>
            );
          })}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          icon={DollarSign}
          label="Addressable revenue"
          value={fmtDollars(selected.totalOpportunityAmount)}
          hint="annualized"
        />
        <KpiTile
          icon={Users}
          label="Affected customers"
          value={fmtUsers(selected.affectedUsers)}
          hint="match the gap profile"
        />
        <KpiTile
          icon={Target}
          label="Avg spend gap / customer"
          value={fmtDollars(avgSpendGap)}
          hint="revenue per customer if closed"
        />
        <KpiTile
          icon={Handshake}
          label="Merchant partners identified"
          value={merchantCount.toString()}
          hint={`${fmtDollars(totalPipelineValue)} pipeline`}
        />
      </div>

      {/* Narrative */}
      <div className="rounded-md border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2">
            The opportunity
          </div>
          <div className="space-y-3 text-[13.5px] text-slate-700 leading-relaxed max-w-3xl">
            <p>
              Enrichment analysis surfaced <span className="font-semibold text-slate-900">{selected.gapTitle.toLowerCase()}</span> as one of the highest-value revenue gaps in the portfolio. Today, <span className="font-semibold">{selected.currentState}</span>. Closing this gap toward <span className="font-semibold">{selected.potentialState.toLowerCase()}</span> represents an estimated <span className="font-semibold text-slate-900">{fmtDollars(selected.totalOpportunityAmount)}</span> of annualized revenue across roughly <span className="font-semibold">{fmtUsers(selected.affectedUsers)} customers</span>.
            </p>
            <p>
              {selected.strategicInsight} Ventus AI has already staged <span className="font-semibold">{merchantCount}</span> merchant partnership pitches sized to the gap, with a combined capture potential of <span className="font-semibold">{fmtDollars(totalPipelineValue)}</span>. The activation window opens now — deals need to land before peak spend so the offer is live when the customer is ready to spend.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="text-[10px] uppercase tracking-wider font-medium text-rose-600 mb-1">
              Current state
            </div>
            <div className="text-[13px] text-slate-800">{selected.currentState}</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[10px] uppercase tracking-wider font-medium text-emerald-700 mb-1">
              Target state
            </div>
            <div className="text-[13px] text-slate-800">{selected.potentialState}</div>
          </div>
        </div>
      </div>

      {/* Charts — by the numbers */}
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-wider font-medium text-slate-400 px-1">
          By the numbers
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ChartCard
            title="Monthly opportunity vs. currently captured"
            hint="12-month annualized view"
            className="min-h-[280px]"
          >
            <div className="h-[220px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlySeries} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtDollars(v as number)} width={54} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, background: "white" }}
                    formatter={(v: number, name: string) => [fmtDollars(v), name === "opportunity" ? "Opportunity" : "Captured"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="opportunity" name="Opportunity" fill="#dbeafe" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Line type="monotone" dataKey="captured" name="Captured today" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Opportunity by customer tier" hint="Split across Preferred Rewards" className="min-h-[280px]">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierSeries} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtDollars(v as number)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={180} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, background: "white" }}
                    formatter={(v: number, name: string) =>
                      name === "revenue" ? [fmtDollars(v), "Revenue opportunity"] : [fmtUsers(v as number), "Customers"]
                    }
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="pt-3">
          <ChartCard
            title="Merchant partnership pipeline by quarter"
            hint={`${merchantCount} partners · ${fmtDollars(totalPipelineValue)} pipeline`}
            className="min-h-[280px]"
          >
            <div className="h-[240px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline.rows} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtDollars(v as number)} width={54} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, background: "white" }}
                    formatter={(v: number, name: string) => [fmtDollars(v), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {pipeline.merchants.map((m, i) => (
                    <Bar
                      key={m}
                      dataKey={m}
                      stackId="pipeline"
                      fill={MERCHANT_COLORS[i % MERCHANT_COLORS.length]}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Merchant partnership detail */}
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <div className="text-[11px] uppercase tracking-wider font-medium text-slate-400">
            Rewards and Perks
          </div>
          <div className="text-[13px] font-semibold text-slate-900 mt-0.5">
            Deals ready to negotiate
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {selected.merchantPartnerships.map((m) => (
            <div key={m.merchantName} className="p-4 grid md:grid-cols-[220px_1fr_180px] gap-4 items-start">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{m.merchantName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.merchantCategory}</div>
                <div className="text-[11px] text-slate-400 mt-2">Peak: {m.peakQuarter}</div>
                <div className="text-[11px] text-slate-400">Deadline: {m.negotiationDeadline}</div>
              </div>
              <div className="text-[12.5px] text-slate-700 leading-relaxed">
                <div className="mb-2">
                  <span className="font-medium text-slate-900">Proposed deal — </span>
                  {m.proposedDeal}
                </div>
                <div className="grid md:grid-cols-2 gap-2 mt-2">
                  <div className="rounded border border-emerald-100 bg-emerald-50/60 p-2">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium mb-0.5">
                      Merchant win
                    </div>
                    <div className="text-[12px] text-slate-700">{m.merchantBenefit}</div>
                  </div>
                  <div className="rounded border border-blue-100 bg-blue-50/60 p-2">
                    <div className="text-[10px] uppercase tracking-wider text-blue-700 font-medium mb-0.5">
                      Bank win
                    </div>
                    <div className="text-[12px] text-slate-700">{m.bankBenefit}</div>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Revenue capture</div>
                  <div className="text-[15px] font-semibold text-slate-900 tabular-nums">
                    {fmtDollars(m.estimatedRevenueCapture)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Targeted users</div>
                  <div className="text-[12px] text-slate-700 tabular-nums">
                    {fmtUsers(m.targetedUserCount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Conversion</div>
                  <div className="text-[12px] text-slate-700 tabular-nums">
                    {m.projectedConversionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <div className="text-[13px] font-semibold text-slate-900">Recommended next steps</div>
          <span className="text-[11px] text-slate-400">Ordered from most urgent to ongoing</span>
        </div>
        <div className="divide-y divide-slate-100">
          {nextSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="p-4 grid md:grid-cols-[48px_1fr_200px] gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[13px] font-semibold">
                  {step.n}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <div className="text-[13.5px] font-semibold text-slate-900">{step.title}</div>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-600">
                      {step.owner}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-600">
                      {step.timeframe}
                    </Badge>
                  </div>
                  <p className="text-[12.5px] text-slate-600 mt-1 leading-snug">{step.rationale}</p>
                </div>
                <div className="md:text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[12px] bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    onClick={step.onClick}
                  >
                    {step.cta}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] text-slate-500">
            Ready to move? Kick off the fastest path from opportunity to activation.
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[12px] bg-white border-slate-200 text-slate-800"
              onClick={() => window.open("/tepilot/rewards-pipeline", "_self")}
            >
              Open Deal Pipeline
            </Button>
            <Button
              size="sm"
              className="h-8 text-[12px] bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => onNavigate("targeting-campaign-builder")}
            >
              Launch Campaign Builder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiTileProps {
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint?: string;
}

function KpiTile({ icon: Icon, label, value, hint }: KpiTileProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="w-3.5 h-3.5" />
        <div className="text-[11px] uppercase tracking-wider font-medium">{label}</div>
      </div>
      <div className="text-[22px] font-semibold text-slate-900 leading-tight mt-1 tabular-nums">
        {value}
      </div>
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}
