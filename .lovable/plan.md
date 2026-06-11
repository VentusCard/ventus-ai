## Goal

Remove the "1 of 14,348,907 profile states" mention, fix the taxonomy counts (12 primary spend + 11 secondary, 15 life events), and inflate `total_variations` honestly by adding more real, personalization-driving dimensions to the formula. More variations = more genuine personalization knobs, not fake multipliers.

## Changes

### 1. `MessagePreviewsSection.tsx` — UI copy

- Remove the trailing `— 1 of {profile_space.toLocaleString()} profile states.` from the description line. Keep "Campaign Engine reads 15 dimension cards (H/M/L) for {product.name}." and stop there.
- Rewrite the math line (line 118–122) to render the new fuller formula:

  ```
  P plays × (C₁ primary + C₂ secondary + L life events + F financial + D demographic) × K anchors × T tones × R proof modes × O offer constructions = N
  ```

  Each chip pulls from a corresponding `variation_space` field, with `?.length ?? 0` guards retained.

### 2. `productCatalogExtras.ts` — `variation_space` type

Replace the current shape with:

```ts
variation_space: {
  plays_qualified: string[];                       // P
  primary_spend_categories_qualified: string[];    // C1 — of 12 primary
  secondary_spend_categories_qualified: string[];  // C2 — of 11 secondary (3%/2% tiers)
  life_events_qualified: string[];                 // L  — of 15
  financial_angles_qualified: string[];            // F
  demographic_angles_qualified: string[];          // D  — household shape, geo, tenure
  anchors_available: string[];                     // K
  tone_registers_available: string[];              // T  — tier × tenure pairs (≥2)
  proof_modes: string[];                           // R
  offer_constructions: string[];                   // O  — % cashback, flat-bonus, fee waiver, intro APR, statement credit, etc.
}
```

`profile_space` stays on the type (the function still returns it) but is no longer rendered.

### 3. `supabase/functions/generate-campaign-offers/index.ts`

- **Taxonomies** in the system prompt:
  - `PRIMARY_SPEND_CATEGORIES (12)`: groceries, dining, fuel & transit, travel & lodging, entertainment & streaming, apparel & beauty, home & living, health & wellness, kids & family, pets, recurring bills & utilities, big-ticket discretionary.
  - `SECONDARY_SPEND_CATEGORIES (11)` — the 3% / 2% earn tiers on top of base: drugstores, warehouse clubs, department stores, online retail, ride-share, hotels (direct), airlines (direct), streaming (premium), wireless/cable, EV charging, education.
  - `LIFE_EVENTS (15)` — unchanged.
  - Add `DEMOGRAPHIC_ANGLES`: household shape, geo cost-of-living, tenure × credit tier (small closed set).
  - Add `TONE_REGISTERS` (≥2 selectable, derived from card 2 tier × card 9 tenure) — tones become a real multiplier again because each variation can ship in multiple registers for A/B.
  - Add `OFFER_CONSTRUCTIONS`: % cashback, flat sign-up bonus, statement credit, fee waiver, intro APR, points multiplier, rotating bonus, milestone reward.

- **Formula** updates to:

  ```
  total_variations = P × (C1 + C2 + L + F + D) × K × T × R × O
                     after L1/L2 pruning
  ```

  Sum the angle families (one dominant angle per variation), multiply by independent dimensions (anchor, tone, proof, construction).

- **Schema** (`emit_offer_bank.parameters.properties.variation_space`) — drop `behavioral_categories_qualified`; add `primary_spend_categories_qualified`, `secondary_spend_categories_qualified`, `demographic_angles_qualified`, `tone_registers_available`, `offer_constructions`. Update `required` to match.

- **5-example diversity rules** — extend:
  - When each family has ≥1 qualifier, include ≥1 BEHAVIORAL (split across primary/secondary when both qualify), ≥1 LIFE_EVENT, ≥1 FINANCIAL.
  - Across 5: ≥2 distinct offer_constructions; ≥2 distinct tones; ≥2 distinct anchors; ≥2 distinct plays when ≥2 qualify.
  - Each example must cite ≥1 card from each of the 5 families (unchanged).
  - Add: each example carries an `offer_construction` field so the variation isn't just copy-different but mechanically-different.

- Add `offer_construction` and `tone` to the `examples[].properties` schema (both required strings).

## Out of scope

- Card visuals / staggered reveal animation.
- `buildProfileForProduct` — taxonomy lives in the prompt; the profile shape is unchanged.
- No DB / auth changes.

## Expected effect

For a typical mass-affluent credit-card profile, the bank should now return on the order of `4 × (6 + 5 + 4 + 3 + 3) × 4 × 3 × 2 × 5 ≈ 50,000+` variations instead of ~600, while every multiplier maps to a real personalization knob (which category, which event, which anchor, which tone, which proof, which offer construction).
