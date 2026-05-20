/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const PRIMARY_MODEL = "google/gemini-2.5-flash";
const FALLBACK_MODEL = "openai/gpt-5-mini";

// ---------- CORS (matches sibling functions) ----------
const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  "https://staging.d1gaewa028qzng.amplifyapp.com",
  /^https:\/\/.*\.ventusai\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((a) => (typeof a === "string" ? a === origin : a.test(origin)));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// ---------- Types ----------
type Flow = "income" | "spend";

interface InboundTx {
  transaction_id?: string;
  merchant_name?: string;
  merchant?: string;
  description?: string;
  amount: number;
  date: string;
  pillar?: string;
  category?: string;
  subcategory?: string;
  subcategories?: string[];
  flow?: Flow | string;
}

interface ClientInput {
  name?: string;
  age?: number;
  occupation?: string;
  industry?: string;
  income_level?: string;
  family_status?: string;
  segment?: string;
}

interface MetricsPack {
  window_days: number;
  observed_days: number;
  tx_count: number;
  inflow_count: number;
  outflow_count: number;
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  monthly_inflow: number;
  monthly_outflow: number;
  surplus_ratio: number;
  dti_proxy: number;
  cashflow_volatility: "low" | "medium" | "high";
  income_stability: "stable" | "variable" | "thin" | "unknown";
  payroll_month_count: number;
  distress_indicators: string[];
  positive_indicators: string[];
  thin_file: boolean;
}

// ---------- Helpers ----------
function isIncome(tx: InboundTx): boolean {
  if (tx.flow === "income") return true;
  if (tx.flow === "spend") return false;
  return tx.pillar === "Income & Inflows";
}

function txMerchant(tx: InboundTx): string {
  return (tx.merchant_name || tx.merchant || "").toString();
}

function txSubcat(tx: InboundTx): string {
  return (tx.subcategory || tx.subcategories?.[0] || "").toString();
}

const DEBT_SUBCAT_RX = /mortgage|auto loan|student loan|credit card payment|personal loan|loan payment/i;

function bucketVolatility(values: number[]): "low" | "medium" | "high" {
  if (values.length < 2) return "low";
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean <= 0) return "low";
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const cv = Math.sqrt(variance) / mean;
  if (cv < 0.2) return "low";
  if (cv < 0.5) return "medium";
  return "high";
}

