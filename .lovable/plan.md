## Problem

In Campaign Builder → Message Previews, every BEHAVIOR-family microsegment card renders subject/body copy tuned for credit cards:

- Subject: `"{rate} — on your top category"` or `"More from your everyday spend"`
- Body: `"With the {product} you can get {rate} — the category that already carries most of your spend..."`

For non-card products this reads wrong. A HELOC card ends up saying "on your top category," an IRA card says "your everyday spend," etc. The anchor text itself (e.g. "High-rate balance elsewhere" for HELOC) is already category-correct — only the subject/body wrapper is generic.

Scope: `src/components/tepilot/campaigns/sections/buildMessageCards.ts`, the `case "BEHAVIOR"` block inside `copyFor` (lines ~232-248). No other files, no data changes, no UI/layout changes.

## Fix

Replace the single BEHAVIOR template with a per-`ProductCategory` template map. The anchor string flows through unchanged; only the framing changes. Rate phrase is preserved for credit_cards (where the rate table is meaningful) and dropped for the others, which don't have rate-table mechanics that map to a spend anchor.

Per-category subject + body:

- **credit_cards** — keep today's copy (rate phrase + "on your top category/categories" / "More from your everyday spend"). This is the only case where "top category" is accurate.
- **loans** (Personal Loan, Auto, HELOC, Mortgage, Refi, etc.) — subject: `"{anchor} — worth refinancing"` (e.g. "High-rate balance elsewhere — worth refinancing"). Body: `"Your recent pattern shows {anchor lowercased}. The {product} can consolidate or replace it at a better rate, {fee}."` CTA: "See your rate" / "Run the numbers" by play.
- **deposit_accounts** — subject: `"{anchor} — put it to work"` (e.g. "Idle checking buffer — put it to work"). Body: `"You're sitting on {anchor lowercased}. Moving it into {product} earns more without locking it up, {fee}."` CTA: "Move it over" / "Open in a minute".
- **investments** — subject: `"{anchor} — a smarter home for it"`. Body: `"{Anchor} shows up in your recent activity. {product} gives that money a tax-advantaged or higher-return path, {fee}."` CTA: "See the fit" / "Start the transfer".
- **insurance** — subject: `"{anchor} — worth a second look"`. Body: `"{Anchor} is a common gap. {product} closes it with {feature}, {fee}."` CTA: "Get a quote" / "Review coverage".
- **digital_services** — subject: `"{anchor} — one tap to fix"`. Body: `"{Anchor} means you're missing what {product} already gives you: {feature}. Takes under a minute."` CTA: "Turn it on" / "Enable now".

CTA text stays play-aware (UPGRADE vs everything else) as it is today. `why` stays: `"Behavior anchor — {anchor}. Play: {play}."`

Implementation shape (single function, no new exports):

```ts
case "BEHAVIOR": {
  const cat = product.category;
  if (cat === "credit_cards") {
    // existing rate-phrase + "top category" copy stays here unchanged
  }
  const anchorLc = lc(anchor);
  const anchorSentence = anchor.charAt(0).toUpperCase() + anchor.slice(1);
  // switch(cat) returns { subject, body, cta } from the table above
  return { subject, body, cta, why: `Behavior anchor — ${anchor}. Play: ${play}.` };
}
```

No changes to LIFE_EVENT / DEMOGRAPHIC / FINANCIAL_SIGNAL branches, no changes to anchor pools, reach bands, or the 2-behavior-per-product slot rule.

## Verification

- Open Campaign Builder → pick HELOC → step 3, confirm two behavior cards read as loan/refi language, not "top category."
- Repeat for Personal Loan, HYSA (deposit_accounts), Roth IRA (investments), Life Insurance, Digital Wallet.
- Credit-card products (Cashback 3/2/1, Travel, Premium Travel) still show the existing rate-phrase + "top category" copy.
- No TS errors; existing tests / typecheck pass.
