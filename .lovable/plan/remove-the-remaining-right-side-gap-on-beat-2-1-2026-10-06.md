# Remove the remaining right-side gap on beat 2.1

## What's causing it
On beat 2.1 the hidden "outside events" column (which only appears on beat 2.2) is meant to have zero width, but its own side padding still reserves about 48px of empty space on the right of the panel. That is the blank strip between the Amount column and the panel edge.

## Change
- On beat 2.1 only, drop the side padding of the hidden outside-events column so it truly takes no space. The transaction table then fills the panel to its right border.
- On beat 2.2, restore the same padding so the outside events look exactly as they do today.

## Unchanged
- Panel width, height, position and the 2.1 to 2.2 slide-over transition.
- Columns, rows, text, profile bar, borders and every later beat.

## Verify
- Playwright at 1691x1011 and 1376x855: on beat 2.1 the table reaches the panel's right border with amounts fully visible; on beat 2.2 the outside events panel looks identical to before; build clean.

## Technical details
In `Visibility` (DeckmoDeck.tsx), the second `<section>` has a fixed `px-6 py-4`; inside the `grid-cols-[minmax(0,1fr)_0fr]` track that padding sets a 48px minimum. Make the padding conditional: `moved ? "px-6 py-4" : "p-0"`.
