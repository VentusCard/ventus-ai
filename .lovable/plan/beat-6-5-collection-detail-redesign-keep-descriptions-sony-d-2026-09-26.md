# Beat 6.5 — Collection Detail Redesign (Keep Descriptions) + Sony Deal

## Goal
All five offers visible in the 6.5 phone's collection detail **with their descriptions kept**, via a redesigned compact layout. Also swap the Away deal for a Sony headphones deal.

## Changes

### 1. Deal data — `src/lib/personalizationSnapshots.ts` (travel_deal_1, ~line 184)
Replace the Away deal with Sony headphones:
- merchant: "Sony"
- product: "WH-1000XM5 Wireless Headphones"
- rewardValue: "12% Cash Back" (unchanged)
- message: "Noise-canceling over-ears that turn a long flight into quiet time."
- valueLine/valueMath: keep the 12% × $5,500 = $660 travel-spend math
- cta: "Fly in Quiet"
- signalReason: "A reliable December trip pattern makes quality travel headphones a timely upgrade."
- boostCategory: "Travel Tech"

### 2. Layout redesign — `GeneratedOffersPhoneView.tsx` detail view (presentation mode only)
Restructure so descriptions stay and all five rows fit:
- Hero image: shrink to a slim ~40px banner strip (keeps the travel mood, frees vertical space).
- Back row + message header: single compact header line (message inline, smaller).
- Deal cards: keep merchant (12.5px bold), product (11px), and the description `message` (10.5px, clamped to 1 line with ellipsis) stacked left; reward pill + CTA button stay right but slimmed (10px text, tighter padding).
- Card padding p-2 → p-1.5, row gap space-y-1.5 → space-y-1.
- If still tight, drop the "5 offers available" subline in presentation mode.

Non-presentation mode (`/demo`) keeps the current full layout unchanged.

## Out of scope
- No changes to other deals, the carousel, or other beats.

## Verification
- Playwright at 1540×855 and 1920×1080: all five offers (Sony, REI, Tommy Bahama, GoPro, Priority Pass) visible with descriptions, no scrolling; `/demo` rewards detail unchanged.
