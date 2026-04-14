

## Plan: Merge Next-Purchase & Next-Offer into a Single Tab

### What changes

**1. Remove the "rewards" tab from the tab bar** (`ExecDemoIntelPanel.tsx`)
- Remove `"rewards"` from `TAB_ORDER` and `TAB_META`
- Remove the `rewards` case from the tab content renderer
- The merged tab stays as `"analytics"` with label "Next-Purchase"

**2. Combine content in `PurchaseCycleTimeline.tsx`**
- **Keep**: The seasonal spend heatmap (timeline graph) + "Now" line + insight callout
- **Remove**: The "Next-Purchase Probability" section (probability cards, confidence badges, predictive insight card) — everything from line 555 onward
- **Add**: Render the `NextOfferRationale` component below the timeline graph, passing through `generatedOffers`, `personaSynthesis`, and `offersLoading` as new props
- Update the `Props` interface to accept `generatedOffers`, `offersLoading`, and `personaSynthesis` (already has personaSynthesis)

**3. Update the parent call** (`ExecDemoIntelPanel.tsx`)
- Pass `generatedOffers` and `offersLoading` props down to `PurchaseCycleTimeline`

### Result
One unified tab showing the timeline heatmap at the top and AI-generated personalized offers below it. Three tabs remain: Next-Purchase, Next-Product, Next Conversation.

