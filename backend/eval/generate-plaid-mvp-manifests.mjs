import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateHouseholds, readCohortManifest } from "../scripts/lib/growth-play-cohorts.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, "..");
const cohortPath = resolve(
  process.env.VENTUS_COHORT_MANIFEST ||
    join(backendRoot, "fixtures", "evaluation", "mvp-growth-play-cohorts.json"),
);
const outputDir = resolve(
  process.env.PLAID_MVP_MANIFEST_OUTPUT_DIR ||
    join(backendRoot, "artifacts", "plaid-mvp-manifests"),
);
const population = Number(process.env.PLAID_MVP_USER_COUNT || 500);
const shardSize = Number(process.env.PLAID_MVP_SHARD_SIZE || 50);
assert.ok(Number.isInteger(shardSize) && shardSize > 0 && shardSize <= 50, "shard size must be 1-50");

const manifest = readCohortManifest(cohortPath);
const households = generateHouseholds(manifest, population);
mkdirSync(outputDir, { recursive: true });

const index = {
  version: 1,
  generated_at: new Date().toISOString(),
  source_manifest: "backend/fixtures/evaluation/mvp-growth-play-cohorts.json",
  population,
  shard_size: shardSize,
  shards: [],
};

for (let offset = 0; offset < households.length; offset += shardSize) {
  const shardNumber = offset / shardSize + 1;
  const users = households.slice(offset, offset + shardSize).map((household) => {
    assert.ok(household.transactions.length <= 250, `${household.householdId} exceeds Plaid's custom-user transaction limit`);
    const customUser = {
      version: "2",
      seed: household.householdId,
      override_accounts: [
        {
          type: "depository",
          subtype: "checking",
          name: "Ventus MVP checking",
          transactions: household.transactions.map((transaction) => ({
            date_transacted: transaction.date,
            date_posted: transaction.date,
            amount: transaction.amount,
            description: transaction.name,
            currency: "USD",
          })),
        },
      ],
    };
    assert.ok(Buffer.byteLength(JSON.stringify(customUser), "utf8") < 55_000, `${household.householdId} exceeds Plaid's custom-user payload limit`);
    return {
      customer_id: household.householdId,
      username: "user_custom",
      expected_play: household.expectedPlay,
      expected_suppressed: household.expectedSuppressed,
      dimensions: household.dimensions,
      custom_user: customUser,
    };
  });
  const fileName = `plaid-mvp-shard-${String(shardNumber).padStart(2, "0")}.json`;
  const path = join(outputDir, fileName);
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        run_id: `ventus_mvp_shard_${String(shardNumber).padStart(2, "0")}`,
        institution_id: "ins_109508",
        products: ["transactions"],
        country_codes: ["US"],
        users,
      },
      null,
      2,
    )}\n`,
  );
  index.shards.push({ file: fileName, users: users.length, first_customer: users[0].customer_id, last_customer: users.at(-1).customer_id });
}

writeFileSync(join(outputDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(`Generated ${index.shards.length} Plaid custom-user shard(s) for ${population} households.`);
console.log(`output: ${outputDir}`);
