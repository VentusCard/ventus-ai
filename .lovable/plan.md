# Merge the 45-tools stat into the 9.1 subtitle

## Goal
On deck beat 9.1, remove the standalone "45 Tools and Workflows" stat line and fold the count into the subtitle text.

## Current state (verified)
- `src/lib/deckmoScript.ts` (~line 538–539, `bankTools`):
  - `subtitle: "The same intelligence becomes an operating system for teams across your bank."`
  - `stat: "45 Tools and Workflows"`
- `src/components/deckmo/DeckmoBankdemoScenes.tsx` (~lines 432–438): `BankdemoBankTools` renders the stat as a separate bold paragraph below the subtitle, only when `step === 0`.

## Changes
1. `src/lib/deckmoScript.ts` — replace `bankTools.subtitle` with the merged line:
   - `An intuitive customer intelligence and personalization platform with 45 tools and workflows.`
   - Delete the `stat` field (no longer used anywhere).
2. `src/components/deckmo/DeckmoBankdemoScenes.tsx` — remove the `{step === 0 && (<p>…stat…</p>)}` block so nothing renders separately.

## Result
Beat 9.1 shows one subtitle sentence containing the 45-tools count, on all three steps of the beat; no second stat element.

## Validation
- Build clean; verify 9.1 at 1540×855 and 1920×1080 via Playwright (subtitle shows merged line, no stray stat line).
