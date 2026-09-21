# Add a "Needs Confirmation" transaction to the Recent Transactions tab

## Goal
Add a 7th transaction to the Immediate Value phone mockup that shows Ventus enrichment asking the customer to confirm an ambiguous merchant: the raw descriptor reads `365 RETAIL MARKETS TROY MI` ($4.75, Troy, MI, vending / miscellaneous retail), but the purchase is actually a vending machine at JFK Airport. The cleaned name is shown as a question — "JFK Airport Vending Machine?" — and the expanded detail asks the customer to confirm.

## Changes

### 1. `src/lib/deckmoScript.ts` — new activity entry (first in the list, date "Today")
- `date: "Today"`, `rail: "CARD"`, `icon: "vending"`, `amount: "$4.75"`
- `raw: "365 RETAIL MARKETS TROY MI"`
- `clean: "JFK Airport Vending Machine"` — rendered with a trailing "?" when unconfirmed
- `meta: "Vending · Miscellaneous retail"`
- `pattern: "One-time · card purchase"`
- `explanation`: explains the mismatch — the merchant descriptor lists Troy, MI, but this purchase matches an airport vending machine at JFK, so we ask the customer to confirm.
- New optional `confirmation` flag on the activity entry so the UI can treat this row specially.

### 2. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`
- Add `vending` to `PURCHASE_ICONS` (CupSoda or similar purchase icon).
- For the confirmation row:
  - Collapsed row shows "JFK Airport Vending Machine?" plus a small amber "Confirm" chip so it stands out from normal rows.
  - Expanded detail keeps the raw statement, shows "Troy, MI · Merchant category: vending / miscellaneous retail" as the category line, and shows the explanation of why confirmation is needed.
  - Replaces the single "Yes, that's mine" button with two actions: "Yes, that's right" and "No, something else".
  - Local component state: after "Yes, that's right", the row's "?" and Confirm chip resolve to a confirmed state (green check, question mark removed) with a short thank-you line. "No, something else" keeps the row but shows a brief "Thanks — we'll take another look." Both are presentational only.
- All other rows and behaviors (expansion, one-line rows, rail chips, tab bar) unchanged.

## Constraints
- Strict light theme, deck tokens only; no dark mode.
- Keep the 620×350 phone frame and one-line row layout; verify the extra row still fits without breaking the scroll area.
- No changes to other slides, beats, or deck navigation.

## Verification
- `bunx tsgo --noEmit` clean, build OK.
- Playwright at 1540×855 (spot-check 1024×768): navigate to the Immediate Value slide, confirm the new row reads "JFK Airport Vending Machine?" with the Confirm chip, expansion shows the Troy, MI raw detail with the two confirm actions, and clicking "Yes, that's right" resolves the row; no page errors.
