# Thesis opener: reveal the first two lines as separate beats

## What changes
The opening slide currently shows "Banking is personal. Or at least, it used to be." as one big line the moment the slide appears. It will instead reveal line by line, one beat at a time:

1. "Banking is personal." (large headline)
2. "Or at least, it used to be." (on its own line below, still large, revealed on the next click/advance)
3. "We cannot speak to millions of digital customers..." (as today)
4. "Your personalization is your differentiation." (as today, in blue)

## Implementation
- `src/lib/deckmoScript.ts`
  - Split `opener.lines[0]` into two entries: `"Banking is personal."` and `"Or at least, it used to be."`.
  - Increase the opener beat's `steps` from 3 to 4 (this automatically adds a step to the deck: slide count 29 → 30; numbering, progress bar, and presenter view pick this up with no extra changes).
- `src/components/deckmo/DeckmoDeck.tsx` — `Opener`
  - Keep the existing per-line `Reveal show={step >= index}` pattern, which now naturally reveals one line per beat.
  - Restyle the index mapping: line 0 keeps the large headline size (`clamp(44px,5vw,76px)`); line 1 ("Or at least, it used to be.") gets a slightly smaller large size so the pair reads as one statement split in two beats; lines 2 and 3 keep the current supporting-text styling, with line 3 staying blue (existing `index === 2` blue condition becomes `index === 3`).

## Verification
- Build OK; Playwright check on `/deckmo` (gate bypass via sessionStorage): opener at step 0 shows only "Banking is personal.", after one advance shows "Or at least, it used to be." beneath it, further advances reveal lines 3–4; footer slide count reads 30 steps; no page errors or external requests.
