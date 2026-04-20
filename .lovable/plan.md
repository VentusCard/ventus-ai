

## Change
Add an "Open AI Banking Assistant" button in the Regular Client column of the Next Conversation tab. Clicking it reveals the phone mockup and switches the in-phone tab to AI chat — but does NOT pre-populate any message.

## Approach

### 1. `src/components/exec-demo/NextConversationRationale.tsx`
- Add `onOpenAIAssistant?: () => void` prop.
- Add a blue gradient button at the bottom of the Regular Client column, mirroring the WM Copilot button shape:
  - Label: `Open AI Banking Assistant for {customerFirstName}`
  - Gradient: `linear-gradient(135deg, #3b82f6, #1d4ed8)`
  - Icon: `MessageSquare` (right side)

### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Add `onOpenAIAssistant?: () => void` prop, pass through to `NextConversationRationale`.

### 3. `src/components/exec-demo/ExecDemoPhoneView.tsx`
- Add `forceAITab?: boolean` prop (or a counter/trigger). When it flips true, set `consumerTab` to `"ai"`.
- No initial message — chat opens empty.

### 4. `src/pages/ExecDemoPage.tsx`
- Add state for the phone column's visibility override AND for forcing the AI tab. Since the phone column is currently hidden unless `activeTab === "relationship"`, the button must:
  - Ensure the phone column is visible (we are already on the relationship tab when this button is clickable, so visibility is already on).
  - Trigger the phone to switch its internal tab to AI.
- Implement `handleOpenAIAssistant`:
  - Set a trigger (e.g. increment a `aiTabTrigger` counter) that `ExecDemoPhoneView` watches to switch to the AI tab.
- Pass `onOpenAIAssistant={handleOpenAIAssistant}` down through `ExecDemoIntelPanel`.
- Pass `aiTabTrigger` to `ExecDemoPhoneView`.

## Files touched
- `src/components/exec-demo/NextConversationRationale.tsx` — new button + prop
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — prop pass-through
- `src/components/exec-demo/ExecDemoPhoneView.tsx` — accept trigger, switch to AI tab (no message)
- `src/pages/ExecDemoPage.tsx` — handler + trigger state + wiring

## Out of scope
- No pre-populated AI message.
- No changes to ConsumerAIChatView, WM Copilot, or other tabs.

