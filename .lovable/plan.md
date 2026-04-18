
## Goal
Make the Shopping Pattern card reliably show real purchase timing signals on Next-Offer: cadence, seasonality/timeline, and richer subcategory language such as “monthly vet visits” or “Hawaiian vacations annually in July.”

## What I found
The card UI is already built, but the data feeding it is fragile:

1. `parseCsvToTransactions()` converts dates to `MM/DD/YY`
2. `PurchaseCycleTimeline.tsx > parseDate()` assumes `MM/DD/YYYY`
3. That causes many Sarah dates to parse incorrectly, so:
   - cadence never computes
   - seasonality/timeline never computes
   - active span can disappear
   - `totalSpend` may stay `0` because it is currently summed only inside the “valid date” loop

There is also a second quality issue:
4. subcategory insight is derived from `signalMap`, which is okay as a fallback, but not explicit enough for richer phrases unless the classified subcategory is available cleanly

## Implementation plan

### 1. Fix the date pipeline so cadence can actually render
Update `src/components/exec-demo/PurchaseCycleTimeline.tsx`:
- make `parseDate()` support both `MM/DD/YY` and `MM/DD/YYYY`
- keep ISO support intact
- stop tying spend calculation to successful date parsing

Result:
- Sarah’s travel / pet / dining rollups can compute recurring intervals
- annual month concentration like July can show up again
- sparkline and active-span become reliable

### 2. Make cadence + seasonality output more human
Still in `PurchaseCycleTimeline.tsx`:
- preserve the existing cadence logic, but ensure it produces plain-English phrases like:
  - `every ~28 days`
  - `roughly once a year`
- convert strong month concentration into more natural copy:
  - `annually in Jul`
  - `Jul–Sep heavy`

### 3. Ensure the summary line prefers meaningful purchase language
Refine the summary generation so it uses the strongest available signal:
- top subcategory when it is dominant
- otherwise rollup label
- combine with cadence/seasonality when available

Examples:
- `Monthly veterinary visits at Banfield`
- `Annual Hawaiian travel every Jul, mostly at Hawaiian Airlines`
- `Weekly Italian dining at Carbone`

### 4. Improve subcategory sourcing
In `PurchaseCycleTimeline.tsx`, update the subcategory mix logic to prefer:
- classified subcategory / signal label when present
- then category
- ignore generic placeholders

If needed after reading the live data shape during implementation, I’ll thread a cleaner enriched-subcategory field down from `ExecDemoPage.tsx`, but I expect the existing classified `signalMap` to be enough once timing works.

### 5. End-to-end verify on `/demo` with Sarah
After implementation, test Sarah specifically on Next-Offer and confirm at least one selected persona shows:
- a visible cadence row
- a visible seasonality/timeline insight when applicable
- a populated sparkline
- richer summary language than the current generic card

## Files likely to change
- `src/components/exec-demo/PurchaseCycleTimeline.tsx`
- possibly `src/components/exec-demo/execDemoData.ts` only if a cleaner date or subcategory field needs to be passed through

## Expected outcome
On Sarah, the Shopping Pattern card should stop looking generic and start reading like actual purchase behavior, for example:
- Pet Care: monthly vet-related behavior
- Travel: Hawaii-heavy annual travel concentrated in July
- Dining: recurring cuisine-specific dining pattern when the data supports it
