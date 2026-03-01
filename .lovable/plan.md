

# Merge Travel Timeline into Travel & Exploration Pillar Card

## Overview
Instead of showing the Travel Timeline as a separate standalone section below the Pillar Explorer, embed it directly inside the expanded detail view of the "Travel & Exploration" pillar card. When a user clicks on the Travel & Exploration pillar, they'll see the usual subcategories and recent transactions, plus an integrated trip timeline section.

## Approach

### 1. Remove standalone TravelTimeline from TePilot page
**File: `src/pages/TePilot.tsx`**
- Remove the `<TravelTimeline transactions={displayTransactions} />` line (line 990)
- Remove the TravelTimeline import (line 29)

### 2. Embed trip grouping inside PillarExplorer's expanded view
**File: `src/components/tepilot/insights/PillarExplorer.tsx`**
- Import the `groupTransactionsByTrip`, `formatDateRange`, `calculateDays` helper functions from `TravelTimeline.tsx` (export them)
- When the selected pillar is "Travel & Exploration", render a "Detected Trips" section between the subcategories grid and the recent transactions list
- Reuse the `TripSection` component from TravelTimeline for consistent trip display (collapsible per-trip timeline with date grouping, reclassification indicators, and spend totals)

### 3. Export reusable pieces from TravelTimeline
**File: `src/components/tepilot/insights/TravelTimeline.tsx`**
- Export `groupTransactionsByTrip`, `TripSection`, `formatDateRange`, and `calculateDays` so PillarExplorer can import them
- Keep the main `TravelTimeline` component exported too (in case it's used elsewhere), but it will no longer be rendered on the TePilot page

## Result
- The pillar grid stays clean with no separate travel section cluttering the page
- Clicking "Travel & Exploration" shows subcategories, detected trips (with expandable day-by-day timelines), and recent transactions -- all in one cohesive expanded card
- Trip data (destination, date range, spend, reclassified count) is shown contextually where it belongs

