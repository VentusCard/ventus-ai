## Issue

When a user clicks a lifestyle rollup pill (e.g. "Seasonal Ski Trips") in the Relationship tab while the AI assistant is open, the auto-dispatched prompt currently shows the merchant breakdown inline in the chat bubble:

> How much do I typically spend on seasonal ski trips? (Use these exact figures from my account: total $6,308 across 10 transactions tagged "Seasonal Ski Trips". Breakdown: EPIC PASS VAIL RESORTS $2238 (2x); EVO.COM $1249 (1x); ...)

Real users would just type the short question. The breakdown was added so the AI doesn't recompute aggregates — but it should be hidden context, not visible chat content.

## Fix

Split the prompt into a **visible** short question and a **hidden** signal context that travels alongside it through the existing pipeline.

### Pipeline changes

1. **`onAIPromptDispatch` signature** (`ExecDemoIntelPanel.tsx`)
   Add an optional 3rd argument `signalContext?: string`.
   ```ts
   onAIPromptDispatch?: (prompt: string, kind?: "lifestyle" | "lifeEvent" | "risk", signalContext?: string) => void;
   ```

2. **`ExecDemoIntelPanel.tsx` (line ~423)** — keep the merchant rollup math, but split:
   ```ts
   const visiblePrompt = `How much do I typically spend on ${r.label.toLowerCase()}?`;
   const signalContext = `Lifestyle rollup "${r.label}": total $${totalSpend.toLocaleString()} across ${totalCount} transaction${totalCount !== 1 ? "s" : ""}.${merchantBreakdown}`;
   onAIPromptDispatch?.(visiblePrompt, "lifestyle", signalContext);
   ```

3. **`ExecDemoPage.tsx`** — extend `pendingAIPrompt` state and `dispatchAIPrompt` to carry the optional `signalContext`:
   ```ts
   const [pendingAIPrompt, setPendingAIPrompt] = useState<{
     text: string; nonce: number;
     kind?: "lifestyle" | "lifeEvent" | "risk";
     signalContext?: string;
   } | null>(null);

   const dispatchAIPrompt = useCallback((text, kind, signalContext) => {
     setPendingAIPrompt({ text, nonce: Date.now(), kind, signalContext });
   }, []);
   ```

4. **`ExecDemoPhoneView.tsx`** — propagate `pendingAIPrompt.signalContext` into `ConsumerAIChatView` via a new prop `initialMessageContext` (and update the `pendingAIPrompt` Props type to include `signalContext?: string`).

5. **`ConsumerAIChatView.tsx`**
   - Accept new optional prop `initialMessageContext?: string`.
   - In `sendMessage`, accept an optional 3rd arg `extraContext?: string`.
   - When set, include it in the `consumer-chat` invoke body as `context.signalContext` (without putting it in the rendered user message).
   - The initial-message effect passes `initialMessageContext` through to `sendMessage`.

6. **`supabase/functions/consumer-chat/index.ts`** — extend `buildContextPrompt` to append the signal context block when present:
   ```ts
   if (context.signalContext) {
     prompt += `\n## Signal Context (ground-truth aggregates for the user's current question)\n${context.signalContext}\n`;
   }
   ```
   No changes to schema/tools — purely additive system-context text.

### Out of scope

- Life-event and risk pill prompts (lines 433, 446) are already short and natural — no changes there.
- No model swap, no rate-limit work.

### User-visible result

The chat bubble shows just `"How much do I typically spend on seasonal ski trips?"`. The AI still answers with the correct totals because the merchant breakdown reaches the model via hidden context.