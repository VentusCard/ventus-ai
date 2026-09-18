# Opener: replace last two lines with Today vs With Ventus comparison

## Goal
On the `/deckmo` Thesis opener, replace the current lines 3 and 4 —

- "We cannot speak to millions of digital customers. And if we cannot see the person, we cannot personalize."
- "Your personalization is your differentiation."

— with a two-line Today / With Ventus contrast, one line per reveal beat, with the Ventus line in blue (as line 4 already is).

## New copy (light polish of the user's draft)
- Line 3: `Today: Don't talk to or understand your customers = Commoditized banking = Easy to lose`
- Line 4: `With Ventus: Understand and predict customer needs = Personalized banking = Differentiated banking`

## Changes

1. `src/lib/deckmoScript.ts` — replace `DECKMO.opener.lines[2]` and `lines[3]` with the two strings above. Opener stays at `steps: 4` (one line per beat), so slide count (30) and numbering are unchanged.

2. `src/components/deckmo/DeckmoDeck.tsx` — `Opener` component: keep the existing reveal and sizing for indices 0–1. For indices 2–3, render the label prefix ("Today" / "With Ventus") distinctly so the comparison reads cleanly:
   - Index 2: "Today" prefix in muted slate, rest of the line in slate-950, same size (`clamp(23px,2.3vw,35px)`), blue accent line stays on index 3.
   - Index 3: "With Ventus" prefix in blue-600, rest of the line in blue-600 (the whole Ventus line blue, per request), matching size.
   - Implementation: store the label and rest separately in the script data (e.g. `lines` entries become `{ label, text }` for indices 2–3, or a parallel `comparison` structure) so the strings stay data, not hardcoded JSX.

## Constraints honored
- Strict light theme, Manrope/deck fonts, no new colors beyond existing tokens (blue-600 already used on line 4).
- No layout or step-count changes; reveal cadence unchanged.
- Static deck: no new data fetching.

## Verification
- Build OK.
- Playwright at 1440×900 (and 1024×768): `?from=demo`, open `section[data-section='0']`, step through 0–3 and confirm line 3 appears alone, then line 4 alone, Ventus line blue, no overflow/spill, no page errors or external requests.
