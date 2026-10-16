# Rerank signal families in /bankdemo Intelligence Database

## Goal
Match the deckmo family order — Demographics → Financial → Behavioral → Life Events → Risk — in the Intelligence Database tab (CapabilitiesView), which /bankdemo Section 5 embeds.

## Current state
`src/components/tepilot/insights/CapabilitiesView.tsx` defines the five families in the `SIGNALS` array (lines ~118-300) in this order:

1. Behavioral
2. Life Event
3. Financial
4. Demographic
5. Risk

The array order drives the rendered family order, so no other code needs to change.

## Change
- Reorder the five entries in `SIGNALS` to: Demographic, Financial, Behavioral, Life Event, Risk.
- Content of each entry (label, icon, colors, description, examples, items) stays byte-identical — only the block positions move.
- No label renames: the tab keeps its existing "Demographic" / "Life Event" wording; only the order changes.

## Verification
- Open /bankdemo → Section 5 → Intelligence Database tab and confirm the family order reads Demographics, Financial, Behavioral, Life Events, Risk left to right.
- Run the existing test suite and typecheck.

## Technical notes
- Single-file edit in `CapabilitiesView.tsx`; the `SIGNALS` array is self-contained and rendered in array order.
