# MVP evaluation baseline

Run date: July 11, 2026

## Setup

The contract suite expands 12 authored cohort definitions into 500 synthetic households. It
includes clear positives, lower-value and thin-file positives, negative and ambiguous cases,
and consent, vulnerability, and employee-relationship suppressions. Each household is evaluated
through the same deterministic Plaid-schema normalization and opportunity logic used by the Live
Pipeline Lab.

## Results

- Growth Play classification: **500/500 expected matches**.
- Policy suppression: **500/500 expected matches**.
- Deposit primacy, liquidity-to-wealth, and lending contract precision/recall: **1.0/1.0**.
- Local deterministic scale baseline: **120,000 transactions across 50,000 households in 77–86 ms**
  across two runs on the development machine used for verification.

## Interpretation

These are designed contract tests. Perfect conformance means the implementation matches its
authored rules; it does **not** mean Ventus has 100% production accuracy. The scale result excludes
network, database, model, queue, and downstream connector latency and is not a production SLA.

The next meaningful accuracy result must come from Plaid-returned records and, after that, a
sanctioned representative bank sample with expectations labeled before predictions are reviewed.
The generated Plaid manifests deliberately preserve the cohort identity so failures can be
attributed to ingestion, Plaid categorization, Ventus detection, policy, or routing.

The leadership demo's Measure step uses a clearly disclosed illustrative outcome file to show the
product behavior. It is not included in the accuracy or lift evidence above.
