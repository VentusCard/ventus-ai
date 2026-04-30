## Goal

Replace the brittle keyword-scanning image picker in `GeneratedOffersPhoneView.tsx` with an LLM-driven approach: the `generate-next-offers` edge function (which already produces the rollup's `collectionMessage`) also returns an image-selection signal per rollup. The client uses that signal against a curated bank of vetted images, with a long-tail fallback for novel themes.

## Approach (Option A)

### 1. Edge function — extend the JSON output

**File:** `supabase/functions/generate-next-offers/index.ts`

For each rollup group (both behavioral and life-event prompts), add two new fields to the LLM output schema:

- `imageCategory` — one of a fixed enum (the LLM picks the closest):
  `ski | beach | tennis | golf | cycling | running | yoga | hiking | camping | boating | wine | coffee | dining | wedding | baby | kids | pet | fashion | beauty | wellness | tech | home | garden | auto | travel-urban | travel-generic | finance | entertainment | other`
- `imageQuery` — 2–4 word visual subject in plain English (e.g. `"snowy ski slope"`, `"hawaiian beach palm trees"`, `"tennis court clay"`). Used only when `imageCategory = "other"`.

Update both `SYSTEM_PROMPT` and `LIFE_EVENT_SYSTEM_PROMPT`:
- Add the two fields to the OUTPUT shape.
- Add a short rules block: "Pick the imageCategory that best matches the LITERAL subject of the rollup label, NOT the pillar. For 'Seasonal Ski Trips' use `ski`, not `golf` or `other`. Use `other` only when no listed category applies."
- Add 2-3 few-shot examples mapping rollup → (imageCategory, imageQuery).

Update the normalization in the life-event branch (lines ~270-289) to carry these two fields through.

### 2. Client — curated image bank + selection

**File:** `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

Replace the current `COLLECTION_IMAGES` keyword array and `getCollectionImage` function with:

- `COLLECTION_IMAGE_BANK: Record<ImageCategory, string>` — one curated, vetted Unsplash URL per enum value (~28 entries). Each URL hand-picked to be on-theme (snow for ski, beach for beach, tennis court for tennis, etc.).
- `getCollectionImage(group)`:
  1. If `group.imageCategory` is set and present in the bank → return that URL.
  2. Else if `group.imageQuery` is set → return `https://source.unsplash.com/400x200/?${encodeURIComponent(group.imageQuery)}`.
  3. Else → `DEFAULT_IMAGE`.
- Drop the random cache-buster (`&t=...`) so the same collection consistently shows the same image across renders.

Update both call sites (carousel hero ~line 277 and expanded view ~line 210) to pass the whole `group` (or its two new fields) instead of `(rollup, pillar)`.

### 3. Type updates

**File:** wherever `RollupOfferGroup` is defined (likely `src/types/` or co-located with the offers hook). Add optional fields:

```ts
imageCategory?: string;
imageQuery?: string;
```

Keep them optional so cached responses without the new fields still render via the fallback.

## Out of scope

- No image generation (Nano Banana). If the curated bank + Unsplash Source isn't enough later, we can add that as a second pass.
- No changes to `generate-product-cards`, `synthesize-persona`, or any other edge function.
- No layout changes to the phone mockup.

## Verification

After deploy, regenerate offers and confirm:
- `Seasonal Ski Trips` → snowy slope (was: golf).
- `Annual Hawaiian Vacations` → beach (was: generic luggage).
- `Tennis & Court Sports` → tennis (was: golf).
- `Weekly Workday Coffee Runs` → coffee (unchanged).
- `Weekend Golfer` → golf (unchanged).
- A novel rollup the bank doesn't cover (e.g. "Pickleball League Nights") → reasonable Unsplash Source result via `imageQuery`.
- Edge-function logs show no JSON-parse failures from the new fields.
