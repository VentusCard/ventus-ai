# Improve Intelligence pipeline card space and legibility

The Intelligence pipeline card on /bankdemo System tab sits in the top half of the viewport with a large empty area below it, while its content is horizontally cramped. Source sublabels, signal-example sentences, and destination names are truncated, making the diagram hard to read.

## Current issues (from live preview)

- The board uses `grid-cols-[1fr_52px_1.35fr_52px_1fr]`. The core column is too narrow, so every signal example row is truncated ("Luxury g...", "Home purchase i...", etc.).
- Destination rows squeeze a team badge, destination name, and channel badge into one line; names and badges are clipped.
- Source cards truncate sublabels like "accounts · trans..." and "app + web teleme...".
- The "Every Customer, Every Colleague" tagline consumes scarce header width in the destinations column.
- The card has generous internal whitespace but does not use the empty vertical space below it, so the section feels bottom-heavy.

## Proposed changes

1. **Rebalance the five-track grid**  
   Change the desktop column ratio to `1.1fr 52px 1.8fr 52px 1.1fr` so the core and side panes get more room. Keep the 52px connector columns.

2. **Let the board breathe vertically**  
   Increase row minimum heights and internal padding so text is not clipped. Allow the card to occupy more of the available viewport height instead of leaving a large blank area beneath it.

3. **Restructure destination rows**  
   Move from a single crowded line to a two-line row: destination name on the first line, team badge and channel tag on a second meta line. This removes horizontal clipping and makes scanning easier.

4. **Relocate the tagline**  
   Remove "Every Customer, Every Colleague" from the destination column header; keep it as a one-line subtitle under the main "Intelligence pipeline" section heading if needed.

5. **Improve core signal legibility**  
   Slightly enlarge the example sentence text (11.5px → 12px) and basis badge, and give the rolling example row a bit more height so descenders are not cut off.

6. **Preserve all behavior**  
   Source click → filter/highlight, signal click → detail panel, destination click-through, and the live rolling signal examples all stay unchanged. Only layout and typography change.

## Scope

- Single file: `src/components/tepilot/insights/CapabilitiesView.tsx` (the pipeline board grid, `SourceGroupCard`, `NodeCard`/destination row, and `SignalSection`).
- No new dependencies.
- No data, taxonomy, or navigation changes.

## Verification

Load /bankdemo → System tab at 1280px and 1584px. Confirm:
- The pipeline card fills more of the viewport and no longer leaves a large empty band below it.
- Core signal example sentences are no longer truncated.
- Destination names and team/channel badges are fully readable.
- Source sublabels are visible.
- Clicking a source, signal, or destination still opens the same detail content.
