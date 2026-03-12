import { useState, useEffect } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}

function buildEnrichedProfile(customer: DemoCustomer, enriched: EnrichedTransaction[]) {
  const totalSpend = enriched.reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  // Pillar breakdown from enriched data
  const pillarMap: Record<string, { spend: number; count: number; confSum: number }> = {};
  const merchantMap: Record<string, number> = {};
  const subcatMap: Record<string, number> = {};

  for (const t of enriched) {
    const pillar = t.pillar || "Unknown";
    if (!pillarMap[pillar]) pillarMap[pillar] = { spend: 0, count: 0, confSum: 0 };
    pillarMap[pillar].spend += Math.abs(t.amount || 0);
    pillarMap[pillar].count += 1;
    pillarMap[pillar].confSum += t.confidence || 0;

    const merchant = t.normalized_merchant || t.merchant_name;
    merchantMap[merchant] = (merchantMap[merchant] || 0) + Math.abs(t.amount || 0);

    const subcat = t.subcategory || "Other";
    subcatMap[subcat] = (subcatMap[subcat] || 0) + Math.abs(t.amount || 0);
  }

  const pillarEntries = Object.entries(pillarMap).sort((a, b) => b[1].spend - a[1].spend);
  const topMerchants = Object.entries(merchantMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topSubcats = Object.entries(subcatMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const avgConfidence = enriched.length > 0
    ? enriched.reduce((s, t) => s + (t.confidence || 0), 0) / enriched.length
    : 0;

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
    enrichment_metadata: {
      total_transactions_classified: enriched.length,
      avg_confidence: `${(avgConfidence * 100).toFixed(1)}%`,
      enriched_at: new Date().toISOString(),
    },
    spending_summary: {
      total_analyzed: `$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      transaction_count: enriched.length,
      pillar_breakdown: pillarEntries.map(([name, data]) => ({
        pillar: name,
        spend: `$${data.spend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        share: `${((data.spend / totalSpend) * 100).toFixed(1)}%`,
        avg_confidence: `${((data.confSum / data.count) * 100).toFixed(0)}%`,
        tx_count: data.count,
      })),
    },
    behavioral_patterns: {
      unique_merchants: Object.keys(merchantMap).length,
      top_merchants_by_spend: topMerchants.map(([name, spend]) => ({
        merchant: name,
        total_spend: `$${spend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      })),
      top_subcategories: topSubcats.map(([name, spend]) => ({
        subcategory: name,
        spend: `$${spend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      })),
      category_diversity: Object.keys(pillarMap).length,
      lifestyle_type: customer.lifestyleType,
    },
    life_events_detected: customer.lifeEvents.map(e => ({
      event: e.name,
      confidence: `${e.confidence}%`,
      urgency: e.urgency,
      timing: e.timing,
      evidence: e.evidence,
    })),
    opportunity_flags: [
      pillarEntries.length > 3 && "diversified_spender",
      customer.lifeEvents.some(e => e.urgency === "Urgent") && "urgent_life_event",
      customer.trips.length > 0 && "active_traveler",
      customer.deals.some(d => d.match >= 90) && "high_match_rewards",
      avgConfidence > 0.85 && "high_confidence_profile",
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

function ProfilePanel({ customer, enriched, accentColor }: { customer: DemoCustomer; enriched?: EnrichedTransaction[]; accentColor: string }) {
  if (!enriched || enriched.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-950 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <span className="text-xs font-mono font-semibold text-slate-300">{customer.profile.name}</span>
        </div>
        <div className="p-8 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs font-mono">Run enrichment to generate profile</p>
        </div>
      </div>
    );
  }

  const profile = buildEnrichedProfile(customer, enriched);

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

export default function DemoEngineProfileView({ customerA, customerB, enrichedA, enrichedB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProfilePanel customer={customerA} enriched={enrichedA} accentColor="#3b82f6" />
      <ProfilePanel customer={customerB} enriched={enrichedB} accentColor="#10b981" />
    </div>
  );
}
