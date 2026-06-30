## Objective
Move the "Ask Ventus AI" navigation item from the **Home** sidebar group into the **Analytics** sidebar group within the `/bankdemo` analytics container.

## Current State
- **Home** group contains: System, Ask Ventus AI, Products, Demo
- **Analytics** group contains: Dashboard, Reports, Query

## Proposed Change
1. In `src/components/tepilot/insights/AnalyticsContainer.tsx`, relocate the `ventus-ai` `NavItem` from the `Home` group array to the `Analytics` group array.
2. Verify that the active-tab fallback logic (line 188: `setActiveTab('ventus-ai')`) still resolves to a valid tab after the move. Since `ventus-ai` will remain in `filteredNavGroups` and `validTabs`, it will still be valid — no logic change needed.
3. No routing or component changes are required; this is purely a sidebar navigation reordering.

## Acceptance Criteria
- "Ask Ventus AI" appears under the **Analytics** collapsible group in the sidebar.
- "Home" group no longer contains "Ask Ventus AI".
- Clicking "Ask Ventus AI" continues to render the `VentusAIWelcomeView` correctly.
- Active-tab styling and accordion behavior remain intact.