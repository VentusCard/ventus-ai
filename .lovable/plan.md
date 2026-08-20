# Kill invented bank brands ("STAR Financial") everywhere in the phone mockup

## What I verified

I called the live generators with the same payload shape the personalization tabs send, and loaded `/bankdemo` in a browser with network capture:

- `generate-next-offers` — all three passes (life-event, financial-signal, pillar-rollup) returned `Our Bank` for every bank-product deal; no invented issuer in the `merchant` field.
- `generate-product-cards` — returned `Our Bank Home Equity Line of Credit`, `Our Bank Advantage Savings`, etc.
- Fresh `/bankdemo` load: no "STAR Financial" anywhere in the rendered page or in any edge-function response.

So the merchant-field fix holds. What is still unprotected:

1. **Only `merchant` is sanitized.** The phone renders `deal.product`, `deal.valueLine`, `deal.dealDescription`, and the collection/rollup label — none of those go through `resolveMerchant`, so the model can still write "STAR Financial" inside body copy and it shows up.
2. **Product cards scrub only `product_name` / `offer_headline`** — `quote`, `benefits[]`, and `cta` are untouched.
3. **Other generators feeding the same surfaces are not covered at all**: `consumer-chat` (relationship chat bubbles), `deal-personalization`, `generate-product-actions`, `generate-campaign-offers`, `generate-financial-tip`.
4. **No client-side guard.** Results are held in memory only, so anything the model emits renders verbatim; a single bad generation shows an invented bank until the tab is reselected.

## The fix

**1. Server-side: sanitize text, not just the merchant field**

In `generate-next-offers`, extend the final `sanitizeOfferMerchants` sweep into a full text scrub that also rewrites any bank-ish brand phrase found in `product`, `valueLine`, `valueMath`, `dealDescription`, and the group `rollup` label — replacing the invented brand with the configured bank label. Same scrub applied to `quote`, `benefits[]`, and `cta` in `generate-product-cards`.

**2. Share one scrubber**

Move the brand-detection regexes and the rewrite helper into a shared module under `supabase/functions/_shared/` so every function uses one implementation, and apply it on the way out of `consumer-chat`, `deal-personalization`, `generate-product-actions`, `generate-campaign-offers`, and `generate-financial-tip`.

**3. Client-side last line of defense**

Add a small `scrubBankBrands(text, bankLabel)` in `src/lib` and run generated offers and product cards through it in `personalizationResultStore` before they reach the phone views. This makes an invented brand impossible to render even if a function is stale, a cached result predates a fix, or the model drifts.

**4. Prompt tightening**

Add the strict naming rule to the *system* prompts of the remaining passes and to `generate-product-cards`, stating the rule applies to every text field, not just the merchant name.

## Detecting the brand

Match a capitalized multi-word phrase whose last token is one of `Financial, Bank, Bancorp, Banc, Lending, Lenders, Capital, Trust, Savings, Credit Union, Federal, Mutual, FCU`, excluding the configured bank label itself and an allowlist of real retail brands. Replace the whole phrase with the bank label.

## Technical notes

- Files: `supabase/functions/generate-next-offers/index.ts`, `supabase/functions/generate-product-cards/index.ts`, new `supabase/functions/_shared/bankBrand.ts`, plus the four other generators listed above; `src/lib/bankBrandScrub.ts` (new) and `src/lib/personalizationResultStore.ts`.
- Verification: re-run the direct function calls plus a `/bankdemo` browser pass that walks all three personalization tabs and asserts no bank-ish brand other than the configured label appears in the DOM.
- If you can point at the exact tab and card where you still see "STAR Financial", I'll target that path first — my repro came back clean, so it is either intermittent model output in body copy or a session that predates the last deploy (a reload regenerates).
