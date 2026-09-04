# Deepen the Intelligence Database signal families

## Current state

The five family cards on the Intelligence Database overview are driven by `FAMILY_SEED` in `src/lib/intelligenceSignalStats.ts`, which currently holds only **37 signals**: Behavioral 8, Life Event 8, Financial 8, Demographic 7, Risk 6.

The System tab's taxonomy (`SIGNALS` in `CapabilitiesView.tsx`) is far richer — **56 types**: Behavioral 11, Life Event 9, Financial 9, Demographic 13, Risk 14. So the two views disagree about how much the engine detects.

## What to build

Bring the Intelligence Database families up to the System taxonomy's 56 signal types, and make the expanded drawer handle the extra volume.

### 1. Expand the seed vocabulary to 56 signals

Rewrite `FAMILY_SEED` so each family carries the same count as the System taxonomy:

| Family | Now | Target |
| --- | --- | --- |
| Behavioral | 8 | 11 |
| Life Event | 8 | 9 |
| Financial | 8 | 9 |
| Demographic | 7 | 13 |
| Risk | 6 | 14 |

Each System taxonomy entry maps to a customer-level rollup, not a category name. The System list is the coverage checklist; the Intelligence Database phrases the same coverage as a behavior a banker can act on — e.g. the pillar `Sports & Active Living` becomes "Fitness studio regular", the risk bucket `Sports betting` becomes "Recurring sports-wagering activity". Every new signal gets a label, a population share, a 24h delta, an evidence line, and a confidence tier, matching the existing entry shape.

Copy rules already in force stay in force: vaguely specific behavioral phrasing, no exact per-customer amounts, opportunity framing rather than stress language, red reserved for the Risk family.

### 2. Keep the population math honest

Shares are recalibrated so, within each family, the signal populations stay consistent with that family's coverage of the 68.2M book and no signal exceeds its parent family. Family coverage percentages and the headline card numbers are unchanged, so the KPI strip and coverage strip stay reconciled.

### 3. Drawer shows top 9, expandable

`SignalFamilyPanel` currently renders every signal in one grid, which would jump to 14 rows for Risk. It will render the **top 9 by population** with a "Show all N signals" toggle that reveals the rest in place, and collapse back to 9. Ordering stays population-descending, the existing 3-column grid, strength pills and click-through-to-Customers behavior are unchanged.

### Scope

Intelligence Database only. The Customers directory, live signal stream, automated flows and personalization tabs keep their current vocabularies; new signals become clickable only insofar as the existing click-through already resolves labels.

## Technical notes

- `src/lib/intelligenceSignalStats.ts` — expand `FAMILY_SEED` to 56 seeds; shares rebalanced per family; no change to `LEGACY_BOOK` rebasing, `TIER_MIX`, or exported types.
- `src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx` — add local `showAll` state, slice to 9, add the toggle row.
- Verification: typecheck, build, and an authenticated Playwright pass on `/bankdemo` confirming each family card's signal count reads 11 / 9 / 9 / 13 / 14 and the drawer's expand toggle works.
