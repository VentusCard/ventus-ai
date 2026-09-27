# Closing line 2: "with" + Ventus AI logo, like the intro

## What changes

The closing slide's second beat currently renders the plain text line "With Ventus AI your bank can anticipate customer needs". The user wants it to read "with" followed by the Ventus AI logo image — the same treatment the intro slide already uses for its Ventus comparison label (word "with" + inline logo image), but scaled to the closing headline's type size.

## Changes

1. `**src/lib/deckmoScript.ts` — `DECKMO.close.lines**`
  - `lines[1]` changes from `"With Ventus AI your bank can anticipate customer needs"` to `"your bank can anticipate customer needs"`. The word "with" and the logo are rendered by the component (same pattern as the intro's label: data = `"with"`, logo from the renderer).
2. `**src/components/deckmo/DeckmoDeck.tsx` — `Close` component, beat-1 Reveal (~line 407)**
  - Replace the plain-text `<p>{d.lines[1]}</p>` with a flex row that reads `with [logo]`:
    - `<span>with</span>` in the same intro-matched typography (`text-[clamp(34px,3.9vw,58px)] font-bold ... text-slate-950`).
    - `<img src="/ventus-ai-logo.png" alt="Ventus AI" />` inline in the row, sized to the headline (roughly cap height, e.g. `h-[clamp(26px,3vw,46px)] w-auto object-contain`) with horizontal margin so it reads as a word.
    - `<span>{d.lines[1]}</span>` — the rest of the sentence, same typography.
  - Row uses `flex flex-wrap items-center` so the logo sits vertically centered in the line; text wrapping stays natural.
  - The equation row below (static segments, `=` signs in slate-950, blue `CloseTicker`) is unchanged, as is line 1 and the signature block.

## Beats

Unchanged: 3 beats (line 1 → line 2 with logo + equation/ticker → signature).

## Verification

- `bunx tsgo --noEmit` + tail build log.
- Playwright at 1376×1011, 1540×855, 1691×1011: beat 2 of the closing slide shows "with" + logo inline before "your bank can anticipate customer needs", logo vertically aligned in the line, no wrap/overlap issues with the equation row or signature.