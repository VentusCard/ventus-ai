# Responsive spacing for Ricky’s signal story

## Scope
Redo spacing on `/deckmo` slide **2.3**, using **one aligned row per signal family**, as selected. Other slides remain unchanged.

## Layout
- Replace the measured, absolutely positioned left segments with five natural-height rows: Behavioral, Life Events, Financial, Demographics, Risk.
- Each row pairs its color-dotted header on the left with its part of Ricky’s story on the right. Both columns share the same row height, so alignment remains correct when pills wrap.
- Use a consistent left-column width, a restrained column gap, and comfortable vertical padding. Thin horizontal separators span the rows; retain the subtle vertical divider.
- Keep natural-language connections within each family. Preserve all 14 pill labels, their order, colors, external markers, and existing facts; only normalize sentence-boundary punctuation for the separate paragraphs.
- Tighten and balance the spacing between the slide heading, profile strip, and five-row story. Avoid stretching short rows merely to fill the screen.

## Different resolutions
- Let the story column take available width and rows grow with their content; no fixed row heights or pixel-positioned headers.
- Use standard and compact spacing/type settings for shorter desktop windows, not continuously viewport-scaled fonts. Keep labels legible and long pills safely wrapping.
- Keep the story inside the space between the presentation header and footer. At constrained heights, allow scrolling within the story rather than clipping content or moving slides.
- Retain the existing desktop-only requirement below 1024px.

## Interactions and scope guardrails
- Keep one expandable detail panel beneath the five rows, with existing internal transaction evidence and external source evidence.
- Opening a detail must not stretch the family rows, break their alignment, or change slides.
- Preserve arrow-button and ←/→/A/D navigation, profile facts, and all other Ricky scenes.

## Technical details
- Primary change: `src/components/deckmo/RickySignalStory.tsx`; group existing story clauses by their existing signal family and render a normal two-column row layout.
- Remove the paragraph measurement state, resize observer, and absolute segment positioning.
- Add narrowly scoped spacing styles in `src/styles/base.css` only if needed, using existing semantic colors.
- Adjust the 2.3 wrapper in `src/components/deckmo/DeckmoDeck.tsx` only if necessary for heading/profile spacing; do not change the shared slide frame.
- Record the natural-row layout decision in `AGENTS.md` and track completion in `roadmap.md` during implementation.

## Verification
- Review 2.3 at 1024×768, 1280×800, 1377×842, 1691×1011, and 1920×1080, plus an effective desktop viewport representing browser zoom.
- Confirm all five headers align with their own story sections, all 14 pills remain visible or reachable, and no labels, pills, or details overlap or create horizontal overflow.
- Open/close internal and external details and expand supporting transactions; confirm row alignment and slide position remain stable.
- Verify navigation to 2.2 and 3.1, run the focused signal-story and navigation tests, and check the latest preview build output.