

## Goal

In the Next-Product rationale cards, replace the LLM-generated `signal_label` (e.g. "Tropical Getaways") with the **exact persona pill** from the top Behavioral Intelligence panel — e.g. `✦ Annual Premium Hawaii Vacations  7 txns · $7.9k` (and for life-event cards, `✦ College Preparation for Dependent  4 txns · $3.9k`). Format must match the top pills 1:1 (✦ prefix, label, txns · spend stat).

## Root cause

`NextProductRationale.tsx` renders `card.signal_label` directly. That string is whatever the `generate-product-cards` LLM invented and isn't tied to the synthesized rollup persona names shown above. We already have the source-of-truth data (`personaSynthesis.pillarRollups` with `label`, `totalCount`, `totalSpend`, plus `detectedLifeEvents` with `evidence`), but it's never passed down.

## Changes

### 1. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Pass `pillarRollups={rollupStats}` to `<NextProductRationale ... />` (line 695).

### 2. `src/components/exec-demo/NextProductRationale.tsx`
- Add `pillarRollups?: PillarRollup[]` to `Props`.
- For each product card, resolve the matching pill:
  - **behavioral** card → find best-match rollup by fuzzy comparing `card.signal_label` / `card.theme` against `rollup.label`, `rollup.pillar`, and `rollup.categories` (case-insensitive token overlap). Fall back to first rollup if multiple cards share the persona.
  - **life event** card → find matching `lifeEvent` by `event_name` (logic already exists).
- Render the resolved pill exactly like `PillarRollupChip` / life-event pill in `ExecDemoIntelPanel`: `✦` glyph + label + `{totalCount} txns · {formatSpend(totalSpend)}` (use `formatSpend` already in file). Drop the existing `card.signal_label` text and the locally-computed txn count/spend.
- Keep colors per existing logic (`getColor(rollup.pillar)` for behavioral, life-event colors as today). Preserve click behavior — pass the resolved label (rollup.label or event_name) into `onTriggerPillClick` so highlighting in the transactions panel still works.
- If no rollup match is found (rare fallback), fall back to current `card.signal_label` rendering so we never show an empty pill.

## Out of scope

- The top behavioral pills, life-event pills, transactions panel, and Next-Offer tab — all unchanged.
- The LLM prompt for `generate-product-cards` — `signal_label` still generated, just no longer displayed.

## Verification

1. `/demo` → Next-Product tab → each rationale card header shows the **exact same pill** as one in the top Behavioral Intelligence row (e.g. `✦ Annual Premium Hawaii Vacations  7 txns · $7.9k`), including the ✦ glyph and txn/spend stats.
2. Clicking the rationale pill still highlights matching transactions in the left panel.
3. Life-event cards (e.g. College Preparation) keep their amber styling and event-name label.

