# Beat 9.1: "45 Tools and Workflows" stat line

## Goal
Add a quantitative claim of 45 tools and workflows to beat 9.1, placed directly under the subtitle, so bank leaders see the platform's breadth at a glance.

## Context (current state, verified)
- Beat 9.1 renders `BankdemoBankTools` (step 0) in `src/components/deckmo/DeckmoBankdemoScenes.tsx` (lines 424–436): a `SceneHeader` (eyebrow/title/subtitle) with the three tab pills on the right, above the scaled `/bankdemo` workspace.
- The header is shared across 9.1–9.4; the new stat must appear on 9.1 only.

## Changes
- In `BankdemoBankTools`, render a small stat line under the subtitle, visible only when `step === 0` (beat 9.1).
- Copy: **"45 Tools and Workflows"**, styled as a bold count with a quiet label, using the deck's existing light-theme tokens (slate text, blue accent) — no new colors.
- Copy lives in `DECKMO.bankTools` in `src/lib/deckmoScript.ts` as a `stat` field so it stays centralized with the rest of the deck copy.
- Nothing else changes: workspace content, tab pills, other beats untouched.

## Validation
- Playwright at 1540×855 and 1920×1080: verify the stat renders under the subtitle on 9.1, does not appear on 9.2–9.4, and nothing clips.
- Confirm a clean build in `/tmp/observability/build-errors.log`.
