# Keep the personalized product line fully visible

The product card copy is being cut off mid-sentence ("...deliver an estimated $45,000 in flexible funding to"). Two causes, both need fixing: the generated sentence is longer than the card allows, and the card clamps it to 3 lines with no overflow handling.

## 1. Generate a shorter, self-contained line

In the product-card generation function:
- Add a hard length rule for `quote`: one complete sentence, 90–140 characters max, must end with a period.
- Keep the existing requirement that it contains one personalized dollar-estimate tied to the customer's real behavior/signal, so it still fits their behavior.
- Update the schema description for `quote` to state the same character budget and "must be a complete sentence — never trail off".
- Tighten the in-prompt examples so every example sits inside the new budget.

## 2. Make the card render the whole line

In the compact product card:
- Replace the fixed 3-line clamp with a layout that fits the full sentence: allow up to 4 lines and let the quote block flex, so short copy stays tight and longer copy still lands inside the frame.
- Keep the card fitting the phone mockup with no scrollbar — the quote gains room from the surrounding padding, not from pushing the card taller.

## 3. Safety net for over-long copy

If a returned quote still exceeds the budget, trim it at the last sentence boundary that fits rather than mid-word, so the customer never sees a dangling phrase. Applies to both live-generated and cached snapshot copy.

## Technical notes

- `supabase/functions/generate-product-cards/index.ts` — prompt rules (numeric specificity section) and the `quote` JSON-schema description.
- `src/components/exec-demo/ProductCardsPhoneView.tsx` — quote rendering and clamping; add the sentence-boundary trim helper here so it covers cached snapshots too.
- Verify with Ricky J on the Personalized Product tab across the product carousel at 1440px and 1920px.
