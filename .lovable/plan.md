# Automated Flows — make every number add up

An audit of the Automated Flows tab found four places where displayed parts do not sum to the total they belong to, plus a scale mismatch with the rest of the demo.

## What's wrong today

1. **Risk filters don't sum.** Each filter row shows "removes X" computed against the full triggered audience, but the total removed at the bottom is computed multiplicatively (filters stacked). With 3 filters the rows visibly add up to far more than the stated total. Turned-off filters also still display a removal number.
2. **Signal audiences drift.** Each signal's audience is rounded independently, so the enabled signal rows do not exactly equal the "Triggered audience" line.
3. **Display rounding hides the math.** Numbers are shown as "1.2M" / "340K", so even correct parts appear not to sum.
4. **Governance card counts conflict.** Owner sign-off shows "approved / total" where approved + pending is 9 short of the total, and the internal "live flows" figure subtracts signal-level pending counts from a product count (mixing two different units).
5. **Scale mismatch.** Flow audiences are written against a ~250M base — the largest flow is 124M — while the rest of the demo uses a 68.2M customer book.

## What will change

**Audience scale**
- Rescale every flow's estimated audience proportionally onto the 68.2M book so no flow exceeds it and the figures line up with the Intelligence Database.

**Signals sum to the triggered audience**
- Allocate signal audiences with a largest-remainder split so the enabled rows add up exactly to the triggered audience, and the full set adds up exactly to the flow audience.

**Filters sum to the total removed**
- Show each filter's removal against the audience remaining after the filters above it (a cascade), so the rows add up exactly to the stated total removed, and triggered − total removed = qualified exactly.
- Disabled filters show "—" instead of a removal number.
- The last filter absorbs the rounding remainder so the sum is exact.

**Consistent display**
- Use one shared number formatter across the tab so a total and its parts are rounded at the same precision, and use enough precision that the parts visibly add up.

**Governance card**
- Fix the approval gates so approved + pending = total at both the marketing and owner stages.
- Compute the "live" figure in the same unit as the label it sits under.
- Keep channel coverage as-is (channels genuinely overlap) but keep the "channels overlap and do not sum" note visible.

## Technical notes

- `src/lib/productAutomatedFlows.ts` — rescale `estimatedAudience` values to the 68.2M book using `BOOK_CUSTOMERS` from `src/lib/bookScale.ts`; update the stale "out of ~250M" comment.
- `src/lib/flowSignalFamilies.ts` — replace per-signal `Math.round(total * weight / totalWeight)` with a largest-remainder allocator; export a `filterCascade(triggered, filters, enabled)` helper returning per-filter removals that sum exactly to `triggered − qualified`.
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` — consume the allocator and cascade instead of computing `Math.round(triggered * (1 - f.passRate))` per row; route all display through one formatter.
- `src/components/tepilot/campaigns/data/flowGovernance.ts` — correct `owner.approved`, `live`, and `readySignals` arithmetic.

## Verification

- Build the project.
- Run a script that, for every flow, asserts: signal audiences sum to the flow audience, enabled signals sum to the triggered audience, filter removals sum to total removed, and triggered − removed = qualified.
- Playwright-check an expanded flow on `/bankdemo` to confirm the on-screen numbers add up.
