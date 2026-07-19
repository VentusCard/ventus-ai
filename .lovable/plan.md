## Root cause

The prompt describes the 5 signals in one flat list with "NEVER" bullets. That gives the LLM too much interpretive room, so it keeps inventing things like "New Pet Household" as a Demographic. The fix is to rewrite the per-signal guidelines so each bucket has a strict, positive definition, a closed enum of acceptable label patterns, hard exclusions with reasoning, and 2–3 canonical examples the model can pattern-match against.

## Fix — rewrite per-signal guidelines in `synthesize-persona/index.ts`

For each of the 5 buckets, replace the current bullet list with this structured block:

1. **Definition** — one sentence, positive framing (what it IS).
2. **Ownership test** — a 2-step yes/no gate the model must pass before emitting.
3. **Closed label vocabulary** — the only shapes a label may take.
4. **Hard exclusions** — with a one-line WHY each exclusion belongs elsewhere.
5. **Canonical examples** — 2–3 GOOD examples and 2–3 BAD examples with the correct bucket noted.

### Bucket-specific guidelines

**LIFE_EVENT**
- IS: a discrete, time-bounded transition with a vendor cluster inside a ~90-day window.
- Test: (a) ≥N vendor rows from the life-event vendor list, (b) rows cluster in time.
- Labels: closed enum (Home Purchase, Wedding, New Baby, Elder Care, Relocation, Business Formation, Retirement Planning, Inheritance/Windfall).
- Exclude: recurring servicer ACH (→ Financial Signal), college prep (→ Demographic), pets (→ Spending Habit).

**FINANCIAL_SIGNAL**
- IS: a durable product relationship shown as recurring servicer ACH or brokerage/retirement contribution.
- Test: (a) merchant matches financial-servicer taxonomy, (b) cadence is recurring.
- Labels: `<Product Family> · <Servicer>` only — never lifestyle words.
- Exclude: one-off big purchases (→ Life Event or Spending Habit), insurance copays at doctor's office (→ Spending Habit).

**DEMOGRAPHIC**
- IS: an inferred STATE CHANGE in income, wealth tier, household composition, or geography — must show a start/stop/step/drift over time.
- Test: (a) evidence shows a delta (before vs after), NOT just presence; (b) category ∈ {income_trajectory, wealth_tier_migration, household_composition, geography_relocation}.
- Labels: closed vocabulary — "Payroll Step-Up ·+X%", "Kid → College", "Empty Nest", "SF → NYC Everyday Spend", "Self-Employment Onset".
- Hard exclusions with reasoning:
  - Pets → Spending Habit. Owning a pet is a lifestyle, not a demographic state change.
  - Fitness / streaming / coffee / groceries / hobbies → Spending Habit. Recurring vendor presence is never a demographic shift.
  - Baby / eldercare / moving vendors → Life Event. Those are transitions, not steady-state demographics.
  - Auto loan / mortgage / insurance ACH → Financial Signal.
- Rule of thumb: if the honest evidence sentence starts with "the customer regularly buys…", it is NOT demographic.

**SPENDING_HABIT (pillar_rollups)**
- IS: a recurring lifestyle habit that names an activity or identity.
- Test: passes the identity test ("this person is the kind of person who ___") with an ACTIVITY word.
- Labels: 2–4 words naming the activity + cadence.
- Always owns: pet spend, fitness, coffee, streaming, groceries, hobbies, salons, gym.

**RISK_FACTOR**
- Owned upstream. Never emit anything for risk-flagged rows.

### Additional guardrails

- Add a decision-tree preamble the model reruns per cluster: "Before writing a Demographic, answer aloud: what changed, when, and how do we know?" If the answer is "nothing changed, this vendor is just present," the model must route to Spending Habit or drop.
- Add explicit BAD-EXAMPLES section at the end of the system prompt showing the exact strings we keep seeing ("New Pet Household", "Multi-Pet Household", "College Prep Cycle" duplicating "Kid → College") with the correct routing next to each.

### Backend guard (unchanged from prior plan, kept as safety net)

- Widen pet/lifestyle vocabulary check to `label`, `magnitude_band`, `evidence_summary`, and `category`. Drop any demographic matching.
- Theme-level dedup between Life Event and Demographic (college theme → keep Demographic, drop Life Event).
- Normalize college demographic to canonical "Kid → College" with no duplicated trailing text.

### Frontend guard (unchanged)

- Defensive filter in `ExecDemoIntelPanel` for pet/lifestyle vocab on demographic pills.
- Suppress `magnitude_band` when it restates the label.

## Validate

Re-run /bankdemo customers and confirm no pet or duplicated college pills appear under Demographic across several personas.