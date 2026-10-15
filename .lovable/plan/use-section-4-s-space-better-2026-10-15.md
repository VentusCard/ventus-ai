# Use Section 4’s space better

## Changes
- Apply only to **4.1 and 4.2: Ricky, understood**, shown in the screenshot.
- Keep the current story width, side margins, headline, and profile line unchanged.
- Enlarge the left-column family headings from their current 12px size to approximately 16px on standard desktop sizes, with a smaller compact treatment only where needed. Keep the label column’s width and color dots unchanged; allow longer headings to wrap cleanly.
- Extend the five-row story through more of the available vertical space, reducing the unused area beneath it. Add balanced vertical breathing room to each row, keeping longer paragraphs naturally taller rather than forcing five equal-height rows.
- Keep the connecting prose, parent pills, and nested attributes at their current sizes and preserve their inline format.
- Keep the entire story visible without scrolling at the supplied 1903×1024 size. At shorter desktop sizes, use compact spacing and retain scrolling only when necessary to keep every signal accessible.
- Preserve a clear gap above the presentation footer; do not stretch the headline or add filler content.

## Unchanged
- All wording, amounts, signal ordering, colors, leading Ext badges, and supporting-transaction pop-ups.
- The 4.1 entrance animation and faded external clauses; the 4.2 external reveal.
- Identical row positions and wrapping between 4.1 and 4.2.
- Slide navigation, the platform in Section 5, and all other slides.

## Technical details
- Keep `RickyStoryScene` horizontal sizing and gutters unchanged.
- Update the family-row container and heading sizing in `RickySignalStory.tsx`, plus story-only compact rules in `base.css` if needed.
- Give the row container the remaining available height, with content-based minimum row heights and evenly shared surplus vertical space. Preserve scrolling when the content exceeds the available height.
- Use fixed desktop heading sizes and compact breakpoints, not viewport-scaled fonts. Keep the same vertical layout for both reveal steps.
- Keep pop-up sizing and shared components untouched.

## Verification
- Compare both beats at 1903×1024, 1691×1011, 1376×842, and 1024×768.
- Confirm larger left-column headings, improved vertical space usage, unchanged story width and pill sizes, no text collisions or horizontal overflow, and footer clearance.
- Confirm rows do not move when external signals reveal, and test opening a financial and external pop-up without changing slides.
- Run the relevant existing deck tests and check preview diagnostics.