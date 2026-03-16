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

/* ── Build dynamic JSON from customer data ──────────────────── */

function buildProfileJson(c: DemoCustomer) {
  return {
    customer_id: `cust_${c.id}`,
    bank_id: "test",
    total_spend: parseFloat(c.txnTotal.replace(/[$,]/g, "")) || 0,
    pillars: c.pillarBreakdown.map((p) => ({
      pillar: p.pillar,
      pct_of_total_spend: p.pct / 100,
      lifestyle_label: c.lifestyleType,
    })),
    top_merchants: c.sampleTransactions.slice(0, 4).map((t) => ({
      merchant: t.merchant,
      amount: t.amount,
      category: t.category,
    })),
    lifestyle_type: c.lifestyleType,
    segment: c.profile.segment,
  };
}

function buildLifeEventsJson(c: DemoCustomer) {
  return {
    customer_id: `cust_${c.id}`,
    life_events: c.lifeEvents.map((e, i) => ({
      id: i + 1,
      event_name: e.name,
      event_type: e.urgency === "Urgent" ? "OPPORTUNITY" : "NOTABLE",
      confidence: e.confidence,
      urgency_timeline: e.urgency === "Urgent" ? "Immediate" : e.urgency === "Soon" ? "Near-term" : "Upcoming",
      status: "active",
      is_dismissed: false,
      timing: e.timing,
      evidence_summary: e.evidence,
      detected_at: "2026-03-07T17:56:54.687Z",
    })),
  };
}

function buildTripsJson(c: DemoCustomer) {
  return {
    customer_id: `cust_${c.id}`,
    trips: c.trips.map((t, i) => ({
      trip_id: `trip_${c.id}_${i + 1}`,
      destination: t.destination,
      dates: t.dates,
      total_trip_spend: t.spend,
      highlights: t.highlights,
      is_upcoming: false,
      detected_at: "2026-03-07T17:57:12.980Z",
    })),
  };
}

function buildTransactionsJson(c: DemoCustomer) {
  return {
    customer_id: `cust_${c.id}`,
    total: c.txnCount,
    limit: 50,
    offset: 0,
    transactions: c.sampleTransactions.map((t, i) => ({
      transaction_id: `t${(i + 1).toString().padStart(3, "0")}`,
      clean_merchant_name: t.merchant,
      lifestyle_category: t.category,
      amount: t.amount,
      transaction_date: t.date,
      confidence_score: 0.9,
      source: t.source || null,
    })),
  };
}

function buildBankAnalyticsJson() {
  return {
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
}

/* ── Tab config builder per customer ────────────────────────── */

interface TabConfig {
  id: string;
  label: string;
  endpoint: string;
  responseMs: number;
  data: unknown;
  glow?: boolean;
}

function getTabsForCustomer(c: DemoCustomer): TabConfig[] {
  const cid = `cust_${c.id}`;
  return [
    { id: "profile", label: "Profile", endpoint: `GET https://api.ventusai.com/v1/customers/${cid}/profile`, responseMs: 347, data: buildProfileJson(c) },
    { id: "life-events", label: "Life Events", endpoint: `GET https://api.ventusai.com/v1/customers/${cid}/life-events`, responseMs: 412, data: buildLifeEventsJson(c), glow: true },
    { id: "trips", label: "Trips", endpoint: `GET https://api.ventusai.com/v1/customers/${cid}/trips`, responseMs: 289, data: buildTripsJson(c) },
    { id: "transactions", label: "Transactions", endpoint: `GET https://api.ventusai.com/v1/customers/${cid}/transactions`, responseMs: 195, data: buildTransactionsJson(c) },
    { id: "bank-analytics", label: "Bank Analytics", endpoint: "GET https://api.ventusai.com/v1/analytics/bank", responseMs: 523, data: buildBankAnalyticsJson() },
  ];
}

/* ── Syntax-highlighted JSON renderer ───────────────────────── */

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-[#7dd3fc]"; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-[#c4b5fd]" : "text-[#86efac]"; // key : string
      } else if (/true|false/.test(match)) {
        cls = "text-[#fbbf24]";
      } else if (/null/.test(match)) {
        cls = "text-[#94a3b8]";
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
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/40" style={{ background: "#161822" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <code className="text-[9px] text-slate-400 font-mono truncate">{tab.endpoint}</code>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
          <Shield className="w-2.5 h-2.5" />
          Zero PII
        </span>
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 border-b border-slate-700/30 flex items-center gap-2" style={{ background: "#12141d" }}>
        <span className="text-[9px] font-mono font-semibold text-emerald-400">200 OK</span>
        <span className="text-[9px] font-mono text-slate-500">•</span>
        <span className="text-[9px] font-mono text-slate-400">{tab.responseMs}ms</span>
        <span className="text-[9px] font-mono text-slate-500">•</span>
        <span className="text-[9px] font-mono text-slate-500">x-api-key: ••••••••</span>
      </div>

      {/* JSON body */}
      <div className="p-3 overflow-auto max-h-[50vh]">
        <pre
          className="text-[10px] leading-[1.65] font-mono whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}

/* ── Single customer panel with tabs ────────────────────────── */

function CustomerTerminal({ customer, accentColor }: { customer: DemoCustomer; accentColor: string }) {
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = getTabsForCustomer(customer);

  return (
    <div className="space-y-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-0.5 rounded-lg gap-0 h-8">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`text-[10px] font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all ${
                tab.glow
                  ? "data-[state=active]:text-amber-700 data-[state=inactive]:text-amber-600/80"
                  : "data-[state=active]:text-slate-900"
              }`}
              style={
                tab.glow
                  ? { textShadow: activeTab === tab.id ? "0 0 8px rgba(245,158,11,0.4)" : "0 0 6px rgba(245,158,11,0.25)" }
                  : undefined
              }
            >
              {tab.glow && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                  style={{ background: "#f59e0b", boxShadow: "0 0 6px 2px rgba(245,158,11,0.45)" }}
                />
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-2">
            <ApiTerminal tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function DemoEngineProfileView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerTerminal customer={customerA} accentColor="#3b82f6" />
      <CustomerTerminal customer={customerB} accentColor="#10b981" />
    </div>
  );
}
