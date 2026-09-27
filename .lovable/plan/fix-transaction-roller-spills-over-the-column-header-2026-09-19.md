# Fix: transaction roller spills over the column header

## Problem
On the Visibility Gap slide, the Inside-the-Walls ledger's rolling rows slide up over the column header ("ACCOUNT / RAIL / RAW DESCRIPTION / AMOUNT"). Cause: the ticker element is a static sibling directly below the header inside the same container, and its roll animation (`deckmo-visibility-roll`, translateY 0 → -33.33%) moves rows above their flow start — painting them over the header, which has no stacking/clip boundary. The top gradient mask starts too low to hide the transit.

## Fix (src/components/deckmo/DeckmoDeck.tsx — InsideLedger only)
1. Wrap the `deckmo-visibility-ticker` div in a dedicated clip viewport: an element that fills the remaining height below the header (`absolute inset-x-0 top-[33px] bottom-0 overflow-hidden`, or equivalently `relative min-h-0 flex-1 overflow-hidden` nested below the header).
2. Keep the existing top/bottom gradient masks inside that viewport, adjusting the top gradient to start at the viewport's top edge (`top-0`) so the fade covers the roll's entry point.
3. Move the column-header row outside the clipping viewport so it stays fixed and never has rows painted over it.

## Verification
- Playwright at 1024×768, 1389×855, 1440×900, 1920×1080: confirm no rows ever render above the header row, gradients look continuous, loop stays seamless, and no overflow or external requests.
- Check build errors log is clean.
