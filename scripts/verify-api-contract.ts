import assert from "node:assert/strict";
import {
  BankAnalyticsSchema,
  CustomerProfileSchema,
  CustomerSignalsSchema,
  RiskFactorsSchema,
  TransactionsSchema,
  TripsSchema,
} from "../src/api/contract";

// node-postgres hands NUMERIC back as a string. The profile handler parseFloats
// its own fields but the raw-row endpoints do not, so both shapes must parse.
const profile = CustomerProfileSchema.parse({
  customer_id: "cust_013",
  bank_id: "bank_demo",
  total_spend: 48213.55,
  pillars: [
    {
      pillar: "Travel & Exploration",
      total_spend: "18422.10",
      transaction_count: "84",
      avg_transaction: "219.31",
      pct_of_total_spend: "0.3821",
      last_purchase_date: "2026-08-30",
      analyzed_at: "2026-09-01T04:12:00.000Z",
    },
  ],
});
assert.equal(profile.pillars[0].total_spend, 18422.1);
assert.equal(profile.pillars[0].transaction_count, 84);

// A page can legitimately come back with life events and no behavioral signals,
// since limit/offset is applied before the category split.
const signals = CustomerSignalsSchema.parse({
  customer_id: "cust_013",
  limit: 50,
  offset: 0,
  life_events: [
    {
      id: 4471,
      event_name: "College-Bound Child",
      event_type: "projected",
      confidence: "0.72",
      urgency_timeline: "6-12 months",
      status: "active",
      talking_points: ["Test prep spend started in March"],
      next_steps: null,
      insight: "Tuition planning window is opening.",
      recommended_products: ["529 Education Savings Plan"],
      financial_projection: {
        project_type: "education",
        estimated_start_year: 2028,
        duration_years: 4,
        estimated_total_cost: "184000.00",
        estimated_current_savings: "21000.00",
        recommended_monthly_contribution: "1150.00",
        cost_breakdown: { tuition: 140000 },
        recommended_funding_sources: ["529"],
      },
      first_detected_at: "2026-03-04T00:00:00.000Z",
      last_confirmed_at: "2026-09-01T00:00:00.000Z",
      detected_at: "2026-03-04T00:00:00.000Z",
      evidence: [
        {
          transaction_id: "txn_91",
          merchant: "Kaplan",
          amount: "1299.00",
          date: "2026-03-04",
          relevance: "Test prep enrollment",
        },
        // Evidence can outlive the enriched transaction; the handler LEFT JOINs.
        { transaction_id: "txn_92", merchant: null, amount: null, date: null, relevance: null },
      ],
    },
  ],
  behavioral_signals: [],
});
assert.equal(signals.life_events[0].id, "4471");
assert.equal(signals.life_events[0].confidence, 0.72);
assert.equal(signals.life_events[0].financial_projection?.estimated_total_cost, 184000);
assert.equal(signals.behavioral_signals.length, 0);

// A life event with no projection omits the key entirely.
const bare = CustomerSignalsSchema.parse({
  customer_id: "c1",
  limit: 50,
  offset: 0,
  life_events: [
    {
      id: "uuid-style-id",
      event_name: "Relocation",
      event_type: null,
      confidence: 0.4,
      urgency_timeline: null,
      status: "active",
      talking_points: null,
      next_steps: null,
      insight: null,
      recommended_products: null,
      first_detected_at: null,
      last_confirmed_at: null,
      detected_at: null,
      evidence: [],
    },
  ],
  behavioral_signals: [],
});
assert.equal(bare.life_events[0].financial_projection, undefined);
assert.equal(bare.life_events[0].id, "uuid-style-id");

// Raw-row endpoints: everything arrives as strings.
const risk = RiskFactorsSchema.parse({
  customer_id: "c1",
  risk_factors: [
    {
      id: "88",
      transaction_id: "txn_5",
      category_group: "financial_distress",
      category_label: "Overdraft & NSF Activity",
      severity: "high",
      merchant: "NSF FEE",
      amount: "35.00",
      transaction_date: "2026-07-02",
      reason: "Three NSF fees in 60 days",
      detected_at: "2026-07-03T00:00:00.000Z",
    },
  ],
  summary: { total: 1, high: 1, medium: 0, low: 0 },
});
assert.equal(risk.risk_factors[0].amount, 35);
assert.equal(risk.summary.high, 1);

const trips = TripsSchema.parse({
  customer_id: "c1",
  trips: [
    {
      trip_id: "trip_1",
      destination: "Miami, FL",
      trip_start: "2026-06-01",
      trip_end: "2026-06-08",
      trip_duration_days: "7",
      total_trip_spend: "4210.88",
      transaction_count: "22",
      transport_spend: "980.00",
      lodging_spend: "1900.00",
      dining_spend: "830.88",
      activities_spend: "500.00",
      other_spend: "0.00",
      is_upcoming: false,
      detected_at: "2026-06-10T00:00:00.000Z",
    },
  ],
});
assert.equal(trips.trips[0].total_trip_spend, 4210.88);
assert.equal(trips.trips[0].trip_duration_days, 7);

const txns = TransactionsSchema.parse({
  customer_id: "c1",
  total: 1,
  limit: 50,
  offset: 0,
  transactions: [
    {
      transaction_id: "txn_1",
      amount: "129.99",
      transaction_date: "2026-08-01",
      zip_code: "10011",
      clean_merchant_name: "Delta Air Lines",
      lifestyle_category: "Travel & Exploration",
      merchant_category: "Airlines",
      confidence_score: "0.97",
      inferred_purchase: null,
      purchase_confidence: null,
      pre_tax_amount: null,
      tax_amount: null,
      tax_rate: null,
      tax_state: null,
      enriched_at: "2026-08-02T00:00:00.000Z",
    },
  ],
});
assert.equal(txns.transactions[0].confidence_score, 0.97);

const analytics = BankAnalyticsSchema.parse({
  bank_id: "bank_demo",
  generated_at: "2026-09-10T20:00:00.000Z",
  overview: {
    total_customers: 412_338,
    total_transactions: 18_442_101,
    total_spend: 1_884_221_004.12,
    avg_transaction: 102.17,
    avg_confidence: 0.94,
  },
  pillar_distribution: [
    {
      pillar: "Home & Living",
      transaction_count: "4102331",
      total_spend: "512000000.00",
      customer_count: "301442",
      pct_of_total: "0.2716",
    },
  ],
  life_event_summary: [{ event_name: "College-Bound Child", count: "21044", avg_confidence: "0.72" }],
  behavioral_signal_summary: [{ signal_category: "home_improvement", count: "88213", avg_confidence: "0.66" }],
  risk_summary: [{ risk_type: "financial_distress", severity: "high", customer_count: "4120" }],
  top_merchants: [
    { merchant: "Amazon", transaction_count: "912004", total_spend: "88120004.00", customer_count: "288104" },
  ],
  segments: [],
});
assert.equal(analytics.life_event_summary[0].count, 21044);
assert.equal(analytics.pillar_distribution[0].pct_of_total, 0.2716);

// An empty tenant must parse, not throw. This is the day-one state for every
// new bank and the state the demo never exercises.
const empty = BankAnalyticsSchema.parse({
  bank_id: "bank_new",
  generated_at: "2026-09-10T20:00:00.000Z",
  overview: {
    total_customers: 0,
    total_transactions: 0,
    total_spend: null,
    avg_transaction: null,
    avg_confidence: null,
  },
});
assert.equal(empty.pillar_distribution.length, 0);
assert.equal(empty.top_merchants.length, 0);

console.log("contract: all assertions passed");
