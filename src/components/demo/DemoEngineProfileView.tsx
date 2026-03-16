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
  showHeaders?: boolean;
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
      lifestyle_label: c.lifestyleType
    })),
    top_merchants: c.sampleTransactions.slice(0, 4).map((t) => ({
      merchant: t.merchant,
      amount: t.amount,
      category: t.category
    })),
    lifestyle_type: c.lifestyleType,
    segment: c.profile.segment
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
      detected_at: "2026-03-07T17:56:54.687Z"
    }))
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
      detected_at: "2026-03-07T17:57:12.980Z"
    }))
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
      source: t.source || null
    }))
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
      avg_confidence: 0.9
    },
    pillar_distribution: [
    { pillar: "Travel & Exploration", transaction_count: 46, total_spend: 33980.5, customer_count: 14, pct_of_total: 26.89 },
    { pillar: "Financial & Aspirational", transaction_count: 13, total_spend: 33329, customer_count: 9, pct_of_total: 26.37 },
    { pillar: "Family & Community", transaction_count: 40, total_spend: 16207.7, customer_count: 10, pct_of_total: 12.82 }],

    life_event_summary: [
    { event_type: "OPPORTUNITY", count: 7, avg_confidence: 81.43 },
    { event_type: "NOTABLE", count: 14, avg_confidence: 83.93 }],

    top_merchants: [
    { merchant: "Delta Air Lines", transaction_count: 19, total_spend: 8860, customer_count: 13 },
    { merchant: "Home Depot", transaction_count: 6, total_spend: 7847, customer_count: 6 },
    { merchant: "MARRIOTT", transaction_count: 9, total_spend: 7206, customer_count: 9 }],

    segments: [
    { segment: "Frequent Traveler", customer_count: 3, avg_spend: 517.01 },
    { segment: "New/Expecting Parent", customer_count: 2, avg_spend: 1104.96 },
    { segment: "Family-oriented", customer_count: 4, avg_spend: 993.34 }]

  };
}

/* ── Tab definitions ────────────────────────────────────────── */

const TAB_IDS = ["profile", "life-events", "trips", "transactions", "bank-analytics"] as const;
const TAB_LABELS: Record<string, string> = {
  profile: "Profile",
  "life-events": "Life Events",
  trips: "Trips",
  transactions: "Transactions",
  "bank-analytics": "Bank Analytics"
};

function getEndpoint(tabId: string, cid: string): string {
  if (tabId === "bank-analytics") return "GET https://api.ventusai.com/v1/analytics/bank";
  const path = tabId === "life-events" ? "life-events" : tabId;
  return `GET https://api.ventusai.com/v1/customers/${cid}/${path}`;
}

const RESPONSE_MS: Record<string, number> = {
  profile: 347,
  "life-events": 412,
  trips: 289,
  transactions: 195,
  "bank-analytics": 523
};

function getDataForTab(tabId: string, c: DemoCustomer): unknown {
  switch (tabId) {
    case "profile":return buildProfileJson(c);
    case "life-events":return buildLifeEventsJson(c);
    case "trips":return buildTripsJson(c);
    case "transactions":return buildTransactionsJson(c);
    case "bank-analytics":return buildBankAnalyticsJson();
    default:return {};
  }
}

/* ── Syntax highlighting ────────────────────────────────────── */

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-[#7dd3fc]";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-[#c4b5fd]" : "text-[#86efac]";
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

function ApiTerminal({ endpoint, responseMs, data }: {endpoint: string;responseMs: number;data: unknown;}) {
  const formatted = JSON.stringify(data, null, 2);
  const highlighted = syntaxHighlight(formatted);

  return (
    <div className="rounded-xl border border-slate-700/60 overflow-hidden" style={{ background: "#0F1117" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/40" style={{ background: "#161822" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <code className="text-[9px] text-slate-400 font-mono truncate">{endpoint}</code>
        </div>
        


        
      </div>
      <div className="px-3 py-1 border-b border-slate-700/30 flex items-center gap-2" style={{ background: "#12141d" }}>
        <span className="text-[9px] font-mono font-semibold text-emerald-400">200 OK</span>
        <span className="text-[9px] font-mono text-slate-500">•</span>
        <span className="text-[9px] font-mono text-slate-400">{responseMs}ms</span>
        <span className="text-[9px] font-mono text-slate-500">•</span>
        <span className="text-[9px] font-mono text-slate-500">x-api-key: ••••••••</span>
      </div>
      <div className="p-3 overflow-auto max-h-[60vh]">
        <pre
          className="text-[11px] leading-[1.7] font-mono whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }} />
        
      </div>
    </div>);

}

/* ── Main component ─────────────────────────────────────────── */

export default function DemoEngineProfileView({ customerA, customerB, showHeaders = true }: Props) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const cidA = `cust_${customerA.id}`;
  const cidB = `cust_${customerB.id}`;

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-lg gap-0.5 h-9">
          {TAB_IDS.map((id) =>
          <TabsTrigger
            key={id}
            value={id}
            className="text-[11px] font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 transition-all">
              {TAB_LABELS[id]}
            </TabsTrigger>
          )}
        </TabsList>

        {showHeaders && (
          <div className="grid grid-cols-2 gap-4 mt-3 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600">{customerA.profile.name.split(" ").map(w => w[0]).join("")}</span>
              </div>
              <span className="text-xs font-semibold text-blue-600">{customerA.profile.name}</span>
              <span className="text-[9px] text-slate-400">· {customerA.lifestyleType}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-emerald-600">{customerB.profile.name.split(" ").map(w => w[0]).join("")}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">{customerB.profile.name}</span>
              <span className="text-[9px] text-slate-400">· {customerB.lifestyleType}</span>
            </div>
          </div>
        )}

        {TAB_IDS.map((id) =>
        <TabsContent key={id} value={id} className="mt-2">
            <div className="grid grid-cols-2 gap-4">
              <ApiTerminal
              endpoint={getEndpoint(id, cidA)}
              responseMs={RESPONSE_MS[id]}
              data={getDataForTab(id, customerA)} />
            
              <ApiTerminal
              endpoint={getEndpoint(id, cidB)}
              responseMs={RESPONSE_MS[id]}
              data={getDataForTab(id, customerB)} />
            
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>);

}