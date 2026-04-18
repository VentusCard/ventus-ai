

## Goal
Persona pills above the Next Conversation tab drive the panel. Clicking a pill shows what the signal can orchestrate, split by client tier:
- **Regular clients** → Automated engagement flows (email/SMS) + AI Chatbot with full context
- **Wealth clients** → All of the above + Wealth Advisor notification with personalized prep brief

## Plan

### 1. Make persona pills clickable (only on Next Conversation tab)
In `ExecDemoIntelPanel.tsx`:
- When tab is `next-conversation`, persona rollup pills become selectable
- Single-select; default = highest priority pill (life event > risk > lifestyle > segment)
- Add "All signals" reset pill at the start
- Selected pill = filled style; others = outlined
- Pass `selectedSignal` to `NextConversationRationale`

### 2. Redesign panel as a single orchestration view
Replace the static two-column boilerplate in `NextConversationRationale.tsx` with one dynamic panel keyed off the selected signal.

Layout:

```text
┌──────────────────────────────────────────────────────────┐
│ Signal: Home Buyer · detected from escrow + title fees   │
├──────────────────────────────────────────────────────────┤
│ REGULAR CLIENT ORCHESTRATION                             │
│ ┌─ Automated Flow ─────────────────────────────────────┐ │
│ │ 📧 Email: "Your home journey starts here"            │ │
│ │ Trigger: Escrow detected → 24h delay                 │ │
│ │ Sequence: pre-approval → insurance bundle → HELOC    │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌─ AI Chatbot Context ─────────────────────────────────┐ │
│ │ 💬 Knows: closing date, down payment size, location  │ │
│ │ Can answer: "When's my first mortgage payment?"      │ │
│ │              "What insurance do I need?"             │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ WEALTH CLIENT — ADDITIONAL ORCHESTRATION                 │
│ ┌─ Advisor Notification ───────────────────────────────┐ │
│ │ 🔔 Sent to: Sarah's advisor (Jane Chen)              │ │
│ │ Personalized prep brief includes:                    │ │
│ │   • Estate plan update for new property              │ │
│ │   • Jumbo mortgage vs portfolio loan analysis        │ │
│ │   • Liquidity timing for down payment                │ │
│ │ Suggested outreach: Within 48 hours                  │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

The wealth section is always shown but visually subordinate (subtle border, "+" indicator) to communicate "regular gets these two, wealth gets all three."

### 3. Signal → orchestration mapping
Build a mapping in `NextConversationRationale.tsx` from signal type/label → orchestration content. Each entry contains:

```ts
{
  signalLabel: string,
  signalSource: string,           // "detected from escrow + title fees"
  automatedFlow: {
    channel: "Email" | "SMS" | "Push",
    subject: string,
    triggerLogic: string,
    sequence: string[],           // 3 step nudges
  },
  chatbotContext: {
    knows: string[],              // 2-3 bullet items the bot has context on
    canAnswer: string[],          // 2-3 sample questions
  },
  advisorBrief: {
    recipient: string,            // "Sarah's advisor (Jane Chen)"
    briefBullets: string[],       // 3 personalized prep items
    suggestedOutreach: string,    // "Within 48 hours"
  },
}
```

Mappings cover:
- **Life events**: Home Buyer, New Parent, Retirement Approaching, Wealth Transfer, Travel Planner
- **Lifestyle**: Frequent Traveler, Luxury Shopper, Health Conscious
- **Risk**: Gambling, Suspicious International (advisor brief = compliance escalation)
- **Segment fallback**: generic relationship-deepening playbook

### 4. "All signals" view
When "All signals" is selected, show a compact stacked summary: each pill as a one-line row with its top recommended channel, expandable on hover. Skips the detailed orchestration cards.

## Files to update
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — clickable pills + selection state on Next Conversation tab
- `src/components/exec-demo/NextConversationRationale.tsx` — full redesign with mapping + 3-block orchestration layout

## Out of scope
- No backend / edge function changes
- No changes to other tabs or to pill data sources
- No real email/SMS sending — this is presentation only

## Expected result for Sarah (Home Buyer + Preferred + Gambling)
- Default opens with "Home Buyer" selected
- Shows Email flow + Chatbot context (regular block) + Advisor prep brief (wealth block)
- Click "Gambling" → flow becomes a discreet wellness check-in, advisor block becomes compliance escalation
- Click "All signals" → compact roll-up of all three pills

