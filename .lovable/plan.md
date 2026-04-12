

## Use AI Chat Presets as Relationship Tab Hooks

### Problem
The Relationship tab has static "Insights for You" hooks that don't send messages to the AI. Meanwhile, the AI tab already has working `QUICK_ACTIONS` presets. We should reuse those.

### Changes

**1. `src/components/exec-demo/RelationshipPhoneView.tsx`**
- Replace the static `INSIGHT_HOOKS` array with a curated subset of the AI chat's `QUICK_ACTIONS` (e.g., "Product recommendations", "Life event insights", "Where does most of my money go?")
- Change `onGoToAI` signature to `onGoToAI: (message: string) => void`
- Each hook button passes its text as the message: `onClick={() => onGoToAI("Product recommendations")}`

**2. `src/components/exec-demo/ExecDemoPhoneView.tsx`**
- Add `pendingAIMessage` state
- Update the `onGoToAI` callback to accept a message string, store it, and switch to `"ai"` tab
- Pass `initialMessage={pendingAIMessage}` to `ConsumerAIChatView`
- Clear `pendingAIMessage` after it's consumed

**3. `src/components/demo/ConsumerAIChatView.tsx`**
- Add optional `initialMessage?: string` prop
- On mount/change, if `initialMessage` is set, auto-send it via `sendMessage()` so the AI responds immediately

### Result
User clicks "Product recommendations" hook on Relationship tab → switches to AI tab → message auto-sends → AI responds with contextual product recommendations. Same presets, one source of truth.

