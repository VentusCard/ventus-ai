# Fix broken deal collection images

## What's wrong

Collection header images in the phone mockup come from `getCollectionImage()` in `GeneratedOffersPhoneView.tsx`. Two paths:

1. Curated bank keyed by `imageCategory` — verified: all 30 URLs return 200, these are fine.
2. Fallback when the model returns `imageCategory: "other"` (or an unknown key) — builds `https://source.unsplash.com/400x200/?<query>`. That endpoint was retired by Unsplash and now returns **503** for every request. Confirmed live. Those collections render a broken/blank image, and there is no `onError` handler so nothing recovers.

## Fix

- Remove the `source.unsplash.com` fallback entirely.
- Add a keyword resolver: when `imageCategory` is missing/`other`/unknown, match words in `imageQuery` (and the rollup label) against synonyms for the existing bank keys (e.g. "pickleball/court" → tennis, "climbing/trail" → hiking, "spa/massage" → wellness, "concert/festival" → entertainment, "flight/airport" → travel-generic, "nursery/newborn" → baby). Fall back to a pillar-based default (Life Event → home, Financial Signal → finance, else the generic default) instead of the single hard-coded default.
- Add `onError` on both `<img>` tags (expanded card, line 276; collection card, line 551) that swaps to the default bank image once, so any future dead URL degrades gracefully rather than showing a broken tile.
- Add a couple of extra bank entries for categories the prompts can emit but the bank lacks, so the enum and the bank stay in sync.

## Technical notes

- Single file: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`. No edge-function or prompt changes — the model can keep emitting `imageQuery`; the client now resolves it locally.
- Verification: run the /bankdemo personalization tabs in Playwright and confirm no failed image requests in the network log.
