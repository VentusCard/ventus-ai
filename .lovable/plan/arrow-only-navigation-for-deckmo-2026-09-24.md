# Arrow-only navigation for /deckmo

## Change
- Clicking the slide canvas no longer advances the deck.
- Arrow keys (Right/Down forward, Left/Up back) remain the way to move between beats.
- Interactive content inside slides (pills, transactions, phone buttons, AI chat, search) keeps working exactly as today.

## Kept as is
- Footer back/next buttons and the Table of Content (P) stay, as explicit controls. Say if you want those removed too.
- Space / PageUp / PageDown: removed so only arrows navigate (space also conflicts with typing-adjacent interactions).

## Technical details
In `src/components/deckmo/DeckmoDeck.tsx`:
- Remove `handleCanvasClick` and the `onClick` on the scroller div.
- Keydown handler: navigation keys reduced to `ArrowRight/ArrowDown` and `ArrowLeft/ArrowUp`; editable-target bail and P/Escape logic unchanged.

## Verification
Playwright at 1540x855: clicking empty canvas leaves the slide counter unchanged; arrows advance/go back; build clean.
