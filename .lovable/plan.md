## Problem

On `/demo`, clicking the signal pills above the phone (lifestyle rollups, life events, risk) is supposed to send a scripted prompt into the AI chatbot:

- **Lifestyle rollup pill** → "How much do I typically spend on {label}?" (with hidden merchant breakdown as `signalContext`)
- **Life event pill** → "I'm preparing for {event}. What financial resources and products should I consider for this?"
- **Risk pill** → "What is this transaction at {merchant} / flagged as {label}? What is it typically associated with statistically?"

These scripts already exist in `src/components/exec-demo/ExecDemoIntelPanel.tsx` (lines ~444, ~456, ~469), but they only fire under two combined guards:

```ts
if (isRelTab) {            // activeTab === "relationship"
  ...
  if (assistantOpen) {     // AI tab already showing
    onAIPromptDispatch?.(...)
  }
}
```

So if the user is on Rewards or Analytics, or the AI tab isn't already open, clicking a pill does nothing in the chat. That matches what the user is reporting.

## Fix

Drop the gating so every pill click dispatches its scripted prompt, switches the phone to the AI tab, and renders the response. The existing `pendingAIPrompt` → `ExecDemoPhoneView` → `ConsumerAIChatView` plumbing already auto-switches to the AI tab on dispatch, so no new wiring is needed.

### File changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`** — three edits, mirroring each other:

1. `handleRollupForRel` (~lines 413–449): keep `onRollupClick?.(r)` and the `isRelTab` selection update, but move the `onAIPromptDispatch?.(...)` call out of the `if (isRelTab)` / `if (assistantOpen)` guards so it always fires on click. Keep the existing merchant-breakdown computation that builds `signalContext`.
2. `handleLifeEventForRel` (~lines 450–461): same — always dispatch `"I'm preparing for {label}. What financial resources and products should I consider for this?"` with `kind: "lifeEvent"`.
3. `handleRiskForRel` (~lines 462–474): same — always dispatch `"What is this transaction {subject}? What is it typically associated with statistically?"` with `kind: "risk"`.

The `setSelectedSignal({...})` calls remain inside `if (isRelTab)` so they only update the in-tab signal selection when the Membership tab is active (current behavior).

No changes to `ConsumerAIChatView`, `ExecDemoPhoneView`, or any edge function — they already handle `pendingAIPrompt` and switch the phone to the AI tab on receipt.

## Verification

On `/demo`:
1. From any phone tab (Rewards / Membership / AI), click a **lifestyle** pill → phone jumps to AI tab, user bubble shows "How much do I typically spend on …?", AI replies with merchant-aware spend.
2. Click a **life event** pill → user bubble asks for resources/products for that event, AI replies.
3. Click a **risk** pill → user bubble asks what the transaction is and what it's statistically associated with, AI replies.
