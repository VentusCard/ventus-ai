import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileBarChart,
  PieChart,
  Layers,
  Grid3x3,
  TrendingDown,
  TrendingUp,
  Store,
  Users,
  Map,
  Repeat,
  CalendarHeart,
  ShieldAlert,
  ArrowRight,
  ArrowUpRight,
  GitBranch,
  Plane,
  MessageSquare,
  Terminal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { INTERACTIVE_REPORTS, type InteractiveReportId } from "./interactiveReportsRegistry";

interface ReportsAndQueryViewProps {
  onOpenInteractiveReport?: (id: InteractiveReportId, payload?: { opportunityId?: string }) => void;
  onRunInConsole?: (query: string) => void;
}

type SubTab = "briefings" | "templates";
type Category = "Lifestyle" | "Outflow" | "Retention" | "Risk" | "Opportunities";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: Category;
  icon: React.ElementType;
  lastRun: string;
  signature?: boolean;
  query: string;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: "lifestyle-pillars",
    title: "Lifestyle pillar share",
    description: "Share of card spend across the 12 lifestyle pillars, with portfolio totals.",
    category: "Lifestyle",
    icon: PieChart,
    lastRun: "Today, 8:12 AM",
    query: `-- @chart bar:total_spend
-- Share of card spend by lifestyle pillar
SELECT pillar,
       COUNT(*)                       AS orders,
       ROUND(SUM(amount))             AS total_spend,
       ROUND(AVG(amount))             AS avg_ticket,
       COUNT(DISTINCT customer_id)    AS customers
FROM   transactions
GROUP BY pillar
ORDER BY total_spend DESC`,
  },
  {
    id: "pillar-deep-dive",
    title: "Pillar deep-dive (age × region)",
    description: "Heatmap of pillar penetration across age bands and US regions.",
    category: "Lifestyle",
    icon: Grid3x3,
    lastRun: "Today, 8:12 AM",
    query: `-- Pillar penetration by region and age band
SELECT c.region,
       CASE WHEN c.age < 30 THEN '18-29'
            WHEN c.age < 45 THEN '30-44'
            WHEN c.age < 60 THEN '45-59'
            ELSE '60+' END             AS age_band,
       t.pillar,
       COUNT(DISTINCT t.customer_id)   AS customers,
       ROUND(SUM(t.amount))            AS spend
FROM   transactions t
JOIN   customers    c ON c.customer_id = t.customer_id
GROUP BY c.region, age_band, t.pillar
ORDER BY spend DESC
LIMIT 200`,
  },
  {
    id: "cross-sell",
    title: "Cross-sell propensity matrix",
    description: "Card-to-card cross-sell scores with estimated annual uplift.",
    category: "Lifestyle",
    icon: Layers,
    lastRun: "Yesterday, 9:05 PM",
    query: `-- Pillar pairs the same customer spends in (cross-sell proxy)
SELECT a.pillar                              AS pillar_a,
       b.pillar                              AS pillar_b,
       COUNT(DISTINCT a.customer_id)         AS shared_customers,
       ROUND(AVG(a.total_spend + b.total_spend)) AS avg_combined_spend
FROM   shopping_habits a
JOIN   shopping_habits b
  ON   a.customer_id = b.customer_id
 AND   a.pillar < b.pillar
GROUP BY a.pillar, b.pillar
ORDER BY shared_customers DESC
LIMIT 50`,
  },
  {
    id: "regional-spend",
    title: "Spend by region",
    description: "Account count, total spend, and $/user across US regions.",
    category: "Lifestyle",
    icon: Map,
    lastRun: "Today, 6:00 AM",
    query: `-- @chart bar:total_spend
-- Spend, customers and $/customer by region
SELECT region,
       COUNT(DISTINCT customer_id)         AS customers,
       ROUND(SUM(amount))                  AS total_spend,
       ROUND(SUM(amount) / COUNT(DISTINCT customer_id)) AS spend_per_customer
FROM   transactions
GROUP BY region
ORDER BY total_spend DESC`,
  },
  {
    id: "tier-migration",
    title: "Behavioral tier migration",
    description: "Customers shifting between Essential, Comfort, Premium and Luxury tiers — early upmarket / downmarket signal.",
    category: "Lifestyle",
    icon: TrendingUp,
    lastRun: "Today, 6:45 AM",
    signature: true,
    query: `-- Behavioral spending tiers by pillar
SELECT pillar,
       spending_tier,
       COUNT(*)                AS customers,
       ROUND(AVG(avg_ticket))  AS typical_ticket,
       ROUND(AVG(total_spend)) AS typical_spend
FROM   shopping_habits
GROUP BY pillar, spending_tier
ORDER BY pillar, customers DESC`,
  },
  {
    id: "travel-trips",
    title: "Travel trip reconstruction",
    description: "Transactions grouped into labeled trips: origin, destination, dates, fare class, total spend.",
    category: "Lifestyle",
    icon: Plane,
    lastRun: "Today, 7:05 AM",
    signature: true,
    query: `-- Travel transactions grouped per customer-day
SELECT customer_id,
       day,
       category,
       COUNT(*)                       AS travel_charges,
       ROUND(SUM(amount))             AS trip_spend,
       COUNT(DISTINCT merchant)       AS merchants
FROM   transactions
WHERE  pillar = 'Travel'
GROUP BY customer_id, day, category
HAVING SUM(amount) >= 200
ORDER BY trip_spend DESC
LIMIT 50`,
  },
  {
    id: "outflow",
    title: "Outflow to competitors",
    description: "ACH and payee-detected outflow by destination institution.",
    category: "Outflow",
    icon: TrendingDown,
    lastRun: "Today, 7:30 AM",
    query: `-- @chart bar:total_outflow
-- Outflow by competitor merchant and category
SELECT competitor_merchant,
       category,
       COUNT(DISTINCT customer_id)   AS customers,
       ROUND(SUM(outflow_amount))    AS total_outflow,
       SUM(outflow_count)            AS transfers
FROM   wallet_share
GROUP BY competitor_merchant, category
ORDER BY total_outflow DESC
LIMIT 25`,
  },
  {
    id: "top-merchants",
    title: "Top merchant outflow",
    description: "Largest external recipients by category and affected customers.",
    category: "Outflow",
    icon: Store,
    lastRun: "Today, 7:30 AM",
    query: `-- @chart bar:total_outflow
-- Top external recipients of funds
SELECT competitor_merchant,
       COUNT(DISTINCT customer_id)  AS customers,
       ROUND(SUM(outflow_amount))   AS total_outflow,
       SUM(outflow_count)           AS transfers
FROM   wallet_share
GROUP BY competitor_merchant
ORDER BY total_outflow DESC
LIMIT 20`,
  },
  {
    id: "wallet-share",
    title: "Wallet share & outbound funds",
    description: "Funds leaving the bank to brokerages, neobanks and rival cards — with win-back AUM per destination.",
    category: "Outflow",
    icon: ArrowUpRight,
    lastRun: "Today, 7:10 AM",
    signature: true,
    query: `-- @chart bar:total_outflow
-- Wallet-share leakage grouped by outflow category
SELECT category,
       COUNT(DISTINCT customer_id)   AS customers,
       ROUND(SUM(outflow_amount))    AS total_outflow,
       ROUND(AVG(outflow_amount))    AS avg_outflow,
       SUM(outflow_count)            AS transfers
FROM   wallet_share
GROUP BY category
ORDER BY total_outflow DESC`,
  },
  {
    id: "subscription",
    title: "Subscription churn cohort",
    description: "Monthly subscription spend, new vs. churned subscribers.",
    category: "Retention",
    icon: Repeat,
    lastRun: "Today, 5:45 AM",
    query: `-- @chart line:total_spend
-- Daily subscription spend by category
SELECT day,
       category,
       COUNT(*)            AS charges,
       ROUND(SUM(amount))  AS total_spend
FROM   transactions
WHERE  pillar = 'Subscriptions'
GROUP BY day, category
ORDER BY day ASC
LIMIT 500`,
  },
  {
    id: "cohort-retention",
    title: "Cohort retention (sign-up month)",
    description: "Retention triangle by sign-up month and tenure (months).",
    category: "Retention",
    icon: Users,
    lastRun: "Yesterday, 11:20 PM",
    query: `-- Customers grouped by tenure with average AUM
SELECT tenure_years,
       segment,
       COUNT(*)            AS customers,
       ROUND(AVG(aum))     AS avg_aum,
       ROUND(SUM(aum))     AS book_aum
FROM   customers
GROUP BY tenure_years, segment
ORDER BY tenure_years ASC, customers DESC`,
  },
  {
    id: "life-events",
    title: "Life-event volume",
    description: "Detected life events by month and event type across the portfolio.",
    category: "Lifestyle",
    icon: CalendarHeart,
    lastRun: "Today, 4:10 AM",
    query: `-- @chart bar:events
-- Life events by type and urgency
SELECT event_type,
       urgency,
       COUNT(*)                    AS events,
       ROUND(AVG(confidence), 2)   AS avg_confidence,
       SUM(evidence_count)         AS evidence_signals
FROM   life_events
GROUP BY event_type, urgency
ORDER BY events DESC`,
  },
  {
    id: "life-event-funnel",
    title: "Life event detection funnel",
    description: "Signals raised → corroborated → confirmed → actioned, by event type. Pinpoints outreach leakage.",
    category: "Retention",
    icon: GitBranch,
    lastRun: "Today, 5:20 AM",
    signature: true,
    query: `-- Detection funnel proxy: events and evidence by type
SELECT event_type,
       COUNT(*)                                                    AS events,
       SUM(evidence_count)                                         AS evidence_signals,
       ROUND(AVG(confidence), 2)                                   AS avg_confidence,
       SUM(CASE WHEN confidence >= 0.75 THEN 1 ELSE 0 END)         AS corroborated,
       SUM(CASE WHEN confidence >= 0.9  THEN 1 ELSE 0 END)         AS confirmed
FROM   life_events
GROUP BY event_type
ORDER BY events DESC`,
  },
  {
    id: "fvi",
    title: "Financial vulnerability summary",
    description: "Vulnerability cohorts, customer counts, and risk severity.",
    category: "Risk",
    icon: ShieldAlert,
    lastRun: "Today, 3:00 AM",
    query: `-- Outflow stress vs. AUM buckets (vulnerability proxy)
SELECT CASE WHEN c.aum < 50000   THEN 'Low AUM'
            WHEN c.aum < 200000  THEN 'Mid AUM'
            ELSE 'High AUM' END                          AS aum_band,
       CASE WHEN SUM(w.outflow_amount) > 5000 THEN 'High outflow'
            WHEN SUM(w.outflow_amount) > 1500 THEN 'Medium outflow'
            ELSE 'Low outflow' END                        AS outflow_band,
       COUNT(DISTINCT c.customer_id)                      AS customers,
       ROUND(SUM(w.outflow_amount))                       AS total_outflow,
       ROUND(AVG(c.aum))                                  AS avg_aum
FROM   customers c
LEFT JOIN wallet_share w ON w.customer_id = c.customer_id
GROUP BY aum_band, outflow_band
ORDER BY customers DESC`,
  },
  {
    id: "next-conversation",
    title: "Next-best-conversation triggers",
    description: "Customer-level triggers ready for advisors this week, each with a 10-word AI action script.",
    category: "Opportunities",
    icon: MessageSquare,
    lastRun: "Today, 8:30 AM",
    signature: true,
    query: `-- Highest-priority life-event triggers per customer
SELECT c.customer_id,
       c.name,
       c.segment,
       le.event_type,
       le.urgency,
       le.confidence,
       le.evidence_count,
       ROUND(le.confidence * le.evidence_count, 2) AS priority_score,
       le.day                                       AS detected_on
FROM   life_events le
JOIN   customers   c ON c.customer_id = le.customer_id
ORDER BY priority_score DESC
LIMIT 25`,
  },
];

