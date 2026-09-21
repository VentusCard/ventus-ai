# Make the JFK transaction detail a true part of deck navigation

## Goal
Beat 5.4 **is** the JFK transaction detail page. Pressing the left arrow from beat 6.1 always lands on the JFK detail — not the transaction list.

## Current behavior
- Slide 5 (Recent Transactions) has 4 beats; beat 5.4 (step 3) opens the JFK detail inside the phone.
- The detail open/closed state lives in local component state that only updates when the beat number changes. Going 6.1 → back keeps the same beat number for slide 5, so the phone can show the list instead of the JFK detail (e.g. after the phone's Back button was pressed, or because no state change fired).

## Changes

### 1. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`
- Derive the open transaction from the beat instead of syncing it into state:
  - `override` state: `undefined` = follow the beat; a number or `null` = explicit user choice (tapping a row sets the number, phone Back sets `null`).
  - Effective selection = `override !== undefined ? override : (step >= 3 ? jfkIndex : null)`.
- Reset `override` to `undefined` whenever the beat (`step`) changes, and whenever the slide becomes active again (new `active` prop) — so arriving at 5.4 from any direction (forward, back from 6.1, table-of-contents jump) re-opens the JFK detail by default.
- All existing interactions stay: tapping any row opens its detail, phone Back returns to the list, confirmation and correction flows unchanged.

### 2. `src/components/deckmo/DeckmoBankdemoScenes.tsx`
- `BankdemoImmediate` accepts the `active` prop (already passed by `DeckmoDeck` to every scene) and forwards it to `DeckmoRecentTransactionsTab`.

No changes to slide order, beat counts, copy, or styling.

## Verification
- Playwright at 1540×855 and 1920×1080:
  - 5.3 → 5.4 opens the JFK detail.
  - 5.4 → 6.1 → ArrowLeft lands on 5.4 with the JFK detail open.
  - Press phone Back (list shows) → 6.1 → ArrowLeft → JFK detail open again.
  - 5.4 → 5.3 still returns to the list.
- Confirm build log is clean.
