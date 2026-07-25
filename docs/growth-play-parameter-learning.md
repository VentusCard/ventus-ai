# Growth Play parameter learning

Ventus pilots run in a regime where each trial is expensive and the environment cannot be
modelled: a bank gives you a handful of cohort waves, not thousands of impressions. This is the
regime task-level iterative learning control was built for — start from a demonstration, keep a
deliberately coarse model of how the controls behave, bound each step, and let repeated trials on
the real system supply the accuracy the model lacks.

This document covers what is implemented today. Everything here is offline: it runs against
fixtures and historical replay, changes no persistence, and produces proposals that still require
Growth Play approval before any run can use them.

## Contract v1.1: the parameter vector

Before v1.1, a play's trigger thresholds were literals inside detector code. The compiled protocol
digest covered approved sources, rails, policies, actions, and measurement — but not the numbers
that actually decided who got contacted. Changing `100_000` to `50_000` left
`decision_protocol_id` unchanged unless someone remembered to bump `eligibility.criteria_version`
by hand. The binding between approved behaviour and real behaviour was a naming convention.

v1.1 adds two required blocks to the draft, both inside the digest.

```json
"parameters": {
  "min_transfer_amount": {
    "value": 100000, "min": 25000, "max": 500000,
    "max_step": 25000, "resolution": 500, "kind": "number"
  }
},
"learning": { "enabled": true, "max_waves": 10, "drift_budget": 3, "noise_gate_sigma": 1 }
```

| Field | Meaning |
| --- | --- |
| `value` | The approved operating value. Detectors read it; they no longer carry literals. |
| `min` / `max` | The box the bank approved once. Learning can move inside it and nowhere else. |
| `max_step` | The largest single-wave change. Also the unit of *normalized* movement: 1.0 == one step. |
| `resolution` | The smallest meaningful change. Proposals quantize to it, so a reviewer reads `212500`, not `212498.32`. |
| `kind` | `number` or `integer`. |

A play may expose at most **8** parameters. That cap is not arbitrary: a handful of waves cannot
identify twenty knobs, and a vector a compliance committee can read in one sitting is the whole
governance argument. A play with no tunable knobs declares `"parameters": {}` and
`"learning": { "enabled": false, … }`.

Any change to any value mints a new `decision_protocol_id`. Tampering with a compiled contract
fails `validateCompiledGrowthPlayContract`. `withParameterValues` refuses to change a value without
a new version, and refuses values outside the approved box.

## The four stages

Each stage is a separate module with its own tests, and each writes an artifact the next one
consumes.

### 1. Demonstration fit — `shared/parameter-fit.mjs`

Cold-starting a policy is the expensive way to begin. Instead, take the households a top-decile
banker or advisor actually acted on and search the approved box for the vector that best reproduces
those selections. Coordinate descent over the `max_step` grid, scored by F1 against the expert.

```bash
npm run --prefix backend fit:play-parameters -- --play merrill-relationship-growth \
  --demonstration ./fixtures/evaluation/demonstration-sample.json
```

The demonstration file format, the exposure rule that decides whether a fit means anything, and how
to read the output are documented in
[growth-play-demonstration-export.md](growth-play-demonstration-export.md).

The output reports declared vs fitted values, precision/recall/F1 before and after, the selection
rate, and any parameters the demonstration cannot identify. A good F1 against one expert's history
is evidence that the vector reproduces that expert — not that the expert was right.

### 2. Replay sensitivity — `shared/play-sensitivity.mjs`

Perturb one parameter by one approved step, re-run the detector over the same historical records,
and measure how the decision-side features move. Derivatives are per **normalized step**, so every
downstream figure shares one unit.

The model does not need to be accurate. It needs the right signs. Deliberately do not build a
customer-behaviour simulator here; the wave loop corrects magnitudes far more cheaply than
simulation fidelity buys them.

Replay observes **decisions, not outcomes**. It can show that tightening a threshold cuts qualified
volume; it cannot show what that does to deposits. The metric row of the Jacobian starts as a
documented prior whose sign is trusted and whose magnitude is not, and `refineMetricRow` refits it
from observed waves — shrinking toward the prior, so few waves keep the prior's sign and many waves
let the data win.

### 3. Bounded update — `shared/play-ilc.mjs`

Given the measured wave error and the Jacobian, solve a ridge-regularized least-squares step in
normalized parameter space, then apply three guards:

- **Step cap.** No knob moves more than one `max_step` per wave.
- **Drift budget.** Cumulative movement from the last *approved* vector is bounded by
  `learning.drift_budget`. The final step is scaled to fit the remaining budget; once spent, the
  loop stops with `reapprovalRequired: true` and the play needs a fresh approval event in the Growth
  Play registry.
- **Noise gate.** The error is compared against the wider of the within-wave standard error and the
  **holdout arm's own wave-to-wave standard deviation**. An error smaller than what the metric does
  when Ventus does nothing is not evidence, and updating on it fits seasonality. Gated features are
  reported by name.

`planWaveUpdate` refuses to run at all when learning is disabled, the wave budget is spent, or the
measurement has not passed its sample and coverage gates. Every refusal returns a named `reason`
rather than a silent no-op.

### 4. Verify the whole loop

```bash
npm run --prefix backend qa:play-learning
```

Runs compile → fit → sensitivity → waves against a synthetic plant whose true response is 8k per
step while the prior claims 12k, and prints the learning curve:

```
wave  min_transfer_amount   lift      error   step   drift   status
   1               150000         0   -20000   1.000    1.00   update_computed
   2               175000      8000   -12000   1.000    2.00   update_computed
   3               200000     16000    -4000   0.500    2.50   update_computed
   4               212500     20000        0   0.000    2.50   error_within_noise_band
```

A model that is wrong by 1.5x still converges in four waves, inside 2.5 of 6 approved drift steps,
and the refit recovers the true response. That is the point of the whole design: iteration is
cheaper than fidelity.

## The trial unit is a cohort wave, not a household

Iterative learning control assumes a repeatable trial. A household is not one — it cannot be re-run,
and the population drifts between waves. So the error is only meaningful at cohort level against a
holdout assigned in the same wave, and the noise gate exists precisely because the disturbance
between waves can exceed the learning signal.

Wave orchestration is **not implemented**. Today `pilot-operating-loop.mjs` runs per household with
no wave entity, so the loop above must be driven manually from measured summaries. Persisting waves
(`growth_play_waves`, a `wave_id` on assignments and decisions) is the next phase and the first one
that touches tenant-scoped persistence.

## What this does not prove

The tests prove parameter binding, tamper evidence, bounded search, sign recovery, gate ordering,
drift accounting, quantization, and convergence of the update rule against a synthetic plant.

They do not prove that any bank metric responds to any knob, that a demonstration is a good policy,
that the decision-side Jacobian predicts outcomes, or that a converged vector generalizes to another
institution. Lift figures produced by `qa:play-learning` are simulated evidence from a synthetic
plant and carry `businessClaimAllowed: false` and `causalClaimAllowed: false` for the same reasons
set out in [outcome-measurement-methodology.md](outcome-measurement-methodology.md).

Every fitted or updated vector is a **proposal**. Compiling it is not approving it.

## Related

- [pilot-operating-loop.md](pilot-operating-loop.md) — the single-pass loop these updates feed.
- [growth-play-onboarding-contract.md](growth-play-onboarding-contract.md) — how a protocol is bound and approved.
- [outcome-measurement-methodology.md](outcome-measurement-methodology.md) — the sample and coverage gates a wave must pass before it can be learned from.
