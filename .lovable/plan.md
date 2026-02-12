
# Redesign Wealth Demo as Multi-Client Alert Dashboard

## What's Changing
Replace the current 3-panel "deep dive into one client" demo with a visual replica of the **Life Events Alert Dashboard** -- showing multiple clients with detected life events in a scrollable list, with the ability to click into one to see supporting details.

## Demo Concept

The demo will look like a miniature version of the real `LifeEventsAlertDashboard`:

**Top Section**: Header with title "Wealth Management Client Life Event Intelligence -- Powered by Ventus AI" and a metrics bar (e.g., "8 Clients | 3 Urgent | 4 This Quarter | 12 Total Events").

**Main Section**: A scrollable list of client alert rows. Each row shows:
- Life event icon (color-coded)
- Client name + AUM + segment badge (Private/Preferred/Premium)
- Event name + urgency badge (Urgent/Soon/Upcoming)
- Key evidence snippet
- Confidence percentage
- Estimated timing
- "Prepare" and "View" buttons

**Detail Panel**: When "Prepare" is clicked on a row, a detail overlay slides in showing:
- Supporting transactions for that event
- Ventus AI Insights paragraph
- Recommended next steps

### Animation Flow (auto-looping)
1. Dashboard fades in with empty state
2. Client rows appear one by one with staggered fade-in (12 total rows across 8 clients)
3. Metrics bar counts up as rows appear
4. After all rows visible, brief pause
5. Auto-clicks "Prepare" on the top urgent row, showing the detail overlay with transactions and insights
6. After a few seconds, closes the overlay
7. Brief pause, then resets and loops

### Interactive Controls
- Users can click "Prepare" on any row to see that client's event details
- Pause/Resume/Reset controls
- Step indicator

## Static Data (8 mock clients, 12 events total)

Clients with events (using data from `PrepareEventDialog`):
1. Margaret Chen | Private | $4.2M -- Retirement Planning (91%, Urgent) + Education Funding (82%, Soon)
2. David Park | Premium | $1.8M -- Home Purchase (87%, Urgent)
3. Sarah Mitchell | Private | $6.1M -- Wealth Transfer (79%, Soon) + Elder Care (68%, Upcoming)
4. James Rodriguez | Preferred | $890K -- Family Formation (76%, Upcoming)
5. Linda Nakamura | Private | $3.5M -- Business Liquidity (84%, Urgent)
6. Robert Thompson | Premium | $2.1M -- Retirement Planning (88%, Soon)
7. Emily Watson | Preferred | $720K -- Education Funding (75%, Upcoming)
8. Michael Foster | Private | $5.8M -- Elder Care (72%, Soon) + Home Purchase (81%, Urgent)

## Changes

### 1. Rewrite: `src/components/technology/demos/VentusWealthDemo.tsx`
Complete rewrite of the component to render a dashboard-style UI instead of the current 3-panel transaction flow. Same architecture (useRef + DOM manipulation + setInterval), but the rendered HTML will be a list of client alert cards matching the `LifeEventAlertCard` design, plus a slide-in detail panel matching `PrepareEventDialog`.

Key visual elements:
- `.vwm-header` with title and metrics bar (matching the real dashboard's bg-slate-100, bg-red-50, bg-amber-50, bg-blue-50 metric pills)
- `.vwm-alert-row` for each client-event pair (horizontal card with icon, client info, event details, confidence, actions)
- `.vwm-detail-overlay` for the "Prepare" view (transactions list, insights, recommended steps)
- Responsive scaling wrapper (same approach: scale 0.7 at 1024px, scale 0.5 at 767px)

### 2. No changes to `src/pages/Wealth.tsx`
The page already imports and renders `VentusWealthDemo` correctly with the right layout and spacing.

## Technical Details
- All data is hardcoded in the component (transactions, insights, action items reused from existing demo data)
- CSS scoped with `.vwm-` prefix, injected via style block
- Animation uses async/await with cancellation tokens (same pattern as current implementation)
- Detail panel opens with a slide-in animation, closes with slide-out
- Clicking any "Prepare" button pauses the auto-loop and shows that client's detail; clicking "Back" resumes
- Dark background with light cards for contrast within the demo container
