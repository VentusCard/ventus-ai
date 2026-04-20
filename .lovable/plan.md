

## Goal
Make each pill in the Behavioral Intelligence section (Spending Habits, Life Event Detection, Risk Factors) — when on the Next Conversation tab — open the phone's AI chat and auto-send a tailored question matching the pill type.

## Behavior per pill type

| Pill type | Auto-sent prompt |
|---|---|
| **Lifestyle rollup** (e.g. "Annual Premium Hawaiian Vacations") | `"How much do I typically spend on annual premium hawaiian vacations?"` |
| **Life event** (e.g. "College Prep for Dependents") | `"I'm preparing for college prep for dependents. What financial resources and products should I consider for this?"` |
| **Risk flag** (e.g. "Vice — DraftKings") | `"What is this transaction at DraftKings? What is it typically associated with?"` (falls back to category label if no merchant) |

The existing `consumer-chat` edge function already handles these conversationally — risk pills will get a contextual statistical answer (the system prompt covers behavioral category insight); life-event pills will get product recommendations; lifestyle pills will get specific dollar amounts from the enriched data already in context.

## Wiring

```text
[Pill click on relationship tab]
        │
        ▼
ExecDemoIntelPanel.handleRollup/LifeEvent/Risk
  ├─ existing: highlight transactions
  └─ NEW: onAIPromptDispatch(promptString)
        │
        ▼
ExecDemoPage.dispatchAIPrompt
  ├─ setPendingAIPrompt({ text, nonce })
  └─ setAiTabTrigger(n+1)   ← already opens phone + switches to AI tab
        │
        ▼
ExecDemoPhoneView (receives pendingAIPrompt)
        │
        ▼
ConsumerAIChatView.initialMessage  ← already auto-sends + calls onConsumed
```

A `nonce` accompanies the prompt so re-clicking the same pill re-fires the message (since `ConsumerAIChatView` uses a `initialMessageSentRef` that we need to reset per-nonce).

## Files touched

1. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
   - New optional prop: `onAIPromptDispatch?: (prompt: string) => void`.
   - In `handleRollupForRel`, `handleLifeEventForRel`, `handleRiskForRel`: when `isRelTab`, additionally call `onAIPromptDispatch(buildPrompt(...))`. Risk handler passes the matched flag's merchant.

2. **`src/pages/ExecDemoPage.tsx`**
   - New state: `pendingAIPrompt: { text: string; nonce: number } | null`.
   - New `dispatchAIPrompt(text)`: sets prompt + bumps `aiTabTrigger`.
   - Pass `onAIPromptDispatch={dispatchAIPrompt}` to `ExecDemoIntelPanel`.
   - Pass `pendingAIPrompt` to `ExecDemoPhoneView`.

3. **`src/components/exec-demo/ExecDemoPhoneView.tsx`**
   - Accept `pendingAIPrompt` prop; forward `.text` as `initialMessage` to `ConsumerAIChatView`. Use the nonce in a `key` so the chat view's `initialMessageSentRef` resets and re-fires on subsequent clicks of the same pill type. (Simpler: pass the nonce too and pop the `useEffect` dependency.)

4. **`src/components/demo/ConsumerAIChatView.tsx`**
   - Add optional `messageNonce?: number` prop; include it in the `useEffect` dependency array and reset `initialMessageSentRef.current = false` when nonce changes — so repeat clicks re-send.

## Out of scope
- No changes to `consumer-chat` edge function — its current system prompt handles all three response types.
- No new pill UI styling.
- No changes to non-relationship tab behavior.

