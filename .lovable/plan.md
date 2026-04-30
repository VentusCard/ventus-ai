## Goal
The third column's pill in Next-Product currently says "✦ Sports Betting" (an auto-matched behavioral pillar). Replace it with the first **risk rollup** pill that's already shown in the rollup row above (e.g. "Gambling 3 txns · high").

## Changes

**`src/components/exec-demo/NextProductRationale.tsx`**

1. Add `riskFlags?: { flags: any[]; summary: string } | null` to `Props`; destructure in the component.

2. Add a small helper `getFirstRiskRollup(riskFlags)` that mirrors the existing rollup logic in `ExecDemoIntelPanel.tsx` (lines 535–582):
   - Group flags by category_group (vice→gambling/adult, financial_distress→financial_vulnerability, suspicious_international, aml, fallback to raw label).
   - Dedupe by `transaction_id::key`.
   - Severity = max in group; count = unique tx count.
   - Sort by `ORDER` then return the first `{ label, severity, count }`.

3. In `renderColumn` for `idx >= 2` only:
   - Compute `firstRisk = getFirstRiskRollup(riskFlags)` once outside `renderColumn`.
   - When `firstRisk` exists, render the third column's pill with:
     - Label: `firstRisk.label` (e.g. "Gambling")
     - Suffix: `{firstRisk.count} txns · {firstRisk.severity}` (e.g. "3 txns · high"), formatted identically to the rollup row.
     - Red color tokens (use `getColor("Risk")` or hardcode `#ef4444` family — same red palette as the rollup pill).
     - Click handler: skip click since we don't have a tx-index list to drive a phone overlay.
   - If `firstRisk` is null, fall back to current behavior.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`** (line 800)
- Pass `riskFlags={riskFlags}` to `<NextProductRationale ... />`.

## Notes
- Reuses existing risk rollup data — no new API calls.
- Strict light theme preserved; red is reserved for risk per existing palette rule.
