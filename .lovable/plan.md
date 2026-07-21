## Change

On the Next-Product tab of `/bankdemo`, remove three UI blocks from `src/components/exec-demo/NextProductRationale.tsx`:

1. **Current Holdings pills row** — the `<CurrentHoldingsPills />` render at line 957.
2. **Product Catalog pills row** — the `<RecommendedProductsPills />` render at line 961.
3. **Creditworthiness banner** — the `<CreditworthinessBanner />` render at line 973, plus the surrounding flex wrapper if it only existed to sit "side-by-side" with the delivery-channel selector. Restore the delivery-channel selector to full width.

Also delete the now-unused component definitions (`CurrentHoldingsPills`, `RecommendedProductsPills`, `PRODUCT_CATALOG`, `CreditworthinessBanner`) and prune any imports that go unused (e.g. `CheckCircle2`, `Star`, `CreditAssessment` type import if no other consumers).

Leave props like `creditAssessment` / `creditLoading` in place on the component signature only if other siblings still use them — if not, remove them from the interface and stop passing them from `ExecDemoPage.tsx`. The upstream `fireCreditAssessment` edge-function call and state are **out of scope** (kept intact) so no backend behavior changes.

## Out of scope

- No changes to the creditworthiness edge function or its state in `ExecDemoPage.tsx`.
- No changes to product-card generation, pill logic, or other tabs.
