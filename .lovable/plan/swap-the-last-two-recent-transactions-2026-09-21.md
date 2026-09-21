# Swap the last two recent transactions

Replace the two placeholder subscription rows at the bottom of the Recent transactions tab with one personal subscription and one business-owner signal.

## New rows

1. Spotify — personal subscription
   - Raw statement text: `SPOTIFY P3A1B2C3D4`
   - Shown as: Spotify Premium, $13.99, Sep 14
   - Detail: recurring monthly, price up $2.00 from the usual $11.99, so Ricky sees the increase before the statement.

2. LegalZoom — business-owner signal
   - Raw statement text: `LEGALZOOM.COM 8005551212 CA`
   - Shown as: LegalZoom, $199.00, Sep 12
   - Detail: annual business filing/registered-agent renewal — a signal that Ricky runs a small business, not a personal expense.

The JFK vending confirmation row stays above these two, keeps its light yellow highlight, and every row stays a single line with the enriched detail on tap.

## Technical notes

- Edit the last two entries in `DECKMO.immediate.activity` in `src/lib/deckmoScript.ts` (date, rail, icon, raw, clean, meta, amount, pattern, explanation).
- Icons: use the existing `music` icon for Spotify and add a `business` icon (Briefcase) to `PURCHASE_ICONS` in `src/components/deckmo/DeckmoRecentTransactionsTab.tsx` for LegalZoom.
- No layout or navigation changes.
