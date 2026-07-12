import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const BASE_DATE = new Date("2026-07-01T12:00:00.000Z");

export function readCohortManifest(path) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(manifest.version, 1, "unsupported cohort manifest version");
  assert.ok(Array.isArray(manifest.cohorts) && manifest.cohorts.length > 0, "cohorts are required");
  const total = manifest.cohorts.reduce((sum, cohort) => sum + cohort.count, 0);
  assert.equal(total, manifest.default_population, "cohort counts must equal default_population");
  return manifest;
}

export function generateHouseholds(manifest, population = manifest.default_population) {
  assert.ok(Number.isInteger(population) && population > 0, "population must be a positive integer");
  const weighted = manifest.cohorts.flatMap((cohort) => Array.from({ length: cohort.count }, () => cohort));
  return Array.from({ length: population }, (_, index) => {
    const cohort = weighted[index % weighted.length];
    const cycle = Math.floor(index / weighted.length);
    const householdId = `hh_${cohort.id}_${String(index + 1).padStart(6, "0")}`;
    return {
      householdId,
      cohortId: cohort.id,
      expectedPlay: cohort.expected_play,
      expectedSuppressed: cohort.expected_suppressed,
      policyContext: cohort.policy_context ?? {},
      dimensions: cohort.dimensions,
      transactions: cohort.transactions.map((transaction, transactionIndex) => ({
        transaction_id: `${householdId}_tx_${transactionIndex + 1}`,
        account_id: `${householdId}_checking`,
        name: transaction.name,
        merchant_name: transaction.merchant_name,
        amount: transaction.amount + cycle * 0.01,
        date: dateFromDaysAgo(transaction.days_ago),
        payment_channel: transaction.channel,
        personal_finance_category: {
          primary: transaction.primary,
          detailed: transaction.detailed,
        },
      })),
    };
  });
}

export function opportunityToPlay(opportunity) {
  if (!opportunity) return "none";
  if (opportunity.type === "Checking primacy at risk") return "deposit_primacy";
  if (opportunity.type.startsWith("Retirement rollover") || opportunity.type.startsWith("Liquidity event")) {
    return "wealth_liquidity";
  }
  if (opportunity.type === "Home / lending intent") return "lending_intent";
  return "none";
}

export function binaryMetrics(rows, play) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const row of rows) {
    const expected = row.expectedPlay === play;
    const predicted = row.predictedPlay === play;
    if (expected && predicted) tp += 1;
    else if (!expected && predicted) fp += 1;
    else if (!expected && !predicted) tn += 1;
    else fn += 1;
  }
  return {
    true_positive: tp,
    false_positive: fp,
    true_negative: tn,
    false_negative: fn,
    precision: ratio(tp, tp + fp),
    recall: ratio(tp, tp + fn),
    false_positive_rate: ratio(fp, fp + tn),
  };
}

export function ratio(numerator, denominator) {
  return denominator === 0 ? null : Number((numerator / denominator).toFixed(4));
}

function dateFromDaysAgo(daysAgo) {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}
