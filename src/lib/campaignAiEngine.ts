// Deterministic, LLM-free "AI" layer for the Campaign Builder.
// Every number here is derived from catalog state + a stable hash, so the demo
// is instant, repeatable, and makes no network calls.

import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import { PRODUCT_CATALOG, PRODUCT_CATEGORY_LABELS } from "@/lib/campaignStudioData";
import { adaptCatalogProduct } from "@/lib/catalogProductAdapter";
import { getProductVariants } from "@/lib/campaignCatalogVariants";

// ── utils ────────────────────────────────────────────────────────────────────

/** Stable string hash → 0..1 */
export function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
};

export const fmtMoney = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

// ── product fit scoring ──────────────────────────────────────────────────────

export interface AiProductFit {
  product: CatalogProduct;
  score: number;
  why: string;
  signalCoverage: number; // 0..1 — share of the 5 signal families with live support
}

const CATEGORY_SIGNAL_STRENGTH: Record<ProductCategory, number> = {
  credit_cards: 0.92,
  deposit_accounts: 0.74,
  loans: 0.81,
  investments: 0.86,
  insurance: 0.62,
  digital_services: 0.55,
};

const CATEGORY_WHY: Record<ProductCategory, string> = {
  credit_cards: "spend-category signals are the densest source we have",
  deposit_accounts: "inflow timing and idle-balance signals are reading clean",
  loans: "life-event and payment-history signals both point at this",
  investments: "outbound-to-brokerage and balance-growth signals are strong",
  insurance: "life-event coverage gaps are the main driver here",
  digital_services: "engagement signals carry this more than spend does",
};

export function scoreProductFit(product: CatalogProduct): AiProductFit {
  const flow = adaptCatalogProduct(product);
  const variants = getProductVariants(product);
  const h = hash01(`fit:${product.name}`);

  const catStrength = CATEGORY_SIGNAL_STRENGTH[product.category];
  // Under-penetrated products have more headroom → higher opportunity score.
  const headroom = 1 - product.penetrationRate / 100;
  const depth = clamp(variants.total / 120, 0, 1); // personalization depth available
  const raw = catStrength * 0.42 + headroom * 0.3 + depth * 0.16 + h * 0.12;

  const score = Math.round(clamp(raw * 100, 41, 94));
  const signalCoverage = clamp(catStrength * 0.7 + depth * 0.3, 0.2, 0.98);

  const why = `${Math.round(headroom * 100)}% of the base doesn't hold it and ${CATEGORY_WHY[product.category]}.`;

  return { product, score, why, signalCoverage };
}

let fitCache: AiProductFit[] | null = null;
export function allProductFits(): AiProductFit[] {
  if (!fitCache) fitCache = PRODUCT_CATALOG.map(scoreProductFit);
  return fitCache;
}

export function recommendedProducts(n = 3): AiProductFit[] {
  return [...allProductFits()].sort((a, b) => b.score - a.score).slice(0, n);
}

export function fitTone(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "Strong fit", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  if (score >= 65) return { label: "Good fit", cls: "bg-blue-50 border-blue-200 text-blue-700" };
  if (score >= 52) return { label: "Fair fit", cls: "bg-amber-50 border-amber-200 text-amber-700" };
  return { label: "Weak fit", cls: "bg-slate-50 border-slate-200 text-slate-600" };
}

// ── cannibalization ──────────────────────────────────────────────────────────

const OVERLAP_PAIRS: Record<string, string> = {
  "Cashback (3/2/1)": "Custom Cashback",
  "Custom Cashback": "Cashback (3/2/1)",
  Travel: "Premium Travel",
  "Premium Travel": "Travel",
  Airline: "Travel",
  Hotel: "Travel",
  Savings: "High-Yield Savings",
  "High-Yield Savings": "Savings",
  "Money Market": "High-Yield Savings",
  HELOC: "Home Mortgage",
  "Personal Loan": "Debt Consolidation",
  "Debt Consolidation": "Personal Loan",
  "Roth IRA": "Traditional IRA",
  "Traditional IRA": "Roth IRA",
  "Robo-Advisor": "Managed Portfolio",
  "Managed Portfolio": "Robo-Advisor",
};

