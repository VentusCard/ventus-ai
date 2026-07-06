## Plan: Add AI Coworker Deliverables to Capabilities Panel

### Goal
Inside the existing "Ventus AI Coworker Capabilities" collapsible panel, add a concise summary of what Ventus AI sends to advisors versus what it sends to leadership — visible immediately when the panel is expanded.

### Changes

#### File: `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`

1. **Insert a new subsection** inside the `{capabilitiesOpen && (...)}` block, placed below the 6-tile capability grid.

2. **Subsection content — two rows, one sentence each:**
   - **Advisor row:** A single sentence describing the deliverables Ventus sends to individual advisors (personalized briefs, life-event signals, talking points, outreach drafts, scheduling support).
   - **Leadership row:** A single sentence describing the deliverables Ventus sends to leadership (weekly trend reports, enterprise-wide intelligence, campaign recommendations, product-gap analysis, retention alerts).

3. **Styling:**
   - Display as two stacked rows (not cards, not bullets).
   - Use a subtle top border to separate from the tile grid above.
   - Left-align each sentence with a small role badge ("Advisor" / "Leadership") for quick scanning.
   - Keep the same 13px text size and slate-600 color used elsewhere in the panel.

### Out of scope
- No changes to the capabilities panel collapse behavior (stays collapsed by default).
- No changes to thread data, KPI cards, activity feed, team status, or example conversations.
- No new data structures in `coworkerInboxData.ts` — the two sentences are static copy inline.