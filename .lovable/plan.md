# Simplify slide 2.3 signal pills

Replace the stacked title-and-mini-pill treatment with compact, readable inline phrases.

- Financial pills follow your format: **“(Monthly) ($3,500 latest · September) to (Goldman Marcus) a (HYSA)”**. Use plain parenthesized text within one pill—not multiple outlined boxes or a second row of chips.
- Keep amounts tied to the existing transaction evidence. Identify variable payments and annualized estimates without presenting them as fixed monthly amounts.
- Apply this exact visual format to **every signal pill in slide 2.3**: one inline phrase with parenthesized attributes connected by ordinary words. No stacked title, second row, or miniature outlined chips. Use relevant attributes for each signal rather than forcing monthly amounts onto nonfinancial signals; wrap naturally only when necessary.
- Preserve the left-hand family headings, family order, connecting narrative, external markers, and click-to-open evidence. Clicking a pill still never changes slides.
- Rebalance row spacing so the story takes less vertical space without shrinking text excessively.

## Technical scope

Update the deck-scoped signal formatting in `src/lib/deckmoSignalAttributes.ts`, its rendering in `src/components/deckmo/RickySignalStory.tsx`, and the relevant story styles in `src/styles/base.css`. Leave transaction fixtures, other slides, and shared demo views unchanged.

## Verification

Check slide 2.3 at your 1375×842 viewport and smaller/larger supported desktop sizes. Confirm compact inline pills, readable amounts and account types, natural wrapping, working evidence expansion, no horizontal overflow, and unchanged arrow-only navigation. Run the existing signal calculation and navigation tests.