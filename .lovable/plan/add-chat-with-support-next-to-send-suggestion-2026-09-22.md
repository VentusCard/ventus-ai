# Add "Chat with support" next to Send suggestion

## Goal
In the deck's transaction detail screen (beat 5.4 and any tapped transaction), the correction card's "Send suggestion" button currently takes the full width. Add a second button beside it that shares the width, for customers who want to dispute the charge or talk to customer service.

## Chosen behavior (user-confirmed)
- Button label: **Chat with support**
- On tap: show an acknowledgment and close the form (no chat mockup)

## Changes — single file: `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`

1. New state: `supportChats: Record<number, boolean>` — tracks which transactions the customer asked to escalate, mirroring `corrections`/`confirmations`.

2. Correction form (the card under "What should this be?"):
   - Replace the single full-width submit button with a two-button row (`flex gap-1.5`), each button `flex-1` so they share the width:
     - **Send suggestion** (default variant, submit, disabled until the input has text — unchanged)
     - **Chat with support** (outline variant, same height/typography as "Send suggestion")
   - "Chat with support" tap: `stopPropagation`, set `supportChats[selected] = true`, clear the draft, close the form. It works with an empty input (no typing required).

3. Acknowledgment row (the existing thank-you + Undo block):
   - Extend the message ternary so a support request shows: **"Thanks — we've connected you with customer service."**
   - Message priority stays: correction suggestion → confirmed ("Looks Good"/"Yes, that's right") → support request → "we'll take another look".
   - Gate: the block shows when `corrections[selected] || confirmState || supportChats[selected]`.
   - **Undo** also clears the support flag, restoring the action buttons.

4. Reset paths unchanged: `closeDetail()` and the beat-change/active effect also clear support state (clearing `supportChats` for the selected row / on re-arm).

## Verification
- Playwright at 1540×855: open deck (sessionStorage bypass), go to 5.4 (JFK detail), tap "No, that's not right" → both buttons render side by side at half width → tap "Chat with support" with empty input → acknowledgment line + Undo appears, form closed → Undo restores the buttons. Repeat quickly on a normal row (e.g. Spotify) to confirm it works outside the JFK beat.
- Build log clean.
