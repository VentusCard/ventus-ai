# Slide 8.1 chat answer: spacing, bolding, and action pills

Target: the AI answer bubble on slide 8.1 (the Hawaii spending breakdown), per the uploaded screenshot.

## 1. Spacing & bolding (deck-only)
The answer bubble currently renders cramped (13px text, tight line height, almost no space between the category lines).

- Thread a deck-only "relaxed answer" option from `ExecDemoPhoneView` into `ConsumerAIChatView` so the /demo chat is untouched.
- In that mode, assistant answers get:
  - More breathing room between lines (roomier line height, clear gap before each category line and before the Total line)
  - Slightly more bubble padding
  - Bold category names kept bold, with the **amounts bolded too** so the numbers scan first; merchant lists stay regular weight
  - The **Total line emphasized** (bold, slightly separated from the breakdown above it)
- Copy stays identical: Lodging / Air Travel / Dining / Experiences / Total: $11,115.

## 2. Action pills
The two pills under the answer are generated live, so they're nudged, not guaranteed. Make them deterministic for the deck:

- Add an optional fixed-actions prop on the chat view (used only by the slide 8.1 phone): every assistant answer shows exactly **"View Details"** and **"View Travel Deals"**.
- Also add an instruction to the deck's Hawaii context telling the assistant to use those two labels, so follow-up answers the user types stay consistent.
- /demo keeps its current generated labels.

## Technical details
- Files: `src/components/demo/ConsumerAIChatView.tsx` (relaxed typography classes + fixed-actions prop), `src/components/exec-demo/ExecDemoPhoneView.tsx` (pass-through props), `src/components/deckmo/DeckmoBankdemoScenes.tsx` (enable both on the Retention phone, extend `HAWAII_CHAT_CONTEXT`).
- No edge function changes required; no copy changes beyond the two pill labels.

## Verification
- Open 8.1 at 1590x855, read the live answer: category lines clearly separated, bold labels/amounts, emphasized total, pills read "View Details" and "View Travel Deals".
- Send one typed follow-up and confirm the pills stay consistent.
- Build/typecheck clean; confirm /demo chat unchanged (default props).
