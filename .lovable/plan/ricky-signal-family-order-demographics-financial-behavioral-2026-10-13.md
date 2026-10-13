# Ricky signal family order: Demographics, Financial, Behavioral, Life Events, Risk

## New order, applied everywhere in the deck
1. Demographics (violet)
2. Financial (emerald)
3. Behavioral (blue)
4. Life Events (amber)
5. Risk (rose)

Four places currently show the old order and will follow the new one:
- Slide 2.3 — the five signal-family rows of Ricky's story
- The Complete Picture — the five colored labels under the customer circle
- The Complete Picture's Ricky scene — the signal family cards beside the ledger
- The Intelligence Database slide — the five family count cards

## What changes
- Reorder the family groups in the deck's Ricky signal data so the new sequence is the source of truth, keeping every signal inside its own family in its current relative order with the external signal still last in that family. Labels, colors, external markers, and evidence text stay exactly as they are.
- Reorder the story clauses to match the same family sequence so the written narrative reads in the same order the rows appear. No re-wording: each family's opening clause already reads as a standalone sentence, and each row is its own paragraph.
- Reorder the two separate label lists (the circle labels and the database cards) to the same sequence, keeping their existing names, colors, and counts.
- Update the signal-story test's expected family order; keep its assertions that all 14 signals appear once, three are external, and each family's external signal comes last.
- Record the chosen order in project memory and track the work in the roadmap.

## What stays unchanged
- Slides 2.1–2.2: KYC block, expandable rail blocks, scrollable transaction lists, outside-events panel, panel size and position.
- Pill interactions: one detail open at a time, internal evidence rows, external source cards, no slide movement from clicks.
- Navigation (on-screen arrows, ←/→, A/D), strict light theme, desktop-only gate, and the responsive row spacing on 2.3.

## Technical details
- Primary file: `src/lib/deckmoScript.ts` — reorder the family blocks in `DECKMO.ricky.signals`, reorder the clauses in `RICKY_SIGNAL_STORY` to the same sequence, and reorder the `livingView.synthesis.families` and Intelligence Database `families` literals.
- No component change needed: `RickySignalStory.tsx` builds its rows from the first occurrence of each family in `DECKMO.ricky.signals`, and the Ricky scene groups its cards the same way, so both follow the data order automatically.
- Test: `scripts/deckmoSignalStory.test.ts` expected family array becomes the new order.
- Memory: new memory file for the chosen family order plus an index line; `roadmap.md` item added and closed on completion.

## Verification
- Run the deck's focused tests (signal story, navigation, rail groups) and check the latest build output.
- Playwright on /deckmo: confirm 2.3 rows run Demographics → Financial → Behavioral → Life Events → Risk with all 14 pills and 3 external markers; confirm the Complete Picture circle labels, its family cards, and the database cards show the same order; open an internal and an external pill detail and confirm evidence still opens without moving the slide.
- Check at 1377×842 and 1691×1011 for wrapping, overflow, or clipping introduced by the reorder.
