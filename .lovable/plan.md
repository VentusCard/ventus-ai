# Use Section 4’s space better

## Changes
- Apply only to **4.1 and 4.2: Ricky, understood**, shown in the screenshot.
- Widen the story area and reduce oversized outer side margins. Keep the headline, profile line, and family rows aligned to the same edges.
- Increase the nested pills, connecting prose, family labels, and profile facts for presentation readability. Keep each signal as one inline parent pill with lighter nested attributes.
- Give the five family rows more breathing room and use the available height more evenly. Keep row heights content-led: longer paragraphs receive more room rather than forcing five equal-height rows.
- Keep the entire story visible without scrolling at the supplied 1903×1024 size. At shorter desktop sizes, use compact spacing and retain scrolling only when necessary to keep every signal accessible.
- Preserve a clear gap above the presentation footer; do not stretch the headline or add filler content.

## Unchanged
- All wording, amounts, signal ordering, colors, leading Ext badges, and supporting-transaction pop-ups.
- The 4.1 entrance animation and faded external clauses; the 4.2 external reveal.
- Identical row positions and wrapping between 4.1 and 4.2.
- Slide navigation, the platform in Section 5, and all other slides.

## Technical details
- Adjust the deck-scoped `RickyStoryScene` width and gutters in `DeckmoDeck.tsx`; its current wrapper is capped at 1560px with additional inner side padding.
- Update the profile and family-row layout in `RickySignalStory.tsx`, plus the story-only sizing rules in `base.css`.
- Use bounded desktop typography sizes and compact breakpoints, not viewport-scaled fonts. Allocate surplus vertical space through row spacing while preserving natural-height content and the shared label column.
- Keep pop-up sizing and shared components untouched.

## Verification
- Compare both beats at 1903×1024, 1691×1011, 1376×842, and 1024×768.
- Confirm larger readable pills and labels, balanced margins, no text collisions or horizontal overflow, and footer clearance.
- Confirm rows do not move when external signals reveal, and test opening a financial and external pop-up without changing slides.
- Run the relevant existing deck tests and check preview diagnostics.