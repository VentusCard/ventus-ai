

## Plan: Show all feature cards on the left when AI tab is active

### Problem
When the "AI" tab is selected in the consumer iPad view, `TAB_ROW_INDEX["ai"]` is `null`, so `FeatureCardSidebar` renders no cards on the left. The user wants all previous tab cards displayed to visually communicate that the AI has full context.

### Change
In `src/components/demo/DemoDetailOverlay.tsx`, modify the `FeatureCardSidebar` component:

When `activeTab === "ai"`, instead of showing nothing, iterate over **all** `PILLAR_ROWS` and render every bank node card from every row — showing "Core Customer Intelligence" at the top, then all bank nodes from Experience, Rewards, and Relationship rows. This visually conveys the AI has context across all modules.

**Implementation detail:**
- When `rowIdx` is `null` (AI tab), collect all bank nodes from all `PILLAR_ROWS` with their respective colors
- Render them in a scrollable column with slightly smaller cards to fit them all
- Add a header like "Full Context" or keep "Powering this Experience"

Single file change: `src/components/demo/DemoDetailOverlay.tsx` — only the `FeatureCardSidebar` function.

