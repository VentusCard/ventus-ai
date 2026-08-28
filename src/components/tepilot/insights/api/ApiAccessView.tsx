import { useState } from "react";
import {
  Plug, Activity, Gauge, AlertTriangle, Timer, KeyRound, ArrowUpRight,
  Copy, Check, Webhook, Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TabHeader } from "../TabHeader";
import { ApiUsageChart } from "./ApiUsageChart";
import {
  API_KPIS, API_ENDPOINT_STATS, API_RATE_LIMITS, API_RECENT_REQUESTS,
  WEBHOOK_SUMMARY, WEBHOOK_DELIVERIES, CURL_EXAMPLE,
} from "@/lib/apiUsageData";

const methodStyles: Record<string, string> = {
  GET: "bg-sky-50 text-sky-700 border-sky-200",
  POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PUT: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-rose-50 text-rose-700 border-rose-200",
};

function statusStyle(status: number) {
  if (status < 300) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status < 500) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function KpiCard({
  icon, label, value, sub, tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums leading-none",
          tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function ProgressRow({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500 tabular-nums">
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full", pct > 85 ? "bg-amber-500" : "bg-blue-600")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ApiAccessViewProps {
  onOpenApiKeys?: () => void;
}

export function ApiAccessView({ onOpenApiKeys }: ApiAccessViewProps) {
  const [copied, setCopied] = useState(false);

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(CURL_EXAMPLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const openKeys = () => {
    if (onOpenApiKeys) return onOpenApiKeys();
    window.dispatchEvent(new CustomEvent("ventus:open-settings-tab", { detail: { tab: "api-keys" } }));
  };

  const quotaPct = (API_KPIS.quotaUsed / API_KPIS.quotaLimit) * 100;

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Plug className="w-4 h-4" />}
        title="API access & usage"
        subtitle="Consumption, performance, rate limits, and endpoint reference for the Ventus API"
        howItWorks="Every downstream system — core, CRM, marketing automation, rewards, digital banking — calls the Ventus API with a scoped key. This view reports what those integrations consumed and how the platform responded."
        whyItMatters="Usage and latency visibility tells you whether personalization is reaching customers in time, and where quota or throttling would cap an upcoming launch."
      />

      {/* Credentials handoff */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-900">Manage API keys & access</div>
            <div className="text-[11px] text-slate-500">
              Key creation, scopes, rotation, and assignment live in Settings — not on this dashboard.
            </div>
          </div>
        </div>
        <button
          onClick={openKeys}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Go to Settings → API Keys
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Calls · 30d"
          value={`${(API_KPIS.callsLast30d / 1_000_000).toFixed(1)}M`}
          sub={`+${API_KPIS.callsDeltaPct}% vs prior 30d`}
        />
        <KpiCard
          icon={<Check className="w-3.5 h-3.5" />}
          label="Success rate"
          value={`${API_KPIS.successRatePct}%`}
          sub="2xx responses across all endpoints"
          tone="good"
        />
        <KpiCard
          icon={<Timer className="w-3.5 h-3.5" />}
          label="p95 latency"
          value={`${API_KPIS.p95LatencyMs}ms`}
          sub="Enrichment p95 under 120ms"
        />
        <KpiCard
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label="Error rate"
          value={`${API_KPIS.errorRatePct}%`}
          sub={`${API_RATE_LIMITS.throttleEvents30d} throttle events in 30d`}
          tone="warn"
        />
        <KpiCard
          icon={<Gauge className="w-3.5 h-3.5" />}
          label="Quota used"
          value={`${quotaPct.toFixed(0)}%`}
          sub={`${(API_KPIS.quotaLimit / 1_000_000).toFixed(0)}M call plan limit`}
        />
      </div>

      {/* Chart + rate limits */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ApiUsageChart />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Rate limits & quota</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {API_RATE_LIMITS.tier}
            </span>
          </div>
          <div className="space-y-3.5">
            <ProgressRow label="Requests / minute" used={API_RATE_LIMITS.requestsPerMinute.used} limit={API_RATE_LIMITS.requestsPerMinute.limit} unit="rpm" />
            <ProgressRow label="Concurrent batches" used={API_RATE_LIMITS.concurrentBatches.used} limit={API_RATE_LIMITS.concurrentBatches.limit} unit="jobs" />
            <ProgressRow label="Monthly quota" used={API_RATE_LIMITS.monthlyQuota.used} limit={API_RATE_LIMITS.monthlyQuota.limit} unit="calls" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-800">{API_RATE_LIMITS.burstStatus}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            Throttled requests return <span className="font-mono">429</span> with a{" "}
            <span className="font-mono">Retry-After</span> header. Batch enrichment retries automatically.
          </p>
        </div>
      </div>

      {/* Endpoint breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Endpoints</h3>
          <span className="text-[11px] text-slate-500">{API_ENDPOINT_STATS.length} endpoints · last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wide">
                <th className="text-left font-semibold px-4 py-2">Endpoint</th>
                <th className="text-right font-semibold px-4 py-2">Calls</th>
                <th className="text-right font-semibold px-4 py-2">Avg latency</th>
                <th className="text-right font-semibold px-4 py-2">Error rate</th>
              </tr>
            </thead>
            <tbody>
              {API_ENDPOINT_STATS.map((e) => (
                <tr key={e.path} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono", methodStyles[e.method])}>
                        {e.method}
                      </span>
                      <span className="font-mono text-slate-800">{e.path}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 pl-[52px]">{e.description}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-800">{e.calls.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{e.avgLatencyMs}ms</td>
                  <td className={cn("px-4 py-2.5 text-right tabular-nums font-medium", e.errorRatePct > 1 ? "text-amber-600" : "text-slate-600")}>
                    {e.errorRatePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent requests + webhooks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Recent requests</h3>
            <span className="text-[11px] text-slate-500">Read-only · last 15</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-[11px]">
              <tbody>
                {API_RECENT_REQUESTS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap">{r.timestamp.slice(11)}</td>
                    <td className="px-1 py-2">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono", methodStyles[r.method])}>
                        {r.method}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-mono text-slate-700 truncate max-w-[190px]">{r.path}</td>
                    <td className="px-2 py-2">
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border tabular-nums", statusStyle(r.status))}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-500 whitespace-nowrap">{r.latencyMs}ms</td>
                    <td className="px-3 py-2 font-mono text-slate-400 truncate max-w-[180px]">{r.keyLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Webhooks</h3>
            </div>
            <span className="text-[11px] text-slate-500">{WEBHOOK_SUMMARY.registeredEndpoints} endpoints registered</span>
          </div>
          <div className="grid grid-cols-3 gap-3 px-4 py-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Delivery rate</div>
              <div className="text-lg font-bold text-emerald-600 tabular-nums">{WEBHOOK_SUMMARY.deliverySuccessPct}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Pending retries</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">{WEBHOOK_SUMMARY.pendingRetries}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Avg delivery</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">{WEBHOOK_SUMMARY.avgDeliveryMs}ms</div>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {WEBHOOK_DELIVERIES.map((d, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 last:border-0">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    d.status === "delivered" ? "bg-emerald-500" : d.status === "retrying" ? "bg-amber-500" : "bg-rose-500",
                  )}
                />
                <span className="font-mono text-[11px] text-slate-800 shrink-0">{d.event}</span>
                <span className="font-mono text-[11px] text-slate-400 truncate flex-1">{d.endpoint}</span>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {d.attempts} {d.attempts === 1 ? "attempt" : "attempts"} · {d.lastAttempt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quickstart */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Quickstart</h3>
          </div>
          <button
            onClick={copyCurl}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy curl"}
          </button>
        </div>
        <pre className="px-4 py-3 text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre bg-slate-50/60">
{CURL_EXAMPLE}
        </pre>
        <div className="px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          Base URL <span className="font-mono text-slate-700">https://api.ventusai.dev</span> · Bearer token auth · JSON over HTTPS
        </div>
      </div>
    </div>
  );
}
