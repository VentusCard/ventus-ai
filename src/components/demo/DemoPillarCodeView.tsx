import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Loader2, Database, Zap, Brain, Activity } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { ApiPayloads } from "@/hooks/useDemoEnrichment";
import type { EnrichedTransaction } from "@/types/transaction";

type ViewMode = "engine" | "profiling" | "predictive" | "phase";

interface Props {
  mode: ViewMode;
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  apiPayloads: ApiPayloads;
}

const MODE_META: Record<ViewMode, { label: string; edgeFn: string; icon: typeof Database; description: string }> = {
  engine: {
    label: "classify-transactions",
    edgeFn: "classify-transactions",
    icon: Database,
    description: "Raw AI classification output — pillars, subcategories, confidence scores, spending tiers",
  },
  profiling: {
    label: "Pillar Summary",
    edgeFn: "client-side aggregation",
    icon: Activity,
    description: "Structured breakdown of spending patterns derived from classified transactions",
  },
  predictive: {
    label: "deal-personalization + local-experiences",
    edgeFn: "deal-personalization, local-experiences",
    icon: Zap,
    description: "Forward-looking: personalized offers and travel intelligence",
  },
  phase: {
    label: "analyze-lifestyle-signals",
    edgeFn: "analyze-lifestyle-signals",
    icon: Brain,
    description: "Life event detection — confidence scores, evidence, talking points",
  },
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function JsonTree({ data, depth = 0 }: { data: JsonValue; depth?: number }) {
  if (data === null) return <span className="text-slate-400">null</span>;
  if (typeof data === "boolean") return <span className="text-amber-500">{String(data)}</span>;
  if (typeof data === "number") return <span className="text-cyan-400">{data}</span>;
  if (typeof data === "string") return <span className="text-emerald-400">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-slate-500">[]</span>;
    return <CollapsibleArray data={data} depth={depth} />;
  }

  if (typeof data === "object") {
    return <CollapsibleObject data={data as Record<string, JsonValue>} depth={depth} />;
  }

  return null;
}

function CollapsibleObject({ data, depth }: { data: Record<string, JsonValue>; depth: number }) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const entries = Object.entries(data);

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-300 transition-colors">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="text-slate-500 text-[10px]">{`{${collapsed ? `…${entries.length} keys` : ""}}`}</span>
      </button>
      {!collapsed && (
        <div style={{ paddingLeft: 16 }}>
          {entries.map(([key, val]) => (
            <div key={key} className="flex gap-1 items-start leading-relaxed">
              <span className="text-indigo-300 shrink-0">"{key}"</span>
              <span className="text-slate-600 shrink-0">:</span>
              <JsonTree data={val as JsonValue} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleArray({ data, depth }: { data: JsonValue[]; depth: number }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

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
              <JsonTree data={item} depth={depth + 1} />
              {i < data.length - 1 && <span className="text-slate-600">,</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildProfilingSummary(enriched: EnrichedTransaction[]) {
  const pillarMap: Record<string, { spend: number; count: number; confSum: number; subcats: Record<string, number>; tiers: Record<string, number>; freqs: Record<string, number> }> = {};

  for (const t of enriched) {
    const pillar = t.pillar || "Unknown";
    if (!pillarMap[pillar]) pillarMap[pillar] = { spend: 0, count: 0, confSum: 0, subcats: {}, tiers: {}, freqs: {} };
    pillarMap[pillar].spend += Math.abs(t.amount || 0);
    pillarMap[pillar].count += 1;
    pillarMap[pillar].confSum += t.confidence || 0;
    const sc = t.subcategory || "Other";
    pillarMap[pillar].subcats[sc] = (pillarMap[pillar].subcats[sc] || 0) + 1;
    const tier = t.spending_tier || "N/A";
    pillarMap[pillar].tiers[tier] = (pillarMap[pillar].tiers[tier] || 0) + 1;
    const freq = t.purchase_frequency || "One-Time";
    pillarMap[pillar].freqs[freq] = (pillarMap[pillar].freqs[freq] || 0) + 1;
  }

  const total = enriched.reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  return Object.entries(pillarMap)
    .sort((a, b) => b[1].spend - a[1].spend)
    .map(([name, data]) => ({
      pillar: name,
      total_spend: `$${data.spend.toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
      share: `${((data.spend / total) * 100).toFixed(1)}%`,
      transaction_count: data.count,
      avg_confidence: `${((data.confSum / data.count) * 100).toFixed(0)}%`,
      top_subcategories: Object.entries(data.subcats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n),
      dominant_tier: Object.entries(data.tiers).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      frequency_distribution: data.freqs,
    }));
}

function DataPanel({ title, accentColor, data, emptyMsg }: { title: string; accentColor: string; data: any; emptyMsg: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
        <span className="text-xs font-mono font-semibold text-slate-300">{title}</span>
        <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-900/40 text-emerald-400 border border-emerald-700/30">LIVE</span>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-[11px] leading-[1.8] max-h-[60vh] overflow-y-auto">
        {data ? (
          <JsonTree data={data as JsonValue} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <p className="text-xs font-mono">{emptyMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoPillarCodeView({ mode, customer, enriched, apiPayloads }: Props) {
  const meta = MODE_META[mode];
  const Icon = meta.icon;

  const getData = () => {
    switch (mode) {
      case "engine": {
        const payload = apiPayloads.classification;
        if (!payload) return null;
        return {
          edge_function: "classify-transactions",
          model: "google/gemini-2.5-flash",
          input: payload.request,
          output: {
            ...payload.response,
            full_enriched_sample: enriched?.slice(0, 5)?.map(t => ({
              merchant: t.normalized_merchant || t.merchant_name,
              amount: t.amount,
              pillar: t.pillar,
              subcategory: t.subcategory,
              confidence: t.confidence,
              spending_tier: t.spending_tier,
              purchase_frequency: t.purchase_frequency,
            })),
          },
        };
      }
      case "profiling": {
        if (!enriched || enriched.length === 0) return null;
        return {
          source: "client-side aggregation of classify-transactions output",
          customer: customer.profile.name,
          total_transactions: enriched.length,
          total_spend: `$${enriched.reduce((s, t) => s + Math.abs(t.amount || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
          pillar_breakdown: buildProfilingSummary(enriched),
        };
      }
      case "predictive": {
        const dealPayload = apiPayloads.dealPersonalization;
        const localPayload = apiPayloads.localExperiences;
        if (!dealPayload && !localPayload) return null;
        return {
          deal_personalization: dealPayload ? {
            edge_function: "deal-personalization",
            model: "google/gemini-2.5-flash",
            request: dealPayload.request,
            response: dealPayload.response,
          } : "awaiting...",
          local_experiences: localPayload ? {
            edge_function: "local-experiences",
            model: "google/gemini-2.5-flash",
            request: localPayload.request,
            response: localPayload.response,
          } : "awaiting...",
        };
      }
      case "phase": {
        const payload = apiPayloads.lifestyleSignals;
        if (!payload) return null;
        return {
          edge_function: "analyze-lifestyle-signals",
          model: "google/gemini-2.5-flash",
          request: payload.request,
          response: payload.response,
        };
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header badge */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700">{meta.edgeFn}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">EDGE FUNCTION</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{meta.description}</p>
        </div>
      </div>

      {/* Single panel */}
      <DataPanel
        title={customer.profile.name}
        accentColor="#3b82f6"
        data={getData()}
        emptyMsg="Run enrichment to see data"
      />
    </div>
  );
}
