## Problem

On `/bankdemo`, clicking the **Demo** tab no longer shows the customer selection dialog. The earlier "suppress popup once demo is done" logic is over-suppressing: because the tab pre-fires analysis on mount (so results are ready when the user first opens Demo), `preFiredRef.current` flips to `true` immediately, which makes `hasRunOnce` `true` on the very first visit — so the dialog never opens.

Verified in `src/pages/ExecDemoPage.tsx` (lines 1345–1365): `hasRunOnce = preFiredRef.current || !!profileRef.current || !!personaSynthesis || !!enrichedTxs`. The `preFiredRef` term is the bug.

## Fix

Decouple "pre-fire happened" from "a run has completed":

1. In the `hasRunOnce` computation, drop `preFiredRef.current`. Base it only on real completion signals — `personaSynthesis` present (or `enrichedTxs` present as fallback). `profileRef.current` should also be excluded because the pre-fire sets it before results exist; use `personaSynthesis` as the single source of truth for "the demo has been walked through."
2. Keep the pre-fire behavior intact so results are warm when the user opens Demo — but the dialog will still open the first time the user activates the tab, because completion hasn't happened yet.
3. Keep the "close on subsequent visits" behavior: once `personaSynthesis` exists, the effect will not re-open the dialog on later Demo-tab activations.
4. No changes to `ExecDemoSelectionDialog`, pre-fire trigger, or any other tab.

## Files

- `src/pages/ExecDemoPage.tsx` — adjust `hasRunOnce` definition around lines 1354–1365.

## Verification

- Fresh load of `/bankdemo` → click **Demo** tab → selection dialog opens.
- Complete a run → switch to another tab → return to **Demo** → dialog stays closed, cached results shown.
- Re-open via "Change customer" button still works (unchanged path).
