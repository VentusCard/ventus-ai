

# Plan: Simplify Evidence Transactions - 2-Line Layout, Chronological Order

## Overview
Remove card/account grouping and display transactions as a flat list with a compact 2-line format, sorted by date (oldest to newest).

## Layout

Each transaction shows:
- **Line 1:** Merchant name + account badge on left, amount + date on right
- **Line 2:** Relevance text (muted)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Check #1042 - Estate Attorney  [Primary Checking ...5678]  $2,500  Jan 12│
│ Estate planning legal fees                                           │
├──────────────────────────────────────────────────────────────────────┤
│ Fidelity Investments  [Platinum Rewards ...4532]          $6,500  Jan 15│
│ 401k contribution increase                                           │
├──────────────────────────────────────────────────────────────────────┤
│ Viking Cruises  [Travel Elite ...2234]                    $8,500  Jan 20│
│ Retirement travel planning                                           │
└──────────────────────────────────────────────────────────────────────┘
```

## Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

**Remove:**
- `groupByCard` function
- `expandedCards` state and `toggleCard` handler
- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports
- `ChevronDown` import

**Add:**
- Sort transactions by date before rendering

**Replace grouped structure with:**
```tsx
{[...transactions]
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((txn, idx) => (
    <div key={idx} className="py-2 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">{txn.merchant}</span>
          <Badge variant="outline" className="text-xs">{txn.cardType} ...{txn.cardLast4}</Badge>
        </div>
        <div className="text-right text-sm">
          <span className="font-medium">{formatAmount(txn.amount)}</span>
          <span className="text-slate-400 ml-2">{txn.date}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1">{txn.relevance}</p>
    </div>
  ))}
```