export interface Cannibalization {
  competingProduct: string;
  overlapPct: number;
  note: string;
}

export function checkCannibalization(productName: string): Cannibalization | null {
  const competing = OVERLAP_PAIRS[productName];
  if (!competing) return null;
  const overlapPct = Math.round(18 + hash01(`cann:${productName}`) * 34);
  return {
    competingProduct: competing,
    overlapPct,
    note: `${overlapPct}% of this audience is already in an active ${competing} flow. Suppress the overlap or stagger the send by two weeks.`,
  };
}

// ── offer suggestions ────────────────────────────────────────────────────────

const OFFER_BANK: Record<ProductCategory, string[]> = {
  credit_cards: [
    "Double rewards on your top two categories for 90 days",
    "$200 statement credit after first 3 months of use",
    "Annual fee waived for year one",
    "5% back on the category you spend most in",
  ],
  deposit_accounts: [
    "Rate boost for 6 months on new balances",
    "$300 bonus for setting up direct deposit",
    "No monthly fee while balance stays active",
    "Automatic round-up savings turned on",
  ],
  loans: [
    "Closing costs credited at funding",
    "0.25% rate discount with autopay",
    "Rate lock held for 90 days",
    "No origination fee this quarter",
  ],
  investments: [
    "Advisory fee waived for the first year",
    "$500 transfer bonus on qualifying balances",
    "Free portfolio review with a licensed advisor",
    "Commission-free trades for 12 months",
  ],
  insurance: [
    "Bundle discount when paired with an existing policy",
    "First month covered on us",
    "Free coverage gap review",
    "Locked premium for 24 months",
  ],
  digital_services: [
    "Premium alerts unlocked at no cost",
    "$50 for activating and using it twice",
    "Free subscription audit in-app",
    "Fee-free overdraft buffer for 90 days",
  ],
};

export function suggestOffers(product?: CatalogProduct, n = 3): string[] {
  if (!product) return [];
  const bank = OFFER_BANK[product.category];
  const start = Math.floor(hash01(`offer:${product.name}`) * bank.length);
  return Array.from({ length: Math.min(n, bank.length) }, (_, i) => bank[(start + i) % bank.length]);
}

// ── forecast ─────────────────────────────────────────────────────────────────

export interface ForecastStage {
  id: string;
  label: string;
  low: number;
  high: number;
  ratePct: string;
}

export interface CampaignForecast {
  stages: ForecastStage[];
  revenueLow: number;
  revenueHigh: number;
  costPerAcquisition: number;
  basis: string;
}

const VALUE_PER_CONVERSION: Record<ProductCategory, number> = {
  credit_cards: 420,
  deposit_accounts: 260,
  loans: 1850,
  investments: 1240,
  insurance: 380,
  digital_services: 95,
};

export function forecastCampaign(audience: number, product?: CatalogProduct): CampaignForecast | null {
  if (!product || audience <= 0) return null;
  const h = hash01(`fc:${product.name}`);
  const openRate = 0.28 + h * 0.16;
  const clickRate = 0.11 + hash01(`clk:${product.name}`) * 0.09;
  const convRate = 0.035 + hash01(`cv:${product.name}`) * 0.045;

  const band = (n: number): [number, number] => [Math.round(n * 0.86), Math.round(n * 1.14)];

  const opens = audience * openRate;
  const clicks = opens * clickRate;
  const conversions = clicks * convRate;

  const [cLow, cHigh] = band(conversions);
  const value = VALUE_PER_CONVERSION[product.category];

  const stages: ForecastStage[] = [
    { id: "reach", label: "Delivered", low: Math.round(audience * 0.96), high: audience, ratePct: "96–100%" },
    { id: "opens", label: "Opens", low: band(opens)[0], high: band(opens)[1], ratePct: `${Math.round(openRate * 100)}%` },
    { id: "clicks", label: "Clicks", low: band(clicks)[0], high: band(clicks)[1], ratePct: `${Math.round(clickRate * 100)}%` },
    { id: "conv", label: "Conversions", low: cLow, high: cHigh, ratePct: `${(convRate * 100).toFixed(1)}%` },
  ];

  return {
    stages,
    revenueLow: cLow * value,
    revenueHigh: cHigh * value,
    costPerAcquisition: Math.round(38 + hash01(`cpa:${product.name}`) * 90),
    basis: `Modeled on ${PRODUCT_CATEGORY_LABELS[product.category].toLowerCase()} campaigns of comparable audience shape over the last 8 quarters.`,
  };
}

