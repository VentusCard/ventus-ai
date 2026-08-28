# Outcome measurement methodology

## Decision standard

Ventus measures one pre-registered metric for one tenant and one experiment at a time. Assignment
must occur before activation and remain immutable. The current calculator compares the latest
eligible household outcome in treatment with the held-out baseline.

A development or sandbox result remains unavailable unless both arms have:

- at least 30 observed households by default; and
- at least 90% outcome coverage by default.

These defaults are mechanism checks and cannot authorize a business claim. A sanctioned pilot must
freeze a power-informed minimum sample, coverage threshold, outcome window, assignment salt custody,
contamination policy, and analysis plan before the first assignment. Thresholds cannot be relaxed
after results are opened. Missing outcomes must not be treated as zero implicitly. The bank feed
must send an explicit zero-valued observation when zero is the valid measurement, or the result
remains coverage-incomplete.

The primary analysis is intent-to-treat on one pre-registered P&L metric. Employee acceptance, task
completion, response time, and capacity are operating metrics; they do not replace the primary
outcome. Secondary metrics are exploratory and cannot determine pilot success.

## Outcome-source authority

The primary metric must come from the institution system that owns the
economic event:

- Deposit Primacy uses the deposit ledger or a certified, reconciled
  deposit-outcome view.
- Merrill Relationship Growth uses wealth books and records or a certified,
  reconciled NNA view.
- Salesforce/FSC and employee workbenches contribute workflow observations
  such as assignment, acceptance, completion, timing, and reason codes. They
  are not authoritative for economic lift unless the institution formally
  certifies the specific view and lineage.

For the MVP, the institution returns a precomputed registered metric value for
each treatment and holdout subject. Ventus does not infer accounting outcomes
from CRM state or re-create bank accounting from raw transactions. The return
feed includes only the opaque subject token, metric, value, event and source
identifiers, source version, occurrence and observation times, correction
sequence, and optional reason code. Ventus derives tenant, experiment, arm,
decision, activation, Growth Play, and protocol from persisted evidence.

Treatment and holdout must share the same source, metric definition, version,
cadence, correction rules, and freshness threshold. A null observation remains
missing; a real zero must be explicit. Corrections are append-only, and the
latest valid correction inside the registered window is used.

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

The product distinguishes awaiting outcomes, measuring, descriptive, review-ready, and approved
claim states. Passing sample and coverage gates makes a result descriptive. Only an institution-
approved review of the exact design, method, language, and audience can authorize a causal or
external business claim.

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

- Deposit Primacy: bank-approved eligible deposit amount retained at the
  registered measurement anchor, returned by the deposit ledger or certified
  outcome view. The MVP estimator compares mean end-anchor eligible balance
  between treatment and holdout.
- Merrill Relationship Growth: signed USD posted and settled qualified external
  inflows minus outflows during the approved outcome window, excluding market
  movement, internal transfers, reversals, and other pre-registered
  exclusions. The MVP estimator compares mean qualified NNA between treatment
  and holdout.
- Connected Liquidity-to-Wealth: incremental qualified NNA versus the standalone arm, not merely
  versus no action.

`estimated_revenue` may support planning but should not serve as the primary pilot success metric
unless Finance approves its assumptions and reconciliation method. No result should be annualized
or commercialized before the completed outcome window and independent review.
