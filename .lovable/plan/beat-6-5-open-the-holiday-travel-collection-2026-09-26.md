# Beat 6.5 — Open the Holiday Travel Collection

## Goal
On beat 6.5, the rewards phone stops at the "Annual tropical vacation in December" collection and opens into it, showing the individual holiday travel deals inside — instead of only rotating past collection covers.

## Current state (verified)
- Beat 6.5 renders `ExactPhone tab="rewards"` with `cycleCollections` in `DeckmoBankdemoScenes.tsx` (line 253), which sets `autoRotateCollections` on `ExecDemoPhoneView`.
- Ricky's fixture already includes the collection "Annual tropical vacation in December" (pillar "Lifestyle", message "Get December-ready before the flights are booked.") in `src/lib/personalizationSnapshots.ts` (line 174).
- `GeneratedOffersPhoneView` already has a collection detail view (`expandedGroup`): hero image, collection message, offer count, and a scrollable list of deals with reward pills and Activate buttons, plus a Back button. It auto-expands when `activeRollupLabel`/`activeRollupPillar` match a group, and auto-rotation already pauses while a group is expanded.

## Changes
1. `src/components/deckmo/DeckmoBankdemoScenes.tsx` — on the rewards phone (beat 6.5), pass `activeRollupLabel="Annual tropical vacation in December"` and `activeRollupPillar="Lifestyle"` through `ExecDemoPhoneView` so the phone opens straight into that collection's deal list. Rotation stays off while the collection is open (existing behavior).
2. Small polish so it reads as a deliberate navigation, not a snap: add a brief mount delay before the detail view slides in (the detail view already has a `detail-slide-in` animation), keeping the existing Back button functional.

## Out of scope
- No changes to other beats, the deal data, or `/demo`.
- No new collections or copy changes.

## Verification
- Playwright at 1540×855 and 1920×1080: arrow to 6.5, confirm the phone shows the holiday travel collection's deals (hero, "Get December-ready…" message, deal rows), and that beats 6.1–6.4 are unchanged.
