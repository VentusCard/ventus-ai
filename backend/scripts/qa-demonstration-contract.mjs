import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { compileGrowthPlayContract } from "../shared/growth-play-contract.mjs";
import { loadDemonstration, validateDemonstration } from "../shared/demonstration-contract.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(resolve(scriptDir, "../fixtures/contracts/demonstration-contract.json"), "utf8"));
const samplePath = resolve(process.env.VENTUS_DEMONSTRATION_FILE || `${scriptDir}/../fixtures/evaluation/demonstration-sample.json`);
const demonstration = JSON.parse(readFileSync(samplePath, "utf8"));
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const validate = ajv.compile(schema);

assert.ok(validate(demonstration), `demonstration failed schema: ${ajv.errorsText(validate.errors)}`);
assert.ok(
  !/(first_name|last_name|full_name|customer_name|customer_email|advisor_name|banker_name|employee_name|employee_id|nmls_id|"email"|"phone"|"address"|ssn|account_number|routing_number)/i
    .test(JSON.stringify(demonstration)),
  "direct customer or employee identity field detected",
);

const drafts = JSON.parse(readFileSync(
  resolve(process.env.VENTUS_GROWTH_PLAY_DRAFTS || `${scriptDir}/../fixtures/evaluation/growth-play-drafts.json`),
  "utf8",
));
const draft = drafts.find((item) => item.growth_play_id === demonstration.growth_play_id);
assert.ok(draft, `no Growth Play draft named ${demonstration.growth_play_id}`);
const growthPlay = compileGrowthPlayContract(draft);

const summary = validateDemonstration(demonstration);
const loaded = loadDemonstration(demonstration, { growthPlay });
assert.equal(loaded.cases.length, summary.exposedCases, "only exposed cases may reach the fit");
assert.ok(loaded.demonstratedHouseholds.length < loaded.cases.length, "the export must contain declines");

// Exposure is the rule a schema cannot enforce and the one that silently corrupts a fit.
const unexposedInFit = new Set(loaded.cases.map((item) => item.householdToken));
for (const item of demonstration.cases) {
  if (!item.exposed) {
    assert.ok(!unexposedInFit.has(item.household_token), `unexposed ${item.household_token} reached the fit`);
  }
}

const contradictsExposure = structuredClone(demonstration);
const actedToken = contradictsExposure.actions[0].household_token;
contradictsExposure.cases.find((item) => item.household_token === actedToken).exposed = false;
assert.throws(() => validateDemonstration(contradictsExposure), /contradicts exposed: false/);

const orphanAction = structuredClone(demonstration);
orphanAction.actions.push({ ...orphanAction.actions[0], household_token: "tok_not_in_this_export_0001" });
assert.throws(() => validateDemonstration(orphanAction), /has no case in this export/);

console.log(
  `Demonstration contract verified: ${summary.totalCases} cases `
  + `(${summary.exposedCases} exposed, ${summary.unexposedCases} excluded from the fit), `
  + `${summary.actedHouseholds} acted-on households from ${summary.distinctExperts} expert(s), `
  + `selection rate ${(summary.selectionRate * 100).toFixed(1)}%, evidence class ${summary.evidenceClass}.`,
);
if (!loaded.fitUsableForProduction) {
  console.log(`A ${summary.evidenceClass} demonstration initializes nothing for a production pilot.`);
}
