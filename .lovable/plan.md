# Highlight "45 tools and workflows" inside the 9.1 subtitle

## Goal
Within beat 9.1's subtitle line, render the phrase "45 tools and workflows" in blue and bold; the rest of the sentence stays normal slate text.

## Current state (verified)
- `src/lib/deckmoScript.ts` — `DECKMO.bankTools.subtitle` = "An intuitive customer intelligence and personalization platform with 45 tools and workflows."
- `src/components/deckmo/DeckmoBankdemoScenes.tsx`:
  - `SceneHeader` (lines 36–45) renders `subtitle` as a plain string.
  - `BankdemoBankTools` (lines 423–440) passes it on line 431.

## Changes
1. `SceneHeader` — add an optional `highlight?: string` prop. When set, split the subtitle on that phrase and wrap the match in `<span className="font-bold text-blue-600">`. All other beats are unaffected (they don't pass `highlight`).
2. `BankdemoBankTools` — pass `highlight="45 tools and workflows"`.
3. `src/lib/deckmoScript.ts` — no change (subtitle string stays as is).

## Validation
- Playwright at 1540×855 and 1920×1080: subtitle on 9.1 shows the phrase in bold blue, sentence unchanged otherwise; no layout shift or wrap issues.
- Clean build in `/tmp/observability/build-errors.log`.
