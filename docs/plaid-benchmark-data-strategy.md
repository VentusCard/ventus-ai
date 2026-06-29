# Plaid Benchmark Data Strategy

This design defines what Ventus AI should pull from Plaid Sandbox before using
the data to evaluate enrichment quality or compare multiple LLMs.

The goal is not to maximize row count blindly. The goal is to create a dataset
where each row has a known identity, a reason to exist, and enough diversity to
show where the enrichment engine, Plaid PFC, or model routing succeeds or fails.

## Evaluation Questions

The benchmark should help answer:

- Can Ventus normalize Plaid transactions into stable rails and source profiles?
- Does Plaid personal finance category coverage help or mislead enrichment?
- Which categories are easy enough for a low-cost model?
- Which ambiguous cases require a stronger reasoning model?
- Where do errors cluster by persona, rail, PFC, source profile, amount, or
  signal type?
- What accuracy, latency, and cost tradeoffs appear across Gemini, GLM, Claude,
  OpenAI, or future provider-specific models?

## Dataset Phases

Use three phases instead of one large pull:

| Phase | Target rows | Purpose |
| --- | ---: | --- |
| Calibration | 150-250 | Confirm Plaid custom_user descriptions produce enough PFC and rail diversity. |
| Benchmark | 450-700 | First fair multi-model comparison set with persona and scenario coverage. |
| Stress | 900-1,200 | Larger long-tail set for cost, latency, edge cases, and routing thresholds. |

The current generator defaults to the benchmark phase because prior pulls
already showed that the existing 107-row sandbox set is too narrow for model
evaluation.

## Required Coverage

Personas:

- consumer baseline
- affluent travel spender
- subscription-heavy digital household
- family household and life-event signals
- medical and pharmacy user
- home improvement and moving user
- small business operating account
- contractor income account
- loan and debt-heavy user
- transfer-heavy user
- risk and fee-prone user
- ambiguous merchant/adversarial strings
- student/young professional
- senior fixed-income user
- gig worker mixed-income user
- nonprofit/community organization

Rails and account types:

- card
- ACH/depository
- P2P-like transfers
- wires / large transfers
- loan payments
- fees
- refunds and credits

Plaid PFC primaries to pursue:

- `BANK_FEES`
- `ENTERTAINMENT`
- `FOOD_AND_DRINK`
- `GENERAL_MERCHANDISE`
- `GENERAL_SERVICES`
- `GOVERNMENT_AND_NON_PROFIT`
- `HOME_IMPROVEMENT`
- `INCOME`
- `LOAN_PAYMENTS`
- `MEDICAL`
- `PERSONAL_CARE`
- `RENT_AND_UTILITIES`
- `TRANSFER_IN`
- `TRANSFER_OUT`
- `TRANSPORTATION`
- `TRAVEL`

Ventus signal coverage:

- travel candidates
- risk candidates
- life-event candidates
- non-signal control rows
- adversarial false-positive controls

## Row Identity Schema

Each designed transaction should have a separate design-key entry with:

- `scenario_id`
- `persona_id`
- `customer_id`
- `account_label`
- `account_type`
- `account_subtype`
- `description`
- `amount`
- `intended_pfc_primary`
- `intended_rail`
- `intended_source_profile`
- `intended_transaction_type`
- `expected_signals`
- `difficulty_level`
- `ambiguity_level`
- `reason_this_row_exists`

Only Plaid-supported transaction fields go into the custom_user manifest. The
identity fields stay in the design key so reports can explain what was supposed
to be tested without pretending Plaid accepts those fields.

## What Not To Trust From Plaid Alone

Do not treat Plaid PFC as ground truth. Use it as a useful partner signal to
inspect. Golden expectations should be human-reviewed before becoming pass/fail
truth for model evaluation.

Do not use a dataset as a model benchmark unless it has enough:

- rows with matched design keys
- distinct PFC primaries
- distinct Ventus rails
- distinct source profiles
- ambiguous/adversarial rows
- signal-positive and signal-negative controls

## Model Benchmark Workflow

The benchmark now has a repeatable three-step flow:

1. Generate or refresh the deterministic Plaid-compatible benchmark fixture.

   ```bash
   npm run --prefix backend plaid:benchmark:synthetic
   ```

2. Capture model predictions into a run-specific artifact directory. The default
   model is `z-ai/glm-5.2` through OpenRouter, but the model can be overridden
   per run.

   ```bash
   OPENROUTER_BENCHMARK_RUN_ID=openrouter-z-ai-glm-5-2-25 \
   OPENROUTER_BENCHMARK_MODEL=z-ai/glm-5.2 \
   OPENROUTER_BENCHMARK_LIMIT=25 \
   OPENROUTER_BENCHMARK_BATCH_SIZE=10 \
   npm run --prefix backend plaid:benchmark:openrouter
   ```

3. Evaluate that prediction file, then compare all available runs.

   ```bash
   PLAID_BENCHMARK_PREDICTIONS_PATH=backend/artifacts/plaid-synthetic-benchmark/runs/openrouter-z-ai-glm-5-2-25/predictions.json \
   npm run --prefix backend plaid:benchmark:evaluate

   npm run --prefix backend plaid:benchmark:compare
   ```

The evaluator automatically builds a transaction-ID-matched expectation subset,
so a 25-row smoke test, a 100-row calibration run, and a full benchmark can all
use the same master expectation file.

The comparison report ranks runs by overall pass rate and exposes field-level
pass rates for:

- clean merchant name
- lifestyle category
- merchant category
- confidence floor
- travel signal
- risk signal
- life-event signal

This is the first layer needed for a multi-LLM system: each candidate model can
be measured against the same rows, then routed by where it is actually strong
instead of by intuition.

## Current Next Step

Generate the benchmark manifest, pull it through Plaid Sandbox, then run the
PFC coverage analyzer. If Plaid collapses the descriptions into too few PFC
categories, revise descriptions before running expensive multi-model
enrichment comparisons.

In parallel, use the synthetic benchmark for shadow-only model evaluation. The
latest GLM 5.2 smoke test through OpenRouter produced a stable JSON response and
passed 23 of 25 evaluated rows after the benchmark labels were corrected for
reasonable merchant/category aliases. The remaining misses were real signal
judgment errors: PG&E utility payments were incorrectly flagged as life-event
candidates.
