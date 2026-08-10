# Move Customer Insights into Personalized Relationship

Customer Insights becomes the first section of the Personalized Relationship page instead of its own sidebar tab.

## Changes

1. **Customer Insights component** (`WellnessAlertsDashboard.tsx`)
   - Accept a `hideHeader` prop so its own page header is suppressed when embedded, matching the pattern already used by the other three embedded views.

2. **Personalized Relationship page** (`PersonalizedRelationshipView.tsx`)
   - Add a new section, placed first, above Relationship Intelligence:
     - Label: "Customer Insights"
     - Description: behavioral wellness and engagement signals across the customer base
   - Render `<WellnessAlertsDashboard hideHeader />` inside it.
   - Update the page subtitle/description text to include customer insights.

3. **Sidebar navigation** (`AnalyticsContainer.tsx`)
   - Remove the "Customer Insights" item from the Customer Intelligence group.
   - Keep `customer-insights` as a valid tab value that routes to `PersonalizedRelationshipView`, so existing links and cross-tab navigation still land in the right place.

4. **Supporting references**
   - `ventusAiTabContext.ts`: fold the customer-insights context into the Personalized Relationship context entry.
   - `VentusAIWelcomeView.tsx`, `DemoDetailOverlay.tsx`, `AnalystDashboardView.tsx`: point any customer-insights cards/links at the Personalized Relationship tab.

## Note

The Personalized Relationship page currently uses stacked sections (not clickable sub-tabs); Customer Insights will be added as a stacked section to match. If you'd prefer real sub-tabs across all four, that's a separate restructure.
