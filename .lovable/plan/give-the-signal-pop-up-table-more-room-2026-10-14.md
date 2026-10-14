# Give the signal pop-up table more room

The Section 4 pop-up table is cramped: merchant names get cut off ("Fidelity Brokera…"), the raw description is cut off, the dark group-header labels are unreadable, and the rows are tight.

## Changes
1. **Wider pop-up**: up to 1240px (still capped to the screen width minus a margin), centered on screen instead of anchored to the pill, so it never runs off the right edge.
2. **Rebalanced columns** so the clean names fit in full:
   - Rail 64px · Date 72px · Description (flexible, gets the extra width) · Amount 96px
   - Merchant 260px · Category 140px · Subcategories 170px · Freq 96px
   - Merchant names wrap to a second line instead of being cut off (two lines max per row). The raw description stays on one line with the full text on hover.
3. **Readable group headers**: "Raw Transaction · as received from bank feed" and "Enriched output · AI-labeled semantic intelligence" get a light tinted background with dark text, matching the family color, instead of gray on dark gray.
4. **Breathing room**: slightly taller rows (more vertical padding), a bit more horizontal cell padding, and a little more space between the header block and the table.

Unchanged: the pill wording, the 4.1/4.2 reveal, the family colors, the ways the pop-up closes, and arrow-only navigation.

## Checks
- Verify the Fidelity, Goldman Marcus, and Income pop-ups at 1903×1024, 1546×1024, and 1376×1011: merchant names are fully visible, nothing overflows sideways, and the headers are readable.
- Run the deck tests.

## Technical details
- `RickySignalStory.tsx`: change the popover width class, `<colgroup>` widths, cell padding, and tier-1 header styling; center the popover with `align="center"` or a fixed viewport-centered position.
