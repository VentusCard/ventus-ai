## Revise variation math in Campaign Engine

Update `supabase/functions/generate-campaign-offers/index.ts` (the system prompt + the `variation_space` schema) and the header copy in `MessagePreviewsSection.tsx` to reflect the corrected combinatorics.

### Replace V (voice registers)
Remove the `V = 2 voice registers` term entirely. Tone is no longer a multiplier — the LLM picks one tone deterministically from card 2 × card 9 and moves on.

### Expand A (angles) into real category counts
Today `A` collapses to ~3 (one per family). Replace it with the true qualifying counts the user described:
- **B = qualifying behavioral categories**, drawn from a fixed taxonomy of **15** (cards 1–3). Counts only categories the profile actually expresses at HIGH or MED.
- **L = qualifying life events**, drawn from a fixed taxonomy of **15** major life events (cards 4–6). Counts only events at "early" or "confirmed."
- **F = qualifying financial angles** from cards 10–12 (cash-flow shape, eligibility headroom, proof posture). Small set, typically 1–3.

### New formula

```text
total_variations = P × (B + L + F) × K × R
                   after L1 Risk Gate + L2 Spend Floor pruning
where
  P = product.plays the profile satisfies
  B = qualifying behavioral categories (out of 15)
  L = qualifying life events           (out of 15)
  F = qualifying financial angles
  K = distinct offer anchors derivable from cards 1, 3, 11, 12
  R = 2 proof modes (card 12 × product.proof_rules)
```

We sum B + L + F (not multiply) because each variation rides on ONE dominant angle, not a cross-product of all three families. Multiplying would inflate the count with nonsensical mixed-angle messages.

### Update `variation_space` schema

Drop `voice_registers`. Replace `angles_qualified` (single number) with three explicit counts:

```text
variation_space = {
  plays_qualified,
  behavioral_categories_qualified,   // 0..15
  life_events_qualified,             // 0..15
  financial_angles_qualified,        // 0..n
  anchors_available,
  proof_modes
}
```

### Update the 5-example diversity rules

Replace "span all 3 angles" with:
- include at least one BEHAVIORAL-anchored, one LIFE_EVENT-anchored, and one FINANCIAL-anchored example when each family has ≥1 qualifier
- across the 5, cite at least 2 distinct behavioral categories OR 2 distinct life events
- keep "≥2 distinct plays" and "≥2 distinct anchors"
- keep the rule that every `cards_used` cites ≥1 card from each of the 5 families

### UI copy (`MessagePreviewsSection.tsx`)

Header subtitle changes from
`{total_variations} variations · 5 shown`
to keep the same number, but the tooltip / helper line under it now reads:

`P plays × (B behavioral + L life events + F financial) × K anchors × R proof modes`

with the live counts pulled from `variation_space`. No `voice_registers` chip.

### Files

- `supabase/functions/generate-campaign-offers/index.ts` — prompt sections L4/L5 and VARIATION CONTRACT block, plus the `emit_offer_bank` tool schema.
- `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — header math line + remove voice chip if present.

### Out of scope

- The 15 behavioral categories and 15 life events themselves — we assume the existing taxonomies in `productCatalogExtras.ts` / life-event mocks already cover this. If they don't, that's a follow-up.
- No changes to `profile_space` (still 3¹⁵ = 14,348,907).
- No DB or auth changes.