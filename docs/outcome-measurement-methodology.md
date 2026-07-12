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
- Duplicate assignments, mixed experiments, changed arms, outcomes before assignment, and orphan
  outcomes fail rather than being silently ignored.
- When multiple valid observations exist for a household, only the latest within the approved
  outcome window is used. Window enforcement must be added to the bank-specific mapping.

## Statistical output

When sample and coverage gates pass, Ventus returns treatment and holdout means, absolute and
relative difference, standard error, and a two-sided 95% normal-approximation interval for the
difference in means. The signal is labeled positive, negative, or inconclusive depending on whether
that interval excludes zero.

This interval is decision support, not automatic proof of causality. The output always keeps
`causalClaimAllowed: false` pending independent review of randomization, metric definition,
covariate balance, attrition, contamination, noncompliance, multiple testing, and business context.
Bank-approved analysis may require a different estimator or a larger sample.

## MVP metrics

- Deposit Primacy: bank-approved retained deposit balance or another pre-registered deposit metric.
- Liquidity-to-Wealth: qualified net new assets posted during the approved outcome window.

`estimated_revenue` may support planning but should not serve as the primary pilot success metric
unless Finance approves its assumptions and reconciliation method. No result should be annualized
or commercialized before the completed outcome window and independent review.
