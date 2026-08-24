# Redesign Automated Flows Governance Card — Full Width & Self-Explaining

## Goal
Make the `FlowGovernanceCard` on `/bankdemo` Automated Flows use the full width of its container and explain the flow end-to-end at a glance, without requiring hover.

## Current state
The card is rendered at `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx:663` inside a full-width `space-y-4` container, but its internal rail is compact and wraps, so it reads as a small cluster rather than a true workflow timeline. Details (active/draft split, avg signals, approval counts, channel reach) are hidden in tooltips.

## Proposed redesign

### 1. Full-width workflow timeline
- Replace the compact wrapping rail with a single horizontal row that spans the entire card width.
- Each of the five stages becomes an equal-width tile with a clear left-to-right chevron/connector.
- Tiles keep their icon, primary number, and short label, but also surface one key sub-detail directly below the number so the stage is understandable without hover.

### 2. Surface details at first glance
- **Products Mapped**: show `76 mapped · 9 active · 67 draft` directly under the number.
- **Signals Assigned**: show `410 assigned · 5.4 avg/product` directly under the number.
- **Marketing Approval**: show `9 pending · 67 approved` directly under the number.
- **Product Owner Approval**: show `4 pending · oldest: Consumer Lending` directly under the number.
- **Channels Assigned**: show the three channel chips with flow count, status dot, and 24h reach inline rather than in a tooltip.

### 3. Stronger visual narrative
- Add a subtle numbered stage indicator (1 → 5) above or within each tile to reinforce the workflow sequence.
- Use a continuous progress bar beneath the rail that fills from stage 1 through stage 5, visually showing how many mapped products have cleared all gates and are live on channels.
- Keep stage chips (`Auto`, `Pending`, `Executing`) but make them more prominent so the state of each gate is instantly readable.

### 4. Header refinement
- Keep the "Flow governance" title and green live pulse.
- Move the "63 of 76 products live" summary to the right side of the header so the headline and outcome count are visible together.
- Keep the subtitle "how automated flows reach customers" but ensure it does not compete with the stage labels.

### 5. Light-theme policy
- Strict light theme: white card surface, slate-200 borders, semantic status colors only on chips/dots/progress.
- No `dark:` utilities.

## Files to change
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx` — main component redesign.
- `src/components/tepilot/campaigns/data/flowGovernance.ts` — verify data supports the new inline details; no structural changes expected.

## Acceptance criteria
- Card spans the full width of the Automated Flows tab content area.
- All five workflow stages and three channels are readable without hovering.
- The left-to-right flow sequence is visually obvious (chevrons/connectors + optional stage numbers).
- Progress bar and live count remain visible.
- Card height stays reasonable (target under 200 px).
- Light-theme policy is preserved; no dark-mode utilities added.

## Notes
- No backend or edge-function changes.
- No changes to `ProductAutomatedFlowsView.tsx` logic beyond the existing `<FlowGovernanceCard />` placement.
