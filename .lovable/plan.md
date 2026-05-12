Normalize text sizes and weights across the customer-selection dialog so it reads as one consistent type system.

## Type scale (target)

- **Dialog title** ("Select a Customer Profile"): `text-base font-semibold` (down from `text-lg font-bold`) — matches enterprise dialogs and reduces top-heaviness
- **Subtitle** under title: keep `text-xs text-slate-500` (down from `text-sm text-slate-400`) — currently too long and too prominent
- **Customer pills**: keep `text-xs font-semibold` ✓ (already consistent)
- **Card header pill labels** (KYC / Source name / Digital Telemetry): `text-xs font-medium` ✓ (already consistent)
- **Card header primary value** (kycStatus / "{n} txns" / "Coming soon"): standardize to `text-sm font-semibold text-slate-700` ✓ (already consistent)
- **Card header secondary** (totals / "Last reviewed …" / "App, web & device signals"): standardize to `text-xs text-slate-500` — fixes the source-card total which is currently `text-sm` and visually out-of-step
- **Section meta row** ("N transactions · M sources" / "Expand all"): keep `text-xs` ✓
- **Table headers**: keep `text-xs uppercase` ✓
- **Table body cells**: standardize ID + Zip to `text-xs`, all other cells to `text-[13px]` (down from mixed `text-sm`) — current mix of `text-xs` (id, zip, mcc pill) and `text-sm` (date, merchant, description, amount) creates jagged rhythm; tightening body to 13px keeps density
- **KYC grid labels**: bump from `text-[10px]` to `text-[11px] uppercase` — 10px is below comfortable read size
- **KYC grid values**: keep `text-sm` ✓
- **Custom-flow step labels** ("1. Describe a persona" / "2. Paste LLM output"): keep `text-xs uppercase` ✓
- **Custom-flow textareas + buttons**: keep `text-sm` ✓
- **Footer "Start" button**: down from `text-base` to `text-sm font-semibold`, reduce padding from `py-3.5` to `py-3` — currently disproportionately large for a one-word CTA

## Specific edits in `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

1. **Line 166** title: `text-lg font-bold` → `text-base font-semibold`
2. **Line 168** subtitle: `text-sm text-slate-400` → `text-xs text-slate-500`
3. **Line 349** source total: `text-sm font-mono tabular-nums text-slate-600` → `text-xs font-mono tabular-nums text-slate-500`
4. **Line 293** KYC "Last reviewed": already `text-xs text-slate-500` ✓ (no change)
5. **Lines 397, 401, 416, 421** table cells: `text-sm` → `text-[13px]`
6. **Line 318** KYC labels: `text-[10px]` → `text-[11px]`
7. **Line 463** Start button: `text-base font-semibold ... py-3.5` → `text-sm font-semibold ... py-3`

No structural changes, no logic changes. Only typography tokens.