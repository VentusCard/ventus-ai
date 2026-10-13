# Restrict /deckmo slide navigation

## Navigation rules
- Allow slide changes only through the on-screen **left/right arrow buttons**, keyboard **← / →**, or **A / D** (case-insensitive).
- Remove **↑ / ↓** as slide-navigation shortcuts.
- Prevent mouse-wheel, trackpad, scrollbar, touch scrolling, and other clicks from changing the deck slide. Keep scrolling inside transaction windows and embedded tools working normally.
- Keep clicks on KYC, rail headers, signal pills, and embedded demo controls fully interactive without advancing the deck.

## Table of contents and other controls
- Keep the table of contents available as an overview, but make its section entries non-navigating; remove the instruction to select a section.
- Keep **P** and **Escape** for opening/closing the overview, and keep its close controls and the exit button working.
- Preserve text-entry behavior: typing A/D or using arrows inside editable fields must not navigate the presentation.

## Technical details
- Update the deck navigation in `src/components/deckmo/DeckmoDeck.tsx`, where footer arrows, table-of-contents jumps, keyboard shortcuts, and scroll-driven section selection are currently handled.
- Make slide state authoritative and keep section scrolling programmatic rather than user-driven. Remove the scroll observer’s ability to change the active slide.
- Scope the changes to /deckmo presentation navigation; do not alter shared demo controls or /bankdemo navigation.

## Validation
- Add and run focused tests for allowed keys and ignored keys.
- Verify arrow buttons, ←/→, lowercase/uppercase A/D, and first/last-slide limits.
- Verify wheel/trackpad scrolling and table-of-contents clicks do not change slides, while KYC expansion and transaction scrolling still work.
- Verify editable fields do not trigger navigation and check the live preview for errors.