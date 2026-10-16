# Split the Section 4 header line: one sentence per beat

## What changes

Section 4 currently shows the same headline sentence on every beat, plus a second smaller line on 4.2. After the change each beat carries exactly one sentence:

- **4.1** (headings and empty rows): no sentence at all — headings only, as today.
- **4.2** (all signals): only "Complex customer signals, broken into individually identifiable attributes: from amounts and cadence to locations, relationships, and events and more."
- **4.3** (one signal's details): only "Every signal is a cross-category, cross-rail pattern that Ventus AI recognizes as an insight."

## How

Both sentences already exist as separate fields in the deck script (`description` and `attributesNote`) — no new copy is written and no wording is touched. Only the rendering in `RickyStoryScene` changes:

- The 4.2 branch stops passing `description` as the headline subtitle and instead passes `attributesNote`, so the single visible sentence under the headline is the attributes line.
- The extra paragraph that currently prints `attributesNote` under the headline is removed, since that text now sits in the headline subtitle itself.
- The 4.3 branch already passes `description` and nothing else, so it needs no change — the cross-category sentence stays exactly where it is.
- 4.1 keeps its current behaviour: the sentence is present but invisible and hidden from readers, so the headline does not jump when 4.2 arrives.

One visible side effect: the attributes line moves from the small muted style into the standard headline-subtitle style used by every other beat, so it reads at the same size as the cross-category sentence on 4.3. It is a longer sentence, so it may take two lines instead of the current two, and the signal pills below get slightly less height. The pill area already scrolls, so nothing should be cut off — this will be checked in the preview at your window size before the work is called done.

## Checks

- A small test keeps the two sentences from drifting back onto the same beat: 4.2 renders the attributes sentence and not the cross-category one, 4.3 the reverse.
- Existing Section 4 tests and the deck build are re-run.
- Preview walkthrough at 1546x903: 4.1 headings only, 4.2 attributes sentence only, open a signal to see 4.3 with the cross-category sentence only, and confirm all pills still fit without clipping.

## After building

The stored note about Section 4 header wording is updated so the split is recorded and not quietly merged back together later.