function computeMetrics(transactions: InboundTx[], windowDays: number): MetricsPack {
  // Filter by window relative to the most recent date in dataset.
  const dated = transactions
    .filter((t) => !!t.date && !isNaN(new Date(t.date).getTime()))
    .map((t) => ({ ...t, _ts: new Date(t.date).getTime() }));

  if (dated.length === 0) {
    return {
      window_days: windowDays,
      observed_days: 0,
      tx_count: 0,
      inflow_count: 0,
      outflow_count: 0,
      total_inflow: 0,
      total_outflow: 0,
      net_cashflow: 0,
      monthly_inflow: 0,
      monthly_outflow: 0,
      surplus_ratio: 0,
      dti_proxy: 0,
      cashflow_volatility: "low",
      income_stability: "unknown",
      payroll_month_count: 0,
      distress_indicators: [],
      positive_indicators: [],
      thin_file: true,
    };
  }

  const maxTs = Math.max(...dated.map((t) => t._ts));
  const minTs = maxTs - windowDays * 86400_000;
  const windowed = dated.filter((t) => t._ts >= minTs);

  const observedDays = Math.max(
    1,
    Math.round((maxTs - Math.min(...windowed.map((t) => t._ts))) / 86400_000),
  );

  let totalInflow = 0;
  let totalOutflow = 0;
  let inflowCount = 0;
  let outflowCount = 0;
  let debtOutflow = 0;

  const outflowByMonth = new Map<string, number>();
  const payrollMonths = new Set<string>();
  const distress = new Map<string, number>();
  const positive = new Map<string, number>();

  for (const t of windowed) {
    const amt = Math.abs(Number(t.amount) || 0);
    const ym = t.date.slice(0, 7);
    const sub = txSubcat(t);
    const pillar = t.pillar || "";

    if (isIncome(t)) {
      totalInflow += amt;
      inflowCount += 1;
      if (pillar === "Income & Inflows") {
        const label = sub || "General";
        positive.set(label, (positive.get(label) || 0) + 1);
      }
      if (/payroll|direct deposit/i.test(sub)) {
        payrollMonths.add(ym);
      }
    } else {
      totalOutflow += amt;
      outflowCount += 1;
      outflowByMonth.set(ym, (outflowByMonth.get(ym) || 0) + amt);
      if (pillar === "Financial Distress") {
        const label = sub || "Distress";
        distress.set(label, (distress.get(label) || 0) + 1);
        debtOutflow += amt;
      } else if (DEBT_SUBCAT_RX.test(sub)) {
        debtOutflow += amt;
      }
    }
  }

  const monthsScale = Math.max(observedDays, 1) / 30;
  const monthlyInflow = totalInflow / monthsScale;
  const monthlyOutflow = totalOutflow / monthsScale;
  const surplusRatio = totalInflow > 0 ? (totalInflow - totalOutflow) / totalInflow : 0;
  const dtiProxy = monthlyInflow > 0 ? (debtOutflow / monthsScale) / monthlyInflow : 0;

  const volatility = bucketVolatility(Array.from(outflowByMonth.values()));

  const monthsObserved = Math.max(1, Math.ceil(observedDays / 30));
  let stability: MetricsPack["income_stability"];
  if (inflowCount < 3) stability = "thin";
  else if (payrollMonths.size >= Math.min(2, monthsObserved)) stability = "stable";
  else if (inflowCount >= 3) stability = "variable";
  else stability = "unknown";

  const thinFile = observedDays < 30 || inflowCount < 5;

  return {
    window_days: windowDays,
    observed_days: observedDays,
    tx_count: windowed.length,
    inflow_count: inflowCount,
    outflow_count: outflowCount,
    total_inflow: round2(totalInflow),
    total_outflow: round2(totalOutflow),
    net_cashflow: round2(totalInflow - totalOutflow),
    monthly_inflow: round2(monthlyInflow),
    monthly_outflow: round2(monthlyOutflow),
    surplus_ratio: round3(surplusRatio),
    dti_proxy: round3(dtiProxy),
    cashflow_volatility: volatility,
    income_stability: stability,
    payroll_month_count: payrollMonths.size,
    distress_indicators: Array.from(distress.keys()),
    positive_indicators: Array.from(positive.keys()),
    thin_file: thinFile,
  };
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
function round3(n: number): number { return Math.round(n * 1000) / 1000; }

function buildSamplePayload(transactions: InboundTx[], windowDays: number): string {
  const dated = transactions.filter((t) => !!t.date);
  if (dated.length === 0) return "(no transactions)";
  const maxTs = Math.max(...dated.map((t) => new Date(t.date).getTime()));
  const minTs = maxTs - windowDays * 86400_000;
  const windowed = dated.filter((t) => new Date(t.date).getTime() >= minTs);

  const inflows = windowed.filter(isIncome).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 30);
  const outflows = windowed.filter((t) => !isIncome(t)).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 30);
  const distress = windowed.filter((t) => t.pillar === "Financial Distress");

  const seen = new Set<string>();
  const lines: string[] = [];
  const push = (t: InboundTx) => {
    const id = t.transaction_id || `${t.date}|${txMerchant(t)}|${t.amount}`;
    if (seen.has(id)) return;
    seen.add(id);
    lines.push(
      `${t.date} | ${isIncome(t) ? "IN " : "OUT"} $${Math.abs(Number(t.amount) || 0).toFixed(2)} | ${t.pillar || "?"} / ${txSubcat(t) || "?"} | ${txMerchant(t)}`,
    );
  };
  for (const t of distress) push(t);
  for (const t of inflows) push(t);
  for (const t of outflows) push(t);
  return lines.slice(0, 100).join("\n");
}

// ---------- Tool schema ----------
const CREDITWORTHINESS_TOOL = {
  type: "function",
  function: {
    name: "emit_creditworthiness_assessment",
    description: "Indicative behavioral creditworthiness assessment grounded only in transaction evidence.",
    parameters: {
      type: "object",
      properties: {
        score: { type: "number", description: "300-850 indicative band" },
        band: { type: "string", enum: ["Excellent", "Good", "Fair", "Limited", "Poor"] },
        confidence: { type: "number", description: "0-100" },
        summary: { type: "string", description: "1-2 sentence advisor-facing headline" },
        drivers: {
          type: "array",
          minItems: 4,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              direction: { type: "string", enum: ["positive", "negative", "neutral"] },
              weight: { type: "number" },
              explanation: { type: "string" },
            },
            required: ["label", "direction", "weight", "explanation"],
            additionalProperties: false,
          },
        },
        signals: {
          type: "object",
          properties: {
            income_stability: { type: "string", enum: ["stable", "variable", "thin", "unknown"] },
            cashflow_volatility: { type: "string", enum: ["low", "medium", "high"] },
            discretionary_pressure: { type: "string", enum: ["low", "medium", "high"] },
            distress_indicators: { type: "array", items: { type: "string" } },
            positive_indicators: { type: "array", items: { type: "string" } },
          },
          required: [
            "income_stability",
            "cashflow_volatility",
            "discretionary_pressure",
            "distress_indicators",
            "positive_indicators",
          ],
          additionalProperties: false,
        },
        recommended_products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product: { type: "string" },
              rationale: { type: "string" },
            },
            required: ["product", "rationale"],
            additionalProperties: false,
          },
        },
        caveats: { type: "array", items: { type: "string" } },
      },
      required: ["score", "band", "confidence", "summary", "drivers", "signals", "recommended_products", "caveats"],
      additionalProperties: false,
    },
  },
} as const;

