# Section 5 phone: reorder Spotify above JFK, add recurring icon, fix dates

## What changes

In `src/lib/deckmoScript.ts` (the `activity` list feeding the slide-5 phone):

1. **Reorder**: move the Spotify Premium row above the JFK vending-machine row, so the list ends: …Escrow wire → Spotify → JFK vending → LegalZoom.
2. **Adjust dates** so the list stays in clean descending order after the swap:
   - Spotify Premium: "Sep 15"
   - JFK vending machine: "Sep 14"
   - LegalZoom stays "Sep 12"
   (All other rows keep their dates; the two swapped rows trade dates.)
3. Keep the JFK row's existing special treatment (lighter-amber highlight, "?" title, confirmation flow) — only its position and date change.

In `src/components/deckmo/DeckmoRecentTransactionsTab.tsx` (collapsed row):

4. **Recurring icon**: after the merchant name, render a small recurring/subscription glyph (Lucide `RefreshCw`, ~10px, slate-400) on any row whose `pattern` text starts with "Recurring" (Courtside Tennis Club, City Utilities, Greenfield Landscaping, Spotify Premium, LegalZoom). Icon sits before the Review chip / amount, shrink-0 so the name still truncates cleanly.

## Verification

- Open /deckmo (gate password), navigate to slide 5; confirm order and dates, recurring icon on the five recurring rows, JFK highlight/confirm flow still works, and beat 5.4 still opens the JFK detail (selection is data-driven via `needsConfirmation`, so the reorder is safe).
- Check at 1540×855 and 1920×1080; confirm build logs clean.
