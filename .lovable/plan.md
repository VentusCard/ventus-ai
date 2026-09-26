# Redesign the closing slide ("The Ask") to mirror the intro

## Goal
Make the final section feel like a bookend to the opening "Thesis" slide: same full-width stage, same oversized typography, same one-beat-at-a-time reveal, and a reprise of the intro's "Today vs with Ventus" equation — ending on the call to action.

## Current state
- Intro (`Opener` in `src/components/deckmo/DeckmoDeck.tsx`): full-bleed `max-w-[1560px]` stage; two huge bold lines (up to 76px) start vertically centered, then glide to the top; below, a "Today = … = Commoditization" / "with Ventus = … = Differentiation" equation builds one segment per beat.
- Ending (`Close`, same file): a narrow centered column — small logo, eyebrow, three lines (max 72px, third in blue), outcome pills, and a CTA button. Visually much smaller and unrelated to the intro.

## Changes (all in `src/components/deckmo/DeckmoDeck.tsx`, content in `src/lib/deckmoScript.ts`)

1. **Same stage as the intro** — rebuild `Close` on the Opener's layout: full-width `max-w-[1560px]` container, lines revealed one per beat with the same `Reveal` rise animation and the same clamp typography (first line up to 76px, following lines smaller, final line in blue).

2. **Same motion choreography** — the lines start vertically centered on the slide; when the comparison begins, they glide to the top with the same 700ms ease-in-out transition the intro uses.

3. **Reprise the intro equation** — after the lines, the closing slide brings back the "Today vs with Ventus" comparison (reusing `DECKMO.opener.comparison` data), now revealed as the payoff: the "with Ventus" row in blue, matching the intro's grid, `=` separators, and sizing.

4. **CTA as the final beat** — the last beat fades in the outcome pills ("More card spend", "More products", "More deposits"), the "Schedule a conversation" button, and the exhibit-hall line, centered under the equation.

5. **Beat count** — keep the section at 4 steps so navigation and the counter stay unchanged: line 1 → line 2 → line 3 + comparison reprise → CTA block.

## Technical notes
- Files: `src/components/deckmo/DeckmoDeck.tsx` (`Close` component), possibly small copy tweaks in `src/lib/deckmoScript.ts` (`DECKMO.close`).
- Strict light theme, existing `Reveal`/`cn` helpers, no new dependencies.
- Verify at 1376×1011, 1540×855, 1691×1011: lines not clipped, equation fits, CTA clears the footer; `bunx tsgo --noEmit` and build log clean.
