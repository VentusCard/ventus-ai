import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOpportunityFromPlaid } from "../../src/lib/plaid.ts";
import { generateHouseholds, readCohortManifest } from "./lib/growth-play-cohorts.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(
  process.env.VENTUS_COHORT_MANIFEST ||
    `${scriptDir}/../fixtures/evaluation/mvp-growth-play-cohorts.json`,
);
const householdCount = Number(process.env.VENTUS_SCALE_HOUSEHOLDS || 25_000);
const manifest = readCohortManifest(manifestPath);
const households = generateHouseholds(manifest, householdCount);
const transactionCount = households.reduce((sum, household) => sum + household.transactions.length, 0);

const started = process.hrtime.bigint();
let opportunities = 0;
for (const household of households) {
  if (buildOpportunityFromPlaid(household.transactions)) opportunities += 1;
}
const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
const report = {
  report_type: "single_process_local_deterministic_benchmark",
  warning: "This is a repeatable laptop benchmark, not a production SLA or distributed-capacity claim.",
  generated_at: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  household_count: householdCount,
  transaction_count: transactionCount,
  opportunities_detected: opportunities,
  duration_ms: Number(durationMs.toFixed(2)),
  households_per_second: Number((householdCount / (durationMs / 1000)).toFixed(2)),
  transactions_per_second: Number((transactionCount / (durationMs / 1000)).toFixed(2)),
};

if (process.env.VENTUS_SCALE_REPORT_PATH) {
  const reportPath = resolve(process.env.VENTUS_SCALE_REPORT_PATH);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`wrote scale report: ${reportPath}`);
}

console.log(
  `Local scale benchmark: ${householdCount.toLocaleString()} households / ${transactionCount.toLocaleString()} transactions in ${report.duration_ms}ms`,
);
console.log(` · ${report.transactions_per_second.toLocaleString()} transactions/sec (single-process deterministic baseline)`);
