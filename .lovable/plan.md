# Slide 8.1 script change: "last trip to Hawaii" + "Dec 2025" header

Two small text changes to the slide 8.1 (retention) AI chat.

## Changes

1. **Opening prompt** — `src/lib/deckmoScript.ts` (line 426):
   - From: `How much have I spent on my trip to Hawaii?`
   - To: `How much have I spent on my last trip to Hawaii?`

2. **Answer header** — `src/components/deckmo/DeckmoBankdemoScenes.tsx` (`HAWAII_CHAT_CONTEXT`):
   - Add a strict instruction that the answer's first line must be exactly:
     `Your Dec 2025 Hawaii trip spend breakdown:`
   - Everything after it (Lodging / Air Travel / Dining / Experiences lines and the bold `Total: $11,115`) stays exactly as it is today.

No layout, color, or flow changes. /demo chat is untouched.

## Verification

- Build + typecheck clean.
- Playwright at 1540×855: open slide 8.1, confirm the prompt reads "How much have I spent on my last trip to Hawaii?" and the assistant answer opens with "Your Dec 2025 Hawaii trip spend breakdown:" with all four categories and total intact.
