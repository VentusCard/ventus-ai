import { useState, useEffect } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

function buildProfile(customer: DemoCustomer) {
  const txs = customer.sampleTransactions;
  const totalSpend = txs.reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.-]/g, "")), 0);
  const merchants = [...new Set(txs.map(t => t.merchant))];
  const categories = [...new Set(txs.map(t => t.category))];

  return {
    customer_id: customer.id,
    demographics: {
      name: customer.profile.name,
      age: customer.profile.demographics.age,
      occupation: customer.profile.demographics.occupation,
      family_status: customer.profile.demographics.familyStatus,
      income_level: customer.profile.demographics.incomeLevel,
      segment: customer.profile.segment,
    },
    spending_summary: {
      total_analyzed: `$${Math.abs(totalSpend).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      transaction_count: txs.length,
      top_pillars: customer.topPillars.map(p => ({
        pillar: p.name,
        share: `${p.pct}%`,
        spend: p.spend,
      })),
    },
    behavioral_patterns: {
      unique_merchants: merchants.length,
      top_merchants: merchants.slice(0, 5),
      category_diversity: categories.length,
      lifestyle_type: customer.lifestyleType,
    },
    pillar_breakdown: customer.pillarBreakdown.map(p => ({
      pillar: p.pillar,
      percentage: `${p.pct}%`,
    })),
    life_events_detected: customer.lifeEvents.map(e => ({
      event: e.name,
      confidence: `${e.confidence}%`,
      urgency: e.urgency,
      timing: e.timing,
      evidence: e.evidence,
    })),
    opportunity_flags: [
      customer.topPillars.length > 3 && "diversified_spender",
      customer.lifeEvents.some(e => e.urgency === "Urgent") && "urgent_life_event",
      customer.trips.length > 0 && "active_traveler",
      customer.deals.some(d => d.match >= 90) && "high_match_rewards",
    ].filter(Boolean),
  };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function JsonTree({ data, depth = 0, staggerMs = 0 }: { data: JsonValue; depth?: number; staggerMs?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), staggerMs);
    return () => clearTimeout(t);
  }, [staggerMs]);

  if (!visible) return <div className="h-5" />;

  if (data === null) return <span className="text-slate-400">null</span>;
  if (typeof data === "boolean") return <span className="text-amber-500">{String(data)}</span>;
  if (typeof data === "number") return <span className="text-cyan-400">{data}</span>;
  if (typeof data === "string") return <span className="text-emerald-400">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-slate-500">[]</span>;
    return <ArrayNode data={data} depth={depth} staggerBase={staggerMs} />;
  }

  if (typeof data === "object") {
    return <ObjectNode data={data as Record<string, JsonValue>} depth={depth} staggerBase={staggerMs} />;
  }

  return null;
}

function ObjectNode({ data, depth, staggerBase }: { data: Record<string, JsonValue>; depth: number; staggerBase: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const entries = Object.entries(data);
  const indent = depth * 16;

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-300 transition-colors">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="text-slate-500 text-[10px]">{`{${collapsed ? `…${entries.length} keys` : ""}}`}</span>
      </button>
      {!collapsed && (
        <div style={{ paddingLeft: indent > 0 ? 16 : 0 }}>
          {entries.map(([key, val], i) => (
            <div key={key} className="flex gap-1 items-start leading-relaxed">
              <span className="text-indigo-300 shrink-0">"{key}"</span>
              <span className="text-slate-600 shrink-0">:</span>
              <JsonTree data={val as JsonValue} depth={depth + 1} staggerMs={staggerBase + (i + 1) * 30} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrayNode({ data, depth, staggerBase }: { data: JsonValue[]; depth: number; staggerBase: number }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-300 transition-colors">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="text-slate-500 text-[10px]">{`[${collapsed ? `…${data.length} items` : ""}]`}</span>
      </button>
      {!collapsed && (
        <div style={{ paddingLeft: 16 }}>
          {data.map((item, i) => (
            <div key={i}>
              <JsonTree data={item} depth={depth + 1} staggerMs={staggerBase + (i + 1) * 40} />
              {i < data.length - 1 && <span className="text-slate-600">,</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilePanel({ customer, accentColor }: { customer: DemoCustomer; accentColor: string }) {
  const profile = buildProfile(customer);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
        <span className="text-xs font-mono font-semibold text-slate-300">{customer.profile.name}</span>
        <span className="text-[9px] text-slate-500 ml-auto font-mono">ventus.ai/profile/{customer.id}</span>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-[11px] leading-[1.8] max-h-[65vh] overflow-y-auto">
        <JsonTree data={profile as unknown as JsonValue} staggerMs={0} />
      </div>
    </div>
  );
}

export default function DemoEngineProfileView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProfilePanel customer={customerA} accentColor="#3b82f6" />
      <ProfilePanel customer={customerB} accentColor="#10b981" />
    </div>
  );
}
