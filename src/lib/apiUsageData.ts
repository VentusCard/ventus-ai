// Deterministic mock data for the API access & usage sub-tab.
// No backend calls — everything here is generated from a fixed seed so the
// demo renders identically on every load.

export interface ApiUsagePoint {
  date: string;
  success: number;
  error: number;
}

export interface ApiEndpointStat {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  calls: number;
  avgLatencyMs: number;
  errorRatePct: number;
}

export interface ApiRequestLogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  keyLabel: string;
}

export interface WebhookDelivery {
  event: string;
  endpoint: string;
  status: "delivered" | "retrying" | "failed";
  attempts: number;
  lastAttempt: string;
}

export interface ApiKeyRecord {
  id: string;
  label: string;
  maskedKey: string;
  environment: "Production" | "Sandbox";
  scopes: string[];
  owner: string;
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
}

// Simple deterministic pseudo-random generator.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildUsageSeries(days: number): ApiUsagePoint[] {
  const rand = seeded(2026 + days);
  const out: ApiUsagePoint[] = [];
  const today = new Date("2026-08-13T00:00:00Z");
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const weekday = d.getUTCDay();
    const weekendDip = weekday === 0 || weekday === 6 ? 0.45 : 1;
    const base = 780_000 + rand() * 220_000;
    const success = Math.round(base * weekendDip);
    const error = Math.round(success * (0.002 + rand() * 0.004));
    out.push({
      date: d.toISOString().slice(0, 10),
      success,
      error,
    });
  }
  return out;
}

export const API_USAGE_RANGES = [7, 30, 90] as const;
export type ApiUsageRange = (typeof API_USAGE_RANGES)[number];

export const API_KPIS = {
  callsLast30d: 22_480_912,
  callsDeltaPct: 8.4,
  successRatePct: 99.71,
  p95LatencyMs: 214,
  errorRatePct: 0.29,
  quotaUsed: 22_480_912,
  quotaLimit: 30_000_000,
};

export const API_ENDPOINT_STATS: ApiEndpointStat[] = [
  {
    method: "POST",
    path: "/v1/transactions/enrich",
    description: "Rail-agnostic behavioral enrichment for a batch of transactions",
    calls: 14_902_331,
    avgLatencyMs: 96,
    errorRatePct: 0.18,
  },
  {
    method: "GET",
    path: "/v1/customers/{id}/signals",
    description: "All five signal families for a single customer",
    calls: 3_411_209,
    avgLatencyMs: 128,
    errorRatePct: 0.22,
  },
  {
    method: "GET",
    path: "/v1/customers/{id}/life-events",
    description: "Detected life events with transaction evidence",
    calls: 1_884_540,
    avgLatencyMs: 143,
    errorRatePct: 0.31,
  },
  {
    method: "POST",
    path: "/v1/recommendations/next-product",
    description: "Next-best-product grounded in the bank product catalog",
    calls: 1_204_887,
    avgLatencyMs: 402,
    errorRatePct: 0.64,
  },
  {
    method: "POST",
    path: "/v1/recommendations/next-offer",
    description: "Personalized deal and reward offers for a customer",
    calls: 702_115,
    avgLatencyMs: 388,
    errorRatePct: 0.51,
  },
  {
    method: "GET",
    path: "/v1/portfolio/pillars",
    description: "Lifestyle pillar rollups across a cohort or the full book",
    calls: 214_663,
    avgLatencyMs: 511,
    errorRatePct: 0.12,
  },
  {
    method: "GET",
    path: "/v1/portfolio/wallet-share",
    description: "Outbound funds movement and win-back exposure",
    calls: 98_442,
    avgLatencyMs: 604,
    errorRatePct: 0.09,
  },
  {
    method: "POST",
    path: "/v1/webhooks/test",
    description: "Fire a sample event at a registered webhook endpoint",
    calls: 62_725,
    avgLatencyMs: 87,
    errorRatePct: 1.42,
  },
];

export const API_RATE_LIMITS = {
  tier: "Enterprise",
  requestsPerMinute: { used: 3_420, limit: 6_000 },
  concurrentBatches: { used: 12, limit: 25 },
  monthlyQuota: { used: API_KPIS.quotaUsed, limit: API_KPIS.quotaLimit },
  burstStatus: "Within burst envelope" as const,
  throttleEvents30d: 3,
};

