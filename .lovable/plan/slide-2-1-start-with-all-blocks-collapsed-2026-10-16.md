# Slide 2.1: start with all blocks collapsed

## What changes

Slide 2.1 currently arrives with the **Cards** block already open, showing its transaction table. After this change, the slide arrives with **all six blocks closed** — KYC, Cards, ACH, Checks, Wire and Zelle — each showing only its header (name, transaction count, and the data-structure description). The presenter clicks a header to open that block's scrollable list, exactly as they do now.

Opening a block still closes whichever other block was open, so the panel only ever shows one list at a time.

## What stays the same

- Nothing else on 2.1 moves: the title bar, block order, headers, counts, column layouts, and scrollable lists are untouched.
- 2.2 and every other slide are unaffected.
- Navigation is unchanged — slides still move only with the on-screen arrows or the arrow / A / D keys.

## How it will be verified

Open the deck at 1375x842 and 1024x768, walk to 2.1, and confirm:

1. No block is open on arrival — six headers, no visible table.
2. The six headers still fill the panel evenly with no gap at the bottom (already true today: 78px each across the 470px panel).
3. Clicking "Cards" opens its list and closes it again on a second click.
4. Leaving 2.1 and returning does not change what the arrows do.

## Technical details

- Single edit in `src/components/deckmo/RickyRailAccordion.tsx` (line 55): the accordion's initial state changes from `"Cards"` to `null`, meaning "nothing open".
- The component already renders a dedicated all-collapsed layout — when nothing is open, each header grows to share the panel height equally (`[&>.ricky-rail]:flex-1`). This path was measured in the live preview and fills the panel correctly, so no CSS, copy, or data changes are needed.
- No test is added: the project's six test files test data and library logic only, with no component-rendering harness, and the behavior is a presentation default rather than a business rule. The live-preview checks above cover it.
