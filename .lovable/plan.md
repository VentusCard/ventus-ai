
## Issue
For the "Annual Hawaiian Vacations" cluster (and similar destination-specific rollups), the LLM picks outdoor brands like **Patagonia, Hydro Flask, Allbirds** that are barely travel-related and outright wrong for a tropical beach destination (Allbirds = wool shoes; Patagonia = cold-weather technical wear).

The root cause: `SYSTEM_PROMPT` in `supabase/functions/generate-next-offers/index.ts` tells the model to "anchor to the pill label" tonally, but doesn't constrain **brand/product appropriateness** to the destination's climate, activity profile, or trip context.

## Fix
Single edit to `supabase/functions/generate-next-offers/index.ts` — extend the `SYSTEM_PROMPT` with a new "DESTINATION & CONTEXT FIT" rule block, placed right after the existing Rule 7:

- **Match brand + product to the literal destination/activity in the rollup label.**
  - Tropical / beach destinations (Hawaii, Caribbean, Mexico, Florida): pick reef-safe sunscreen, snorkel gear, beach apparel, swimwear, sandals, lightweight luggage, waterproof phone cases, sun hats, GoPro, polarized sunglasses, beach towels, dry bags, suncare, resort-friendly fashion (Tommy Bahama, Sunbum, Ray-Ban, Olukai, Reef, Vuori, Outdoor Voices, Quiksilver, Roxy, Rip Curl, Speedo, Costa).
  - Cold/mountain destinations (Ski, Aspen, Tahoe): cold-weather gear is appropriate (Patagonia, Smartwool, Helly Hansen, Burton).
  - Urban city trips: travel tech, luggage, premium hotels/lounges, apparel suited to city walking.
- **Forbidden mismatches (explicit examples):**
  - Do NOT recommend wool shoes, fleeces, insulated jackets, thermal flasks, or cold-weather technical wear for tropical/beach rollups.
  - Specifically banned for tropical trips: Allbirds (wool shoes), Patagonia (cold-weather), Hydro Flask insulated bottles, Smartwool, North Face fleeces.
- **Affirmative requirement:** every deal in a destination-tagged cluster MUST plausibly improve that specific trip type. If the merchant/product doesn't pass a "would a traveler pack this for [destination]?" test, replace it.

I'll also tighten the few-shot example for "Annual Hawaiian Vacations" to mention 2-3 appropriate brand exemplars (e.g., Sunbum, Olukai, GoPro) so the model has a concrete anchor.

## Out of scope
- No changes to life-event prompt, no UI changes, no client code.
- No changes to deal generation count, signal logic, or rollup matching.
