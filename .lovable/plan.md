

## Goal
Two changes on the Next-Conversation tab:
1. Behavioral signal pills should ONLY update the in-tab content (the two columns) — not open the phone mockup.
2. Phone mockup opens ONLY when "Open AI Banking Assistant" is clicked.
3. Once the phone is open, clicking a behavioral signal pill fires a chat prompt into the assistant (not just updates content).

## Investigation needed
I need to confirm the exact wiring before finalizing — specifically:
- Where pill clicks are handled (likely `ExecDemoLeftPanel.tsx`)
- Where phone mockup visibility state lives (likely `ExecDemoIntelPanel.tsx` or `ExecDemoPage.tsx`)
- How the assistant phone view receives messages (likely the `initialMessage`/`messageNonce` pattern seen in `ConsumerAIChatView.tsx`)

## Plan

### State model (in the parent container, likely `ExecDemoIntelPanel.tsx`)
- `activeSignal` — set by pill clicks, drives column content
- `assistantOpen` — boolean, only flipped true by "Open AI Banking Assistant" button
- `assistantPrompt` + `promptNonce` — pushed into the phone chat when a pill is clicked AND assistant is already open

### Behavior matrix
| Action | Assistant closed | Assistant open |
|---|---|---|
| Click signal pill | Update `activeSignal` only | Update `activeSignal` + push prompt to chat (bump nonce) |
| Click "Open AI Banking Assistant" | Set `assistantOpen=true` (no auto-prompt) | No-op |
| Click "Open WM CoPilot" | Unchanged existing behavior | Unchanged |

### Files to change
1. **`src/components/exec-demo/ExecDemoLeftPanel.tsx`** (or wherever pills live) — pill `onClick` calls a handler from parent: `onSignalSelect(signal)`. No phone-opening side effect.
2. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`** — own the new state (`assistantOpen`, `assistantPrompt`, `promptNonce`). Implement `onSignalSelect`: always update active signal; if `assistantOpen`, also build a prompt string (e.g. `"Tell me about this customer's ${signal.label} signal and what to discuss next."`) and bump nonce.
3. **`src/components/exec-demo/NextConversationRationale.tsx`** — "Open AI Banking Assistant" button → calls `onOpenAssistant()` prop (no longer triggered by pill).
4. **`src/components/exec-demo/ExecDemoPhoneView.tsx`** (or whichever component renders the phone for this tab) — pass `initialMessage={assistantPrompt}` and `messageNonce={promptNonce}` through to `ConsumerAIChatView`. The existing nonce-based effect in `ConsumerAIChatView` (already implemented) will fire `sendMessage` each time nonce changes.

### Prompt template (when pill clicked while assistant open)
`"Walk me through this customer's {signal.label} signal — what's the recommended next conversation?"`

### Verification
- Close phone → click 3 different pills → only columns update, phone never appears.
- Click "Open AI Banking Assistant" → phone opens with welcome state, no auto-message.
- With phone open → click a pill → columns update AND a new user message appears in chat with assistant response streaming back.
- Click "Open WM CoPilot" → unchanged.

### Out of scope
- Other tabs (Next-Offer, Next-Product)
- Wealth column / WM CoPilot behavior
- Pill or column styling

