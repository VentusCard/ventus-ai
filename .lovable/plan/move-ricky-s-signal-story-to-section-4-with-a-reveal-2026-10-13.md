# Move Ricky's signal story to Section 4 with a reveal

## What changes
- Section 2 keeps only the Visibility Gap and Visibility reveal (2.1, 2.2).
- Section 3 stays The Complete Picture (Ventus AI diagram).
- Ricky's signal story becomes its own Section 4, right after The Complete Picture; later sections shift by one (Immediate becomes 5, ... The Ask becomes 10).
- Reveal in two arrow presses:
  - 4.1: family headings, narrative and all internal pills fade/slide in, rows staggered top to bottom. External pills show as faint dashed placeholders.
  - 4.2: the three external pills light up with a soft glow pulse and their "Ext" marker.
- Going back (left arrow / A) reverses the reveal. Clicking pills still opens evidence and never changes slides. Reduced-motion users see instant changes.
- Pill wording, order, colors and evidence stay exactly as they are.

## Technical details
- `deckmoScript.ts`: visibility steps 3 -> 2; insert beat `{ id: "ricky-story", nav: "Meet Ricky", steps: 2 }` after `living-view`; update tests asserting beat counts if any.
- `DeckmoDeck.tsx`: `VisibilityAndRicky` renders only `Visibility`; new `RickyStoryScene` (header + `RickySignalStory`) registered in `SCENES`.
- `RickySignalStory.tsx`: accept optional `revealStep` prop (undefined = fully shown, keeping other uses unchanged); stagger rows via CSS delay; external pills get `data-revealed`.
- `base.css`: `.ricky-story-reveal` keyframes, external placeholder + glow pulse, `prefers-reduced-motion` override.
- Update AGENTS.md rule for the combined visibility story; verify with Playwright at 1375x1011 and 1024x768 and bun tests.
