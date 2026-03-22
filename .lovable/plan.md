

## Trip-Fare Matching: Active Flight-to-Trip Assignment

### Problem
When a cardholder books multiple flights (e.g. two "DELTA AIR" charges on the same day), the current system has no mechanism to figure out which fare belongs to which trip. This also applies when someone pays for another person's trip on their card.

### Solution: Two-Phase Trip Resolution

Add a **post-classification reconciliation step** in the edge function that actively matches unassigned flight/fare transactions to detected trips using price heuristics, date proximity, and route inference.

**Phase 1 — Trip Detection (existing):** AI identifies trips from hotel anchors, destination merchants, and temporal clusters. This already works well.

**Phase 2 — Fare Reconciliation (new):** After trips are identified, a second pass matches orphaned flight/fare transactions to trips using:

1. **Price-distance heuristic** — Domestic flights (e.g. Florida) are typically $150–$400; international flights (e.g. Paris) are $500–$1500+. Match fare amounts to likely destination distance.
2. **Date proximity** — Match each fare to the trip whose start date is closest (booking date → nearest trip start).
3. **Fare pairing** — Round-trip fares often appear as two charges of similar amounts. Pair them, then assign the pair to the trip window they bracket.
4. **Third-party trip inference** — If more fares exist than trips the cardholder took (detected via spending gaps), flag extras as "paid for others" with a `third_party_likely: true` field.

### Technical Changes

**File: `supabase/functions/travel-detection/index.ts`**

1. **Expand the AI prompt** to add a new section instructing the model to:
   - When multiple flight charges exist, compare amounts and assign cheaper fares to domestic trips and pricier fares to international trips
   - Look for fare pairs (similar amounts from same airline) and bracket them around trip windows
   - If fare count exceeds detected trip count, mark surplus fares as `third_party_likely: true`
   - Use date proximity as a tiebreaker: assign each fare to the trip starting closest to the charge date

2. **Expand the tool schema** to add new optional fields:
   - `fare_match_confidence`: "high" | "medium" | "low"
   - `fare_match_reason`: string explaining why this fare was assigned to this trip
   - `third_party_likely`: boolean

3. **Add post-processing reconciliation** after AI results come back:
   - Collect all flight/airline transactions
   - Collect all identified trips (unique trip_labels)
   - For any flight not already assigned to a trip, run the price-distance + date-proximity matching
   - If more flights than trips × 2, flag extras as third-party

**File: `src/lib/travelPreFilter.ts`**

4. **Add fare metadata to candidates** — When a transaction matches a travel anchor that is an airline, tag it with `anchor_type: 'flight'` and preserve the amount so the edge function can use it for matching.

### Prompt Addition (key excerpt)

```
FLIGHT-TO-TRIP MATCHING:
When you see multiple flight charges (airlines), actively assign each to a trip:
1. PRICE SIGNAL: International trips (Europe, Asia) = fares $500+. Domestic US = $150-$400.
   Example: Two DELTA charges - $289 and $1,142. The $289 likely = Florida, $1,142 likely = Paris.
2. DATE PROXIMITY: Match fares to the trip starting closest to the charge date.
3. FARE PAIRS: Two similar amounts from same airline = round-trip. Bracket them around a trip.
4. SURPLUS FARES: If you see more flight charges than trips detected, mark extras as
   third_party_likely: true with reason "Fare does not match any detected trip window".
```

### What This Solves
- Two "DELTA" charges → cheaper one assigned to Florida trip, expensive to Paris trip
- Someone paying for a friend's flight → flagged as third-party when no matching trip exists
- Back-to-back bookings on same day → separated by price and date proximity to each trip window

