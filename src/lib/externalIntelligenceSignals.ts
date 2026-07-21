import type { LifeEvent } from "@/types/lifestyle-signals";

/** Bucket the intel panel should surface this signal in. Mirrors the LLM's
 *  ownership ladder (Life Event > Financial Signal > Demographic Shift > Pillar). */
export type ExternalBucket = "life_event" | "financial_signal" | "demographic_shift" | "behavioral";

export interface ExternalIntelSignal {
  id: string;
  event_name: string;
  confidence: number; // 0..1
  category: "bureau" | "property" | "auto" | "demographics" | "life_event" | "employment" | "other";
  /** Which intel-panel row this signal belongs in. */
  bucket: ExternalBucket;
  provider: string;
  headline: string;
  detail: string;
  evidence: { merchant: string; amount: number; date: string; relevance: string }[];
  talking_points: string[];
  /** Optional Financial-Signal fields (only used when bucket === "financial_signal"). */
  product_family?: string;
  servicer?: string;
  monthly_amount_band?: string;
  cadence?: "monthly" | "biweekly" | "quarterly" | "annual" | "irregular";
  /** Optional Demographic-Shift fields (only used when bucket === "demographic_shift"). */
  demographic_category?: "income_trajectory" | "wealth_tier_migration" | "household_composition" | "geography_relocation";
  direction?: "up" | "down" | "lateral";
  magnitude_band?: string;
  /** Optional per-customer scoping. Empty/undefined => universal. */
  appliesTo?: string[];
}

export const EXTERNAL_INTEL_SIGNALS: ExternalIntelSignal[] = [
  {
    id: "auto-loan-renewal",
    event_name: "Auto Loan Renewal",
    confidence: 0.92,
    category: "auto",
    bucket: "financial_signal",
    provider: "Bureau Tradeline",
    headline: "Auto loan maturing in ~2 months",
    detail: "VW Credit · ~$685/mo",
    product_family: "auto_loan",
    servicer: "VW Credit",
    monthly_amount_band: "~$685/mo",
    cadence: "monthly",
    evidence: [
      {
        merchant: "VW CREDIT INC",
        amount: 685,
        date: new Date().toISOString().slice(0, 10),
        relevance: "External bureau tradeline — auto loan maturity within 60 days",
      },
    ],
    talking_points: [
      "Refi window opens now — pre-qualify for a lower APR before payoff.",
      "If trading in, pair with a new-auto loan pre-approval.",
      "Free cash flow (~$685/mo) can seed a HYSA or 529 top-up.",
    ],
  },
  // Future signals just get appended here — no other file needs to change.
];


export function getExternalSignalsFor(customerId: string | undefined | null): ExternalIntelSignal[] {
  if (!customerId) {
    return EXTERNAL_INTEL_SIGNALS.filter((s) => !s.appliesTo || s.appliesTo.length === 0);
  }
  return EXTERNAL_INTEL_SIGNALS.filter(
    (s) => !s.appliesTo || s.appliesTo.length === 0 || s.appliesTo.includes(customerId),
  );
}

export function externalSignalToLifeEvent(s: ExternalIntelSignal): LifeEvent {
  return {
    event_name: s.event_name,
    confidence: s.confidence,
    evidence: s.evidence,
    talking_points: s.talking_points,
  };
}

/** Compact payload sent to the persona LLM so it can reconcile external signals
 *  with transaction-derived buckets from the very first pass. */
export interface ExternalSignalForLLM {
  id: string;
  bucket: ExternalBucket;
  label: string;
  provider: string;
  detail: string;
  confidence: number;
  product_family?: string;
  servicer?: string;
  monthly_amount_band?: string;
  demographic_category?: string;
  direction?: string;
}

export function externalSignalsForLLM(list: ExternalIntelSignal[]): ExternalSignalForLLM[] {
  return list.map((s) => ({
    id: s.id,
    bucket: s.bucket,
    label: s.event_name,
    provider: s.provider,
    detail: s.detail,
    confidence: s.confidence,
    product_family: s.product_family,
    servicer: s.servicer,
    monthly_amount_band: s.monthly_amount_band,
    demographic_category: s.demographic_category,
    direction: s.direction,
  }));
}
