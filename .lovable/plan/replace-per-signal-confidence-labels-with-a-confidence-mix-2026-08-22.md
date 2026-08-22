# Replace per-signal confidence labels with a confidence mix

## Problem

Each signal tile in the expanded family drawer carries a single chip reading STRONG / LIKELY / EMERGING. But every signal covers millions of customers, so one label for the whole population is wrong — confidence is a property of an individual customer's evidence, not of a signal with a 2.4M-person cohort.

## Change

In the expanded signal family drawer (Intelligence Database overview), drop the single-word chip and show the confidence *distribution* of the population instead:

- Chip becomes a share, e.g. `74% strong` — the portion of that signal's customers with strong evidence.
- A slim 3-segment bar under the count visualizes strong / likely / emerging in the family's colors (same treatment already used on the family cards, just scaled down).
- Hover title shows the full split ("Strong 74% · Likely 19% · Emerging 7%").

Family cards keep their existing 3-segment confidence bar — that one is already a distribution and stays as is.

## Technical notes

- `src/lib/intelligenceSignalStats.ts`: change `SignalRollup.confidence` from the `"strong" | "likely" | "emerging"` string to a `{ strong: number; likely: number; emerging: number }` mix. Derive each signal's mix deterministically from its current label (strong signals skew high, emerging skew low) so the numbers stay stable, and normalize so the family-level mix roughly reconciles with the sum of its signals.
- `src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx`: replace `CONFIDENCE_CHIP` with the percentage chip plus the mini distribution bar, reusing `family.barStrong / barLikely / barEmerging`.
- No other view reads `topSignals[].confidence`, so the change is contained to these two files.
