## Gate pill reveal behind the "Behavioral Intelligence — Ready" click while keeping pre-fire

### Current behavior (confirmed)
- On /bankdemo mount, `src/pages/ExecDemoPage.tsx:1329-1336` pre-fires `handleRunAnalysis()` **and** calls `setSynthesisTriggered(true)`. That means persona/classification loads in the background AND the pills auto-reveal without a click.
- The Ready button (`ExecDemoIntelPanel.tsx:1508`) renders only when `hasSynthesis && !synthesisTriggered && phase === "hold"`, so it never appears.

### Goal
Keep the background pre-fire (fast Demo tab), but require the user to click **Behavioral Intelligence — Ready** before pill rollups/Next-* nav appear.

### Fix — `src/pages/ExecDemoPage.tsx`

1. **Pre-fire effect (~line 1330-1336)**: keep `handleRunAnalysis()` (data still warms up), remove the `setSynthesisTriggered(true)` line. Pills stay hidden until the user clicks Ready.

2. **`handleRunAnalysis` (~line 1282)**: add `setSynthesisTriggered(false)` near the top so any Start click from the selection dialog also re-arms the Ready button for the next run.

3. **Selection dialog Start path**: verify no other code path (e.g. `handleSelectStage`, embedded auto-open) flips `synthesisTriggered` to true before the user clicks Ready. Adjust if found — the only place that should set it true is the Ready button's `onClick` in `ExecDemoIntelPanel.tsx:1511`.

### Expected result
- Land on /bankdemo → Demo tab. Enrichment table renders, persona synthesis runs quietly in the background.
- As soon as synthesis completes and `phase === "hold"`, the animated blue "Behavioral Intelligence — Ready" button appears at the bottom of the intel column.
- Clicking it reveals the pill rollups and Next-Offer / Next-Product / Next-Conversation nav.

### Out of scope
No changes to synthesis logic, taxonomy, or the button's visuals.
