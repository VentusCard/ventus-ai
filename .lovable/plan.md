

## Plan: Add `trip_label` Field to Travel Detection (Preserve Original Classification)

### Core Idea

Instead of reclassifying transactions (changing pillar to "Travel & Exploration", overwriting subcategories), travel detection adds a **`trip_label`** string that encodes the trip compactly:

```
"260301:260315 Banff Trip"
"260612:260615 Miami Trip"
```

Format: `YYMMDD:YYMMDD Destination Trip`

Non-travel transactions get `trip_label: null`. The original pillar/category/subcategories stay **untouched**.

### Why This Is Better

- Original classification preserved — a Shell gas station during a Banff trip stays "Home & Living / Local Commuting / Gas" 
- Trip grouping becomes trivial: group by `trip_label`
- TravelTimeline and other downstream views parse the label instead of reconstructing trips from `travel_context` fields
- The label is human-readable and sortable

### Files Changed

| File | Change |
|---|---|
| `src/types/transaction.ts` | Add `trip_label?: string` to `EnrichedTransaction` |
| `supabase/functions/travel-detection/index.ts` | Add `trip_label` to AI tool schema output; build label from destination + dates |
| `src/hooks/useSSEEnrichment.ts` | **Stop overwriting pillar/subcategories**; just set `trip_label` and `travel_context` |
| `src/components/tepilot/ResultsTable.tsx` | Add "Trip" column showing `trip_label` as a compact badge (e.g., `✈ 260301:260315 Banff`) |
| `src/components/tepilot/insights/TravelTimeline.tsx` | Simplify `groupTransactionsByTrip` — group by `trip_label` instead of composite key from `travel_context` |
| `src/components/tepilot/AfterInsightsPanel.tsx` | Use `trip_label` for travel metrics instead of pillar check |
| `src/lib/advisorContextBuilder.ts` | Use `trip_label` for travel context building |
| `src/lib/geoLocationUtils.ts` | Use `trip_label` for geo aggregation |
| `src/lib/achievementEngine.ts` | Use `trip_label` for travel achievement checks |
| `src/components/demo/DemoEnrichmentTableView.tsx` | Add Trip column |

### Key Implementation Details

**1. Type addition:**
```typescript
export interface EnrichedTransaction extends Transaction {
  // ... existing fields unchanged
  trip_label?: string | null;  // e.g. "260301:260315 Banff Trip"
  travel_context?: { ... };    // kept for detailed metadata
}
```

**2. Edge function — build label from AI output:**
The AI still returns `is_travel_related`, `travel_destination`, `travel_period_start/end`. The edge function constructs the label:
```typescript
function buildTripLabel(update: any): string | null {
  if (!update.is_travel_related || !update.travel_destination || !update.travel_period_start) return null;
  const start = update.travel_period_start.replace(/-/g, '').slice(2); // "260301"
  const end = (update.travel_period_end || update.travel_period_start).replace(/-/g, '').slice(2);
  return `${start}:${end} ${update.travel_destination} Trip`;
}
```

**3. useSSEEnrichment — stop overwriting classification:**
```typescript
// BEFORE (current): overwrites pillar + subcategories
updated[idx].pillar = "Travel & Exploration";
updated[idx].subcategory = travelUpdate.reclassified_subcategory;

// AFTER: just add label + context, keep original classification
updated[idx].trip_label = travelUpdate.trip_label;
updated[idx].travel_context = { ... };
// pillar, category, subcategories UNTOUCHED
```

**4. TravelTimeline — simplified grouping:**
```typescript
// Group by trip_label instead of composite key
const tripMap = new Map<string, EnrichedTransaction[]>();
transactions
  .filter(t => t.trip_label)
  .forEach(t => {
    if (!tripMap.has(t.trip_label!)) tripMap.set(t.trip_label!, []);
    tripMap.get(t.trip_label!)!.push(t);
  });
```

**5. ResultsTable — Trip column:**
Shows a small `✈ Banff` badge on travel rows, with tooltip showing full label. Non-travel rows show "—".

### What Stays the Same
- `travel_context` object is still populated for detailed metadata (destination, dates, original_pillar, reason)
- The AI prompt and tool schema in `travel-detection` stay largely the same — only the response processing adds the label construction
- Demo sub-views (DemoTravelView, etc.) still work with `travel_context`

