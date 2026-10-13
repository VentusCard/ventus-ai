# Clean up the slide 2.3 signal pill wording

## What changes

Every pill on slide 2.3 keeps its current nested-pill format. Only the wording inside the pills is cleaned:

| Signal | Now | Becomes |
| --- | --- | --- |
| SMB Owner | `SMB Owner``in``Food and Beverage` (words run together) | `SMB Owner in Food and Beverage` |
| Airplane co-owner | "…identifies him as a **Airplane co-owner** of a Cirrus SR22" | "…as a **small-aircraft co-owner** of a **Cirrus SR22**" |
| BMW X5 | trailing ` · ` dot at the end of the pill | removed |
| Tennis | `$12,000``annual spent in``bi weekly``Tennis` (two pills jammed, no spaces) | `$12,000 a year on Tennis about every two weeks` |
| Hawaii | `$9,000``annual spent in``Annual pre-holiday trip``Q4` (two pills jammed) | `$9,000 for a pre-holiday trip to Maui in Q4` |
| Media | `$6,000``annual spent in``Media…` (no spaces) | `$6,000 a year on Media, music and entertainment through streaming services and live events` |
| Sports betting | `bi-weekly deposites` | `…Online Sports Betting with bi-weekly deposits` |
| Income | `a Technology Company` | `a technology company` |

Also: the `variable` chip on the Goldman Marcus pill is removed. To keep that pill honest — that deposit grew from $2,000 to $3,500 rather than sitting at one fixed amount — the amount pill becomes `$2,000 → $3,500` instead. Fidelity ($5,000 every month) and Amex (annualized estimate) are unchanged. The exact month-by-month table stays in the expandable evidence panel.

Two small narrative touches come with the above: the Hawaii clause reads ", a" instead of ", an" so the sentence stays grammatical, and the Tennis/Hawaii pills gain the connecting words they were missing so their pills no longer sit flush against each other.

Also spotted and included: the income pill reads `Stable $22K monthly income`, while the agreed wording was the `$22–26K` monthly range. This restores that range. Say the word if the single figure was deliberate.

## What does not change

Family order, left-hand family headings, the connecting narrative, external "Ext" markers, click-to-open evidence, nested attribute-pill styling, and the rule that clicks never advance slides.

## Technical details

- `src/lib/deckmoSignalAttributes.ts` — reword the affected entries in `signalInlineSegments` (add real connector segments with spaces, drop the trailing connector on BMW, drop the `variable` attribute, and derive the non-fixed amount as first-to-latest from `signalPaymentSummary`). Remove the now-unused `Variable amount` entry from `signalAttributes`.
- `src/lib/deckmoScript.ts` — one character-level change to `RICKY_SIGNAL_STORY`: Hawaii's `before` becomes `", a"`.
- `scripts/deckmoSignalAttributes.test.ts` — add one guard test over all 14 signals: no two attribute segments adjacent, every connector padded with spaces, no trailing connector, and no `variable` / `deposites` / `bi weekly` text anywhere.
- Styles untouched; `base.css` stays as is since connectors supply the spacing.

## Verification

`bun test` plus the build log, then Playwright at 1375×842, 1691×1011 and 1024×768: read all 14 pill texts, confirm no jammed or trailing punctuation, no horizontal overflow, evidence panels still open, and slides still move only on arrows or A/D.