// ---------- LLM call ----------
async function callGateway(model: string, systemPrompt: string, userPrompt: string): Promise<Response> {
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [CREDITWORTHINESS_TOOL],
      tool_choice: { type: "function", function: { name: "emit_creditworthiness_assessment" } },
    }),
  });
}

function clamp(n: number, lo: number, hi: number): number {
  if (isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function deterministicFallback(metrics: MetricsPack): any {
  const distressList = metrics.distress_indicators;
  const positiveList = metrics.positive_indicators;
  const band = metrics.thin_file ? "Limited" : distressList.length > 0 ? "Fair" : "Good";
  const score = metrics.thin_file ? 660 : distressList.length > 0 ? 620 : 720;
  return {
    score,
    band,
    confidence: metrics.thin_file ? 35 : 50,
    summary:
      "Indicative fallback assessment generated from transaction metrics only — model output unavailable.",
    drivers: [
      {
        label: "Cashflow surplus",
        direction: metrics.surplus_ratio > 0.1 ? "positive" : metrics.surplus_ratio < 0 ? "negative" : "neutral",
        weight: 0.3,
        explanation: `Surplus ratio observed at ${(metrics.surplus_ratio * 100).toFixed(0)}% over the window.`,
      },
      {
        label: "Income stability",
        direction: metrics.income_stability === "stable" ? "positive" : "neutral",
        weight: 0.25,
        explanation: `Income pattern: ${metrics.income_stability}.`,
      },
      {
        label: "Debt service load (DTI proxy)",
        direction: metrics.dti_proxy > 0.4 ? "negative" : "neutral",
        weight: 0.25,
        explanation: `Recurring debt-like outflow runs at ${(metrics.dti_proxy * 100).toFixed(0)}% of monthly inflow.`,
      },
      {
        label: "Distress signals",
        direction: distressList.length > 0 ? "negative" : "positive",
        weight: 0.2,
        explanation: distressList.length > 0
          ? `Observed: ${distressList.join(", ")}.`
          : "No financial-distress merchant activity observed.",
      },
    ],
    signals: {
      income_stability: metrics.income_stability,
      cashflow_volatility: metrics.cashflow_volatility,
      discretionary_pressure: metrics.dti_proxy > 0.4 ? "high" : metrics.dti_proxy > 0.25 ? "medium" : "low",
      distress_indicators: distressList,
      positive_indicators: positiveList,
    },
    recommended_products: metrics.thin_file
      ? [{ product: "Secured credit-builder card", rationale: "Thin transaction history; start with a low-risk builder product." }]
      : distressList.length > 0
      ? [{ product: "Debt-consolidation loan", rationale: "Distress merchant activity present — consolidation may reduce carrying cost." }]
      : [{ product: "Unsecured card upgrade", rationale: "Stable cashflow and no distress signals support an upgrade conversation." }],
    caveats: [
      "Indicative model, not a credit decision; no bureau data used.",
      "Fallback path: deterministic metrics only, LLM reasoning unavailable.",
    ],
  };
}

// ---------- Prompts ----------
const SYSTEM_PROMPT = `You are a credit-risk analyst producing an INDICATIVE BEHAVIORAL creditworthiness assessment from bank transaction data only. You do NOT have credit bureau data, FICO scores, loan history, balances, or identity verification. You do NOT issue a credit decision — you produce a directional read for an advisor conversation.

SCORE BAND MAPPING (300-850 lender-style):
- 300-579  Poor
- 580-669  Fair
- 670-739  Good (use "Limited" instead when thin-file)
- 740-799  Good
- 800-850  Excellent

THIN-FILE RULE: If observed_days < 30 OR inflow_count < 5, cap score at 680, force band = "Limited", confidence <= 60.

DRIVER RULES (4-7 drivers):
- Each driver MUST cite observed pillars, subcategories, or merchant patterns from the supplied metrics or sample. Weight in [0,1], all weights should sum to ~1.
- Allowed driver themes: income stability, cashflow surplus, debt-service load (DTI proxy), spending volatility, discretionary pressure, distress-merchant activity, positive-savings activity, category concentration.
- Forbidden: speculation about credit bureau data, FICO claims, identity, asset balances, or anything not derivable from the transactions.

PRODUCT RECOMMENDATIONS — choose only from this set (no external brand names):
- Secured credit-builder card
- Credit-builder loan
- Unsecured card upgrade
- Debt-consolidation loan
- Home equity line of credit
- Personal loan
- Auto refinance
- Mortgage pre-qualification
- Wealth onboarding

TONE: Behavioral and "vaguely specific" — describe patterns, not exact transaction counts or dollar amounts.

REQUIRED CAVEAT: The caveats array MUST include "Indicative model, not a credit decision; no bureau data used."

Return your answer ONLY by calling the emit_creditworthiness_assessment tool.`;

// ---------- Handler ----------
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client: ClientInput = body.client || {};
    const transactions: InboundTx[] = Array.isArray(body.transactions) ? body.transactions : [];
    const windowDays: number = Number.isFinite(body.window_days) && body.window_days > 0 ? Math.floor(body.window_days) : 90;

    if (transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "transactions array is required and must be non-empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metrics = computeMetrics(transactions, windowDays);
    console.log("[CREDIT] metrics", JSON.stringify(metrics));

    const sample = buildSamplePayload(transactions, windowDays);
    const userPrompt = `CLIENT PROFILE
- Name: ${client.name ?? "Unknown"}
- Age: ${client.age ?? "Unknown"}
- Occupation: ${client.occupation ?? "Unknown"}
- Industry: ${client.industry ?? "Unknown"}
- Income band: ${client.income_level ?? "Unknown"}
- Family status: ${client.family_status ?? "Unknown"}
- Segment: ${client.segment ?? "Unknown"}

DETERMINISTIC METRICS (computed from the transactions; treat as ground truth for cashflow math):
${JSON.stringify(metrics, null, 2)}

TRANSACTION SAMPLE (distress rows + top inflows + top outflows, max 100 lines):
${sample}

Produce the indicative creditworthiness assessment.`;

    // Primary call, fallback once on non-2xx (other than 402/429 which we surface).
    let response = await callGateway(PRIMARY_MODEL, SYSTEM_PROMPT, userPrompt);

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn("[CREDIT] primary model failed, trying fallback", response.status, errText);
      response = await callGateway(FALLBACK_MODEL, SYSTEM_PROMPT, userPrompt);
    }

    let assessment: any | null = null;
    if (response.ok) {
      try {
        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          assessment = JSON.parse(toolCall.function.arguments);
        }
      } catch (e) {
        console.error("[CREDIT] tool-call parse error", e);
      }
    } else {
      const errText = await response.text();
      console.error("[CREDIT] fallback model failed", response.status, errText);
    }

    if (!assessment) {
      assessment = deterministicFallback(metrics);
    }

    // Authoritative affordability — always overwrite with deterministic numbers.
    assessment.affordability = {
      estimated_monthly_inflow: metrics.monthly_inflow,
      estimated_monthly_outflow: metrics.monthly_outflow,
      estimated_dti_proxy: metrics.dti_proxy,
      surplus_ratio: metrics.surplus_ratio,
    };

    // Clamps + thin-file enforcement.
    assessment.score = clamp(Number(assessment.score) || 0, 300, 850);
    assessment.confidence = clamp(Number(assessment.confidence) || 0, 0, 100);
    if (metrics.thin_file) {
      assessment.score = Math.min(assessment.score, 680);
      assessment.band = "Limited";
      assessment.confidence = Math.min(assessment.confidence, 60);
    }

    // Required caveat.
    if (!Array.isArray(assessment.caveats)) assessment.caveats = [];
    const REQUIRED = "Indicative model, not a credit decision; no bureau data used.";
    if (!assessment.caveats.includes(REQUIRED)) assessment.caveats.unshift(REQUIRED);

    assessment.window_days = windowDays;
    assessment.metrics = metrics;

    console.log(
      `[CREDIT] result score=${assessment.score} band=${assessment.band} confidence=${assessment.confidence} thin_file=${metrics.thin_file}`,
    );

    return new Response(JSON.stringify(assessment), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[CREDIT] unhandled error", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
