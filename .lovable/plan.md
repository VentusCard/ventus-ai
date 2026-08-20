# Fix invented bank brand names ("Star Financial") in the rewards mockup

## What's happening

The rewards deals in the phone mockup are generated live by the `generate-next-offers` function. For deals tied to **financial signals** (auto loan refi, mortgage, student loan, investing), the merchant should be the bank itself. The function computes a bank label from the demo bank setting — "Your Bank" when no custom bank name is configured — but it only uses that label as a *fallback* when the model omits a merchant, and the prompt never forbids inventing an issuer brand. So the model fills in a plausible-sounding lender name, which is where "Star Financial" comes from.

The sibling function `generate-product-cards` already has this guard: it hard-instructs the model to use only the bank label and never a real or invented bank brand. `generate-next-offers` is missing the equivalent rule.

## The fix

In `supabase/functions/generate-next-offers/index.ts`:

1. **Prompt rule (financial-signal system prompt):** state that every bank-product deal must use `${bankLabel}` verbatim as `merchant`, and that inventing lender/issuer brands (e.g. "Star Financial", "Summit Lending") or naming real banks (Chase, Wells Fargo, Bank of America, SoFi, LightStream) is prohibited. Third-party retail merchants stay allowed only for non-bank-product deals.
2. **Server-side enforcement:** in the financial-signal mapping step, when a deal's product is a bank product (loan, refinance, HELOC, mortgage, card, savings, IRA, investing, line of credit), overwrite `merchant` with `bankLabel` instead of trusting the model's value. This guarantees the mockup can never show an invented bank name even if the model ignores the prompt.
3. Apply the same "never invent or name real banks" line to the life-event and rollup prompts, where the same drift can occur on financial deals.

## Notes

- No frontend changes; `GeneratedOffersPhoneView` just renders `deal.merchant`.
- If a custom bank name is set in demo settings, that name is used everywhere; otherwise deals read "Your Bank".
- Redeploying the function is enough; cached per-customer results refresh on reload.
