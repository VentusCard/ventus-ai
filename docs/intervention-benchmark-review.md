# Intervention benchmark review

## Purpose

`backend/fixtures/evaluation/intervention-planning-benchmark.json` is the draft decision benchmark
for model-assisted interventions. It tests whether a candidate can choose or abstain from one
approved employee action using supplied evidence and policy context across standalone Deposit
Primacy, standalone Merrill Relationship Growth, and connected Liquidity-to-Wealth Growth Plays.

The packet currently contains 21 synthetic cases. Three qualitative-conflict cases deliberately sit
outside the deterministic baseline's simple matching rules: seasonal tax outflow, an unverified
liquidity source, and a canceled Merrill transfer with a no-contact instruction. This creates room
to test useful contextual judgment rather than rewarding a model for repeating rules.

## Label review and freeze

The current labels are authored preparation material, not independent ground truth. They cannot
support a model promotion claim while `status` is `draft`.

The repository enforces a blind, consensus-derived freeze:

1. Generate at least two packets. They contain the case evidence, allowed actions, and supplied
   policy verdicts, but omit authored expectations and all candidate predictions.

   ```bash
   npm run interventions:review:prepare
   ```

   Packets are written under the gitignored `backend/artifacts/intervention-review/` directory by
   default. Set `VENTUS_INTERVENTION_REVIEW_DIR` to use another approved location. Existing packets
   are not overwritten unless `VENTUS_INTERVENTION_REVIEW_OVERWRITE=1` is explicitly set.

2. Each reviewer independently fills `reviewer_id`, `reviewed_at`, and every case's `review` object:
   one allowed `action_id` or an abstention, supplied evidence ids, and optional notes. Reviewers
   must not open candidate model outputs or the authored expectations.

3. Adjudicate the completed packets without writing a frozen benchmark:

   ```bash
   VENTUS_INTERVENTION_REVIEW_PATHS=/path/reviewer-1.json,/path/reviewer-2.json \
   VENTUS_INTERVENTION_REVIEW_REPORT_PATH=/path/adjudication.json \
   npm run interventions:review:adjudicate
   ```

   The command verifies that both reviewers saw the same hash-bound case packet, covered every
   case, cited only supplied evidence, selected only allowed actions, and used distinct identities.
   It reports disagreements and differences between reviewer consensus and the original authored
   labels. Authored differences are informative, not an error: independent consensus is the label.

4. Resolve every disagreement before opening model predictions. Then write a separate frozen
   candidate for review:

   ```bash
   VENTUS_INTERVENTION_REVIEW_PATHS=/path/reviewer-1.json,/path/reviewer-2.json \
   VENTUS_INTERVENTION_FREEZE_OUTPUT_PATH=/path/intervention-benchmark.frozen.json \
   npm run interventions:review:adjudicate
   ```

   Freezing fails while any disagreement remains. The output expectations are derived from reviewer
   consensus, and the reviewer identities, source-packet hash, adjudication method, and expectation
   hash are recorded. Review the frozen diff through GitHub before replacing the draft manifest.

The review packet may contain tokenized financial evidence. For sanctioned pilot cases, keep packets
inside the bank-approved storage and collaboration boundary; do not distribute them through ordinary
email or personal cloud storage.

For a bank pilot, replace or supplement the synthetic packet with sanctioned, tokenized cases and
repeat the same blind review and freeze process.

## Candidate evaluation

Candidate predictions are a JSON object keyed by `case_id`, with each value matching the output
contract in `backend/shared/intervention-planner.mjs`. Evaluate a captured run without calling a
model from the QA command:

```bash
VENTUS_INTERVENTION_PREDICTIONS_PATH=/absolute/path/predictions.json \
VENTUS_INTERVENTION_CANDIDATE_COST_USD=0.05 \
VENTUS_INTERVENTION_PROVIDER=provider-name \
VENTUS_INTERVENTION_MODEL=model-name \
VENTUS_INTERVENTION_RUN_ID=run-id \
VENTUS_INTERVENTION_REPORT_PATH=/absolute/path/report.json \
npm run test:interventions
```

The initial evaluation gate requires 100% schema-valid output, zero hard failures, at least 95%
case acceptance, and at least a two-point quality improvement over the deterministic baseline.
Registered ambiguity, suppression, vulnerability, business-line, and demographic-proxy slices may
not materially regress. All hard gates must pass on three independently captured runs. The initial
intervention-ranking and employee-brief budget is a mean cost no greater than USD 0.02 per evaluated
case and p95 runtime no greater than five seconds unless a stricter Skill budget is registered.

Passing the offline gate is not runtime approval. A candidate must then run without activation on
sanctioned data for at least 500 eligible cases or 30 consecutive days, whichever is later, with
zero critical failures and complete cost, latency, routing, evidence, and prediction receipts.
Promotion is locked pending Growth Play owner, risk/model reviewer, and institution administrator
approval of the exact Skill, model route, prompt, schemas, thresholds, fallback, and environment.
