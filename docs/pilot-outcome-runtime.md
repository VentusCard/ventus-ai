# Pilot outcome runtime

## Purpose

`POST /api/pilot-outcomes` closes the deployable standalone loop after activation. It accepts an
observed bank outcome or requests a coverage-gated experiment summary for one approved Consumer or
Wealth Management protocol.

## Outcome writes

The bank outcome service supplies only:

- opaque household and event identifiers;
- approved event type, timestamp, metric value, and source system;
- optional source-record and reason identifiers.

Ventus derives tenant and business-line authority from a short-lived signed session. It then loads
the immutable assignment and decision/activation context from its own tenant-isolated stores. The
caller cannot supply or override the experiment, arm, assignment timestamp, decision, activation,
Growth Play, or protocol lineage.

The metric value is a closed object containing only metric, finite amount, and USD currency. Extra
nested fields are rejected so the outcome endpoint cannot be used to persist direct customer data.

The endpoint requires `growth_play_outcome_write` scope and the matching business-line entitlement.
Legacy bearer and local-demo authorization are rejected. A protocol revoked after assignment may
still collect outcomes for that historical assignment; future decision runs remain blocked.

## Measurement reads

`operation=measure` requires `growth_play_measure_read`. It derives the experiment from the
protocol ID and uses the protocol's pre-registered metric, minimum sample, coverage threshold, and
outcome window. Results remain unavailable until both treatment and holdout satisfy those gates.

Every response keeps `businessClaimAllowed=false` and `causalClaimAllowed=false`. A measured
interval is decision support for independent review, not automatic proof of lift.

## Integrity and evidence boundary

The server validates that assignment storage, decision-ledger context, and approved protocol agree
on tenant, household, assignment ID, arm, Growth Play, and protocol ID. Outcome source, event,
metric, and timing must also match the approved contract. Idempotent replays are accepted only when
event content is unchanged.

PostgreSQL also rejects a new protocol-bound binary assignment unless the latest approval event at
its assignment timestamp is `approved`. This prevents a direct repository write from bypassing a
revocation even if the application orchestration is misused.

Tests prove treatment and holdout lineage, historical approval resolution, scope separation,
caller-lineage rejection, and non-claim measurement output. They do not prove a deployed database,
bank-authenticated outcome feed, completed measurement window, statistical validity, or economic
impact.
