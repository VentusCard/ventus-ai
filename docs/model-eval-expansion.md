# Model Evaluation Expansion Plan

## Purpose

Turn model testing from a single-task, synthetic benchmark into a robust,
multi-task evaluation system that tells us, **for every enrichment task**, which
model is the best (accuracy), fastest (latency), and most cost-effective — so we
never pay for an expensive model when a cheaper one is good enough.

## Current State

### Multi-task framework (new — `backend/scripts/model-eval/`)

A task-agnostic evaluation framework now exists and is unit-tested offline:

- `scoring.mjs` — pure scoring primitives: set precision/recall/F1 (`setMetrics`),
  `exactMatchAccuracy`, `confidenceCalibration` (Brier + MAE), `latencyStats`
  (avg/p50/p95/max).
- `leaderboard.mjs` — per-task winners (`best_accuracy`, `lowest_latency`,
  `most_cost_effective`, `best_value`) plus a single quality-gated `recommended`
  model, with JSON + markdown output.
- `scorers.mjs` — `makeDetectionScorer` (per-customer set F1 for detection tasks)
  and `scoreEnrichment` (reuses the production golden evaluator).
- `tasks.mjs` — the task registry (see below).
- `run-task-eval.mjs` — the generic runner (capture → score → leaderboard).
- `scoring.test.mjs`, `leaderboard.test.mjs`, `tasks.test.mjs` — 23 offline tests.

Run: `npm run model-eval:test` and `npm run model-eval:run -- --task <id> --models <a,b>`.

### Tasks wired

| Task | Unit | Capture | Scorer | Golden source |
|---|---|---|---|---|
| `merchant_classification` | transaction | external (existing OpenRouter suite) | `scoreEnrichment` (field match) | synthetic benchmark expectations |
| `risk_detection` | customer | generic runner | set F1 on `risk_factors` + severity | `fixtures/evaluation/model-eval/risk-detection-golden.json` |
| `life_event_detection` | customer | generic runner | set F1 on `life_events` + confidence band | `fixtures/evaluation/model-eval/life-event-detection-golden.json` |
| `travel_detection` | customer | generic runner | set F1 on `trips` + month | `fixtures/evaluation/model-eval/travel-detection-golden.json` |

### Pre-existing enrichment benchmark

The enrichment task already had a mature pipeline (`capture → evaluate → compare`)
that measures accuracy, latency, cost, and `pass_per_dollar` with a
`model-comparison.md` leaderboard. The new framework reuses its scorer rather than
duplicating it.

## Key Limitations (what "good" still requires)

- **Golden data is synthetic and unverified.** All fixtures — including the three
  new detection tasks — are stamped `synthetic_requires_human_review`. Scores are
  directional, not decision-grade, until labels are human-reviewed.
- **Detection tasks aren't run against real model output yet** (needs
  `OPENROUTER_API_KEY` / provider access).
- **Cost input is provider-dependent.** Cost currently comes from OpenRouter's
  `usage.cost`; production Gemini won't return it, so a token-based pricing table
  is needed for apples-to-apples cost.
- **Latency is wall-clock** (includes gateway/network), single-trial.

## Data Sourcing: Synthetic vs Plaid (clarification)

- Model testing runs on **synthetic** data today. The enrichment fixture is built
  from a design key without calling Plaid.
- The toolchain is *designed* for Plaid Sandbox
  (`generate manifest → plaid:sandbox:pull → normalize → benchmark`), but the pull
  is optional, credential-gated, and not currently feeding the benchmark.
- Even when wired, Plaid **Sandbox** is canned test data, not real customer
  transactions.

## Selection Policy (how `recommended` is chosen)

For each task, among models that clear the quality gate
(`accuracy ≥ min_accuracy` AND `sample_size ≥ min_sample_size`), pick the lowest
cost-per-unit, breaking ties by higher accuracy then lower p95 latency. Gate
thresholds are configurable (`MODEL_EVAL_MIN_ACCURACY`, `MODEL_EVAL_MIN_SAMPLE_SIZE`).
This is the guardrail against overpaying for accuracy a task doesn't need.

## Roadmap

### Tier 1 — Multi-task spine — DONE
Task registry, generic runner, per-task scorers, leaderboard, offline tests.

### Tier 2 — Data quality (highest leverage, next)
- Wire real Plaid Sandbox pulls into the fixtures.
- Human-review golden labels for all tasks; promote from
  `synthetic_requires_human_review` to frozen truth.
- Shrink the overfit `merchant-normalization.mjs` lookup table.
- Track coverage (all 12 pillars, rails, PFC primaries, edge cases).

### Tier 3 — Statistical rigor
- Wilson confidence intervals on accuracy.
- McNemar significance testing for paired model comparisons.
- Multiple runs to quantify variance / non-determinism.
- Per-slice breakdowns (difficulty, ambiguity, rail, persona, category).

### Tier 4 — Realism
- Token-based cost pricing table + `$/1M transactions` projection.
- Latency separated from network; p50/p95/p99; warm vs cold; concurrency.
- Adversarial (prompt injection, malformed inputs) and consistency suites.
- Contract adherence (JSON validity, taxonomy violations) as a first-class metric.

### Tier 5 — Operationalize
- CI regression gate on `model-routing.json` changes.
- Historical run tracking + drift alerts.
- Shadow/online eval using existing `shadow_only` routes; human spot-check;
  measure benchmark-vs-production agreement.
- Feed per-task `recommended` back into `model-routing.json`.

## Value / Outcomes

- Cheapest "good-enough" model per task → direct cost savings.
- Overspend detection (expensive model where a cheap one ties).
- Category/pillar-level accuracy gaps.
- Confidence calibration for auto-accept vs human-review thresholds.
- Contract reliability + provider drift monitoring.
- Data-driven, task-aware routing decisions.

## Open Questions / Asks

- Credentials: OpenRouter API key (run models), Plaid Sandbox keys (real-shaped data).
- Owner + time for human label review (the trustworthiness unlock).
- Agreement on quality-gate thresholds per task.
