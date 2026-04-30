## Problem

In the Next-Offer tab (and Next-Product tab), clicking pills currently triggers chat messages in the phone mockup and force-switches the phone to the AI tab. This shouldn't happen — pill clicks in Next-Offer should only filter the deal collection shown on the phone. AI chat dispatch should be reserved for the Next-Conversation tab.

## Root cause

In `src/components/exec-demo/ExecDemoIntelPanel.tsx` (lines ~414–466), the pill click handlers `handleRollupForRel`, `handleLifeEventForRel`, and `handleRiskForRel` always call `onAIPromptDispatch?.(...)` regardless of `activeTab`. The handlers were originally written for the Relationship/Next-Conversation tab but are reused across all three tabs — and the AI dispatch was never gated.

The comment on line 419 even acknowledges this:  
*"Always dispatch the scripted AI prompt — phone auto-switches to AI tab."*

That dispatch updates `pendingAIPrompt` in `ExecDemoPage.tsx`, which `ExecDemoPhoneView.tsx` watches via `useEffect` and uses to switch `consumerTab` to `"ai"` and inject a chat message.

## Fix

In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, gate the three `onAIPromptDispatch?.(...)` calls so they only fire when `activeTab === "relationship"` (Next-Conversation).

Specifically, in each of the three handlers:
- `handleRollupForRel` (line ~444)
- `handleLifeEventForRel` (line ~451)
- `handleRiskForRel` (line ~462)

…wrap the `onAIPromptDispatch` call in `if (isRelTab) { ... }`. The pillar/life-event filtering side-effects (`onRollupClick`, `onTriggerPillClick`, `setSelectedSignal`) remain unchanged so Next-Offer still updates its filtered deal collection.

Also rename the handlers to drop the misleading `ForRel` suffix (they handle all tabs now) — purely cosmetic, but reduces future confusion.

## Verification

After change:
- Next-Offer tab → click pillar pill → phone stays on rewards/offers tab, deal collection re-filters. No chat triggered.
- Next-Product tab → same, no chat triggered.
- Next-Conversation tab → click pill → phone switches to AI tab and shows scripted message (existing behavior preserved).
