# Put External Pills Last Within Each Pillar

## Goal
Keep the five pillar groups and all 13 signals unchanged, while placing every external pill after all internal pills in its own pillar.

## Changes
- Reorder **Behavioral** to: Bi-weekly tennis, Annual pre-holiday Hawaii trip, Media and entertainment spend, then **High pet expenditure (Ext)**.
- Keep **Life Events** unchanged because it has no external pill.
- Reorder **Financial** to: Monthly investing at Fidelity, Monthly transfers to Marcus savings, Monthly American Express payments, then **BMW X5 loan ending in ~4 months (Ext)**.
- Keep **Demographics** and **Risk** unchanged because they have no external pills.
- Preserve existing labels, evidence, colors, animations, filtering, and the five-pillar structure.

## Validation
- Confirm beat 2.4 still shows the same 11 internal pills.
- Confirm beat 2.5 shows 13 pills, with each external pill last in its pillar.
- Confirm both external evidence cards still open correctly and the presentation remains stable at the active deck viewport.

## Technical details
Only reorder the signal definitions in the existing Ricky deck data. No rendering or business-logic changes are required because each pillar preserves source order when it builds its pill list.
