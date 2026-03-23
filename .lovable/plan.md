

## Use Color-Coded Source Pills for "Currently Held" in Financial Journey

### Problem
The Financial Journey view shows held products as plain grey badges. The left panel already uses color-coded source pills (purple for Premium Card, emerald for Cashback Card, blue for Travel Card, etc.). These should match.

### Change

**File: `src/components/demo/DemoFinancialJourneyView.tsx`**

In the "Currently Held" section (~lines 286-296), replace the generic grey `Badge` rendering with color-coded pills matching the customer panel's source color scheme:

- Extract a shared `SOURCE_PILL_COLOR` map (or inline it):
  - Checking → `bg-slate-100 text-slate-600`
  - Cashback Card / Basic Cashback → `bg-emerald-50 text-emerald-700`
  - Travel Card / Travel Rewards → `bg-blue-50 text-blue-700`
  - Premium Card / World Elite → `bg-purple-50 text-purple-700`
  - HSA → `bg-amber-50 text-amber-700`
  - Savings → `bg-teal-50 text-teal-700`
  - Fallback → `bg-slate-50 text-slate-500`

- Display the **source name** (e.g., "Premium Card") rather than the mapped product name (e.g., "World Elite"), since that's what users see in the input panel. Show both if useful: "Premium Card" as the pill label.

- Actually, since `heldProducts` currently stores mapped product names ("World Elite"), we need to also track the original source names. We'll create a `heldSources` set from `sampleTransactions` sources, and display those as colored pills. The product names continue to be used internally for opportunity filtering.

### Layout
```text
Currently Held
[Checking] [Premium Card] [Cashback Card] [Travel Card] [HSA]
 (grey)     (purple)       (emerald)       (blue)        (amber)
```

### Files Modified
- `src/components/demo/DemoFinancialJourneyView.tsx` — update held products display to use color-coded source pills

