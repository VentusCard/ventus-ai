
## Goal
After every AI response in the phone chat, render 2 contextual action button chips. Labels are extracted from the **existing `consumer-chat`** edge function output (no new function), so they stay in sync with the response and incur no extra latency/cost.

## Approach

Have the existing `consumer-chat` edge function return action button suggestions inside its JSON response, alongside the `message`. Frontend renders them as non-functional chips below each assistant bubble.

### 1. `supabase/functions/consumer-chat/index.ts`
- Accept a new optional field in the request body: `kind?: "lifestyle" | "lifeEvent" | "risk" | "general"` (defaults to `"general"`).
- Extend the system prompt to instruct the model to ALSO return 2 short action labels (≤4 words each) tailored to `kind`:
  - `lifestyle` → navigational ("Go to Account Profile", "Go to Deals", "View Spending")
  - `lifeEvent` → action ("Apply Today", "See Details", "Talk to Advisor")
  - `risk` → safety ("Report This Transaction", "This Is Fine", "Freeze Card")
  - `general` → helpful generic ("Tell Me More", "Got It")
- Switch the response shape to use **tool-calling for structured output** so we reliably get `{ message: string, actions: [string, string] }`.
- Return both fields in the JSON body. Existing callers that only read `message` keep working.

### 2. `src/hooks/useAdvisorChat.ts` (used by `ConsumerAIChatView`)
- Accept optional `kind` per-message in `sendMessage(content, kind?)`.
- Pass `kind` through to the edge function body.
- Store returned `actions` on the assistant message (extend `Message` type with `actions?: string[]`).

### 3. Plumb `kind` from pill click → chat
- **`ExecDemoIntelPanel.tsx`** — extend `onAIPromptDispatch` to include `kind`:
  ```ts
  onAIPromptDispatch?: (prompt: string, kind?: "lifestyle" | "lifeEvent" | "risk") => void;
  ```
  Pass `"lifestyle"` / `"lifeEvent"` / `"risk"` from the three rollup/lifeEvent/risk handlers.
- **`ExecDemoPage.tsx`** — store `kind` in `pendingAIPrompt` state.
- **`ExecDemoPhoneView.tsx`** — forward `pendingAIPrompt.kind` into `ConsumerAIChatView` as `initialMessageKind` (and via `messageNonce` flow).

### 4. `src/components/demo/ConsumerAIChatView.tsx`
- When auto-sending the initial pill prompt, pass the `kind` into `sendMessage`.
- Below each assistant bubble that has `actions`, render 2 chips matching the existing quick-action chip style (`rounded-full bg-blue-50 text-blue-700`, ~11px, no-op `onClick`).
- Skeleton chips while the message is streaming/loading; silently omit if `actions` missing.

## Files touched
- `supabase/functions/consumer-chat/index.ts` — add `kind` input, return `{ message, actions }` via tool-calling
- `src/hooks/useAdvisorChat.ts` — pass `kind`, persist `actions` on message
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — pass `kind` through dispatch
- `src/pages/ExecDemoPage.tsx` — store `kind` in pending prompt
- `src/components/exec-demo/ExecDemoPhoneView.tsx` — forward `kind`
- `src/components/demo/ConsumerAIChatView.tsx` — render action chips

No new edge function. No DB changes. No new secrets.

## Verification
- /demo → run a customer → Next-Conversation tab → click a lifestyle pill, a life event pill, a risk pill.
- Each AI reply shows 2 contextual chips matching the pill kind. Chips do nothing on click.
