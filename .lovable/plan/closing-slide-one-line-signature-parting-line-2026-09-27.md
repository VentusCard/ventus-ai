# Closing slide: one-line signature + parting line

Rework the signature block on the final deck slide (`Close` in `src/components/deckmo/DeckmoDeck.tsx`, copy in `src/lib/deckmoScript.ts` `DECKMO.close.signature`).

## Changes

1. **New parting line above the signature** — "Let's do great things together" fades in at beat 4 (step 3), above the Marco Ma line, styled like the slide's secondary lines (bold slate-950, slightly smaller than the signature name).

2. **Signature becomes one line** — the current three stacked lines (name / role / email) merge into a single line: "Marco Ma — CEO & Cofounder — marco@ventusai.com". Name and role in slate-950, email in blue-600, all on one baseline with the same separators.

## Files

- `src/components/deckmo/DeckmoDeck.tsx` (`Close`, lines ~416–423): replace the three `<p>` lines with the parting line + a single flex row signature.
- `src/lib/deckmoScript.ts` (line 696): add `parting: "Let's do great things together"` to `DECKMO.close.signature` (keep name/role/email fields).

## Verification

- Beat 4 at 1376×1011, 1540×855, 1691×1011: parting line and one-line signature visible, no overlap with the lifted lines above or the footer below; `bunx tsgo --noEmit` and build log clean.
