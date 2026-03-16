import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}

/* ── Hardcoded API responses ────────────────────────────────── */

const PROFILE_JSON = {
  customer_id: "cust_013",
  bank_id: "test",
  total_spend: 4051.89,
  pillars: [
    {
      pillar: "Family & Community",
      total_spend: "2549.00",
      transaction_count: 8,
      avg_transaction: "318.63",
      pct_of_total_spend: 0.6291,
      lifestyle_label: "Education-focused",
      lifestyle_traits: ["Education-focused", "Family-oriented", "Organized and forward-planning"],
      spending_behaviors: ["Education-focused spender", "Traveler for educational purposes"],
      interests: ["Higher education", "College admissions", "Academic success"],
      analyzed_at: "2026-03-07T17:56:39.296Z",
    },
    {
      pillar: "Travel & Exploration",
      total_spend: "1289.00",
      transaction_count: 3,
      avg_transaction: "429.67",
      pct_of_total_spend: 0.3181,
      lifestyle_label: "Education-focused",
    },
  ],
};

const LIFE_EVENTS_JSON = {
  customer_id: "cust_013",
  life_events: [
    {
      id: 14,
      event_name: "College-Bound Child",
      event_type: "OPPORTUNITY",
      confidence: 95,
      urgency_timeline: "Immediate",
      status: "active",
      is_dismissed: false,
      talking_points: [
        "Significant college application spending detected Jan-Feb 2026",
        "Child actively applying to elite schools including Harvard, MIT, Yale, Stanford",
        "Over $3,000 spent on applications, test prep, and campus visits",
        "FAFSA processing fee detected — exploring financial aid options",
      ],
      next_steps: [
        "Schedule college savings consultation within 30 days",
        "Review 529 College Savings Plan options",
        "Assess financial aid eligibility and funding gaps",
      ],
      project_type: "education",
      duration_years: 4,
      estimated_total_cost: "240000.00",
      recommended_monthly_contribution: "2500.00",
      cost_breakdown: [
        { category: "Tuition & Fees", yearly_amounts: { year_1: 36000, year_2: 36000, year_3: 36000, year_4: 36000 } },
        { category: "Room & Board", yearly_amounts: { year_1: 18000, year_2: 18000, year_3: 18000, year_4: 18000 } },
      ],
      recommended_funding_sources: [
        { type: "529", rationale: "Primary tax-advantaged savings vehicle", suggested_annual_amount: 30000 },
        { type: "savings", rationale: "Cover immediate costs and non-qualified expenses", suggested_annual_amount: 15000 },
      ],
      detected_at: "2026-03-07T17:56:54.687Z",
      evidence: [
        { transaction_id: "t141", merchant: "Princeton Review", amount: "1299.00", date: "2026-01-08T00:00:00.000Z", relevance: "Test preparation services for college admissions" },
        { transaction_id: "t146", merchant: "College Essay Advisor", amount: "850.00", date: "2026-01-18T00:00:00.000Z", relevance: "Professional college application essay assistance" },
        { transaction_id: "t145", merchant: "Yale Admissions Office", amount: "32.00", date: "2026-01-15T00:00:00.000Z", relevance: "Direct college application fee" },
      ],
    },
  ],
};

const TRIPS_JSON = {
  customer_id: "cust_013",
  trips: [
    {
      trip_id: "trip_customer123_Stanford_2026-02-11",
      destination: "Stanford, CA",
      trip_start: "2026-02-11T00:00:00.000Z",
      trip_end: "2026-02-11T00:00:00.000Z",
      trip_duration_days: 1,
      total_trip_spend: "210.00",
      transaction_count: 1,
      transport_spend: "0.00",
      lodging_spend: "210.00",
      dining_spend: "0.00",
      activities_spend: "0.00",
      other_spend: "0.00",
      is_upcoming: false,
      detected_at: "2026-03-07T17:57:12.980Z",
    },
    {
      trip_id: "trip_customer123_Philadelphia_2026-02-02",
      destination: "Philadelphia, PA",
      trip_start: "2026-02-02T00:00:00.000Z",
      trip_end: "2026-02-02T00:00:00.000Z",
      trip_duration_days: 1,
      total_trip_spend: "189.00",
      transaction_count: 1,
      transport_spend: "0.00",
      lodging_spend: "189.00",
      dining_spend: "0.00",
      activities_spend: "0.00",
      other_spend: "0.00",
      is_upcoming: false,
      detected_at: "2026-03-07T17:57:12.958Z",
    },
  ],
};

const TRANSACTIONS_JSON = {
  customer_id: "cust_013",
  total: 17,
  limit: 50,
  offset: 0,
  transactions: [
    {
      transaction_id: "t156",
      clean_merchant_name: "Stanford Guest House",
      lifestyle_category: "Travel & Exploration",
      merchant_category: "Hotels & Lodging",
      amount: "210.00",
      pre_tax_amount: "193.51",
      tax_amount: "16.49",
      tax_rate: "8.5%",
      transaction_date: "2026-02-11T00:00:00.000Z",
      confidence_score: 0.9,
      inferred_purchase: "1-night stay at Stanford Guest House",
      trip_id: "trip_customer123_Stanford_2026-02-11",
    },
    {
      transaction_id: "t141",
      clean_merchant_name: "Princeton Review",
      lifestyle_category: "Family & Community",
      merchant_category: "Childcare & Education",
      amount: "1299.00",
      pre_tax_amount: "1197.01",
      tax_amount: "101.99",
      tax_rate: "8.5%",
      transaction_date: "2026-01-08T00:00:00.000Z",
      confidence_score: 0.9,
      inferred_purchase: "Princeton Review SAT/ACT prep course",
      trip_id: null,
    },
  ],
};