const CATEGORY_TONE: Record<Category, string> = {
  Lifestyle: "bg-blue-50 text-blue-700 border-blue-100",
  Outflow: "bg-amber-50 text-amber-700 border-amber-100",
  Retention: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Risk: "bg-rose-50 text-rose-700 border-rose-100",
  Opportunities: "bg-violet-50 text-violet-700 border-violet-100",
};

const CATEGORIES: ("All" | Category)[] = ["All", "Lifestyle", "Outflow", "Retention", "Risk", "Opportunities"];

const SUBTITLE: Record<SubTab, string> = {
  briefings: "Read end-to-end — narrative, numbers, graphs, and recommended next steps",
  templates: "Prebuilt SQL templates analysts can run, schedule, and export",
};

export function ReportsAndQueryView({ onOpenInteractiveReport, onRunInConsole }: ReportsAndQueryViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [subTab, setSubTab] = useState<SubTab>(() => {
    try {
      const saved = sessionStorage.getItem("bankdemo-reports-subtab");
      if (saved === "briefings" || saved === "templates") return saved;
    } catch { /* ignore */ }
    return "templates";
  });
  const hasInteractive = !!onOpenInteractiveReport && INTERACTIVE_REPORTS.length > 0;

  useEffect(() => {
    try {
      sessionStorage.setItem("bankdemo-reports-subtab", subTab);
    } catch { /* ignore */ }
  }, [subTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const openTemplate = (sql: string) => {
    onRunInConsole?.(sql);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-slate-500" />
            <h2 className="text-[15px] font-semibold text-slate-900">Reports</h2>
            <span className="text-[11px] text-slate-400">{SUBTITLE[subTab]}</span>
          </div>
        </div>
        {subTab === "templates" && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates"
                className="h-8 w-56 pl-7 text-[12px] bg-white border-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {hasInteractive && (
          <button
            onClick={() => setSubTab("briefings")}
            className={cn(
              "px-3 h-8 text-[12px] font-medium border-b-2 -mb-px transition inline-flex items-center gap-1.5",
              subTab === "briefings"
                ? "border-blue-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            <FileBarChart className="w-3.5 h-3.5" />
            Briefings
            <span className="text-[10px] opacity-60">{INTERACTIVE_REPORTS.length}</span>
          </button>
        )}
        <button
          onClick={() => setSubTab("templates")}
          className={cn(
            "px-3 h-8 text-[12px] font-medium border-b-2 -mb-px transition inline-flex items-center gap-1.5",
            subTab === "templates"
              ? "border-blue-600 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700",
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Templates
          <span className="text-[10px] opacity-60">{TEMPLATES.length}</span>
        </button>
      </div>

      {/* Briefings */}
      <div className={cn(subTab === "briefings" ? "block" : "hidden")}>
        {hasInteractive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {INTERACTIVE_REPORTS.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => onOpenInteractiveReport!(r.id)}
                  className="text-left rounded-md border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded border border-blue-200 bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-100">
                      {r.category}
                    </span>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-wider font-medium text-slate-400">
                    {r.eyebrow}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold text-slate-900 leading-tight">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {r.description}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[10px] text-slate-400">Interactive</span>
                    <span className="text-[11px] text-blue-600 inline-flex items-center gap-0.5 group-hover:gap-1 transition-all">
                      Open report <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-white p-10 text-center text-[12px] text-slate-400">
            No interactive briefings available
          </div>
        )}
      </div>

      {/* Templates */}
      <div className={cn(subTab === "templates" ? "block" : "hidden")}>
        {/* Category chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "h-7 px-3 rounded-full text-[12px] border transition",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                )}
              >
                {c}
                {c !== "All" && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {TEMPLATES.filter((t) => t.category === c).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => openTemplate(t.query)}
                className="text-left rounded-md border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded border",
                        CATEGORY_TONE[t.category],
                      )}
                    >
                      {t.category}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[13px] font-semibold text-slate-900 leading-tight">
                  {t.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t.description}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] text-slate-400">Last run: {t.lastRun}</span>
                  <span className="text-[11px] text-blue-600 inline-flex items-center gap-0.5 group-hover:gap-1 transition-all">
                    Open in SQL Console <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-white p-10 text-center text-[12px] text-slate-400">
            No templates match &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

    </div>
  );
}
