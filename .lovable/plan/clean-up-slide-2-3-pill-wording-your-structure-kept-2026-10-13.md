# Clean up slide 2.3 pill wording (your structure kept)

## What changes — defects only

Every pill keeps your exact wording and the nested-pill structure. Only these defects are fixed:

| Signal | Now | Becomes |
| --- | --- | --- |
| SMB Owner | `SMB Owner``in``Food and Beverage` (words run together) | `SMB Owner in Food and Beverage` — spaces added |
| Tennis | `$12,000``annual spent in``bi weekly``Tennis` (two pills jammed flush) | `$12,000 annual spent in bi-weekly Tennis` — spaces added, `bi weekly` → `bi-weekly` |
| Hawaii | `$9,000``annual spent in``Annual pre-holiday trip``Q4` (two pills jammed flush) | `$9,000 annual spent in Annual pre-holiday trip Q4` — spaces added |
| Media | `$6,000``annual spent in``Media…` (words run together) | `$6,000 annual spent in Media, music and entertainment through streaming services and live events` — spaces added |
| BMW X5 | pill ends with a stray ` · ` | removed |
| Sports betting | `bi-weekly deposites` | `bi-weekly deposits` |
| Goldman Marcus | ends with a `variable` chip | chip removed — pill reads `Monthly $3,500 to Goldman Marcus a HYSA` |

Nothing else is re-worded: no phrasing swaps, no capitalization changes, no amount changes.

## Two things to flag

- The airplane pill follows "…identifies him as a", so it reads "as a Airplane co-owner". The shortest fix is dropping that one "a". Say the word, or leave it as is.
- With the `variable` chip gone, the Marcus pill states $3,500 as the monthly figure; the month-by-month step-ups stay visible in its expandable evidence panel.

## Technical details

- `src/lib/deckmoSignalAttributes.ts` — in `signalInlineSegments`: pad the connector segments with spaces, insert the missing space connectors between adjacent pills, fix the two typos, drop the BMW trailing connector, drop the `variable` attribute (plus the matching `Variable amount` entry in the unused `signalAttributes` helper).
- `scripts/deckmoSignalAttributes.test.ts` — one guard test over all 14 signals: no two attribute segments adjacent, every connector padded with spaces, no trailing connector, and no `variable` / `deposites` / `bi weekly` text.
- `roadmap.md` — record this cleanup item during the build (plan mode blocks editing it now).
- No changes to the narrative in `deckmoScript.ts`, to styles, or to fixtures.

## Verification

`bun test` plus the build log, then Playwright at 1375×842, 1691×1011 and 1024×768: read all 14 pill texts, confirm no jammed pills or trailing dots, no horizontal overflow, evidence panels still open, and slides still move only on arrows or A/D.
