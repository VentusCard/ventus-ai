// Proves the real pipeline: Plaid-schema transactions in → enriched signals → detected
// opportunity out, and the learning loop actually shifts scores from feedback.
// Run: npm run test:pipeline   (node --experimental-strip-types, like the capability gate)
//
// This is the "it's not fluff" test — it exercises the same pure functions the app and
// the API use, on data in the exact shape Plaid returns.

import assert from "node:assert/strict";
import {
  normalizePlaidTxn,
  detectSignals,
  buildOpportunityFromPlaid,
  PLAID_FIXTURE_PRIMACY,
  PLAID_FIXTURE_ROLLOVER,
} from "../src/lib/plaid.ts";
import { computeWeights, applyLoop, relearnAndRank, summarizeLearning } from "../src/lib/loop.ts";

// 1) Enrichment does real work: Plaid fields → pillar + tag + rail.
const enriched = PLAID_FIXTURE_PRIMACY.map(normalizePlaidTxn);
assert.ok(enriched.some((t) => t.tag === "Recurring payroll"), "payroll should be tagged from INCOME");
assert.ok(enriched.some((t) => t.tag === "Transfer to off-bank account"), "Chime transfer should be tagged off-bank");
assert.ok(enriched.every((t) => t.src && t.pillar), "every txn gets a rail and pillar");

// 2) Signal detection fires the right rules.
const signals = detectSignals(enriched);
const types = signals.map((s) => s.type);
assert.ok(types.includes("payroll"), "payroll signal detected");
assert.ok(types.includes("off_bank_transfer"), "off-bank transfer signal detected");

// 3) A real opportunity emerges from raw Plaid data — not hand-authored.
const primacy = buildOpportunityFromPlaid(PLAID_FIXTURE_PRIMACY);
assert.ok(primacy, "an opportunity is produced");
assert.equal(primacy.type, "Checking primacy at risk", "primacy pattern recognized");
assert.equal(primacy.pnlHint, "deposit", "maps to deposit P&L");
assert.ok(primacy.confidence >= 70 && primacy.confidence <= 97, "confidence in range");

const rollover = buildOpportunityFromPlaid(PLAID_FIXTURE_ROLLOVER);
assert.ok(rollover, "rollover opportunity is produced");
assert.equal(rollover.pnlHint, "nna", "rollover maps to NNA");

// 4) The learning loop actually changes the ranking from outcomes.
const baseline = applyLoop(80, ["off_bank_transfer", "payroll"], {});
assert.equal(baseline.delta, 0, "no feedback → no change (neutral)");

// Reject off_bank_transfer repeatedly → its weight drops → score drops.
const rejects = Array.from({ length: 6 }, () => ({ signalType: "off_bank_transfer", decision: "reject" }));
const wRej = computeWeights(rejects);
assert.ok(wRej["off_bank_transfer"].weight < 1, "rejected signal is trusted less");
const dampened = applyLoop(80, ["off_bank_transfer"], wRej);
assert.ok(dampened.score < 80, `score should drop after rejects (got ${dampened.score})`);

// Accept + convert payroll → its weight rises → score rises.
const wins = Array.from({ length: 6 }, () => ({ signalType: "payroll", decision: "accept", converted: true }));
const wAcc = computeWeights(wins);
assert.ok(wAcc["payroll"].weight > 1, "accepted+converted signal is trusted more");
const lifted = applyLoop(80, ["payroll"], wAcc);
assert.ok(lifted.score > 80, `score should rise after conversions (got ${lifted.score})`);

// 5) Re-ranking flips order when the loop learns.
const ranked = relearnAndRank(
  [
    { id: "A", score: 82, signalTypes: ["off_bank_transfer"] },
    { id: "B", score: 80, signalTypes: ["payroll"] },
  ],
  [...rejects, ...wins],
);
assert.equal(ranked[0].id, "B", "learning promotes the trusted-signal item above a higher base score");

const summary = summarizeLearning(computeWeights([...rejects, ...wins]));
assert.ok(summary.length === 2 && summary.some((s) => s.includes("trusted more")), "learning is summarizable");

console.log("Real pipeline verified: Plaid schema → enrich → detect → opportunity, and the loop shifts ranking from outcomes.");
console.log(` · primacy: ${primacy.type} @ ${primacy.confidence}% (${primacy.signals.length} signals)`);
console.log(` · rollover: ${rollover.type} @ ${rollover.confidence}%`);
console.log(` · loop: off_bank_transfer ${wRej["off_bank_transfer"].weight} after 6 rejects; payroll ${wAcc["payroll"].weight} after 6 conversions`);
