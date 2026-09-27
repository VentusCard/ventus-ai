# Beat 6.5 — Fit All Five Offers in the Collection View

## Goal
In the holiday travel collection detail on beat 6.5, all five offers are visible inside the phone at once — no scrolling.

## Current state (verified)
- The detail view in `GeneratedOffersPhoneView.tsx` (lines 353–407) stacks: Back button, a 110px hero image, the collection message + offer count, then deal cards (`p-3`, 13px merchant text, reward pill + Activate button) in a scrollable list. At the deck's phone size only ~3.5 offers fit.
- The deck phone renders this view with `presentationMode` on; `/demo` uses the same component without it.

## Changes
1. `src/components/exec-demo/GeneratedOffersPhoneView.tsx` — when `presentationMode` is on, compact the detail view so five offers fit:
   - Hero image: 110px → ~56px tall.
   - Collection message/count block: tighter padding, message at 12px.
   - Deal cards: padding `p-3` → `p-2`, gap `space-y-2` → `space-y-1.5`, merchant 13px → 12.5px, product line 12px → 11px, and the deal's longer `message` line hidden in presentation mode (merchant + product + reward pill + CTA carry the offer).
   - Back button row: tighter vertical padding.
2. Non-presentation usage (`/demo`, `/exec-demo`) keeps the current spacious layout unchanged.

## Out of scope
- No changes to deal data, copy, the carousel, or other beats.

## Verification
- Playwright at 1540×855 and 1920×1080: on 6.5, confirm all five offers (Away, REI, Tommy Bahama, and the remaining two) are visible inside the phone without scrolling; confirm `/demo` rewards detail is unchanged.
