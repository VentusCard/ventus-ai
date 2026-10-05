/**
 * The wire contract for ventus-api.
 *
 * These schemas are the single source of truth shared by the production client
 * and by test fixtures. Every response is parsed through them, so a drift
 * between Aurora, the Lambda handlers, and this file surfaces as a validation
 * error at the boundary instead of as `undefined` three components deep.
 *
 * Derived by reading the handlers in backend/functions/ventus-api/index.mjs
 * against the DDL in backend/sql/core-product-schema.sql. Where the two
 * disagree, the handler wins, since that is what actually ships over the wire.
 *
 * Numeric columns arrive as strings from node-postgres unless the handler
 * casts them. The handlers cast inconsistently, so anything money- or
 * score-shaped goes through `numeric` below rather than `z.number()`.
 */
import { z } from "zod";

/**
 * Postgres NUMERIC arrives as a string over the wire. Some handlers parseFloat
 * it first and some pass the row straight through, so accept both and always
 * hand a number to the UI.
 */
const numeric = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = Number.parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return v;
}, z.number().nullable());

/** Same problem as `numeric`, for INTEGER/BIGSERIAL columns. */
const integer = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = Number.parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return v;
}, z.number().nullable());

/** DATE and TIMESTAMPTZ both serialize to strings; we do not parse to Date here. */
const timestamp = z.string().nullable();

/**
 * `id` is BIGSERIAL in the DDL but the schema file flags it as unverified
 * against Aurora, where it may be a UUID. Accept either so a mismatch does not
 * break the whole payload, and normalize to string for use as a React key.
 */
const recordId = z.union([z.string(), z.number()]).transform(String);

/** JSONB columns the model writes free-form. Shape is not guaranteed. */
const jsonb = z.unknown().nullable();

// ─── errors ───────────────────────────────────────────────────────────────────

/** Every handler's failure path is `{ error: string }`. */
export const ApiErrorSchema = z.object({ error: z.string() });

// ─── GET /v1/customers/:id/profile ────────────────────────────────────────────

export const PillarProfileSchema = z.object({
  pillar: z.string(),
  total_spend: numeric,
  transaction_count: integer,
  avg_transaction: numeric,
  pct_of_total_spend: numeric,
  last_purchase_date: timestamp,
  analyzed_at: timestamp,
});

/**
 * Note: the handler 404s when a customer has no pillar rows, so "customer
 * exists but has not been enriched yet" is indistinguishable from "no such
 * customer". Worth splitting server-side before the console relies on it.
 */
export const CustomerProfileSchema = z.object({
  customer_id: z.string(),
  bank_id: z.string(),
  total_spend: numeric,
  pillars: z.array(PillarProfileSchema),
});

// ─── life events & behavioral signals ─────────────────────────────────────────

export const EvidenceSchema = z.object({
  transaction_id: z.string(),
  /** Null when the evidence row outlives the enriched transaction (LEFT JOIN). */
  merchant: z.string().nullable(),
  amount: numeric,
  date: timestamp,
  /** DDL says TEXT, but the DDL flags this as unverified; may be a score. */
  relevance: z.union([z.string(), z.number()]).nullable(),
});

export const FinancialProjectionSchema = z.object({
  project_type: z.string().nullable(),
  estimated_start_year: integer,
  duration_years: integer,
  estimated_total_cost: numeric,
  estimated_current_savings: numeric,
  recommended_monthly_contribution: numeric,
  cost_breakdown: jsonb,
  recommended_funding_sources: jsonb,
});

export const LifeEventSchema = z.object({
  id: recordId,
  event_name: z.string().nullable(),
  event_type: z.string().nullable(),
  confidence: numeric,
  /** Handler substitutes a default when the column is null or 'Unknown'. */
  urgency_timeline: z.string().nullable(),
  status: z.string().nullable(),
  talking_points: jsonb,
  next_steps: jsonb,
  insight: z.string().nullable(),
  recommended_products: jsonb,
  /** Only present when the row carries cost or project fields. */
  financial_projection: FinancialProjectionSchema.optional(),
  first_detected_at: timestamp,
  last_confirmed_at: timestamp,
  detected_at: timestamp,
  evidence: z.array(EvidenceSchema).default([]),
});

