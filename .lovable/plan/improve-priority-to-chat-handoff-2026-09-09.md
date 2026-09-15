# Improve priority-to-chat handoff

## What to change

1. **Make the priority-card prompt more holistic.**
   - File: `src/lib/ventusPriorityCards.ts`
   - Change `getPriorityPrompt` so it asks a broader weekly-trends question instead of the current narrow "Brief me on this priority…" request.
   - New prompt: `"What are the trends and opportunities for this past week?"`

2. **Stop auto-scrolling to the bottom when a priority card opens the chat.**
   - File: `src/components/tepilot/insights/VentusAIChatPage.tsx`
   - The transcript currently calls `scrollIntoView` on every new message and loading state change.
   - Add a one-time suppression flag that is set when `pendingPrompt` is consumed, and cleared after the first assistant response. While the flag is active, the scroll-into-view effect is skipped so the user sees the new question bubble in place and can scroll manually.

## Why

The current prompt is too specific for a first question and the immediate scroll hides the question from view. A broader opening question plus no forced scroll keeps the user oriented and in control.

## Verification

- Open `/bankdemo` → Intelligence Database.
- Click the "Brief me on this" chip on any priority card.
- The view switches to Ask Ventus AI and the new user bubble reads the weekly trends question.
- The page does not jump to the bottom; the question bubble is visible and the user can scroll to see the answer as it arrives.
