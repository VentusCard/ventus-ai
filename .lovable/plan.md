
# Life Events Alert Dashboard for Wealth Managers

## Overview
Create a new dashboard view focused on surfacing detected life events across all clients. This enables wealth managers to proactively prepare for upcoming client needs before meetings. The dashboard prioritizes actionable intelligence over general client management.

## New Components

### 1. LifeEventsAlertDashboard
**File:** `src/components/tepilot/advisor-console/LifeEventsAlertDashboard.tsx`

Main dashboard with:
- **Summary Alert Bar**: Count of clients with detected life events by urgency
- **Life Event Cards Grid**: Grouped by event type (Retirement, Home Purchase, Education, etc.)
- **Quick Filters**: Filter by event type, confidence level, time sensitivity
- **Client Quick-View**: Expandable row showing client details + detected events

### 2. LifeEventAlertCard
**File:** `src/components/tepilot/advisor-console/LifeEventAlertCard.tsx`

Card for each client-event combination:
- Client name, segment badge, AUM
- Event type with icon and confidence score
- Key evidence snippets (e.g., "College tour bookings detected")
- Time sensitivity indicator (e.g., "Event in ~6 months")
- Action buttons: "Prepare Meeting", "View Client", "Schedule Call"

### 3. DashboardClientData Type + Generator
**File:** `src/lib/randomProfileGenerator.ts` (extend)

Add function `generateDashboardClients(count: number)` that creates clients with:
- Full profile data (using existing generator)
- Assigned life events with varied types and confidence scores
- Last contact date for recency tracking
- Urgency score based on event timing

## Life Event Types to Feature

| Event Type | Icon | Typical Signals |
|------------|------|-----------------|
| Retirement Planning | Sunset | RMD approaching, pension inquiries |
| Education Funding | GraduationCap | College tour bookings, 529 activity |
| Home Purchase | Home | Mortgage inquiries, home inspection |
| Wealth Transfer | Gift | Estate attorney visits, trust activity |
| Business Liquidity | Briefcase | M&A signals, business valuations |
| Family Formation | Baby | Childcare expenses, insurance queries |
| Elder Care | Heart | Healthcare spending patterns |

## Changes to Existing Files

### AdvisorConsolePage.tsx
- Add view mode state: `"dashboard" | "client"`
- Add toggle buttons/tabs in header
- Conditionally render `LifeEventsAlertDashboard` or `AdvisorConsole`
- Pass callback to open specific client from dashboard

### AdvisorConsole.tsx
- Add optional `selectedClientId` prop to pre-load a specific client
- Add "Back to Dashboard" navigation option

## User Flow

```text
1. Manager opens /advisor-console
2. Sees Dashboard View: "18 clients have life events detected"
3. Scans cards organized by event type or urgency
4. Clicks "Prepare Meeting" on Robert Chen (Retirement)
5. Transitions to single-client Co-Pilot view
6. Reviews AI-generated talking points and recommendations
7. Clicks "Back to Dashboard" to continue triaging
```

## Dashboard Layout

```text
+------------------------------------------------------------------+
| Back to TePilot              [Dashboard]  [Client View]          |
+------------------------------------------------------------------+
| LIFE EVENTS DETECTED                                              |
| 18 clients need attention  |  5 urgent  |  8 this quarter        |
+------------------------------------------------------------------+
| [All Events v]  [Confidence: 70%+ v]  [Sort: Urgency v]          |
+------------------------------------------------------------------+
| RETIREMENT (4)                                                    |
| +------------------------+ +------------------------+             |
| | Robert Chen | Premium  | | Linda Park | Private   |             |
| | $3.2M AUM             | | $1.8M AUM             |             |
| | Confidence: 87%       | | Confidence: 78%       |             |
| | "RMD due in 8 months" | | "Pension rollover"    |             |
| | [Prepare] [View] [Call]| | [Prepare] [View] [Call]|            |
| +------------------------+ +------------------------+             |
+------------------------------------------------------------------+
| EDUCATION FUNDING (6)                                             |
| +------------------------+ +------------------------+             |
| | Sarah Mitchell | Pref  | | James Wong | Private   |             |
| ...                                                               |
+------------------------------------------------------------------+
```

## Technical Details

### Data Structure for Dashboard Client

```typescript
interface DashboardClient {
  id: string;
  profile: ClientProfileData;
  detectedEvents: Array<{
    eventType: string;
    eventName: string;
    confidence: number;
    estimatedTiming: string;  // "Q2 2026", "6-12 months"
    keyEvidence: string[];
    urgencyScore: number;     // 1-5, for sorting
  }>;
  lastContactDate: Date;
  nextScheduledMeeting?: Date;
}
```

### Mock Data Generation
- Generate 50-80 clients
- ~40% have 1+ life events detected
- Distribute across event types realistically
- Vary confidence from 65-95%

### State Management
- Dashboard client list generated on mount (memoized)
- Selected client ID passed to AdvisorConsole
- Preserve dashboard scroll position when returning

## Files Summary

| File | Action |
|------|--------|
| `src/components/tepilot/advisor-console/LifeEventsAlertDashboard.tsx` | Create |
| `src/components/tepilot/advisor-console/LifeEventAlertCard.tsx` | Create |
| `src/lib/randomProfileGenerator.ts` | Extend with dashboard client generator |
| `src/pages/AdvisorConsolePage.tsx` | Add view toggle and dashboard rendering |
| `src/components/tepilot/advisor-console/AdvisorConsole.tsx` | Add back-to-dashboard callback prop |
