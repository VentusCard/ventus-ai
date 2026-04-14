

# Horizontal Current vs. Recommended Cross-Check

## What we're building

A compact horizontal section at the top of the Next-Product intelligence panel that shows the customer's **current banking products** (left) connected via **logic pills** to **recommended next products** (right). This sits above the existing "N product cards generated → Consumer notifications ready" header.

```text
┌──────────────────────────────────────────────────────────────┐
│ CURRENT HOLDINGS              →           RECOMMENDED NEXT   │
│ ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│ │ ✓ Checking   │  │ Education ↑    │  │ 529 Plan         │  │
│ │   12 txns    │──│ Family of 4    │──│ Life Event       │  │
│ └──────────────┘  └────────────────┘  └──────────────────┘  │
│ ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│ │ ✓ Cashback   │  │ Travel Pattern │  │ Travel Rewards   │  │
│ │   42 txns    │──│ Spending ↑     │──│ Behavioral       │  │
│ └──────────────┘  └────────────────┘  └──────────────────┘  │
│ ✓ HSA (2)  ✓ Premium (4)  ✓ Travel (8)  ← unmatched       │
└──────────────────────────────────────────────────────────────┘
│ 2 product cards generated → Consumer notifications ready     │
│ [existing card rationale below...]                           │
```

## Technical changes

### 1. `src/components/exec-demo/execDemoData.ts`
- Add `source` field to the `Transaction` interface
- Parse the `source` column from CSV in `parseCsvToTransactions`

### 2. `src/components/exec-demo/NextProductRationale.tsx`
- Accept new `transactions` prop
- Add a `CurrentVsRecommended` sub-component rendered **above** the existing header
- **Left column**: Extract unique `source` values from transactions, render as green-tinted pills with transaction counts
- **Right column**: Render recommended products from `productCards` as themed pills (violet for behavioral, colored for life-event)
- **Center connector**: Logic pills showing the signal/trigger from each product card (e.g. "Education Spending ↑") with arrow connectors between matched current → recommended pairs
- Unmatched current products shown as smaller gray pills at the bottom

### 3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Pass `transactions` prop to `NextProductRationale`

