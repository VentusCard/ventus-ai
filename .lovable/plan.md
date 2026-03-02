

## Interleave Transaction Sources Across Intelligence Cards

**Problem**: Transactions in each persona's array are currently grouped by account number. When an intelligence card selects consecutive indices (e.g. `[0,1,2,3,4,5]`), they all come from the same account — defeating the purpose of showing multi-source signal detection.

**Solution**: Reorder the `transactions` arrays for all 3 personas so that account numbers are interleaved/criss-crossed. Then adjust `txIndices` on each card to match the new positions.

**File**: `src/components/hero/EnrichmentMockup.tsx`

### Michael R. (lines 48-68)

Current order groups all `••4821` together, then `••9053`, etc. Reorder to interleave accounts so the feed shows transactions jumping between sources:

```
 ••4821  Home Depot         $847.00
 ••9053  Vail Resorts        $3,200.00
 ••7390  Whole Foods          $187.40
 ••2156  Benjamin Moore       $234.00
 ••4821  Lowe's              $312.50
 ••9053  United Airlines     $1,890.00
 ••7390  Trader Joe's         $94.20
 ••2156  Houzz Pro            $89.00
 ••4821  Pottery Barn        $1,245.00
 ••9053  Delta Sky Club       $45.00
 ••7390  Blue Apron           $62.00
 ••2156  West Elm             $567.00
 ••4821  Restoration Hardware $2,180.00
 ••9053  Marriott Bonvoy      $892.00
 ••7390  Peloton              $44.00
 ••2156  Crate & Barrel       $423.00
 ••4821  Ferguson             $489.00
 ••4821  Sherwin-Williams     $167.30
 ••2156  Ace Hardware          $78.50
```

Then update `txIndices` on each card to select the correct (now-scattered) transactions:
- **Analytics Intelligence**: indices pointing to Home Depot, Lowe's, Pottery Barn, Restoration Hardware, Ferguson, Sherwin-Williams (the renovation merchants, now spread across the list)
- **Smart Rewards**: indices pointing to Vail, United, Delta, Marriott
- **Relationship Intelligence**: all remaining indices

### Sarah & David L. (lines 111-131)

Same interleaving approach — shuffle `••3347`, `••8812`, `••5501`, `••6274` transactions so they alternate, then remap `txIndices`.

### Emily & James W. (lines 174-194)

Same — interleave `••6102`, `••7745`, `••3318`, `••9901` and remap indices.

### Summary

- Only data reordering and index remapping — no logic or component changes needed
- The color-coding from the previous change will now visually "criss-cross" in the feed since accounts alternate
- Each card's accumulated transactions will show mixed-color account badges, demonstrating cross-source signal detection
