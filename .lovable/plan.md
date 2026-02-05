
# Plan: Transfer Event Preparation Data to Ventus WM Co-Pilot

## Overview
When a user clicks "Prepare with Ventus WM Co-Pilot" in the PrepareEventDialog, all relevant information (client profile, detected event, transaction evidence, and recommended steps) should be transferred to the Ventus Chat Panel so the AI can help prepare for the client conversation.

---

## Architecture Changes

### Data Flow
```text
PrepareEventDialog
    ↓ (onPrepareWithVentus callback)
LifeEventsAlertDashboard
    ↓ (passes up to parent)
AdvisorConsolePage
    ↓ (stores data, switches to client view)
AdvisorConsole
    ↓ (passes pending message with context)
VentusChatPanel
    ↓ (receives context, pre-fills input, sends to AI)
```

---

## Implementation Details

### 1. Add Callback Props to PrepareEventDialog

Add a new prop `onPrepareWithVentus` that gets called when the button is clicked:

```typescript
interface PrepareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EventPreparationData | null;
  onPrepareWithVentus?: (data: EventPreparationData) => void;  // NEW
}
```

### 2. Update LifeEventsAlertDashboard

- Add a new prop `onPrepareWithVentus` to pass up to the parent
- Wire it through to the `PrepareEventDialog`

```typescript
interface LifeEventsAlertDashboardProps {
  clients: DashboardClient[];
  onOpenClient: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
  onPrepareWithVentus?: (data: EventPreparationData) => void;  // NEW
}
```

### 3. Update AdvisorConsolePage

- Add handler `handlePrepareWithVentus` that:
  1. Stores the client profile to sessionStorage
  2. Stores the event preparation data to sessionStorage
  3. Builds a context-rich prompt message
  4. Switches to client view with the pending message

```typescript
const handlePrepareWithVentus = useCallback((data: EventPreparationData) => {
  // Store client profile
  sessionStorage.setItem("tepilot_client_profile", JSON.stringify(data.client.profile));
  
  // Store event preparation context for the chat
  sessionStorage.setItem("tepilot_event_preparation", JSON.stringify(data));
  
  // Build context-rich prompt
  const prompt = buildEventPreparationPrompt(data);
  
  // Set pending message and switch view
  setPendingVentusMessage(prompt);
  setSelectedClientId(data.client.id);
  setViewMode("client");
}, []);
```

### 4. Build Context-Rich Prompt

Create a helper function that builds a comprehensive prompt:

```typescript
function buildEventPreparationPrompt(data: EventPreparationData): string {
  const { client, event, transactions, recommendedSteps } = data;
  
  return `I need to prepare for a client meeting about a detected ${event.eventName} event.

**Client:** ${client.profile.name} (${client.profile.segment})
**Event:** ${event.eventName} (${event.confidence}% confidence)
**Estimated Timing:** ${event.estimatedTiming}

**Key Evidence from Transactions:**
${transactions.slice(0, 5).map(t => 
  `- ${t.merchant}: $${t.amount} (${t.cardType}) - ${t.relevance}`
).join('\n')}

**Suggested Steps:**
${recommendedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Help me prepare talking points and questions for this client conversation about their ${event.eventName} planning.`;
}
```

### 5. Pass Pending Message to AdvisorConsole

Add state and props to pass the pending message from AdvisorConsolePage to AdvisorConsole:

```typescript
// In AdvisorConsolePage
const [pendingVentusMessage, setPendingVentusMessage] = useState<string | null>(null);

<AdvisorConsole 
  // ... existing props
  initialPendingMessage={pendingVentusMessage}
  onPendingMessageConsumed={() => setPendingVentusMessage(null)}
/>
```

### 6. Update AdvisorConsole

Receive the initial pending message and forward it to VentusChatPanel:

```typescript
interface AdvisorConsoleProps {
  // ... existing props
  initialPendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
}
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/tepilot/advisor-console/PrepareEventDialog.tsx` | Add `onPrepareWithVentus` prop, call it on button click, close dialog |
| `src/components/tepilot/advisor-console/LifeEventsAlertDashboard.tsx` | Add `onPrepareWithVentus` prop, pass to PrepareEventDialog |
| `src/pages/AdvisorConsolePage.tsx` | Add handler, state for pending message, pass to AdvisorConsole |
| `src/components/tepilot/advisor-console/AdvisorConsole.tsx` | Accept initial pending message prop, merge with existing pending message logic |

---

## User Experience Flow

1. User clicks "Prepare" on a life event card
2. PrepareEventDialog opens showing transaction evidence and recommended steps
3. User clicks "Prepare with Ventus WM Co-Pilot"
4. Dialog closes, view switches to Client View
5. VentusChatPanel shows with a pre-filled, context-rich message
6. Message is automatically sent or ready for the advisor to review and send
7. Ventus AI responds with tailored preparation guidance

---

## Technical Notes

- The event preparation data is also stored in sessionStorage (`tepilot_event_preparation`) for potential use by the AI context builder
- The prompt is designed to give the AI enough context to provide meaningful preparation assistance
- All transaction evidence, recommended steps, and client details are included in the prompt
