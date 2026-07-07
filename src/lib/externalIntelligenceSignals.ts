import type { LifeEvent } from "@/types/lifestyle-signals";

export interface ExternalIntelSignal {
  id: string;
  event_name: string;
  confidence: number; // 0..1
  category: "bureau" | "property" | "auto" | "demographics" | "life_event" | "employment" | "other";
  provider: string;
  headline: string;
  detail: string;
  evidence: { merchant: string; amount: number; date: string; relevance: string }[];
  talking_points: string[];
  /** Optional per-customer scoping. Empty/undefined => universal. */
  appliesTo?: string[];
}

export const EXTERNAL_INTEL_SIGNALS: ExternalIntelSignal[] = [
  {
    id: "auto-loan-renewal",
    event_name: "Car Loan Renewal in ~2 Months",
    confidence: 0.92,
    category: "auto",
    provider: "Bureau Tradeline",
    headline: "Car loan renewal in ~2 months",
    detail: "Bureau tradeline · estimated maturity window · Toyota Financial Services",
    evidence: [
      {
        merchant: "Toyota Financial Services",
        amount: 485,
        date: new Date().toISOString().slice(0, 10),
        relevance: "External bureau tradeline — auto loan maturity within 60 days",
      },
    ],
    talking_points: [
      "Refi window opens now — pre-qualify for a lower APR before payoff.",
      "If trading in, pair with a new-auto loan pre-approval.",
      "Free cash flow (~$485/mo) can seed a HYSA or 529 top-up.",
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