// ── comparable campaigns ─────────────────────────────────────────────────────

export interface ComparableCampaign {
  name: string;
  quarter: string;
  audience: number;
  conversionPct: string;
  outcome: string;
}

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export function comparableCampaigns(product?: CatalogProduct, audience = 0): ComparableCampaign[] {
  if (!product) return [];
  return Array.from({ length: 3 }, (_, i) => {
    const h = hash01(`cmp:${product.name}:${i}`);
    const conv = 2.4 + h * 4.1;
    return {
      name: `${product.name} · ${["signal-led", "life-event-led", "broad-category"][i]}`,
      quarter: `${QUARTERS[Math.floor(h * 4)]} ${2024 + (i % 2)}`,
      audience: Math.max(2000, Math.round(audience * (0.6 + h * 0.9))),
      conversionPct: `${conv.toFixed(1)}%`,
      outcome:
        i === 0
          ? "Beat plan — narrow signal stack, highest per-contact value"
          : i === 1
            ? "On plan — strong open rate, softer conversion"
            : "Under plan — audience too broad, message too generic",
    };
  });
}

// ── audience health ──────────────────────────────────────────────────────────

export type HealthLevel = "good" | "warn" | "bad";

export interface AudienceHealth {
  level: HealthLevel;
  headline: string;
  detail: string;
  metrics: { label: string; value: string }[];
}

export function assessAudience(audience: number, base: number, product?: CatalogProduct): AudienceHealth | null {
  if (!product || base <= 0) return null;
  const retained = audience / base;
  const perContactValue = VALUE_PER_CONVERSION[product.category] * (0.04 + retained * 0.03);

  let level: HealthLevel = "good";
  let headline = "Audience is well shaped";
  let detail = "Narrow enough to stay relevant, large enough to read a result within one cycle.";

  if (audience < 4000) {
    level = "bad";
    headline = "Audience is too narrow to measure";
    detail = "Below ~4K you can't separate lift from noise in a single send. Relax one exclusion family.";
  } else if (retained < 0.18) {
    level = "warn";
    headline = "Filters are cutting deep";
    detail = `Only ${Math.round(retained * 100)}% of the eligible base survives. Check whether two filters are removing the same people.`;
  } else if (retained > 0.82) {
    level = "warn";
    headline = "Audience is close to a blast";
    detail = "Almost nobody is being excluded — relevance and per-contact value both fall off at this width.";
  }

  return {
    level,
    headline,
    detail,
    metrics: [
      { label: "Retained from base", value: `${Math.round(retained * 100)}%` },
      { label: "Est. value per contact", value: `$${perContactValue.toFixed(2)}` },
      { label: "Read-a-result window", value: audience > 25000 ? "~1 week" : audience > 8000 ? "~2 weeks" : "~4 weeks" },
    ],
  };
}

// ── send time & channel ──────────────────────────────────────────────────────

export interface SendPlan {
  channel: string;
  secondary: string;
  day: string;
  time: string;
  rationale: string;
}

