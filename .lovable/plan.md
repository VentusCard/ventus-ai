# Make `synthesize-persona` populate life events when fitting

Today, `synthesize-persona` only returns `pillar_rollups` (Spending Habits pills). Life events come exclusively from `analyze-lifestyle-signals`, which runs first and feeds detected events in for dedup. When detection misses (e.g. tool call skipped or evidence rules too strict), home/college clusters leak into Spending Habits as "New Home Transition Phase", "College Prep Phase", etc.

Fix: let `synthesize-persona` itself **promote** any cluster that fits a canonical life event into a life event, and return both arrays. The orchestrator merges these with whatever `analyze-lifestyle-signals` already produced.

## 1. `supabase/functions/synthesize-persona/index.ts`

### Tool schema — add `detected_life_events`

Extend the `return_persona` tool to return two arrays:

```text
{
  pillar_rollups: [...],          // unchanged shape
  detected_life_events: [
    {
      event_name: string,         // canonical: "Home Purchase / Transition",
                                  // "College Preparation for Dependent",
                                  // "Wedding / Engagement", "New Baby / Family Expansion",
                                  // "Business Formation", "Elder Care", "Retirement Planning",
                                  // "Relocation", "Inheritance / Windfall"
      confidence: number,         // 60-95
      evidence: [
        { merchant: string, amount: number, date: string, relevance: string }
      ],
      talking_points: string[],   // 3-5 short advisor prompts
      transaction_indices: number[] // [T<n>] indices, same convention as rollups
    }
  ]
}
```

`detected_life_events` is required but may be empty. Both arrays use the same `[T<n>]` index space already passed to the model.

### System prompt — add a "LIFE EVENT PROMOTION" section

Insert before the existing rollup rules:

- **Canonical life events** with minimum-evidence thresholds:
  - **Home Purchase / Transition** — 3+ from {realtor, title company, escrow, home inspector, mortgage co., moving company, large home retailers in atypical volume (Crate & Barrel, West Elm, Pottery Barn, Restoration Hardware, IKEA), Home Depot/Lowe's spike, first-time mortgage payment, HOA setup, utility transfers}.
  - **College Preparation for Dependent** — 2+ from {SAT/ACT/Kaplan/Princeton Review, college visitor parking, application portals (Common App/Coalition), university bursar/tuition deposit, AP exam fees, college tour airfare paired with university merchant} OR 1 explicit university tuition/deposit.
  - **Wedding / Engagement** — 2+ from {jeweler $2k+, wedding venue, bridal salon, wedding photographer, event caterer, registry retailers}.
  - **New Baby / Family Expansion** — 2+ from {OB/midwife, baby specialty retailers, pediatrician, daycare, hospital L&D, baby furniture}.
  - **Business Formation, Elder Care, Retirement Planning, Relocation, Inheritance / Windfall** — same pattern, defined briefly.
- Hard rule: **"If a cluster meets a canonical threshold above, you MUST emit it under `detected_life_events`. Do NOT also emit it as a `pillar_rollup`. Life events take priority."**
- Vocabulary ban for rollup labels (final defense): **"NEVER use 'Phase', 'Transition', 'Prep', 'Preparation', 'Bound', 'Expecting', 'New Parent', 'New Homeowner', 'Empty Nest', 'Aspiring Homeowner' in a rollup label. Those describe life events — emit them under `detected_life_events` or omit them."**
- Pre-existing dedup block stays: if `lifeEvents` were passed in from `analyze-lifestyle-signals`, treat them as already detected — do NOT re-emit the same theme in `detected_life_events` either.
- For each promoted event: pick 2-4 strongest transactions from the [T<n>] list as `evidence`, write 3 short advisor `talking_points`, set confidence by evidence count (3 rows = 70, 4-5 = 80, 6+ = 90).

### Force tool use & model

- Set `tool_choice: { type: "function", function: { name: "return_persona" } }` — already correct, keep.
- Keep `google/gemini-3-flash-preview`. (No change needed; promotion is a structural add, not a reasoning bottleneck.)

### Response shape

Update the response to forward both arrays:

```text
{
  pillar_rollups: [...],
  detected_life_events: [...]   // NEW
}
```

Each detected event maps `transaction_indices` → resolves to merchant/amount/date the same way `analyze-lifestyle-signals` does (the function does this client-side already; no extra resolution needed here since indices reference rows the caller sent in).

## 2. `src/pages/ExecDemoPage.tsx` — merge promoted events into UI state

In the persona-synthesis success branch (around the existing `setPersonaSynthesis(synthesis)` call), after parsing the response:

- Read `data.detected_life_events` (default `[]`).
- Map each promoted event to the `LifeEvent` shape used by the UI (same fields the `analyze-lifestyle-signals` consumer already accepts: `event_name`, `confidence`, `evidence`, `talking_points`).
- Resolve `transaction_indices` against the same `enrichedTxs` array passed into the function so `evidence` items have real merchant/amount/date.
- **Merge with the events from `analyze-lifestyle-signals`**, deduping by normalized `event_name` (lowercase, strip punctuation, drop common words). When two sources fire on the same theme, prefer the one with higher confidence; if tied, prefer the `analyze-lifestyle-signals` one (richer financial projection).
- Pass the merged list into `setDetectedLifeEvents(...)` and downstream consumers (`fireProductCards`, `fireNextOffers`).

No UI structure change — both columns render exactly as today; only what populates them changes.

## 3. Files touched

- `supabase/functions/synthesize-persona/index.ts` — tool schema + system prompt + response shape.
- `src/pages/ExecDemoPage.tsx` — merge `detected_life_events` from persona response with events from `analyze-lifestyle-signals` before setting state.

## Resulting behavior

For the failing case (home + college clusters present, `analyze-lifestyle-signals` returned `[]`):

- `synthesize-persona` now emits **`detected_life_events: ["Home Purchase / Transition", "College Preparation for Dependent"]`** with transaction-level evidence.
- Those two themes are absent from `pillar_rollups`.
- UI shows them under **Life Event Detection**; **Spending Habits** keeps lifestyle pills only ("Annual Hawaiian Vacations", "Seasonal Ski Trips", "Dedicated Pet Owner").
- When `analyze-lifestyle-signals` *does* fire correctly, dedup keeps the richer event (with financial projection) and discards the persona-promoted duplicate.
