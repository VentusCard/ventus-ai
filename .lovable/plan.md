# Color-Code Payment Rails in the Visibility Gap Ledger

## What changes
On the "The Gap" (Visibility) slide, the inside rolling ledger currently shows every rail badge in the same blue. Each rail gets its own color, applied to **both the rail label badge and the row background tint**, so the six rails are visually distinct at a glance.

## Rail color mapping (strict light theme, deck palette)
| Rail | Badge (border / bg / text) | Row background tint |
|------|---------------------------|---------------------|
| CARD | blue-200 / blue-50 / blue-700 | blue-50/50 |
| ACH  | violet-200 / violet-50 / violet-700 | violet-50/40 |
| CHECK| amber-200 / amber-50 / amber-700 | amber-50/40 |
| WIRE | teal-200 / teal-50 / teal-700 | teal-50/40 |
| RTP  | cyan-200 / cyan-50 / cyan-700 | cyan-50/40 |
| ATM  | slate-200 / slate-100 / slate-600 | slate-50/60 |

Notes:
- Red is excluded (reserved for risk in this deck). Emerald is excluded (already means positive amounts).
- The amber CHECK tint stays subtle so it doesn't compete with the gold "outside" column.
- Existing `even:bg-deck-surface/50` striping is replaced by the per-rail tint.

## Where
- `src/components/deckmo/DeckmoDeck.tsx` — `InsideLedger`: add a `RAIL_STYLES` lookup keyed by rail name; badge span and row `div` read their classes from it. Fallback to the current blue style for any unknown rail.
- No data changes in `deckmoScript.ts`; no animation changes.

## Verification
- Playwright at 1024×768, 1440×900, 1920×1080: each rail badge shows its color, row tints match, no clipping/spill, ticker still loops seamlessly.
- Build clean.
