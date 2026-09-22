# Move "Activation" (slide 07) into For Your Teams as nested beat 8.2.1

## Goal

The standalone "07 Activation" slide is removed from the deck order. Its content becomes a nested
beat under the "For Your Teams" slide's Automated Flows screen — the second thing shown there:

```text
Before                          After
07  Activation                  (removed)
09  For Your Teams              08  For Your Teams
  9.1 Intelligence Database       8.1 Intelligence Database
  9.2 Automated Flows             8.2 Automated Flows  (flows list)
  9.3 AI Coworker                 8.2.1 Activation     (campaign content, second thing under Automated Flows)
                                  8.3 AI Coworker
```

The deck goes from 10 pages to 9; all later pages renumber automatically (Value: The Relationship → 07,
The Ask → 09). Confirmed with the user: move (don't copy), and use the natural 8.2.1 label.

## Changes

### 1. `src/lib/deckmoScript.ts`

- Remove `{ id: "segment-campaign", nav: "Activation", steps: 1 }` from `DECKMO.beats` and remove
  `"segment-campaign"` from the `DeckmoBeatId` union.
- Give `bank-tools` 4 steps with a sub-beat map so beat 3 of 4 is a sub-beat of Automated Flows:
  add an optional field to the beat type, e.g. `stepMap: [0, 1, 1, 2]` (screen index per flat step).
- Extend the `DECKMO_STEPS` flattening (line ~550) so the Automated Flows step carries a `sub`
  marker for its second sub-step (the activation beat).
- Keep the `segmentCampaign` data object — the nested beat reuses it.

### 2. `src/components/deckmo/DeckmoDeck.tsx`

- Counter: when the current step carries the sub marker, render three parts — e.g. `Slide 8.2.1 / 9`.
  Single-sub-step beats otherwise keep today's format. Total becomes `DECKMO.beats.length` = 9.
- Remove the `"segment-campaign"` entry from `SCENES` and the now-unused `BankdemoSegmentCampaign`
  import (the local dead `BankTools` function is left alone unless it references removed ids).
- Navigation, jump(), progress bar and TOC are driven by `DECKMO_STEPS`, so they pick up the new
  structure automatically (TOC shows "08 | For Your Teams | 4 STEPS").

### 3. `src/components/deckmo/DeckmoBankdemoScenes.tsx`

- `BankdemoBankTools` maps its flat step through the screen map (`[0, 1, 1, 2]`) so the header pills
  highlight INTELLIGENCE DATABASE / AUTOMATED FLOWS / AI COWORKER correctly; during the activation
  beat the AUTOMATED FLOWS pill stays highlighted.
- Turn `BankdemoSegmentCampaign`'s body into a reusable content component (stages column with
  "From intelligence to activation", product card, and the "Micro-Segment Personalized Campaign
  Output" card — all copy preserved verbatim).
- On the activation beat, the workspace area shows that campaign content instead of
  `ExactWorkspace`, compacted to fit the workspace area (scale wrapper, same pattern
  ExactWorkspace already uses). The For Your Teams header and pills stay in place.

## Untouched

Opener (with the blank beat and logo), the 4.2 ledger roll, Ricky/Sarah identity, phone mockups,
JFK transaction flow, all other slides, gate page, and the /demo and /bankdemo pages.

## Verification

- Playwright at 1540×855: table of contents shows 9 pages with no Activation entry; arrow forward
  8.1 → 8.2 (flows list) → 8.2.1 (counter reads "8.2.1", campaign content shown, AUTOMATED FLOWS
  pill highlighted) → 8.3 (AI Coworker); ArrowLeft from 8.3 returns to 8.2.1; the Ask is page 09.
- Build log clean.
