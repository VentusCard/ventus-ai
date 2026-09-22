# Sharper deal search + collection-style results

Two problems today: searching "coffee machine" returns merchants that don't actually sell one (Dyson), and results render as a cramped two-per-row grid.

## 1. Only show merchants that clearly sell the item

- Require a per-match confidence score instead of a bare ID list. Each match returns `{ id, confidence, why }`, and only matches at 0.9 or above are kept.
- Tighten the matching rules: a merchant qualifies only if a shopper could walk in (or onto the site) and buy the queried item today. Brand adjacency ("makes appliances", "sells home stuff") is not enough.
- Drop the current "coffee machine → Dyson" example from the instructions and replace it with an explicit negative: Dyson sells vacuums, fans and hair tools, not coffee machines.
- Add a "general retailer" rule: big-box stores count only when the item is a normal shelf item there.
- Allow a small result set — 3 to 10 merchants. An empty result is a valid, correct answer, and the screen already handles "No matching deals found".
- Keep a safety net on the server: filter out any returned ID not in the catalog, and cap the list after the confidence filter.

## 2. One deal per row, styled like the collection cards

Replace the two-column grid in the results view with a single-column stack where each deal is a full-width card matching the curated-collection look:

- Category-colored accent and rounded card on white.
- Merchant name on top, subcategory beneath.
- Reward value as a colored pill on the right.
- One line of deal description.
- Full-width "View Deal" action at the bottom of the card.
- Cards fade in one after another as they already do.

The results header ("Results for …", count, Clear) and the bottom search bar stay as they are.

## Technical notes

- `supabase/functions/semantic-deal-search/index.ts`: change the tool schema to `matches: [{ id, confidence, why }]`, rewrite the system prompt for strict purchase-intent matching, filter `confidence >= 0.9` and validate IDs against `DEAL_CATALOG` before responding. Response shape stays `{ matchingDealIds, reasoning }` so no client contract change.
- `src/components/exec-demo/GeneratedOffersPhoneView.tsx`: search-results block only — swap `grid grid-cols-2 gap-1.5` for a `space-y-2` single-column list and restyle each card. No change to the carousel, savings bar, perks, Top Pick, or Expiring Soon.
- Verify in the preview on the deck's Rewards phone: "coffee machine" no longer returns Dyson, and results render one per row.