const CHANNEL_BY_CATEGORY: Record<ProductCategory, [string, string]> = {
  credit_cards: ["Mobile push + in-app card", "Personalized email"],
  deposit_accounts: ["Personalized email", "Mobile push + in-app card"],
  loans: ["Relationship-manager outreach", "Personalized email"],
  investments: ["Advisor call + secure message", "Personalized email"],
  insurance: ["Personalized email", "Relationship-manager outreach"],
  digital_services: ["Mobile push + in-app card", "SMS reminder"],
};

const DAYS = ["Tuesday", "Wednesday", "Thursday"];
const TIMES = ["8:45am", "9:30am", "11:15am", "5:45pm"];

export function recommendSendPlan(product?: CatalogProduct): SendPlan | null {
  if (!product) return null;
  const [channel, secondary] = CHANNEL_BY_CATEGORY[product.category];
  const h = hash01(`send:${product.name}`);
  return {
    channel,
    secondary,
    day: DAYS[Math.floor(h * DAYS.length)],
    time: TIMES[Math.floor(hash01(`time:${product.name}`) * TIMES.length)],
    rationale: `${PRODUCT_CATEGORY_LABELS[product.category]} decisions in this segment cluster mid-week; ${channel.toLowerCase()} carries the highest observed response for this audience shape.`,
  };
}

// ── message guardrails ───────────────────────────────────────────────────────

export type GuardrailStatus = "pass" | "warn";

export interface GuardrailIssue {
  rule: string;
  status: GuardrailStatus;
  note: string;
  fix?: string;
}

export interface GuardrailResult {
  status: GuardrailStatus;
  issues: GuardrailIssue[];
  readingLevel: string;
  tone: string;
  predictedLiftPct: number;
}

const CREEPY_PATTERNS: { re: RegExp; note: string; fix: string }[] = [
  { re: /\b\d+\s*(transactions|purchases|charges)\b/i, note: "Names an exact transaction count", fix: "Replace the count with a pattern description, e.g. \"your recent travel spending\"." },
  { re: /\$\s?\d[\d,]{2,}/, note: "Quotes an exact spend amount back to the customer", fix: "Use a range or a directional phrase instead of the exact figure." },
  { re: /\bwe (noticed|saw|tracked|detected)\b/i, note: "Surveillance phrasing", fix: "Lead with the benefit instead of what the bank observed." },
  { re: /\b(every|each) (time|week|month) you\b/i, note: "Implies continuous monitoring", fix: "Soften to a general habit reference." },
];

const COMPLIANCE_PATTERNS: { re: RegExp; note: string; fix: string }[] = [
  { re: /\b(guarantee[d]?|risk[- ]free|no risk)\b/i, note: "Absolute claim needs qualification", fix: "Qualify the claim: \"subject to approval\"." },
  { re: /\b(pre[- ]?approved)\b/i, note: "\"Pre-approved\" triggers firm-offer-of-credit rules", fix: "Use \"you may qualify\" unless a firm offer is intended." },
  { re: /\b(best|lowest) rate\b/i, note: "Superlative rate claim", fix: "Use \"competitive rate\" or cite the actual APR range." },
];

export function checkGuardrails(subject: string, body: string, seed = ""): GuardrailResult {
  const text = `${subject} ${body}`;
  const issues: GuardrailIssue[] = [];

  for (const p of CREEPY_PATTERNS) {
    if (p.re.test(text)) issues.push({ rule: "Vaguely specific", status: "warn", note: p.note, fix: p.fix });
  }
  for (const p of COMPLIANCE_PATTERNS) {
    if (p.re.test(text)) issues.push({ rule: "Compliance", status: "warn", note: p.note, fix: p.fix });
  }
  if (subject.length > 62) {
    issues.push({ rule: "Subject length", status: "warn", note: `${subject.length} chars — truncates on mobile`, fix: "Trim to under 60 characters." });
  }
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words > 90) {
    issues.push({ rule: "Body length", status: "warn", note: `${words} words — long for this channel`, fix: "Cut to a single benefit plus one call to action." });
  }

  const sentences = Math.max(1, (body.match(/[.!?]/g) ?? []).length);
  const wordsPerSentence = words / sentences;
  const readingLevel = wordsPerSentence > 22 ? "Grade 11 · dense" : wordsPerSentence > 15 ? "Grade 9 · clear" : "Grade 7 · plain";
  const tone = /\?/.test(subject) ? "Curious" : /\b(you|your)\b/i.test(subject) ? "Direct, personal" : "Informational";

  const h = hash01(`lift:${seed}${subject}`);
  const predictedLiftPct = Math.round((issues.length === 0 ? 6 + h * 22 : 1 + h * 11) * 10) / 10;

  return {
    status: issues.length ? "warn" : "pass",
    issues,
    readingLevel,
    tone,
    predictedLiftPct,
  };
}