export const BehavioralSignalSchema = z.object({
  id: recordId,
  signal_category: z.string().nullable(),
  signal_name: z.string().nullable(),
  confidence: numeric,
  status: z.string().nullable(),
  talking_points: jsonb,
  first_detected_at: timestamp,
  last_confirmed_at: timestamp,
  detected_at: timestamp,
  evidence: z.array(EvidenceSchema).default([]),
});

/**
 * GET /v1/customers/:id/life-events returns both categories from one table in
 * one payload, split by `event_category`.
 *
 * The limit/offset applies to the combined query *before* the split, so the two
 * arrays cannot be paged independently and a page can come back with all life
 * events and no behavioral signals. Do not build separate paginated lists on
 * top of this endpoint without changing the handler.
 */
export const CustomerSignalsSchema = z.object({
  customer_id: z.string(),
  limit: integer,
  offset: integer,
  life_events: z.array(LifeEventSchema).default([]),
  behavioral_signals: z.array(BehavioralSignalSchema).default([]),
});

export const LifeEventDetailSchema = z.object({
  customer_id: z.string(),
  life_event: LifeEventSchema,
});

export const BehavioralSignalDetailSchema = z.object({
  customer_id: z.string(),
  behavioral_signal: BehavioralSignalSchema,
});

// ─── GET /v1/customers/:id/risk-factors ───────────────────────────────────────

/** Returned as raw table rows, so this mirrors customer_risk_factors. */
export const RiskFactorSchema = z.object({
  id: recordId,
  customer_id: z.string().optional(),
  bank_id: z.string().optional(),
  batch_id: z.string().nullable().optional(),
  transaction_id: z.string().nullable(),
  category_group: z.string().nullable(),
  category_label: z.string().nullable(),
  severity: z.string().nullable(),
  merchant: z.string().nullable(),
  amount: numeric,
  transaction_date: timestamp,
  reason: z.string().nullable(),
  detected_at: timestamp,
});

export const RiskFactorsSchema = z.object({
  customer_id: z.string(),
  risk_factors: z.array(RiskFactorSchema).default([]),
  summary: z.object({
    total: integer,
    high: integer,
    medium: integer,
    low: integer,
  }),
});

export const RiskFactorDetailSchema = z.object({
  customer_id: z.string(),
  risk_factor: RiskFactorSchema,
});

// ─── GET /v1/customers/:id/trips ──────────────────────────────────────────────

/**
 * Mirrors customer_trips. `is_upcoming` is a stored column but the handler
 * recomputes it from trip_end at read time, so trust the response over the DDL.
 */
export const TripSchema = z.object({
  trip_id: z.string(),
  customer_id: z.string().optional(),
  destination: z.string().nullable(),
  trip_start: timestamp,
  trip_end: timestamp,
  trip_duration_days: integer,
  total_trip_spend: numeric,
  transaction_count: integer,
  transport_spend: numeric,
  lodging_spend: numeric,
  dining_spend: numeric,
  activities_spend: numeric,
  other_spend: numeric,
  is_upcoming: z.boolean(),
  detected_at: timestamp,
});

export const TripsSchema = z.object({
  customer_id: z.string(),
  trips: z.array(TripSchema).default([]),
});

export const TripDetailSchema = z.object({
  customer_id: z.string(),
  trip: TripSchema,
});

// ─── GET /v1/customers/:id/transactions ───────────────────────────────────────

/** Mirrors transactions_enriched. */
export const EnrichedTransactionSchema = z.object({
  transaction_id: z.string(),
  customer_id: z.string().optional(),
  amount: numeric,
  transaction_date: timestamp,
  zip_code: z.string().nullable(),
  clean_merchant_name: z.string().nullable(),
  lifestyle_category: z.string().nullable(),
  merchant_category: z.string().nullable(),
  confidence_score: numeric,
  inferred_purchase: z.string().nullable(),
  purchase_confidence: numeric,
  pre_tax_amount: numeric,
  tax_amount: numeric,
  tax_rate: numeric,
  tax_state: z.string().nullable(),
  enriched_at: timestamp,
});

