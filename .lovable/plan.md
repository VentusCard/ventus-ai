## Why Next-Product picked Pet Care instead of Hawaiian Vacations

The Next-Product tab calls `generate-product-cards`. Its system prompt says (line 27, 223):

> Slot 2 — behavioral (from `persona_rollups[0]`)

So the behavioral card is **always** whatever rollup sits at index 0 of the array we send. Today that order is whatever `synthesize-persona` returned — the LLM's own ordering — and is never re-sorted by spend on the client. In this run the model listed "Pet Care Routine" first, so it beat higher-spend rollups (Annual Hawaiian Vacations, ski portfolio, etc.) into Slot 2.

Confirmed from the code:
- `supabase/functions/synthesize-persona/index.ts:845` — returns `pillar_rollups: filteredSH.map(...)` with no sort.
- `src/pages/ExecDemoPage.tsx:438-615` — computes `totalSpend` and `totalCount` per rollup but preserves original order. No `.sort()` before it becomes `synthesis.pillarRollups`.
- `src/pages/ExecDemoPage.tsx:972` — sends `persona_rollups: synthesis?.pillarRollups || []` to `generate-product-cards` in that order.

## Fix

Deterministically send the highest-spend rollup as `persona_rollups[0]`.

### Change

`src/pages/ExecDemoPage.tsx`, inside the `pillarRollups` pipeline (right after the coherence filters, before the final `.map(({ _resolvedCategories, ...rest }) => rest)` around line 615), add:

```ts
.sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
```

That single sort makes `pillarRollups[0]` the top-spend behavioral pillar for the entire downstream pipeline.

### Downstream impact

- **Next-Product** (`generate-product-cards`): Slot 2 becomes the top-spend behavior — Annual Hawaiian Vacations, not Pet Care.
- **Next-Offer** (`generate-next-offers`): same array, same ordering benefit; the primary behavioral offer aligns with top spend.
- **Intel Panel pills**: Spending Habits row already reads from `synthesis.pillarRollups`, so its lead pill also becomes top-spend.

### What we're NOT changing

- No prompt edits — `generate-product-cards` already trusts `[0]`; we just make `[0]` correct.
- No changes to life-event or financial-signal ordering — those slots already work.
- No changes to `synthesize-persona` behavior — the model still surfaces habits freely; we order deterministically on the client.
- Pet Care remains in the pill list; it just no longer wins the single Slot-2 product card.

### Verification

Re-run the Demo tab for Sarah Mitchell:
- Intel Panel Spending Habits lead pill = Annual Hawaiian Vacations (highest $).
- Next-Product Slot 2 references tropical-getaway behavior (e.g. Travel Rewards Card copy).
