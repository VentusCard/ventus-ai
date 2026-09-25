# Hawaii phone: fix scroll position and rename header

## Goal
On the Hawaii trip AI phone (beat 8.3 and its copy in the 8.4 carousel), the seeded conversation is long enough that the chat auto-scrolls to the bottom, hiding the opening question. Start that chat scrolled to the top so "How much have I spent on my last trip to Hawaii?" is visible, and rename the phone's header label to "Intelligent Insights".

## Changes

1. **Start Hawaii chat at the top**
   - Add a `chatStartAtTop?: boolean` prop to `ExecDemoPhoneView`, passed through to `ConsumerAIChatView`.
   - In `ConsumerAIChatView`, when the prop is set, scroll the conversation container to the top once on mount (after initial messages render) via a ref + effect — instead of relying on the stick-to-bottom default.
   - Stick-to-bottom behavior stays intact for any new messages the user types afterward (only the initial position changes).
   - Set `chatStartAtTop` on the Hawaii `RetentionPhone` (used in both beat 8.3 and the 8.4 carousel, so both copies — which share the same persist key — behave identically).
   - Showcase phones (short two-message conversations that fit on screen) are unchanged.

2. **Rename the header**
   - In `RetentionShowcase` (`src/components/deckmo/DeckmoBankdemoScenes.tsx`), change the Hawaii carousel item label from "AI assistant" to "Intelligent Insights" (same enlarged bold styling as the other phone labels).

## Out of scope
- No changes to message content, canned answers, carousel motion, other beats, or `/demo`.

## Validation
- Playwright at 1540×855 and 1920×1080: unlock the deck gate, navigate to 8.4 — Hawaii phone shows the question at the top of the chat (not scrolled to the bottom), header reads "Intelligent Insights", rotation and pause-on-hover still work, no clipping.
- Confirm 8.3's standalone Hawaii phone also starts at the top.
- Clean build (`/tmp/observability/build-errors.log`).
