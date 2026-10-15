# Fade the outside lead-in words on 4.1

## What changes

On slide 4.1 the three outside pills are already blurred to near-nothing, but the words leading into them are fully readable, so the outside story is still given away:

- "…; outside ownership data identifies him as a"
- "… , while outside vehicle data shows a"
- "…; outside purchase data also points to"

Those lead-in words will fade and blur exactly like their pill on 4.1, then sharpen together with the pill on 4.2. Nothing on the slide moves — the layout is already locked between the two beats, and it stays that way.

The closing period of a row whose last clause is an outside signal fades with it too, so no crisp punctuation dangles after a blurred pill. Internal-only rows (Life Events, Risk) are untouched, and 4.2 is unchanged.

## Technical details

- `src/lib/deckmoStoryReveal.ts` — add one small rule alongside the existing `shouldRevealStoryRows`: an outside clause is hidden when its source is external and the reveal step is 0. The component derives both the pill state and the lead-in state from this so they can't drift apart.
- `src/components/deckmo/RickySignalStory.tsx` — the lead-in text is currently a bare text node before each pill. Wrap it in a span that carries the same reveal attribute the pill already carries (`data-revealed`), using the existing spacing rules so 4.2 text is byte-identical to today.
- `src/styles/base.css` — the fade lives on `.ricky-story-pill[data-revealed="false"]` today (opacity 0.28, grayscale, 1.5px blur). Split the shared part (opacity, filter, transition, reduced-motion handling) so it applies to the lead-in span as well, and leave the pill-only parts (dashed border, glow pulse) on the pill.
- `scripts/deckmoSignalStory.test.ts` — cover the new rule: hidden for an outside clause at step 0, shown at step 1 and when nothing is gated, never hidden for internal clauses.

## Verification

- Playwright on `/deckmo` at 1903×903, 1691×1011 and 1376×1011: on 4.1 the three lead phrases compute to the same faded/blurred state as their pills; on 4.2 all three are crisp; row heights and line wrapping are identical between 4.1 and 4.2.
- Confirm the internal-only rows and the profile heading are unchanged, and that credit-union mode is unaffected.
- Run the deck regression tests and check the build log before reporting completion.
