## Goal
When an external-intel pill is active, the enrichment table swaps to a dedicated external-signal view: a violet "External Signal" Tier-1 band, its own Tier-2 headers (not the transaction ones), and a single data row.

All edits in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`.

## External-signal column schema

| Col | Label | Content |
|---|---|---|
| 1 | Source | Violet "External" chip with sparkle icon |
| 2 | Provider | `activeExternal.provider` |
| 3 | Signal | `activeExternal.headline` (bold) |
| 4 | Type | One of `Spending Habit` / `Life Event` / `Risk`, derived from `activeExternal.category` |
| 5 | Confidence | `NN%` pill |

No Detail column, no Category (raw), no Evidence column.

### Type mapping (from `activeExternal.category`)
- Anything containing `spend`, `habit`, `merchant`, `travel_spend`, `dining` → **Spending Habit**
- Anything containing `life`, `event`, `renewal`, `move`, `wedding`, `baby`, `home`, `loan`, `car` → **Life Event**
- Anything containing `risk`, `fraud`, `default`, `delinquency`, `credit` → **Risk**
- Fallback → **Life Event**

Type pill colors: Spending Habit = blue, Life Event = violet, Risk = red.

## Changes in `ExecDemoEnrichmentTable.tsx`

1. **colgroup**: render a 5-column colgroup with proportional widths when `activeExternal`; otherwise keep the current 10-column colgroup.
2. **Tier-1 header**: change `colSpan` from 10 → 5 when active (violet "External Signal · sourced from outside data provider" band stays).
3. **Tier-2 header**: branch on `activeExternal` — render the 5 labels (Source / Provider / Signal / Type / Confidence) with a light violet background instead of the transaction labels.
4. **Data row**: replace the current 10-cell row with a 5-cell row using the new schema and violet `exec-ext-highlighted` styling.
5. Keep `min-w-[912px]` on the `<table>` so the wrapper width stays stable across modes.

## Out of scope
No changes to intel panel pills, signal data model, downstream product/offer generation, or the bottom externals list in the default view.

## Verification
Click "Car Loan Renewal" pill → violet Tier-1 band, second header row shows exactly Source / Provider / Signal / Type / Confidence, one violet row shows the signal with Type = "Life Event". Clear → transaction headers and rows return.