// ── confidence + brief ───────────────────────────────────────────────────────

export interface AiBriefContext {
  mode: "product" | "signals" | "outflow";
  productName: string;
  product?: CatalogProduct;
  audience: number;
  baseAudience: number;
  offers: string[];
  campaignLink: string;
  step: 1 | 2 | 3;
}

export interface AiNextAction {
  id: string;
  label: string;
  detail: string;
}

export interface AiBrief {
  recommendation: string;
  confidenceLow: number;
  confidenceHigh: number;
  drivers: string[];
  actions: AiNextAction[];
  reasoning: { label: string; value: string }[];
  sendPlan: SendPlan | null;
}

export function buildAiBrief(ctx: AiBriefContext): AiBrief {
  const { product, audience, baseAudience, offers, step } = ctx;
  const sendPlan = recommendSendPlan(product);
  const fit = product ? scoreProductFit(product) : null;
  const health = assessAudience(audience, baseAudience, product);
  const cann = product ? checkCannibalization(product.name) : null;

  const drivers: string[] = [];
  const actions: AiNextAction[] = [];

  if (!product) {
    return {
      recommendation:
        "Pick a product, or describe the outcome you want above and I'll pick one — three products are reading unusually strong signal support this period.",
      confidenceLow: 0,
      confidenceHigh: 0,
      drivers: ["No product selected yet"],
      actions: recommendedProducts(3).map((f) => ({
        id: `select:${f.product.name}`,
        label: `Start with ${f.product.name}`,
        detail: `Fit ${f.score}/100 — ${f.why}`,
      })),
      reasoning: [
        { label: "Catalog scanned", value: `${PRODUCT_CATALOG.length} products` },
        { label: "Ranking basis", value: "Signal density × unmet penetration × personalization depth" },
      ],
      sendPlan: null,
    };
  }

  if (fit) drivers.push(`Product fit ${fit.score}/100 — ${fit.why}`);
  if (health) drivers.push(`${health.headline.toLowerCase()} (${health.metrics[0].value} of the eligible base retained)`);
  if (offers.length === 0) drivers.push("No offer attached — offer-less sends run materially behind in this category");
  if (cann) drivers.push(`Overlap with an active ${cann.competingProduct} flow`);

  // Confidence: starts mid, moves on completeness. Never near-certain.
  let conf = 58;
  if (fit && fit.score >= 75) conf += 8;
  if (health?.level === "good") conf += 7;
  if (health?.level === "bad") conf -= 12;
  if (offers.length > 0) conf += 5;
  if (step >= 3) conf += 4;
  if (cann) conf -= 5;
  const mid = clamp(conf, 41, 79);

  if (health?.level !== "good") {
    actions.push({
      id: "tune-audience",
      label: "Auto-tune the audience",
      detail: health?.detail ?? "Rebalance the exclusion families for value per contact.",
    });
  }
  if (offers.length === 0) {
    actions.push({
      id: "add-offer",
      label: "Attach the recommended offer",
      detail: suggestOffers(product, 1)[0] ?? "Add an incentive before launch.",
    });
  }
  if (step < 3) {
    actions.push({ id: "go-messages", label: "Draft the personalized messages", detail: "Generate the five anchored variants and run the guardrail check." });
  }
  if (cann) {
    actions.push({ id: "suppress-overlap", label: `Suppress the ${cann.competingProduct} overlap`, detail: cann.note });
  }
  actions.push({
    id: "lock-send",
    label: `Send ${sendPlan?.day} ${sendPlan?.time} via ${sendPlan?.channel.toLowerCase()}`,
    detail: sendPlan?.rationale ?? "",
  });

  const recommendation =
    health?.level === "bad"
      ? `${product.name} is the right product, but the audience is too small to read. Widen it before you spend the send.`
      : `Run ${product.name} to the ${fmtCount(audience)} qualified segment${offers.length ? ` with "${offers[0]}"` : ""} — ${sendPlan?.day} ${sendPlan?.time}, ${sendPlan?.channel.toLowerCase()}.`;

  return {
    recommendation,
    confidenceLow: mid - 6,
    confidenceHigh: mid + 6,
    drivers,
    actions: actions.slice(0, 3),
    reasoning: [
      { label: "Product fit", value: fit ? `${fit.score}/100 · signal coverage ${Math.round(fit.signalCoverage * 100)}%` : "—" },
      { label: "Audience", value: `${fmtCount(audience)} qualified of ${fmtCount(baseAudience)} eligible` },
      { label: "Exclusion effect", value: `${Math.round((1 - audience / Math.max(1, baseAudience)) * 100)}% removed by active filters` },
      { label: "Channel rule", value: sendPlan ? `${sendPlan.channel} → ${sendPlan.secondary}` : "—" },
      { label: "Comparables used", value: `3 prior ${PRODUCT_CATEGORY_LABELS[product.category].toLowerCase()} campaigns` },
      { label: "Confidence band", value: `${mid - 6}–${mid + 6}% — bounded by comparable-campaign variance` },
    ],
    sendPlan,
  };
}

