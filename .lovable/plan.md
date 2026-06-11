## Goal

When the selected product is the **Cashback (3/2/1) / Customer-Choice card**, render the 5 message cards exactly as supplied — bypassing the dynamic anchor + copy generator. Every other product keeps its current behavior.

## Changes

**File: `src/components/tepilot/campaigns/sections/buildMessageCards.ts`**

1. Add a name matcher helper:
   ```ts
   function isCustomerChoiceCard(p: CatalogProduct): boolean {
     const n = p.name.toLowerCase();
     return p.category === "credit_cards" &&
            (n.includes("3/2/1") || n.includes("customer-choice") || n.includes("customer choice"));
   }
   ```
2. Add a constant `CUSTOMER_CHOICE_CARDS: MessageCard[]` with the 5 cards below, mapped to the anchor families enforced by the 2/1/1/1/1 rule:

   | # | Family | Play | Anchor label | Subject |
   |---|---|---|---|---|
   | 1 | BEHAVIOR | ACTIVATE | "Everyday foodie (budget tier)" | 6% on takeout, 4% on groceries — eat happy |
   | 2 | BEHAVIOR | UPGRADE | "Premium foodie (premium tier)" | 6% on fine dining, 4% at the specialty grocer |
   | 3 | LIFE_EVENT | ACTIVATE | "New home" | New keys, new projects — 6% back |
   | 4 | DEMOGRAPHIC | ACQUIRE | "New city" | New city, more gas, more dinners out — 6% back |
   | 5 | FINANCIAL_SIGNAL | ACTIVATE | "Saving toward a goal" | Turn everyday spending into your goal |

   Bodies, CTAs, and `why` strings use the exact copy the user supplied. `why` is a short rationale, e.g. `"Behavioral — everyday foodie (budget tier)."`.

3. In `buildMessageCards(...)`, short-circuit at the top:
   ```ts
   if (isCustomerChoiceCard(product)) {
     const href = campaignLink.trim();
     return href
       ? CUSTOMER_CHOICE_CARDS.map((c) => ({ ...c, ctaHref: href }))
       : CUSTOMER_CHOICE_CARDS;
   }
   ```
   This runs **before** the dynamic anchor/play/copy pipeline.

## Behavior notes

- **Regenerate button:** for the Customer-Choice card it returns the same 5 cards every time (copy is fixed). The button still works for all other products.
- **Promo overlay:** ignored for the Customer-Choice card — the supplied copy already bakes in "doubled for new cardholders through December 31."
- **Anchor visuals:** existing `ANCHOR_VISUAL` mapping in `MessagePreviewsSection.tsx` already covers `BEHAVIOR`, `LIFE_EVENT`, `DEMOGRAPHIC`, `FINANCIAL_SIGNAL` — no UI changes needed.
- **Out of scope:** no changes to `MessagePreviewsSection.tsx`, edge functions, variant counts, or other product templates.