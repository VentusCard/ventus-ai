

## Diagnosis

The data flow `activeTriggerPill.label → activeTriggerLabel → activeOfferLabel → NextOfferRationale` IS wired correctly. So when you click "Home Purchase", `activeRollupLabel` arriving at `NextOfferRationale` IS `"Home Purchase"`.

The offer match logic (lines 159–171 of `NextOfferRationale.tsx`):
1. Exact normalized match against `offers[].rollup`
2. Falls back to bidirectional substring match (`r.includes(target) || target.includes(r)`)
3. Only if both fail → empty state

For "Home Purchase" to show "Upscale Hawaii Traveler" deals, the substring fallback must be matching incorrectly — but neither string contains the other. So the most likely real cause:

**The AI never generated a "Home Purchase" rollup in the response**, AND **the previous render of `selectedRollup`-driven offers (defaulting to first rollup, "Upscale Hawaii Traveler") is what you're seeing**. When `activeTriggerPill` is set, line 512 should switch `activeOfferLabel` to "Home Purchase" — but if `setActiveTriggerPill` isn't firing for some reason (e.g., the click handler short-circuits when `matchedIndices.length === 0`), `activeTriggerLabel` stays undefined and `selectedRollup?.label` ("Upscale Hawaii Traveler") wins.

Look at `ExecDemoIntelPanel.tsx` line 367 + 373:
```ts
const isClickable = matchedIndices.length > 0;
onClick={() => isClickable && onTriggerPillClick?.(...)}
```
If `evidenceMerchants` for "Home Purchase" don't fuzzy-match any transaction merchant, `matchedIndices = []`, `isClickable = false`, **the click does nothing**, and the previously-selected behavioral rollup's deals stay visible.

## Fix

### 1. `ExecDemoIntelPanel.tsx` — always allow life-event pill clicks
Remove the `matchedIndices.length > 0` gate. Even if no transactions match, clicking the pill should still set `activeTriggerPill` (with empty `indices`) so the offer panel switches and either shows that life event's deals or the "No offers generated for X yet" empty state. Visual indication of unclickability stays via opacity.

### 2. `ExecDemoPage.tsx` — clear `activeRollup` when life-event pill clicked
Already done in `handleTriggerPillClick`. ✓

### 3. `NextOfferRationale.tsx` — tighten the substring fallback
The bidirectional substring match is dangerous for short labels (e.g., a behavioral rollup named "Home" would match life-event "Home Purchase"). Replace with:
- Exact normalized match only
- If 0 hits AND the active label looks like a life event (pillar === "Life Event"), show clear "No offers generated for [label] yet" rather than fall through to substring matching.

Re-introduce `activeRollupPillar` for this guard (it's still being passed in from `PurchaseCycleTimeline`).

### 4. `ExecDemoPage.tsx` `fireNextOffers` — feed life events richer context
Life-event rollups currently send empty `categories: []`. Augment with the life event's matched-transaction pillar/category data so the AI has enough signal to actually generate a coherent group with the verbatim label:
```ts
const lifeEventRollups = (lifeEvents || []).map(e => {
  const evidenceMerchants = (e.evidence || []).map(ev => ev.merchant).filter(Boolean);
  // Pull pillars/categories from matched enriched txs
  const categories = [...new Set(
    enrichedTxs
      .filter(tx => evidenceMerchants.some(m => tx.merchant_name?.toLowerCase().includes(m.toLowerCase())))
      .map(tx => tx.category)
      .filter(Boolean)
  )].slice(0, 5);
  return {
    label: e.event_name,
    pillar: "Life Event",
    categories,
    topMerchants: evidenceMerchants,
    totalCount: evidenceMerchants.length || 1,
  };
});
```

### 5. Edge function reminder line in user prompt
In `generate-next-offers/index.ts`, strengthen the existing verbatim instruction by adding to the user prompt: `If the input pillar is "Life Event", the rollup label is a SHORT EVENT NAME (e.g., "Home Purchase", "New Baby") — output it character-for-character; do NOT paraphrase or expand it.`

## Expected result
- Click any life-event pill → either its dedicated deals appear, or a clean empty state. No more cross-contamination from the previously-selected behavioral rollup.
- Life-event pills no longer silently "do nothing" when merchant fuzzy match fails.

## Out of scope
- Persona synthesis prompt
- Pill UI/animations
- Life-event detection logic itself
- ID-based matching (rejected previously)

