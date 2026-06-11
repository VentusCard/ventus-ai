## Lead with the product + benefit, not the observation

Right now STACK bodies start with *"Your spend in dining and Streaming has been steady for a while…"* — observation first, product second. Flip it: lead with the product and the concrete earn, then close with why it fits the customer.

### Change

Only the **STACK** template in `copyFor()` (in `src/components/tepilot/campaigns/sections/buildMessageCards.ts`). Subject, CTAs, and other families stay as they are.

New body shape when a `ratePhrase` resolves:

> **3% on groceries and 2% on warehouse clubs — on your two biggest categories**
> With the Cashback (3/2/1) card you can get 3% on groceries and 2% on warehouse clubs — the two categories that already carry most of your spend. No annual fee, nothing to switch on.

Fallback shape (product has no rate table — flat-rate variants already handled by `ratePhrase`, so this only kicks in for genuinely table-less cards):

> With the {name} you can get {tagline lowercased} — built around the pattern your spend already follows. {fee}.

### Template

```
body = ratePhrase
  ? `With the ${name} you can get ${ratePhrase} — the ${parts === 1 ? "category" : "categories"} that already carry most of your spend. ${fee}, nothing to switch on.`
  : `With the ${name} you can get ${lc(mechanics.tagline)} — built around the pattern your spend already follows. ${fee}.`
```

Where `parts` = `splitAnchor(anchor).length` so a single-part anchor reads "the category" instead of "the categories."

### Out of scope

LIFE_EVENT / GOAL / USAGE bodies, subjects, CTAs, and the rate-matching logic — all unchanged.