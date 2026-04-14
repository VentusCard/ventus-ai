

## Make AI product card copy more subtle — avoid naming life events directly

The `generate-product-cards` edge function prompt currently allows life event cards to reference the detected event directly (e.g., "new baby", "college planning"). The fix is to update the system prompt to instruct the AI to use softer, indirect language like "major family milestone" instead.

### Change: `supabase/functions/generate-product-cards/index.ts`

Update the system prompt's **CARD 2 — LIFE EVENT** section and **TONE RULES** to add explicit instructions:

- Never name the life event directly (e.g., don't say "new baby", "college", "retirement", "wedding")
- Use indirect, euphemistic language: "major family milestone", "an exciting new chapter", "a big life transition", "planning for the future"
- The customer should feel the recommendation is timely without the bank revealing what it detected
- Add examples of good vs. bad phrasing:
  - BAD: "Planning for a new baby?", "Getting ready for college?"
  - GOOD: "A major family milestone is worth planning for", "Big life chapters deserve a solid financial foundation"

Also update the `signal_label` field description to use the same indirect framing — so the pill label itself stays subtle too.

