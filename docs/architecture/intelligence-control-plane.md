# Ventus Intelligence And Control Planes

> **🧭 PLANNED / TARGET STATE (as of 2026-08).** This is the target control-plane
> architecture (Growth Console operating loop, `decision-run` contract, tenant
> ledger). The enrichment backend is real, but the Growth Console / decision
> runtime / ledger described here are **not built**. For what actually exists, see
> [`current-system.md`](./current-system.md).

## Purpose

Ventus currently has an AWS enrichment backend and a newer Growth Console operating loop. The target architecture keeps both investments by making AWS the canonical intelligence and execution plane while the Growth Console remains the human control and product plane.

## Canonical Decision Contract

`ventus.decision-run.v1` is the boundary between product surfaces and the decision runtime:

1. A tenant-bound, entitled operator supplies a sanctioned transaction stream.
2. The server runtime returns `qualified`, `suppressed`, or `abstained`.
3. The result names its Growth Play, source, policy version, runtime version, supporting opportunity, and whether a model was invoked.
4. The frontend renders the result but does not authoritatively calculate it.

PR #178 initially serves this contract with `plaid-rules-v1`, the deterministic baseline. A future AWS endpoint can produce the same contract without changing the console.

## Runtime Direction

- **Now:** Plaid and fixtures enter a server-side deterministic runtime. The result explicitly records `modelInvocation: null`.
- **Now:** The model-free decision baseline is hosted behind the authenticated AWS
  Console API and writes tokenized decision evidence to the durable tenant-isolated
  ledger. The Console displays the returned ledger sequence and hash.
- **Next:** Move reviewed activation and outcome ingestion behind the same AWS
  boundary so the complete operating loop is durable without relying on a local or
  platform-specific API runtime.
- **Evaluation:** Candidate models run in shadow against the same input and contract. They cannot alter activation.
- **Promotion:** A model route can become assisted only after quality, policy, fairness, cost, latency, and holdout gates pass.

## Growth Plays And Skills

A **Growth Play** is a business operating loop: objective, P&L metric, cohort, policy, action, owner, destination, and measurement.

A **Skill** is a reusable technical capability composed into a Growth Play: merchant normalization, payroll detection, liquidity detection, intervention ranking, banker-brief generation, Salesforce activation, or lift calculation.

The MVP `SkillArtifact` currently packages most of a Growth Play into one versioned object. The next schema revision should let one Growth Play reference multiple independently evaluated Skill versions.

## Improvement Loop

Ventus does not silently self-modify in production. It records evidence, recommendation, human disposition, activation, outcome, model version, and policy version. An offline process proposes a new Skill version, evaluates it against the current baseline, runs it in shadow, and requires an accountable owner to promote it from draft to assisted operation.