// ── launch readiness ─────────────────────────────────────────────────────────

export interface ReadinessItem {
  id: string;
  label: string;
  ok: boolean;
  blocking: boolean;
  detail: string;
}

export interface Readiness {
  items: ReadinessItem[];
  score: number;
  ready: boolean;
}

export function assessReadiness(ctx: AiBriefContext, guardrailsPassed: boolean): Readiness {
  const health = assessAudience(ctx.audience, ctx.baseAudience, ctx.product);
  const items: ReadinessItem[] = [
    {
      id: "product",
      label: "Product selected",
      ok: Boolean(ctx.product),
      blocking: true,
      detail: ctx.product ? ctx.product.name : "Pick a product or describe your goal.",
    },
    {
      id: "audience",
      label: "Audience is measurable",
      ok: ctx.audience >= 4000,
      blocking: true,
      detail: ctx.audience >= 4000 ? `${fmtCount(ctx.audience)} qualified` : "Below 4K — lift can't be separated from noise.",
    },
    {
      id: "shape",
      label: "Exclusions balanced",
      ok: health?.level === "good",
      blocking: false,
      detail: health?.headline ?? "Apply the exclusion funnel.",
    },
    {
      id: "offer",
      label: "Offer attached",
      ok: ctx.offers.length > 0,
      blocking: false,
      detail: ctx.offers.length ? ctx.offers[0] : "No incentive attached.",
    },
    {
      id: "copy",
      label: "Copy passes guardrails",
      ok: ctx.step >= 3 && guardrailsPassed,
      blocking: true,
      detail: ctx.step >= 3 ? (guardrailsPassed ? "All variants clean" : "One or more variants flagged") : "Messages not drafted yet.",
    },
    {
      id: "link",
      label: "Campaign link set",
      ok: /^https?:\/\/.+\..+/.test(ctx.campaignLink.trim()),
      blocking: true,
      detail: ctx.campaignLink || "Missing destination URL.",
    },
  ];

  const score = Math.round((items.filter((i) => i.ok).length / items.length) * 100);
  const ready = items.filter((i) => i.blocking).every((i) => i.ok);
  return { items, score, ready };
}
