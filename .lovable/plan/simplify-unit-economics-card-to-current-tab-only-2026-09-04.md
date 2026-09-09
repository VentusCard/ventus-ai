# Simplify Unit Economics card to current tab only

## Goal
The Unit economics card in the three personalization tabs should show only the impact of the tab currently being viewed — no running/cumulative total across tabs.

## Changes (`src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx`)
1. Remove the cumulative logic: the `ALL_SURFACES` loop, `computed` array for all three surfaces, `recordContribution` persistence effect, the `contributions`/`stored` lookup, and the `total`/`partial` calculation.
2. Delete the "Running total" sub-card (Total / customer / yr + the three per-tab rows with "not generated" states).
3. Header now shows the current surface's impact value only (e.g. `$X / customer / yr`), dropping the "so far" suffix.
4. Keep unchanged: the current-surface metrics block (blue card with its line items), the Assumptions collapsible with editable fields + reset, the empty-state (no customer selected) minus its total sub-card, and the reveal animation for remaining blocks.
5. Clean up now-unused imports/exports. Check `personalizationUnitEconomics.ts`: if `recordContribution` / contributions state become unused anywhere else, leave the lib file intact (safe) or trim dead exports — trim only if clearly unused.

## Verification
- Typecheck + build pass.
- Playwright: on each of the three personalization tabs, select a customer and confirm the card shows only that tab's impact lines + header value, no cumulative total, and switching tabs shows different values.
