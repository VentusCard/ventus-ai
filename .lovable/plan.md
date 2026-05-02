## Goal

On the Next-Conversation tab, add a context band of **three pill rows** at the top of the panel — visually mirroring the "Current Holdings" and "Product Catalog" pill rows used on the Next-Product tab. The three rows describe what the AI assistant has access to and where it can route the customer:

1. **Data Ingestion** — Transaction streams · Account holdings · Demographics · Loans & credit · KYC records · Digital telemetry
2. **Capabilities** — Check balances & transactions · Track spending & subscriptions · Surface offers & deals · Recommend bank products · Plan major purchases · Coach on goals & savings
3. **Routes To** — Wealth advisors · Insurance specialists · Mortgage team · Business banking · Fraud operations · Branch staff

## File

`src/components/exec-demo/NextConversationRationale.tsx`

## Changes

### 1. New `ContextPillRows` component (added near top of file, after imports)

A small presentational component that renders three labeled flex-wrap rows, matching the style used by `CurrentHoldingsPills` / `RecommendedProductsPills` in `NextProductRationale.tsx`:

- Tiny uppercase label on the left: `text-[9px] font-bold text-slate-400 uppercase tracking-wider`
- Each pill: `inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border` with a tiny lucide icon
- Color per row to keep them visually distinct but quiet:
  - **Data Ingestion** — slate (`text-slate-700 bg-slate-50 border-slate-200`), icon `Database`
  - **Capabilities** — blue (`text-blue-700 bg-blue-50 border-blue-100`), icon `Sparkles`
  - **Routes To** — violet (`text-violet-700 bg-violet-50 border-violet-100`), icon `Send` / `ArrowUpRight`

Per-pill icon (small, optional) keeps it consistent with the Holdings row's `CheckCircle2`. We can use a single neutral icon per row, or no icons inside the pills (just text) — recommendation: **no per-pill icon** to keep density manageable across 6 items per row. Only the row label gets a leading icon.

### 2. Insert into the render

Inside the main return (around line 770–772), insert the new component **above** the existing stacked Regular/Wealth grid, so the panel becomes:

```text
┌─ Context (3 pill rows) ─────────────────┐
│  Data Ingestion: [pill] [pill] ...      │
│  Capabilities:   [pill] [pill] ...      │
│  Routes To:      [pill] [pill] ...      │
├─────────────────────────────────────────┤
│  Regular Client                         │
│   …existing automated flow + chatbot …  │
│   [Open AI Banking Assistant]           │
├─────────────────────────────────────────┤
│  Wealth Client (+)                      │
│   …existing signals + prepped + WM …    │
└─────────────────────────────────────────┘
```

The context block sits as a sibling above the `flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto …` scroll container, so it stays pinned at the top while Regular/Wealth scrolls.

Outer wrapper change (around line 770):

```tsx
<div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-2.5 flex flex-col h-full min-h-0">
  <ContextPillRows />              {/* NEW — pinned context band */}
  <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto exec-light-scroll pr-1">
    {/* existing Regular + Wealth stack — unchanged */}
  </div>
</div>
```

### 3. Imports

Add `Database` to the existing `lucide-react` import (the rest — `Sparkles`, `Send` — are already imported).

## Notes

- No copy edits to existing Regular/Wealth content.
- No changes to Next-Offer or Next-Product tabs.
- Strict light theme preserved. Pills stay tiny (`text-[10px]`) to fit alongside the dense panel.
- The block is static (no data binding) — same approach as the existing `PRODUCT_CATALOG` constant on Next-Product.