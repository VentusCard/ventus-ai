
# Fix Client Transfer Data Conflicts in Advisor Console

## Problem Identified

When a client is transferred from the Life Events Alert Dashboard to the Advisor Console, two conflicts occur:

1. **Life Events Not Transferred**: The dashboard has pre-generated `detectedEvents` for each client, but these are NOT passed to the Advisor Console. The console instead shows life events from `aiInsights?.detected_events` (AI analysis of transactions), which is a completely different data source.

2. **Data Source Mismatch**: The dashboard client has:
   - `profile` (name, AUM, demographics) - transferred correctly
   - `detectedEvents` (pre-generated life events) - NOT transferred

   But the Advisor Console shows:
   - `clientProfile` from sessionStorage - correct
   - `aiInsights?.detected_events` from Supabase edge function - wrong source

## Solution

Unify the data flow by storing and consuming the dashboard client's detected events alongside the profile when transferring.

### Changes Required

**1. AdvisorConsolePage.tsx** - Store detected events when transferring

Update `handleOpenClient` to also store the client's detected events:
```typescript
const handleOpenClient = useCallback((clientId: string) => {
  const client = dashboardClients.find(c => c.id === clientId);
  if (client) {
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(client.profile));
    // NEW: Also store the detected life events
    sessionStorage.setItem("tepilot_detected_events", JSON.stringify(client.detectedEvents));
    setSelectedClientId(clientId);
    setViewMode("client");
  }
}, [dashboardClients]);
```

Update `handlePrepareWithVentus` similarly:
```typescript
const handlePrepareWithVentus = useCallback((data: EventPreparationData) => {
  sessionStorage.setItem("tepilot_client_profile", JSON.stringify(data.client.profile));
  // NEW: Store all detected events from this client
  sessionStorage.setItem("tepilot_detected_events", JSON.stringify(data.client.detectedEvents));
  sessionStorage.setItem("tepilot_event_preparation", JSON.stringify(data));
  // ... rest of existing logic
}, []);
```

**2. AdvisorConsole.tsx** - Load detected events from sessionStorage

Add state and loading logic for dashboard-sourced events:
```typescript
const [dashboardEvents, setDashboardEvents] = useState<DetectedLifeEvent[] | null>(null);
```

In the initialization `useEffect`, load these events:
```typescript
const existingEvents = sessionStorage.getItem("tepilot_detected_events");
if (existingEvents) {
  setDashboardEvents(JSON.parse(existingEvents));
}
```

**3. ClientSnapshotPanel.tsx** - Accept and prioritize dashboard events

Update the component props to accept pre-loaded events:
```typescript
interface ClientSnapshotPanelProps {
  // ... existing props
  dashboardEvents?: DetectedLifeEvent[] | null;  // NEW
}
```

Update the life events display logic:
```typescript
// Prioritize dashboard events if available, otherwise use AI insights
const lifeEvents = dashboardEvents?.length 
  ? dashboardEvents.map(e => ({
      event_name: e.eventName,
      confidence: e.confidence,
      evidence: e.keyEvidence.map(k => ({ relevance: k }))
    }))
  : (aiInsights?.detected_events || []);
```

**4. Clear events on "New Client" click**

When `onGenerateProfile` is called, also clear the dashboard events to allow fresh AI analysis for randomly generated clients:
```typescript
const handleGenerateProfile = useCallback(() => {
  // ... existing logic
  sessionStorage.removeItem("tepilot_detected_events");
  setDashboardEvents(null);
}, [toast]);
```

**5. AdvisorConsolePage cleanup**

Update `handleBackToDashboard` to clear the events:
```typescript
const handleBackToDashboard = useCallback(() => {
  sessionStorage.removeItem("tepilot_detected_events");
  setViewMode("dashboard");
  setSelectedClientId(null);
  setPendingVentusMessage(null);
}, []);
```

## Technical Summary

| File | Change |
|------|--------|
| `AdvisorConsolePage.tsx` | Store `detectedEvents` to sessionStorage when opening/preparing client |
| `AdvisorConsole.tsx` | Load `dashboardEvents` from sessionStorage, pass to ClientSnapshotPanel |
| `ClientSnapshotPanel.tsx` | Accept `dashboardEvents` prop, prioritize over `aiInsights` |

## Data Flow After Fix

```text
Dashboard (LifeEventsAlertDashboard)
       │
       │ click "View" or "Prepare"
       ▼
AdvisorConsolePage
  ├─► sessionStorage["tepilot_client_profile"] = client.profile
  └─► sessionStorage["tepilot_detected_events"] = client.detectedEvents  ← NEW
       │
       ▼
AdvisorConsole (loads from sessionStorage)
       │
       ▼
ClientSnapshotPanel
  └─► shows dashboardEvents (if present)
      OR aiInsights?.detected_events (for random/transaction-based clients)
```

## Expected Outcome

- When clicking on a client from the Life Events Dashboard, the Advisor Console will show that SAME client's life events (e.g., "College Funding - 85% confidence")
- When clicking "New Client" in the Advisor Console, it generates a fresh random client without pre-loaded events
- No more mismatch between dashboard life events and console life events
