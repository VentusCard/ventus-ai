# Intervention benchmark review

## Purpose

`backend/fixtures/evaluation/intervention-planning-benchmark.json` is the draft decision benchmark
for model-assisted interventions. It tests whether a candidate can choose or abstain from one
approved employee action using supplied evidence and policy context across the Deposit Primacy and
Liquidity-to-Wealth Growth Plays.

The packet currently contains 14 synthetic cases. Two qualitative-conflict cases deliberately sit
outside the deterministic baseline's simple matching rules: seasonal tax outflow and an unverified
liquidity source. This creates room to test useful contextual judgment rather than rewarding a model
for repeating rules.

## Label review and freeze

The current labels are authored preparation material, not independent ground truth. They cannot
support a model promotion claim while `status` is `draft`.

1. Two reviewers who did not generate candidate predictions independently assess each case's
   `action_id`, `abstain`, and `evidence_transaction_ids` without seeing model answers.
2. Reviewers document disagreements and resolve them before any model results are opened.
3. Record two distinct reviewer entries with `reviewer_id`, `decision: "approved"`, and an ISO 8601
   `reviewed_at` timestamp.
4. Run `npm run test:interventions` and copy the printed `expectations_sha256` into the manifest.
5. Change `status` to `frozen` and rerun the command. Any later expectation change will invalidate
   the hash and fail validation.

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

An evaluation gate requires zero hard failures, at least 95% case pass rate, and at least a
two-point quality improvement over the deterministic baseline. Passing that gate is not production
approval. Runtime promotion remains locked pending frozen independent labels, policy and model-risk
review, sanctioned-data performance, security review, and a bank-approved operating owner.