export const API_RECENT_REQUESTS: ApiRequestLogEntry[] = [
  { timestamp: "2026-08-13 23:41:08", method: "POST", path: "/v1/transactions/enrich", status: 200, latencyMs: 91, keyLabel: "core-batch · vk_live_••••7f21" },
  { timestamp: "2026-08-13 23:41:02", method: "GET", path: "/v1/customers/8841923/signals", status: 200, latencyMs: 134, keyLabel: "crm-sync · vk_live_••••1c04" },
  { timestamp: "2026-08-13 23:40:57", method: "POST", path: "/v1/recommendations/next-product", status: 200, latencyMs: 418, keyLabel: "marketing-automation · vk_live_••••93bd" },
  { timestamp: "2026-08-13 23:40:51", method: "GET", path: "/v1/customers/2210447/life-events", status: 200, latencyMs: 147, keyLabel: "crm-sync · vk_live_••••1c04" },
  { timestamp: "2026-08-13 23:40:44", method: "POST", path: "/v1/transactions/enrich", status: 429, latencyMs: 12, keyLabel: "core-batch · vk_live_••••7f21" },
  { timestamp: "2026-08-13 23:40:39", method: "GET", path: "/v1/portfolio/pillars", status: 200, latencyMs: 522, keyLabel: "analytics-warehouse · vk_live_••••55ea" },
  { timestamp: "2026-08-13 23:40:31", method: "POST", path: "/v1/recommendations/next-offer", status: 200, latencyMs: 371, keyLabel: "rewards-provider · vk_live_••••20af" },
  { timestamp: "2026-08-13 23:40:24", method: "GET", path: "/v1/customers/7712088/signals", status: 404, latencyMs: 38, keyLabel: "crm-sync · vk_live_••••1c04" },
  { timestamp: "2026-08-13 23:40:18", method: "POST", path: "/v1/transactions/enrich", status: 200, latencyMs: 88, keyLabel: "core-batch · vk_live_••••7f21" },
  { timestamp: "2026-08-13 23:40:11", method: "GET", path: "/v1/portfolio/wallet-share", status: 200, latencyMs: 611, keyLabel: "analytics-warehouse · vk_live_••••55ea" },
  { timestamp: "2026-08-13 23:40:03", method: "POST", path: "/v1/transactions/enrich", status: 200, latencyMs: 94, keyLabel: "core-batch · vk_live_••••7f21" },
  { timestamp: "2026-08-13 23:39:58", method: "GET", path: "/v1/customers/1904553/life-events", status: 200, latencyMs: 139, keyLabel: "digital-banking · vk_live_••••e7d9" },
  { timestamp: "2026-08-13 23:39:49", method: "POST", path: "/v1/recommendations/next-offer", status: 500, latencyMs: 1204, keyLabel: "rewards-provider · vk_live_••••20af" },
  { timestamp: "2026-08-13 23:39:42", method: "GET", path: "/v1/customers/3320981/signals", status: 200, latencyMs: 121, keyLabel: "digital-banking · vk_live_••••e7d9" },
  { timestamp: "2026-08-13 23:39:35", method: "POST", path: "/v1/transactions/enrich", status: 200, latencyMs: 102, keyLabel: "core-batch · vk_live_••••7f21" },
];

export const WEBHOOK_SUMMARY = {
  registeredEndpoints: 6,
  deliverySuccessPct: 99.4,
  pendingRetries: 2,
  avgDeliveryMs: 312,
};

export const WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  { event: "life_event.detected", endpoint: "https://crm.ourbank.com/hooks/ventus", status: "delivered", attempts: 1, lastAttempt: "23:41:04" },
  { event: "signal.updated", endpoint: "https://automation.ourbank.com/ventus", status: "delivered", attempts: 1, lastAttempt: "23:40:52" },
  { event: "offer.generated", endpoint: "https://rewards.ourbank.com/ingest", status: "retrying", attempts: 2, lastAttempt: "23:40:31" },
  { event: "enrichment.batch.completed", endpoint: "https://warehouse.ourbank.com/ventus", status: "delivered", attempts: 1, lastAttempt: "23:40:12" },
  { event: "risk.flag.raised", endpoint: "https://risk.ourbank.com/hooks", status: "delivered", attempts: 1, lastAttempt: "23:39:58" },
  { event: "offer.generated", endpoint: "https://rewards.ourbank.com/ingest", status: "failed", attempts: 5, lastAttempt: "23:38:47" },
];

export const CURL_EXAMPLE = `curl -X POST https://api.ventusai.dev/v1/transactions/enrich \\
  -H "Authorization: Bearer $VENTUS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "8841923",
    "transactions": [
      { "id": "t_001", "amount": 68.42, "date": "2026-08-11",
        "description": "SQ *BLUEBOTTLE COFFEE 4471" }
    ]
  }'`;

export const API_KEYS: ApiKeyRecord[] = [
  { id: "k1", label: "core-batch", maskedKey: "vk_live_••••••••7f21", environment: "Production", scopes: ["enrich:write", "signals:read"], owner: "Data Platform", created: "2026-01-12", lastUsed: "2 min ago", status: "active" },
  { id: "k2", label: "crm-sync", maskedKey: "vk_live_••••••••1c04", environment: "Production", scopes: ["signals:read", "life-events:read"], owner: "CRM Ops", created: "2026-02-03", lastUsed: "4 min ago", status: "active" },
  { id: "k3", label: "marketing-automation", maskedKey: "vk_live_••••••••93bd", environment: "Production", scopes: ["recommendations:write"], owner: "Growth Marketing", created: "2026-03-19", lastUsed: "6 min ago", status: "active" },
  { id: "k4", label: "rewards-provider", maskedKey: "vk_live_••••••••20af", environment: "Production", scopes: ["offers:write", "signals:read"], owner: "Rewards & Deals", created: "2026-04-02", lastUsed: "11 min ago", status: "active" },
  { id: "k5", label: "analytics-warehouse", maskedKey: "vk_live_••••••••55ea", environment: "Production", scopes: ["portfolio:read"], owner: "Enterprise Analytics", created: "2026-04-28", lastUsed: "1 hr ago", status: "active" },
  { id: "k6", label: "sandbox-integration", maskedKey: "vk_test_••••••••04b8", environment: "Sandbox", scopes: ["enrich:write", "signals:read", "offers:write"], owner: "Integration QA", created: "2026-05-14", lastUsed: "Yesterday", status: "active" },
  { id: "k7", label: "legacy-etl", maskedKey: "vk_live_••••••••ab77", environment: "Production", scopes: ["enrich:write"], owner: "Data Platform", created: "2025-11-05", lastUsed: "Revoked 2026-06-30", status: "revoked" },
];

export const API_SCOPES = [
  { scope: "enrich:write", description: "Submit transactions for behavioral enrichment" },
  { scope: "signals:read", description: "Read the five signal families for a customer" },
  { scope: "life-events:read", description: "Read detected life events and their evidence" },
  { scope: "recommendations:write", description: "Generate next-best-product recommendations" },
  { scope: "offers:write", description: "Generate personalized deals and reward offers" },
  { scope: "portfolio:read", description: "Read bankwide rollups, pillars, and wallet share" },
];
