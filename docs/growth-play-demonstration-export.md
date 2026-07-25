# Growth Play demonstration export

This is the data pull that initializes a Growth Play's parameter vector. It records what a set
of experts — typically top-decile bankers or advisors — actually did during one window: the
households they saw, and the ones they acted on.

One export covers **one tenant, one Growth Play, one window**. Schema:
[`backend/fixtures/contracts/demonstration-contract.json`](../backend/fixtures/contracts/demonstration-contract.json).
Worked example: [`backend/fixtures/evaluation/demonstration-sample.json`](../backend/fixtures/evaluation/demonstration-sample.json).

```bash
npm run --prefix backend qa:demonstration                 # validate the sample
VENTUS_DEMONSTRATION_FILE=/path/to/export.json npm run --prefix backend qa:demonstration
npm run --prefix backend fit:play-parameters -- \
  --play merrill-relationship-growth --demonstration /path/to/export.json
```

## Required fields

### Envelope

| Field | Notes |
| --- | --- |
| `contract_version` | `"1.0"` |
| `demonstration_id` | Stable id for this pull. |
| `tenant_id`, `growth_play_id`, `business_line` | Must match the Growth Play being initialized. |
| `evidence_class` | `synthetic`, `sandbox`, or `sanctioned`. See below — this one has teeth. |
| `window.from` / `window.to` | The observation period. Every action must fall inside it. |
| `captured_at` | When the export was pulled. |
| `expert_selection.basis` | Free text: **how the experts were chosen.** Required, and it is the field that decides whether the fit is worth anything. |
| `expert_selection.expert_count` | How many experts the export claims to cover. |

### `cases[]` — every household the export covers

| Field | Notes |
| --- | --- |
| `household_token` | Bank-issued opaque token, `tok_…`. Never a customer id, account number, or name. |
| `exposed` | **See below.** Whether an expert actually saw this household in the window. |
| `records[]` | The transaction-shaped evidence the detector reads: `transaction_id`, `source_system`, `rail`, `amount`, `occurred_at`, and optionally `merchant_name` / `category`. Same shape the operating loop consumes. |
| `policies[]` | `policy_id` + verdict (`clear` / `block` / `review`), if known at the time. |

### `actions[]` — what the experts did

| Field | Notes |
| --- | --- |
| `household_token` | Must reference an **exposed** case in the same export. |
| `action_id` | Must be an action the Growth Play approves. |
| `acted_at` | Must fall inside the declared window. |
| `expert_token` | Opaque employee token, `exp_…`. Never a name, employee id, email, or NMLS id. |

## The three rules that decide whether the fit means anything

**1. Exposure is not optional.** A household the expert never saw is not a decline. If the
export includes households outside the experts' books during the window and marks them
`exposed: true`, every one becomes a false negative, the fit is pushed toward a looser trigger,
and nothing about the result will look wrong. Unexposed cases may be included — they are useful
for coverage reporting — but they are excluded from the fit and are the one field you cannot
approximate. If exposure cannot be determined for a household, leave it out of the export.

**2. The export needs declines.** A pull containing only households the experts acted on has no
negative examples and is rejected. The interesting signal is the boundary: households that
looked similar and were passed over.

**3. Identity stays opaque.** Household and employee tokens only. Direct customer PII and direct
employee identity (`advisor_name`, `employee_id`, `employee_email`, `nmls_id`, and the standard
customer set) are rejected structurally, not filtered. Merchant enrichment fields are fine.

## Evidence class

Follows the export through the fit and into the report.

- `synthetic` — fabricated. Exercises the pipeline; initializes nothing.
- `sandbox` — real shape, non-production source. Fine for rehearsal.
- `sanctioned` — real expert behaviour from an approved source inside the approved perimeter.
  The only class whose fit can initialize a production pilot (`fitUsableForProduction: true`).

## Reading the fit output

Two things in the report matter more than the fitted numbers.

**Selection rate.** Acted-on households over exposed households. A rate near 100% usually means
exposure was over-claimed; a rate near 0% usually means the window or the book was too broad.

**Equivalent values.** When no household sits between two candidate values, both reproduce the
expert exactly and the demonstration cannot tell them apart. The fit reports the whole
equivalence class and sets `identified: false`. Choosing within that class is a judgement call,
not a finding — and it is a good prompt to widen the window or the population.

Expect `qualified_confidence` to be fully unidentified: a demonstration says who an expert
selected, not what confidence Ventus should report. Knobs that do not change selection cannot be
fitted from selections.

## What a fit is and is not

A high F1 is evidence that the vector **reproduces these experts**. It is not evidence that the
experts were right, that their selections were profitable, or that the vector generalizes to
another desk or institution. The fitted vector is a proposed initialization: it still has to be
compiled and approved through the Growth Play registry before any run can use it, and the wave
loop in [growth-play-parameter-learning.md](growth-play-parameter-learning.md) is what turns an
initialization into something measured.

## Related

- [growth-play-parameter-learning.md](growth-play-parameter-learning.md) — what happens to the vector after it is fitted.
- [growth-play-onboarding-contract.md](growth-play-onboarding-contract.md) — how a protocol is bound and approved.
- [pilot-operating-loop.md](pilot-operating-loop.md) — the record and policy shapes reused here.
