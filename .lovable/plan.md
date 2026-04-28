## Goal

When the user is on any of the three "Next" tabs in the executive demo (`rewards` = Next-Offer, `product` = Next-Product, `relationship` = Next-Conversation), the layout should show the **middle Intelligence panel + right Phone mockup**, and hide the **left Transaction feed panel**.

Currently the left panel is always visible on these tabs, and the phone only appears for `relationship` after the AI Assistant button is clicked.

## Change

Edit `src/pages/ExecDemoPage.tsx` only. No other files need changes.

### 1. Broaden `phoneVisible` to all three "Next" tabs

Replace the two existing definitions:
```ts
const phoneVisible = activeTab === "relationship" && aiTabTrigger > 0;
```
with:
```ts
const isNextTab = activeTab === "rewards" || activeTab === "product" || activeTab === "relationship";
const phoneVisible = isNextTab;
```

This makes the phone show automatically whenever the user is on any of the three Next tabs, no longer gated on the AI Assistant button. (The AI Assistant button still works — `aiTabTrigger` continues to drive which tab inside the phone is active via `ExecDemoPhoneView`.)

### 2. Hide the left Transaction panel on Next tabs

In the Col 1 wrapper (currently around line 941), change the visibility condition so the column collapses entirely on Next tabs instead of becoming a 40px sliver:

- When `isNextTab` is true → render nothing for Col 1 (panel hidden, no sliver, no expand affordance).
- Otherwise (Persona / pre-Next phases, full-screen enrichment, etc.) → keep current behavior.

Concretely, wrap the existing Col 1 block with `{!isNextTab && !showEnrichmentFullScreen && (...)}` and remove the `phoneVisible ? ... : 400` width math inside, since when the panel renders it always renders at full 400px now. Drop the sliver/expand UI (the `txPanelExpanded` toggle becomes unused on Next tabs — leave the state in place for safety but it no longer affects layout).

### 3. Keep phone-collapse behavior

Leave Col 3's collapse-to-sliver (`phoneCollapsed`) behavior intact — users can still collapse the phone to a 40px strip via the chevron if they want more room for the middle panel.

## Resulting layout per tab

| Tab | Left (Tx feed) | Middle (Intel) | Right (Phone) |
|---|---|---|---|
| Persona / no tab | shown (400px) | shown | hidden |
| `analytics` (Next-Purchase) | shown (400px) | shown | hidden |
| `rewards` (Next-Offer) | **hidden** | shown (expanded) | **shown** |
| `product` (Next-Product) | **hidden** | shown (expanded) | **shown** |
| `relationship` (Next-Conversation) | **hidden** | shown (expanded) | **shown** |
| Pre-synthesis enrichment full-screen | hidden (existing) | full-width | hidden |

Note: `analytics` (Next-Purchase) is one of the four tabs but is the "purchase intelligence" view, not one of the three Next-action tabs. Per your message ("3 next tabs"), it is excluded — it keeps the current left+middle layout. If you also want the phone on Next-Purchase, say so and I'll include it.
