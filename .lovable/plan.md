# Section 6 beat descriptions — audit and rewrite

## What the phone actually shows per beat
- 6.1–6.4: Ricky's Rewards home ("Curated for Ricky") with rotating deal collections and semantic search.
- 6.5: the phone opens the holiday travel collection (Sony, REI, Tommy Bahama, GoPro, Priority Pass).

## Current callouts and issues
| Beat | Current | Issue |
|---|---|---|
| 6.1 | Top pick built from observed behavior | OK, but generic |
| 6.2 | Interests become browsable collections | Fine, but it's what 6.5 actually demonstrates |
| 6.3 | Every recommendation traces to a signal | OK |
| 6.4 | Benefits are made concrete | Vague; doesn't name search, which is on screen |
| 6.5 | The same experience travels across channels | Mismatch — the phone is opening a collection, no channels shown |

## Proposed rewrite (one line each, same style)
- 6.1 — Offers selected from how Ricky actually lives
- 6.2 — Every recommendation traces to a real signal
- 6.3 — Semantic search returns only confident matches
- 6.4 — Rewards value is shown in real dollars
- 6.5 — Life moments become curated deal collections

Title, subtitle, eyebrow ("MID-TERM: PROFIT") and value block ("$20 User/Year yield for the bank") stay unchanged.

## Technical
- Edit only `DECKMO.midTerm.popups` in `src/lib/deckmoScript.ts`. No layout or behavior changes; verify on 6.1–6.5 at 1691×1011.
