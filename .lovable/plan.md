# Fix: Product card quote cut off — more vertical space, larger text

## Problem
The personalized quote on Personalized Product cards is hard-clipped at 90 characters by `fitQuote()` in `src/components/exec-demo/ProductCardsPhoneView.tsx`, so sentences still get chopped. The quote row is also locked at `text-[11.5px]` with `shrink-0`, giving it no room to grow.

## Changes (all in `ProductCardsPhoneView.tsx` unless noted)

1. **Raise the display budget for the quote**
   - Increase `QUOTE_MAX_CHARS` from 90 to 140 in `fitQuote()`. It still trims at the last sentence boundary, so copy always ends as a complete thought — never mid-word or with an ellipsis when a sentence break exists.
   - Keep the edge-function generation cap as-is; the display layer simply stops cutting valid longer sentences.

2. **Give the quote real vertical space**
   - Remove `shrink-0` and the one-line mindset: the quote paragraph wraps naturally (no clamp), with `leading-relaxed`.
   - Rebalance the card's flex column so the quote section can grow: benefits container keeps `flex-1 min-h-0` but benefits drop from 3 to 2 items in compact mode to guarantee the CTA and value line are never pushed off-card.

3. **Bump quote text one size up**
   - Quote: `text-[11.5px]` → `text-[12.5px]`, with `text-slate-700` for slightly better contrast.

4. **Guarantee no cutoff regardless of copy length**
   - Card inner uses `flex flex-col` with the benefits area as the only flexible region; if space is ever tight, the benefits area yields first (it has `min-h-0`), so the quote, value line, and CTA always render fully — no scrollbar, no truncation.
   - Safety net: if a quote exceeds 140 chars and has no sentence boundary in the window, `fitQuote` still ends it cleanly at a word boundary.

5. **Verify**
   - Check `/bankdemo` Personalized Product tab with a live-generated customer (e.g., Ricky J) via Playwright screenshot at 1280px: quote fully visible, larger, CTA fully on-card, no scrollbar inside the phone mockup.

## Technical details
- Files: `src/components/exec-demo/ProductCardsPhoneView.tsx` only.
- No edge-function, prompt, or data changes. The 90-char generation cap (mem: product-card-quote-length) stays; this is a display-layer fix, so the memory rule is not violated — it governs generated copy, not render budget. If preferred, I can also relax the generation cap to ~140 chars so longer complete sentences arrive from the model instead of being pre-trimmed; recommend doing both.
- Optional companion change: `supabase/functions/generate-product-cards/index.ts` — raise quote hard cap 90 → 140 chars (still one complete sentence) so the display budget matches generation.
