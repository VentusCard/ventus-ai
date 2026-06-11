Add clickable section cover pages, starting with **Targeting**.

## Nav header interaction (the key change)
Currently each group header is a single `CollapsibleTrigger` that only expands/collapses. Change it to two distinct hit targets in one row:

- **Label area (left)** — clicking the group name (e.g. "Targeting") navigates to that section's overview tab (`setActiveTab('targeting-overview')`). Does NOT toggle expand/collapse.
- **Chevron (right)** — only the chevron toggles expand/collapse, via `CollapsibleTrigger` wrapping just the chevron button.

Active styling: when the overview tab is active, the label gets the same blue treatment used for active nav items (text-blue-700, font-medium). No extra blocks, pills, or "Overview" sub-rows are added.

Only **Targeting** is wired this turn. Other group labels (Home, Analytics, Rewards, Relationship, Health) remain non-navigating for now — clicking their label is a no-op (chevron still expands). Adding overviews later is per-group, one line each.

## New tab + view
- Add `TabValue` `'targeting-overview'`.
- New file `src/components/tepilot/insights/TargetingOverviewView.tsx` rendered for that tab.

## TargetingOverviewView layout
Strict light theme, Manrope. Single scroll column, max-w ~1100px.

1. **Hero**: eyebrow "Targeting", H1 "Reach the right customer at the right moment", 1–2 sentence sub explaining the suite turns enriched lifestyle signals into who-to-contact, what-to-say, when-to-send decisions.
2. **Why it matters** — 3 short value pills (lifestyle-driven > demographic; trigger-based vs batch; same data, three execution modes).
3. **Three function cards** (one per existing sub-tab) — clickable, each with icon tile, title, tagline, 3 "what it does" bullets, a small "what's different" callout, and a primary CTA that calls `setActiveTab(...)`:
   - **Automated Flows** (`Zap`) → `targeting-automated-flows`
   - **Campaign Builder** (`Megaphone`) → `targeting-campaign-builder`
   - **Next-product** (`Route`) → `targeting`
4. **How they work together** — 3 numbered steps: Analytics surfaces cohort/signal → pick execution mode → measure in Rewards/Analytics.
5. **Footer line**: "All three modes share the same enrichment + cohort engine."

## Out of scope
- Overview pages for other sections.
- Backend/data changes.
- Changes to the three existing targeting sub-views.

## Files
- Edit: `src/components/tepilot/insights/AnalyticsContainer.tsx` — split header into label-button + chevron-trigger; add `targeting-overview` tab value and render case.
- New: `src/components/tepilot/insights/TargetingOverviewView.tsx`.
