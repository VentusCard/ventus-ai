import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyOpportunityPolicy, buildOpportunityFromPlaid } from "../../src/lib/plaid.ts";
import {
  binaryMetrics,
  generateHouseholds,
  opportunityToPlay,
  ratio,
  readCohortManifest,
} from "./lib/growth-play-cohorts.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(
  process.env.VENTUS_COHORT_MANIFEST ||
    `${scriptDir}/../fixtures/evaluation/mvp-growth-play-cohorts.json`,
);
const manifest = readCohortManifest(manifestPath);
const households = generateHouseholds(manifest, Number(process.env.VENTUS_COHORT_POPULATION || manifest.default_population));

const rows = households.map((household) => {
  const opportunity = buildOpportunityFromPlaid(household.transactions);
  const policy = applyOpportunityPolicy(opportunity, household.policyContext);
  return {
    householdId: household.householdId,
    cohortId: household.cohortId,
    expectedPlay: household.expectedPlay,
    predictedPlay: opportunityToPlay(opportunity),
    expectedSuppressed: household.expectedSuppressed,
    predictedSuppressed: !!opportunity && !policy.allowed,
    policyReason: policy.reason,
  };
});

const exactMatches = rows.filter((row) => row.expectedPlay === row.predictedPlay).length;
const suppressionMatches = rows.filter((row) => row.expectedSuppressed === row.predictedSuppressed).length;
const failures = rows.filter(
  (row) => row.expectedPlay !== row.predictedPlay || row.expectedSuppressed !== row.predictedSuppressed,
);
const plays = ["deposit_primacy", "wealth_liquidity", "lending_intent"];
const report = {
  report_type: "synthetic_contract_conformance",
  warning: "Designed synthetic cohorts validate deterministic behavior; they do not estimate production accuracy or incremental lift.",
  generated_at: new Date().toISOString(),
  manifest_path: manifestPath,
  population: rows.length,
  cohort_count: manifest.cohorts.length,
  summary: {
    exact_play_matches: exactMatches,
    exact_play_match_rate: ratio(exactMatches, rows.length),
    suppression_matches: suppressionMatches,
    suppression_match_rate: ratio(suppressionMatches, rows.length),
    failures: failures.length,
  },
  by_play: Object.fromEntries(plays.map((play) => [play, binaryMetrics(rows, play)])),
  by_cohort: Object.fromEntries(
    manifest.cohorts.map((cohort) => {
      const cohortRows = rows.filter((row) => row.cohortId === cohort.id);
      const passed = cohortRows.filter(
        (row) => row.expectedPlay === row.predictedPlay && row.expectedSuppressed === row.predictedSuppressed,
      ).length;
      return [cohort.id, { population: cohortRows.length, passed, pass_rate: ratio(passed, cohortRows.length) }];
    }),
  ),
  failure_preview: failures.slice(0, 25),
};

if (process.env.VENTUS_COHORT_REPORT_PATH) {
  const reportPath = resolve(process.env.VENTUS_COHORT_REPORT_PATH);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`wrote cohort report: ${reportPath}`);
}

console.log(
  `MVP cohort conformance: ${exactMatches}/${rows.length} play matches; ${suppressionMatches}/${rows.length} policy matches; ${failures.length} failures`,
);
for (const play of plays) {
  const metrics = report.by_play[play];
  console.log(` · ${play}: precision=${metrics.precision} recall=${metrics.recall} fpr=${metrics.false_positive_rate}`);
}

assert.equal(failures.length, 0, `cohort contract failures: ${JSON.stringify(failures.slice(0, 5))}`);
