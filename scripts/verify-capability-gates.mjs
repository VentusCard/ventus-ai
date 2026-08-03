import assert from "node:assert/strict";
import { appendEvents, verifyChain } from "../src/lib/ledger.ts";
import {
  DEPOSIT_PRIMACY_SKILL,
  canPromote,
  promoteSkill,
  promotionBlockers,
} from "../src/lib/skills.ts";

assert.equal(canPromote(DEPOSIT_PRIMACY_SKILL), false, "draft seed must not promote without approval evidence");
assert.ok(promotionBlockers(DEPOSIT_PRIMACY_SKILL).includes("Evaluation has not been approved."));

const approvedDraft = {
  ...DEPOSIT_PRIMACY_SKILL,
  promotionEvidence: {
    source: "verified",
    evaluationApproved: true,
    sampleSize: 0,
    precision: 0,
    fairnessReviewed: false,
    policyApprovalId: "policy-test-1",
    holdoutActive: false,
    outcomeWindowComplete: false,
  },
};
assert.equal(canPromote(approvedDraft), true, "approved valid draft may enter shadow evaluation");
assert.equal(promoteSkill(approvedDraft).stage, "shadow");

const simulatedDraft = {
  ...approvedDraft,
  promotionEvidence: { ...approvedDraft.promotionEvidence, source: "simulated" },
};
assert.equal(canPromote(simulatedDraft), false, "simulated evidence must never unlock production promotion");
assert.throws(
  () => promoteSkill(simulatedDraft),
  /Simulated evidence can only be used in the internal evaluation workspace/,
  "the core promotion function must reject simulated evidence outside evaluation mode",
);
assert.equal(
  canPromote(simulatedDraft, { allowSimulatedEvidence: true }),
  true,
  "internal evaluation may exercise the lifecycle with simulated evidence",
);

const drafts = [
  {
    eventKey: "hh-1:activation",
    kind: "activation",
    title: "Staged activation",
    detail: "Sandbox only",
    ref: "hh-1",
    skill: "deposit-primacy-defense",
    value: 250000,
    status: "simulated",
  },
];
const events = appendEvents([], drafts);
assert.equal(verifyChain(events), true);
assert.equal(appendEvents(events, drafts).length, 1, "stable event keys must prevent duplicate activation");

const mutatedValue = events.map((event) => ({ ...event, value: 500000 }));
assert.equal(verifyChain(mutatedValue), false, "value mutation must break the integrity chain");
const mutatedSkill = events.map((event) => ({ ...event, skill: "different-skill" }));
assert.equal(verifyChain(mutatedSkill), false, "skill mutation must break the integrity chain");

console.log("Capability gates verified: promotion evidence, idempotency, and ledger integrity.");
