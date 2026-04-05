

## Use Real Sample Data for Exec Demo Transactions

### Problem
Each exec demo profile currently has ~12 hand-written transactions with a matching 12-entry `signalMap`. The actual sample CSVs in `sampleData.ts` have 75–248 rows per customer. The demo should use this real data so the transaction feed and signal accumulator feel substantial and realistic.

### Approach
Parse each customer's CSV at module load time and build the `transactions` array and `signalMap` automatically from the real data.

### Changes

**1. `src/components/exec-demo/execDemoData.ts`**

- Import the 6 CSV constants from `@/lib/sampleData`
- Add a helper function `parseCsvToTransactions(csv: string): Transaction[]` that:
  - Splits by newline, skips header
  - Extracts `merchant_name` → `merchant`, formats `amount` with `$`, masks `source` into `••XXXX` style account labels
  - Returns 75+ Transaction objects per customer
- Add a helper function `buildSignalMap(transactions: Transaction[]): Record<number, SignalEntry>` that:
  - Maps each transaction's MCC code or merchant name to a `{ pillar, label }` using a lookup table (e.g., MCC 5411 → `Food & Dining / Grocery`, MCC 4511 → `Travel & Transport / Airlines`, MCC 7997 → `Wellness & Fitness / Gym`, etc.)
  - Covers ~20 common MCC ranges plus merchant-name fallbacks for edge cases
  - Every transaction gets a signal entry so the pill accumulator builds continuously
- Replace the hardcoded `transactions` and `signalMap` in each of the 6 `EXEC_PROFILES` with calls to these helpers, passing the matching CSV
- Keep the `intelligence` cards (analytics, rewards, relationship) as-is but update their `txIndices` to reference meaningful indices in the larger dataset
- Keep `persona.pills` as-is (they're display labels, not data-driven)

**2. `src/pages/ExecDemoPage.tsx`**

- Adjust scroll timing: with 75+ transactions, the `signalInterval` calculation (`TIMINGS.scroll / txCount`) will naturally space signals closer together, creating a faster-feeling accumulation
- May need to increase `TIMINGS.scroll` slightly (e.g., 6000ms instead of 4800ms) so individual signals are still visible
- The `cardScan` `txIndices` will need updating to match the new larger transaction array indices

**3. `src/components/exec-demo/ExecDemoLeftPanel.tsx`**

- The scroll animation CSS (`exec-rapid-scroll`) may need a larger `translateY` percentage since 75+ rows means a much taller virtual list
- Consider capping the rendered list to avoid DOM bloat — render only the first ~80 rows plus a duplicate set for the scroll loop

### MCC → Signal Mapping (core lookup)
```text
4511        → Travel & Transport / Airlines
7011        → Travel & Transport / Hotels
4121        → Travel & Transport / Rideshare
5541        → Travel & Transport / Gas
5411        → Food & Dining / Grocery
5812/5814   → Food & Dining / Dining
7997        → Wellness & Fitness / Gym
7298        → Wellness & Fitness / Spa
5651/5661   → Shopping / Apparel
5977        → Shopping / Beauty
5942        → Shopping / Books
5995        → Pets & Care / Pet Care
4899        → Entertainment / Streaming
7922/7832   → Entertainment / Events
5211/5712   → Home & Living / Home Improvement
8299        → Education / Test Prep
...etc
```

### Files
1. `src/components/exec-demo/execDemoData.ts` — major rewrite: parse CSVs, auto-build transactions + signalMap
2. `src/pages/ExecDemoPage.tsx` — adjust timing constants for larger datasets
3. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — adjust scroll animation for longer lists

