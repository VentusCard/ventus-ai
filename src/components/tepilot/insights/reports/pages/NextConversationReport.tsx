import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

const TRIGGER_TYPES = [
  { key: "tier_jump", label: "Tier jump detected", priority: "High" },
  { key: "life_event", label: "Life event confirmed", priority: "High" },
  { key: "outbound_flow", label: "Outbound funds spike", priority: "High" },
  { key: "spend_drop", label: "Sudden spend drop", priority: "Medium" },
  { key: "travel_window", label: "Travel window upcoming", priority: "Medium" },
  { key: "new_subscription", label: "Premium subscription added", priority: "Medium" },
  { key: "rewards_underused", label: "Rewards balance underused", priority: "Low" },
];

const ACTIONS: Record<string, string[]> = {
  tier_jump: [
    "Offer Signature card upgrade today",
    "Schedule premium-tier benefits walkthrough",
    "Invite to private banking intro call",
  ],
  life_event: [
    "Schedule advisor call about new milestone",
    "Send education savings starter packet",
    "Review insurance gaps before quarter close",
  ],
  outbound_flow: [
    "Match competitor rate before quarter end",
    "Discuss CD ladder versus external brokerage",
    "Offer fee waiver to keep deposits parked",
  ],
  spend_drop: [
    "Check in on financial health and cashflow",
    "Surface budgeting tools and bill negotiator",
    "Offer fee waiver and grace-period extension",
  ],
  travel_window: [
    "Pre-load travel notice and FX-free card",
    "Pitch trip insurance bundle this week",
    "Offer airport-lounge pass for upcoming trip",
  ],
  new_subscription: [
    "Promote rewards card with streaming credits",
    "Bundle subscription dashboard with premium tier",
    "Offer first-month statement credit for retention",
  ],
  rewards_underused: [
    "Nudge to redeem points before yearly expiry",
    "Suggest local restaurant perks in their city",
    "Show travel-transfer partners with bonus rates",
  ],
};

function fmtNum(n: number) {
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

const SAMPLE_NAMES = [
  "Avery K.",
  "Marcus T.",
  "Priya N.",
  "Jordan L.",
  "Sofia R.",
  "Daniel H.",
  "Maya P.",
  "Owen J.",
  "Isabel C.",
  "Tomás V.",
  "Hannah B.",
  "Lucas W.",
];

const CHANNELS = ["Advisor call", "Contact center", "Branch visit", "In-app message", "Outbound SMS"];

export function NextConversationReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Next-best-conversation triggers"
      category="Opportunities"
      description="Behavioral triggers ready for the advisor or contact center this week — each with a 10-word AI action item the rep can read aloud."
      onBack={onBack}
      defaultPreset="7d"
    >
      {({ range }) => {
        const triggerCounts = useMemo(
          () =>
            TRIGGER_TYPES.map((t, i) => ({
              label: t.label,
              key: t.key,
              priority: t.priority,
              customers: Math.round((1800 - i * 180) * (0.6 + seededRand(range.seed + i * 13, i) * 1.1)),
            })).sort((a, b) => b.customers - a.customers),
          [range.seed],
        );

        const totalTriggers = triggerCounts.reduce((a, b) => a + b.customers, 0);

        const rows = useMemo(() => {
          const out: {
            id: string;
            customer: string;
            trigger: string;
            triggerKey: string;
            priority: string;
            action: string;
            channel: string;
          }[] = [];
          for (let i = 0; i < 24; i++) {
            const t = TRIGGER_TYPES[i % TRIGGER_TYPES.length];
            const actionList = ACTIONS[t.key];
            const action = actionList[Math.floor(seededRand(range.seed + i * 7, i) * actionList.length)];
            const name = SAMPLE_NAMES[Math.floor(seededRand(range.seed, i * 3) * SAMPLE_NAMES.length)];
            const channel = CHANNELS[Math.floor(seededRand(range.seed, i * 5) * CHANNELS.length)];
            out.push({
              id: `c-${i}`,
              customer: name,
              trigger: t.label,
              triggerKey: t.key,
              priority: t.priority,
              action,
              channel,
            });
          }
          return out.sort((a, b) => (a.priority === "High" ? -1 : 0));
        }, [range.seed]);

        const priorityTone: Record<string, string> = {
          High: "bg-rose-50 text-rose-700 border-rose-100",
          Medium: "bg-amber-50 text-amber-700 border-amber-100",
          Low: "bg-slate-50 text-slate-600 border-slate-200",
        };

        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Triggers ready</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{fmtNum(totalTriggers)}</div>
                <div className="text-[11px] text-slate-400">{range.label}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">High priority</div>
                <div className="text-[20px] font-semibold text-rose-600 tabular-nums">
                  {fmtNum(triggerCounts.filter((t) => t.priority === "High").reduce((a, b) => a + b.customers, 0))}
                </div>
                <div className="text-[11px] text-slate-400">Same-week outreach</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500">Channels suggested</div>
                <div className="text-[20px] font-semibold text-slate-900 tabular-nums">{CHANNELS.length}</div>
                <div className="text-[11px] text-slate-400">Routed by customer preference</div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="text-[12px] font-medium text-slate-700 mb-2 px-1">Triggers by type</div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={triggerCounts} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={170} />
                    <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, background: "white" }} />
                    <Bar dataKey="customers" fill="#3b82f6" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ReportDataTable
              caption="Customer-level triggers (sample queue)"
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                { key: "customer", header: "Customer", render: (r) => <span className="font-medium text-slate-900">{r.customer}</span> },
                {
                  key: "priority",
                  header: "Priority",
                  render: (r) => (
                    <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded border ${priorityTone[r.priority]}`}>
                      {r.priority}
                    </span>
                  ),
                },
                { key: "trigger", header: "Trigger", render: (r) => r.trigger },
                { key: "action", header: "AI action item (advisor script)", render: (r) => <span className="text-slate-700">"{r.action}"</span> },
                { key: "channel", header: "Channel", render: (r) => <span className="text-slate-500">{r.channel}</span> },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
