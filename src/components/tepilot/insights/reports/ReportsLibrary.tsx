import { useMemo, useState } from "react";
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
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TabValue } from "../AnalyticsContainer";

interface ReportsLibraryProps {
  onOpen: (tab: TabValue) => void;
}

type Category = "Lifestyle" | "Outflow" | "Retention" | "Risk" | "Opportunities";

interface ReportTemplate {
  tab: TabValue;
  title: string;
  description: string;
  category: Category;
  icon: React.ElementType;
  lastRun: string;
  signature?: boolean;
}

const TEMPLATES: ReportTemplate[] = [
  {
    tab: "report-lifestyle-pillars",
    title: "Lifestyle pillar share",
    description: "Share of card spend across the 12 lifestyle pillars, with portfolio totals.",
    category: "Lifestyle",
    icon: PieChart,
    lastRun: "Today, 8:12 AM",
  },
  {
    tab: "report-pillar-deep-dive",
    title: "Pillar deep-dive (age × region)",
    description: "Heatmap of pillar penetration across age bands and US regions.",
    category: "Lifestyle",
    icon: Grid3x3,
    lastRun: "Today, 8:12 AM",
  },
  {
    tab: "report-cross-sell",
    title: "Cross-sell propensity matrix",
    description: "Card-to-card cross-sell scores with estimated annual uplift.",
    category: "Lifestyle",
    icon: Layers,
    lastRun: "Yesterday, 9:05 PM",
  },
  {
    tab: "report-regional-spend",
    title: "Spend by region",
    description: "Account count, total spend, and $/user across US regions.",
    category: "Lifestyle",
    icon: Map,
    lastRun: "Today, 6:00 AM",
  },
  {
    tab: "report-tier-migration",
    title: "Behavioral tier migration",
    description: "Customers shifting between Essential, Comfort, Premium and Luxury tiers — early upmarket / downmarket signal.",
    category: "Lifestyle",
    icon: TrendingUp,
    lastRun: "Today, 6:45 AM",
    signature: true,
  },
  {
    tab: "report-travel-trips",
    title: "Travel trip reconstruction",
    description: "Transactions grouped into labeled trips: origin, destination, dates, fare class, total spend.",
    category: "Lifestyle",
    icon: Plane,
    lastRun: "Today, 7:05 AM",
    signature: true,
  },
  {
    tab: "report-outflow",
    title: "Outflow to competitors",
    description: "ACH and payee-detected outflow by destination institution.",
    category: "Outflow",
    icon: TrendingDown,
    lastRun: "Today, 7:30 AM",
  },
  {
    tab: "report-top-merchants",
    title: "Top merchant outflow",
    description: "Largest external recipients by category and affected customers.",
    category: "Outflow",
    icon: Store,
    lastRun: "Today, 7:30 AM",
  },
  {
    tab: "report-wallet-share",
    title: "Wallet share & outbound funds",
    description: "Funds leaving the bank to brokerages, neobanks and rival cards — with win-back AUM per destination.",
    category: "Outflow",
    icon: ArrowUpRight,
    lastRun: "Today, 7:10 AM",
    signature: true,
  },
  {
    tab: "report-subscription",
    title: "Subscription churn cohort",
    description: "Monthly subscription spend, new vs. churned subscribers.",
    category: "Retention",
    icon: Repeat,
    lastRun: "Today, 5:45 AM",
  },
  {
    tab: "report-cohort-retention",
    title: "Cohort retention (sign-up month)",
    description: "Retention triangle by sign-up month and tenure (months).",
    category: "Retention",
    icon: Users,
    lastRun: "Yesterday, 11:20 PM",
  },
  {
    tab: "report-life-events",
    title: "Life-event volume",
    description: "Detected life events by month and event type across the portfolio.",
    category: "Lifestyle",
    icon: CalendarHeart,
    lastRun: "Today, 4:10 AM",
  },
  {
    tab: "report-life-event-funnel",
    title: "Life event detection funnel",
    description: "Signals raised → corroborated → confirmed → actioned, by event type. Pinpoints outreach leakage.",
    category: "Retention",
    icon: GitBranch,
    lastRun: "Today, 5:20 AM",
    signature: true,
  },
  {
    tab: "report-fvi",
    title: "Financial vulnerability summary",
    description: "Vulnerability cohorts, customer counts, and risk severity.",
    category: "Risk",
    icon: ShieldAlert,
    lastRun: "Today, 3:00 AM",
  },
  {
    tab: "report-next-conversation",
    title: "Next-best-conversation triggers",
    description: "Customer-level triggers ready for advisors this week, each with a 10-word AI action script.",
    category: "Opportunities",
    icon: MessageSquare,
    lastRun: "Today, 8:30 AM",
    signature: true,
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

export function ReportsLibrary({ onOpen }: ReportsLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-slate-500" />
            <h2 className="text-[15px] font-semibold text-slate-900">Reports</h2>
            <span className="text-[11px] text-slate-400">
              Prebuilt templates analysts can run, schedule, and export
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports"
              className="h-8 w-56 pl-7 text-[12px] bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
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
              key={t.tab}
              onClick={() => onOpen(t.tab)}
              className="text-left rounded-md border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded border",
                    CATEGORY_TONE[t.category],
                  )}
                >
                  {t.category}
                </span>
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
                  Open report <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-200 bg-white p-10 text-center text-[12px] text-slate-400">
          No reports match "{query}"
        </div>
      )}
    </div>
  );
}
