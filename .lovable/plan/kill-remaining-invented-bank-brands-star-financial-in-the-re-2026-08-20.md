# Kill remaining invented bank brands ("STAR Financial") in the rewards mockup

## What's actually happening

The "Expiring Soon" strip in the phone mockup just renders `deal.merchant` from whatever `generate-next-offers` returns — it has no hardcoded content, so the invented name comes from the generation function.

`generate-next-offers` runs three generation passes and only two of them sanitize the merchant:

- Life-event pass — sanitized via `resolveMerchant` (line 410)
- Financial-signal pass — sanitized via `resolveMerchant` (line 492)
- Pillar-rollup pass — **not sanitized**: the parsed model output is pushed straight through (`rollupOffers.push(...parsed.rollupOffers)`, line 388)

Savings/APY and "Auto-Save" style deals are exactly the kind of bank product the rollup pass emits, which is why they still carry a made-up issuer name.

## The fix

1. **Sanitize every path once.** After all three passes finish and `rollupOffers` is assembled, run a single normalization sweep over every group's deals that applies the existing `resolveMerchant(merchant, product, bankLabel)` logic. This covers the pillar-rollup pass and guarantees any future pass is covered too.
2. **Widen the bank-product detection** so APY/deposit style products are caught: add `apy`, `yield`, `high-yield`, `money market`, `auto-save`, `autosave`, `round-up`, `cd rate` to `BANK_PRODUCT_RE`, and add `capital|trust|savings bank|star financial`-style issuer words to `BANKISH_MERCHANT_RE` so an invented brand is replaced even when the product string is vague.
3. **Add the naming rule to the pillar-rollup system prompt** (it currently only appears in the user prompt for that pass), matching the strict wording used in the financial-signal prompt.
4. **Same sweep for product cards.** `generate-product-cards` only instructs the model to prefix names with the bank label; add a server-side pass that rewrites any `product_name` / issuer field containing a bank-ish brand other than the configured label.

## Seeing the change

Generated results are cached per customer for the session, so after the fix reselect the customer (or reload `/bankdemo`) to regenerate. The demo bank setting still drives the label — default "Our Bank", or the custom name when configured.

## Technical notes

- Files: `supabase/functions/generate-next-offers/index.ts`, `supabase/functions/generate-product-cards/index.ts`.
- No frontend changes; `GeneratedOffersPhoneView` keeps rendering `deal.merchant` as-is.
- Verify by calling the edge function directly with a financial signal set and confirming no merchant outside the allowed retail brands contains "Financial", "Bank", "Lending", etc.
