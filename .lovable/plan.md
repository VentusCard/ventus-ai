

## Remove Redundant Header and "Next Step" Button for Bank-Wide Analytics

### Problem
1. When clicking into a bank-analytics node, the `DemoDetailOverlay` header bar still shows the tab name — wasting space since `AnalyticsContainer` already has its own header.
2. The "Next Step →" button persists on screen when inside the bank analytics view, cluttering the experience.

### Changes

**`src/components/demo/DemoDetailOverlay.tsx`**
- For bank-wide nodes, skip rendering the header bar entirely (lines 111-129). Only render the close button (positioned absolutely in the top-right corner).
- Remove the padding/border from the header for bank-wide views so the `AnalyticsContainer` fills the full overlay.

**`src/pages/DemoPage.tsx`**
- Hide the "Next Step →" button when `activeNode` is a bank-wide node. Only show it when no node is active.
- Change condition on lines 159-168: render "Next Step →" only when `!activeNode` (not when a bank-wide node is active).

### Result
When a user clicks into any bank-analytics node, they see only the `AnalyticsContainer` with its own header, sidebar, and content — no redundant title bar, no "Next Step" button. A small close button remains to exit back to the network diagram.

