# Section 4: pill click opens a full "4.3" detail beat

## What changes for the presenter
- **4.1** stays the same: family headings and empty rows only.
- **4.2** shows every pill like it does now. Clicking a pill no longer opens a pop-up. It moves the deck to **4.3** for that signal.
- **4.3** is a full-slide view that replaces the five-row story grid. It shows the same information the pop-up shows today: family and source badges, the description, key details, merchants, observed monthly payments, outside evidence, and the raw-vs-enriched supporting transactions table. The table keeps Rail first and Subcategories, with sideways scrolling and no cut-off text.
- A "Back to all signals" button on 4.3 returns to 4.2. The left arrow, ← and A also return to 4.2.
- Pressing → or D on 4.2 without clicking a pill opens 4.3 with the **home purchase** signal. Pressing → on 4.3 goes to Section 5. Pressing ← from Section 5 returns to 4.3 with the signal you last opened, or the home purchase if you haven't opened one.
- The slide counter reads "4.3" while a signal is open.

## Header copy
- On 4.2 and 4.3 the description becomes: "Every signal is a cross-category, cross-rail pattern that Ventus AI recognizes as an insight." The current line becomes the subtitle on 4.2 only. If you'd rather use only the new line, I can drop the old one.
- On 4.3 the selected signal's name is shown as the slide heading, under the same section title.
- 4.1 keeps its description hidden.

## Technical details
- `deckmoScript.ts`: set ricky-story to `steps: 3` and add the new description copy. Export a default detail-signal constant that resolves to the home purchase pill by label. Keyboard and arrow navigation into step 3 uses the clicked signal, or this default when no pill was clicked.
- Keep the selected signal label in deck state in `DeckmoDeck.tsx`, next to slide state. Pills call a scoped `openSignalDetail(label)`. This is an explicit deck-scoped button, the same pattern as the benefit buttons, so the slide still changes only through explicit controls.
- `RickySignalStory.tsx`: move `renderDetail` into a `RickySignalDetail` panel that shows inline on step 3. Remove the Popover. Pills stay real buttons without `aria-expanded`.
- Update `deckmoNavigation.test.ts` (step 2 → Section 5, pill → 4.3, back → 4.2) and `deckmoSignalStory.test.ts`. Update the AGENTS.md navigation and signal-story rules, plus the outside-clause-reveal memory.
- Check in the browser at 1691×1011 and 1024×768: click a pill, see the 4.3 detail, go back, and use the arrows.
