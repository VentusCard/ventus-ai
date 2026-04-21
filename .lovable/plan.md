

## Approach

Generalize subcategories to carry **cross-pillar lifestyle tags** in addition to today's parent-category facets.

A transaction's `pillar` and `category` stay as the primary classification (unchanged). But `subcategories[]` can now include **one cross-pillar lifestyle tag** drawn from a controlled vocabulary — only when the merchant name or description makes it obvious. This turns `subcategories` from "facets of the parent category" into a **lifestyle signal** that downstream personas, risk detection, and offer generation can key off without re-deriving context.

### What this looks like

| Merchant | Pillar / Category (unchanged) | New subcategories |
|---|---|---|
| `PALISADES TAHOE LODGE` | Travel / Hotels & Lodging | **`["Ski", "Mountain"]`** |
| `MAUI HILTON` | Travel / Hotels & Lodging | **`["Tropical Vacation", "Beach"]`** |
| `BANFF SPRINGS HOTEL` | Travel / Hotels & Lodging | **`["Mountain"]`** |
| `MARRIOTT MIDTOWN` | Travel / Hotels & Lodging | **`["Urban Hotel"]`** |
| `LULULEMON` | Sports / Gym & Fitness | `["Apparel", `**`"Athleisure"`**`]` |
| `HARRY WINSTON` | Style / Jewelry | `["Fine Jewelry", `**`"Engagement"`**`]` |
| `STANFORD GSB TUITION` | Family / Childcare & Education | `["Tuition", `**`"Career Development"`**`]` |
| `BABIES R US` | Family / Kids Activities | `["Infant Goods", `**`"New Parent"`**`]` |

The cross-pillar tag is **secondary** — it never replaces the primary pillar/category. The Tahoe lodge is still a Travel transaction; we just *also* tell downstream that it's a ski trip.

### Controlled vocabulary

The model needs a closed list so tags are consistent and matchable. Define in the prompt:

**Activity context** (where/how the spend happens):
`Ski`, `Mountain`, `Tropical Vacation`, `Beach`, `Coastal Resort`, `Urban Hotel`, `Theme Park`, `Cruise`, `Camping`, `Roadtrip`

**Life-event context** (what life moment the spend signals):
`Wedding`, `Engagement`, `New Parent`, `Baby Prep`, `New Home`, `Moving`, `Career Development`, `Retirement Prep`, `College Prep`, `Pet Adoption`

**Lifestyle-flavor context** (cross-pillar interest):
`Athleisure`, `Foodie`, `Wellness`, `Eco-Conscious`, `DIY`, `Luxury Lifestyle`, `Family-Oriented`, `Tech Enthusiast`, `Outdoor`, `Arts & Culture`

Anything outside this vocabulary stays as today's category-facet tags (`Domestic`, `Full-Service`, `Membership`, `Apparel`, etc.).

### Application rule

> **CROSS-PILLAR LIFESTYLE TAG (optional, max 1 per transaction):**
> In addition to category-facet labels, you may include ONE tag from the controlled lifestyle vocabulary above when the merchant name or description makes the lifestyle context **obvious**. This tag tells downstream systems what *life pattern* this spend belongs to, even when it primarily lives in another pillar.
>
> Apply ONLY when the signal is unambiguous — never guess. If the merchant is generic (`MARRIOTT`, `WHOLE FOODS`, `AMAZON`, `TARGET`), do NOT apply a lifestyle tag. The tag must be deducible from the merchant string itself, not from your prior beliefs about the customer.
>
> Examples:
> - `PALISADES TAHOE LODGE` → `["Ski", "Mountain"]` ✓ — merchant says Tahoe Lodge, clear ski signal
> - `MAUI HILTON` → `["Tropical Vacation", "Beach"]` ✓ — Maui is unambiguous
> - `MARRIOTT` → `["Full-Service"]` ✗ — could be anywhere, no lifestyle tag
> - `HARRY WINSTON` → `["Fine Jewelry", "Engagement"]` ✓ — engagement-ring brand
> - `KAY JEWELERS` → `["Fine Jewelry"]` ✗ — sells broad jewelry, no Engagement tag
> - `BABIES R US` → `["Infant Goods", "New Parent"]` ✓
> - `TARGET` → `["Department Store"]` ✗ — generic, no New Parent tag even if suspected

The 1-3 subcategory cap stays the same; the lifestyle tag, if used, counts toward it.

## Why this is the right cut

- **No schema change** — `subcategories[]` already accepts free-form labels.
- **No new LLM cost** — same call, same tokens.
- **Generalizes beyond travel** — one mechanism handles ski/tropical, weddings, new parents, career pivots, etc.
- **Downstream gets it for free** — `synthesize-persona`, `generate-next-offers`, `detect-risk-transactions`, `deal-personalization` already consume `subcategories`. New tags become usable everywhere immediately.
- **Tight controlled vocabulary** prevents tag explosion — downstream code can match on a fixed set instead of fuzzy-matching free text.
- **Compositional with the semantic-coherence rule** we just added to `synthesize-persona`: the rollup builder now has explicit `Ski` vs `Tropical Vacation` tags to key off, instead of inferring them from raw merchant strings every time.

## Files Changed

- `supabase/functions/classify-transactions/index.ts` — system prompt only. Add the controlled vocabulary section, the application rule, and 8-10 worked examples sprinkled through the existing Travel / Style / Family / Pets example blocks.

No code changes, no schema changes, no client changes.

## Verification

- /demo → run a customer with Tahoe + Hawaii travel, plus a Harry Winston and a Babies R Us purchase
- Inspect the enrichment table → confirm:
  - Tahoe lodge shows `Ski` in subcategories
  - Maui hotel shows `Tropical Vacation`
  - Harry Winston shows `Engagement`
  - Babies R Us shows `New Parent`
  - Generic Marriott / Whole Foods / Amazon show NO lifestyle tag (just facets)
- Next-Offer pills → "Annual Hawaiian Vacations" no longer sweeps in Tahoe; a separate ski rollup emerges
- Existing non-card cases (Maria Garcia / dogsitting → Pets, John Smith / rent → Home & Living) still classify correctly — no regressions