/**
 * `total` is the length of the returned page, not the total matching row count,
 * so it cannot drive a pager. Treat a full page as "there may be more".
 */
export const TransactionsSchema = z.object({
  customer_id: z.string(),
  total: integer,
  limit: integer,
  offset: integer,
  transactions: z.array(EnrichedTransactionSchema).default([]),
});

// ─── GET /v1/customers/:id/purchase-signals ───────────────────────────────────

/**
 * Spend-trend analytics per pillar, not a targeting signal. Excludes the
 * Financial & Aspirational pillar server-side. Row shape is computed in the
 * handler rather than selected from a table, so it is kept permissive.
 */
export const PurchaseSignalsSchema = z.object({
  customer_id: z.string(),
  generated_at: z.string(),
  days_elapsed_this_month: integer,
  purchase_signals: z.array(z.record(z.unknown())).default([]),
});

// ─── GET /v1/analytics/bank ───────────────────────────────────────────────────

/**
 * Tenant-wide aggregates. This is the closest thing to the Intelligence
 * Database dashboard that already exists.
 *
 * It reports current state only. There is no history table in the schema, so
 * period-over-period deltas and sparklines have no source here and must not be
 * faked in the UI.
 */
export const BankAnalyticsSchema = z.object({
  bank_id: z.string(),
  generated_at: z.string(),
  overview: z.object({
    total_customers: integer,
    total_transactions: integer,
    total_spend: numeric,
    avg_transaction: numeric,
    avg_confidence: numeric,
  }),
  pillar_distribution: z
    .array(
      z.object({
        pillar: z.string(),
        transaction_count: integer,
        total_spend: numeric,
        customer_count: integer,
        pct_of_total: numeric,
      })
    )
    .default([]),
  life_event_summary: z
    .array(
      z.object({
        event_name: z.string().nullable(),
        count: integer,
        avg_confidence: numeric,
      })
    )
    .default([]),
  behavioral_signal_summary: z
    .array(
      z.object({
        signal_category: z.string().nullable(),
        count: integer,
        avg_confidence: numeric,
      })
    )
    .default([]),
  risk_summary: z
    .array(
      z.object({
        risk_type: z.string().nullable(),
        severity: z.string().nullable(),
        customer_count: integer,
      })
    )
    .default([]),
  top_merchants: z
    .array(
      z.object({
        merchant: z.string().nullable(),
        transaction_count: integer,
        total_spend: numeric,
        customer_count: integer,
      })
    )
    .default([]),
  segments: z.array(z.record(z.unknown())).default([]),
});

// ─── GET /health ──────────────────────────────────────────────────────────────

export const HealthSchema = z.object({ status: z.string() }).passthrough();

// ─── inferred types ───────────────────────────────────────────────────────────

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PillarProfile = z.infer<typeof PillarProfileSchema>;
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type FinancialProjection = z.infer<typeof FinancialProjectionSchema>;
export type LifeEvent = z.infer<typeof LifeEventSchema>;
export type BehavioralSignal = z.infer<typeof BehavioralSignalSchema>;
export type CustomerSignals = z.infer<typeof CustomerSignalsSchema>;
export type RiskFactor = z.infer<typeof RiskFactorSchema>;
export type RiskFactors = z.infer<typeof RiskFactorsSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type Trips = z.infer<typeof TripsSchema>;
export type EnrichedTransaction = z.infer<typeof EnrichedTransactionSchema>;
export type Transactions = z.infer<typeof TransactionsSchema>;
export type PurchaseSignals = z.infer<typeof PurchaseSignalsSchema>;
export type BankAnalytics = z.infer<typeof BankAnalyticsSchema>;
