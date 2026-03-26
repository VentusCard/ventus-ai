

## Plan: Normalize Travel Destination Names

### Problem
The AI model returns inconsistent destination names across batches — e.g., "New York" vs "New York City" — which creates duplicate trips in the timeline because `trip_label` uses the raw destination string.

### Solution
Add a destination normalization step in `supabase/functions/travel-detection/index.ts` after all batches complete, before trip labels are built.

### Changes — `supabase/functions/travel-detection/index.ts`

**1. Add a normalization map (~line 360, before the trip-grouping logic)**

```typescript
const DESTINATION_ALIASES: Record<string, string> = {
  "new york city": "New York",
  "nyc": "New York",
  "manhattan": "New York",
  "brooklyn": "New York",
  "los angeles": "Los Angeles",
  "la": "Los Angeles",
  "san francisco": "San Francisco",
  "sf": "San Francisco",
  "washington dc": "Washington D.C.",
  "washington d.c.": "Washington D.C.",
  "dc": "Washington D.C.",
  // Add more as needed
};

function normalizeDestination(dest: string): string {
  return DESTINATION_ALIASES[dest.toLowerCase().trim()] || dest.trim();
}
```

**2. Apply normalization to all updates before trip grouping (~line 368)**

After raw updates are collected from all batches, normalize every `travel_destination`:

```typescript
updates.forEach(u => {
  if (u.travel_destination) {
    u.travel_destination = normalizeDestination(u.travel_destination);
  }
});
```

This runs before the `seenTrips` dedup logic and before `trip_label` construction, so all downstream grouping uses consistent names.

**3. Redeploy the edge function**

