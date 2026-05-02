## Goal

In `src/components/exec-demo/NextConversationRationale.tsx`, the **AI Native Intelligence Layer** band currently has 3 rows (Inputs, Capabilities, Routes To) with 6 pills each. Add 2 more pills to each existing row, and add a 4th row labeled **Out of Scope** describing what the AI Banking Assistant explicitly will not do — phrased in the same short, parallel style as the existing rows.

## Changes

### `src/components/exec-demo/NextConversationRationale.tsx` — `CONTEXT_ROWS` (lines 4–57)

**Inputs (+2)** — currently: Transaction streams, Account holdings, Demographics, Loans & credit, KYC records, Digital telemetry. Add:
- `Card & merchant signals`
- `Geo & travel context`

**Capabilities (+2)** — currently: Check balances & transactions, Track spending & subscriptions, Surface offers & deals, Recommend bank products, Plan major purchases, Coach on goals & savings. Add:
- `Detect life events early`
- `Flag fraud & unusual activity`

**Routes To (+2)** — currently: Wealth advisors, Insurance specialists, Mortgage team, Business banking, Fraud operations, Branch staff. Add:
- `Card services`
- `Customer support`

**New row — Out of Scope** (4th entry in `CONTEXT_ROWS`):
- icon: `ShieldAlert` (already imported)
- accent: `bg-rose-500`
- labelClass: `text-rose-700`
- pillClass: `border-rose-200 bg-white text-rose-700`
- pills (parallel verb-led wording, kept short like the others):
  - `Move money or pay bills`
  - `Approve loans or credit lines`
  - `Give legal or tax advice`
  - `Trade securities`
  - `Open or close accounts`
  - `Negotiate fees`
  - `Replace human advisors`
  - `Make binding commitments`

The existing `ContextPillRows` renderer (lines 59–91) already maps over `CONTEXT_ROWS` and uses `divide-y` between rows, so the new row will appear with the same styling automatically. No layout changes needed; the wrap behavior handles the extra pills.

## Visual result

The intelligence band now has 4 rows. The first three are denser (8 pills each instead of 6), and a new rose-tinted **Out of Scope** row sits at the bottom, visually distinct from the blue/violet capability rows, making clear what the assistant intentionally does not do.

## Out of scope

- No changes to the two journey cards (Regular / Wealth) below the band.
- No changes to layout, spacing, or `ContextPillRows` rendering logic.