const BANK_ANALYTICS_JSON = {
  bank_id: "test",
  generated_at: "2026-03-14T20:08:33.441Z",
  overview: {
    total_customers: 22,
    total_transactions: 218,
    total_spend: 126378.53,
    avg_transaction: 579.72,
    avg_confidence: 0.9,
  },
  pillar_distribution: [
    { pillar: "Travel & Exploration", transaction_count: 46, total_spend: 33980.5, customer_count: 14, pct_of_total: 26.89 },
    { pillar: "Financial & Aspirational", transaction_count: 13, total_spend: 33329, customer_count: 9, pct_of_total: 26.37 },
    { pillar: "Family & Community", transaction_count: 40, total_spend: 16207.7, customer_count: 10, pct_of_total: 12.82 },
  ],
  life_event_summary: [
    { event_type: "OPPORTUNITY", count: 7, avg_confidence: 81.43 },
    { event_type: "NOTABLE", count: 14, avg_confidence: 83.93 },
  ],
  top_merchants: [
    { merchant: "Delta Air Lines", transaction_count: 19, total_spend: 8860, customer_count: 13 },
    { merchant: "Home Depot", transaction_count: 6, total_spend: 7847, customer_count: 6 },
    { merchant: "MARRIOTT", transaction_count: 9, total_spend: 7206, customer_count: 9 },
  ],
  segments: [
    { segment: "Frequent Traveler", customer_count: 3, avg_spend: 517.01 },
    { segment: "New/Expecting Parent", customer_count: 2, avg_spend: 1104.96 },
    { segment: "Family-oriented", customer_count: 4, avg_spend: 993.34 },
  ],
};

/* ── Tab configuration ──────────────────────────────────────── */

interface TabConfig {
  id: string;
  label: string;
  endpoint: string;
  responseMs: number;
  data: unknown;
  glow?: boolean;
}

const TABS: TabConfig[] = [
  { id: "profile", label: "Profile", endpoint: "GET https://api.ventusai.com/v1/customers/cust_013/profile", responseMs: 347, data: PROFILE_JSON },
  { id: "life-events", label: "Life Events", endpoint: "GET https://api.ventusai.com/v1/customers/cust_013/life-events", responseMs: 412, data: LIFE_EVENTS_JSON, glow: true },
  { id: "trips", label: "Trips", endpoint: "GET https://api.ventusai.com/v1/customers/cust_013/trips", responseMs: 289, data: TRIPS_JSON },
  { id: "transactions", label: "Transactions", endpoint: "GET https://api.ventusai.com/v1/customers/cust_013/transactions", responseMs: 195, data: TRANSACTIONS_JSON },
  { id: "bank-analytics", label: "Bank Analytics", endpoint: "GET https://api.ventusai.com/v1/analytics/bank", responseMs: 523, data: BANK_ANALYTICS_JSON },
];

/* ── Syntax-highlighted JSON renderer ───────────────────────── */

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-[#7dd3fc]"; // number — sky-300
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-[#c4b5fd]"; // key — violet-300
        } else {
          cls = "text-[#86efac]"; // string — green-300
        }
      } else if (/true|false/.test(match)) {
        cls = "text-[#fbbf24]"; // boolean — amber-400
      } else if (/null/.test(match)) {
        cls = "text-[#94a3b8]"; // null — slate-400
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

/* ── Terminal panel ─────────────────────────────────────────── */

function ApiTerminal({ tab }: { tab: TabConfig }) {
  const formatted = JSON.stringify(tab.data, null, 2);
  const highlighted = syntaxHighlight(formatted);

  return (
    <div className="rounded-xl border border-slate-700/60 overflow-hidden" style={{ background: "#0F1117" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/40" style={{ background: "#161822" }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <code className="text-[11px] text-slate-400 font-mono">{tab.endpoint}</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            Zero PII
          </span>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-b border-slate-700/30 flex items-center gap-3" style={{ background: "#12141d" }}>
        <span className="text-[10px] font-mono font-semibold text-emerald-400">200 OK</span>
        <span className="text-[10px] font-mono text-slate-500">•</span>
        <span className="text-[10px] font-mono text-slate-400">{tab.responseMs}ms</span>
        <span className="text-[10px] font-mono text-slate-500">•</span>
        <span className="text-[10px] font-mono text-slate-500">x-api-key: ••••••••</span>
      </div>

      {/* JSON body */}
      <div className="p-4 overflow-auto max-h-[55vh]">
        <pre
          className="text-[11px] leading-[1.7] font-mono whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function DemoEngineProfileView({ customerA, customerB, enrichedA, enrichedB }: Props) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-lg gap-0.5">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`text-xs font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all ${
                tab.glow
                  ? "data-[state=active]:text-amber-700 data-[state=inactive]:text-amber-600/80"
                  : "data-[state=active]:text-slate-900"
              }`}
              style={
                tab.glow
                  ? {
                      textShadow: activeTab === tab.id ? "0 0 8px rgba(245,158,11,0.4)" : "0 0 6px rgba(245,158,11,0.25)",
                    }
                  : undefined
              }
            >
              {tab.glow && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                  style={{
                    background: "#f59e0b",
                    boxShadow: "0 0 6px 2px rgba(245,158,11,0.45)",
                  }}
                />
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-3">
            <ApiTerminal tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
