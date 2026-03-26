

## Redesign "Personalized Banking Relationship" as a Consumer-Facing, Life-Event-Driven View

### Problem
The current "wealth" node view renders `DemoFinancialJourneyView` — a bank-side cross-sell dashboard showing advisor language ("Next Best Product", confidence scores, outreach templates). Two issues:
1. **Not consumer-facing** — it reads like an internal tool, not what a customer would see in their banking app
2. **Life events are buried** — detected events only influence product scoring behind the scenes; they should be the hero content

### Approach
Replace the `DemoWealthView` component (currently unused dead code) with a new **consumer-facing "Personalized Banking Relationship"** view that puts detected life events front and center, styled like a banking app screen (similar to how `DemoEngagementView` uses a phone mockup pattern).

### Design
The view will show:

1. **Relationship Summary Header** — Customer name, segment, a warm greeting framing the personalized relationship
2. **Life Events as Hero Cards** — Each detected life event displayed prominently as a consumer-facing "We're here for you" moment:
   - Event name + friendly description (not confidence scores)
   - "How we can help" section with 2-3 relevant product/service suggestions, framed as benefits not cross-sell
   - A CTA like "Explore options" or "Talk to an advisor"
3. **Your Financial Snapshot** — Holdings summary (deposits, credit, mortgage, investments) in a clean consumer-friendly layout
4. **Personalized Recommendations** — Top 2-3 product suggestions driven by life events, shown as benefit cards (not outreach templates)

### File Changes

**`src/components/demo/DemoWealthView.tsx`** — Complete rewrite:
- Accept `customer` and `detectedEvents` props (same as other demo views)
- Build a consumer-facing layout with life events as the primary content
- Use friendly language: "Your upcoming milestones", "We noticed you might be planning...", "Here's how we can help"
- Show holdings in a clean summary grid
- Style with the same card/border patterns used in other demo views
- No confidence percentages, no "outreach preview", no advisor-facing language

**`src/components/demo/DemoDetailOverlay.tsx`** — Update the `wealth` node rendering:
- Change from rendering `DemoFinancialJourneyView` to rendering `DemoWealthView`
- Pass `detectedEvents` to the new component

### What stays the same
- `DemoFinancialJourneyView` remains intact — it's used by the `lifeEvents` node ("Financial Journey — Next Best Product") which IS bank-facing
- The overlay title "Personalized Banking Relationship" stays as-is
- The node routing and color remain unchanged

