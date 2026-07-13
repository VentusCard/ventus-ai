# Outcome measurement methodology

## Decision standard

Ventus measures one pre-registered metric for one tenant and one experiment at a time. Assignment
must occur before activation and remain immutable. The current calculator compares the latest
eligible household outcome in treatment with the held-out baseline.

A result remains unavailable unless both arms have:

- at least 30 observed households by default; and
- at least 90% outcome coverage by default.

The pilot may set stricter thresholds before predictions or outcomes are opened. Missing outcomes
must not be treated as zero implicitly. The bank feed must send an explicit zero-valued observation
when zero is the valid measurement, or the result remains coverage-incomplete.

## Integrity controls

- A summary may contain exactly one tenant and one experiment.
- Every target-metric outcome must match a pre-existing assignment on tenant, experiment, household,
  arm, and assignment timestamp.
- The authenticated outcome runtime derives assignment, decision, activation, Growth Play, and
  protocol lineage from Ventus persistence; the bank feed cannot supply those fields.
- Duplicate assignments, mixed experiments, changed arms, outcomes before assignment, and orphan
  outcomes fail rather than being silently ignored.
- When multiple valid observations exist for a household, only the latest within the approved
  outcome window is used. The compiled Growth Play enforces event type, source system, metric, and
  window before persistence; the bank-specific mapping must still be approved against those fields.

## Statistical output

When sample and coverage gates pass, Ventus returns treatment and holdout means, absolute and
relative difference, standard error, and a two-sided 95% normal-approximation interval for the
difference in means. The signal is labeled positive, negative, or inconclusive depending on whether
that interval excludes zero.

This interval is decision support, not automatic proof of causality. The output always keeps
`causalClaimAllowed: false` pending independent review of randomization, metric definition,
covariate balance, attrition, contamination, noncompliance, multiple testing, and business context.
Bank-approved analysis may require a different estimator or a larger sample.

## Connected-data incrementality

Cross-business value uses a separately pre-registered three-arm design:

- **Holdout:** no Ventus action.
- **Standalone:** the business line acts using only its authorized team-owned inputs.
- **Connected:** the same eligible population may use the explicitly authorized cross-business
  signal classes.

Assignment is deterministic and immutable. The connected experiment cannot be created without a
time-bounded authorization scope naming at least two business lines and the permitted signal
classes. It also pins one decision-protocol ID across the standalone and connected arms so model,
prompt, policy, or action-catalog drift cannot be attributed to data connection. Every household
requires an exposure receipt recording whether an action was actually delivered and whether
connected data was used.

Ventus withholds all three contrasts unless every arm clears sample size, outcome coverage,
exposure coverage, and pre-registered deviation limits. When ready, it reports:

1. **Standalone minus holdout:** whether the business line creates independent value.
2. **Connected minus standalone:** the incremental value attributable to authorized connection.
3. **Connected minus holdout:** total effect of the connected operating path.

The connected-minus-standalone result is the expansion decision metric. A positive interval only
makes the connection a candidate for independent scale review; it never authorizes expansion
automatically. Inconclusive or negative results remain unscaled. `businessClaimAllowed` and
`causalClaimAllowed` remain false pending independent statistical, data-governance, and experiment
review.

## MVP metrics

- Deposit Primacy: bank-approved retained deposit balance or another pre-registered deposit metric.
- Merrill Relationship Growth: qualified net new assets posted during the approved outcome window.
- Connected Liquidity-to-Wealth: incremental qualified NNA versus the standalone arm, not merely
  versus no action.

`estimated_revenue` may support planning but should not serve as the primary pilot success metric
unless Finance approves its assumptions and reconciliation method. No result should be annualized
or commercialized before the completed outcome window and independent review.
