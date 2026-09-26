# 6.5 Collection View — Merge Brand + Item into One Line

## Goal
Each deal card in the collection detail view currently has three text sections: brand (bold), item, and description. Merge brand and item into a single bold line so each card has two sections, matching the requested style:
- "Sony Noise-Canceling Headphones"
- "REI Travel & Swim Essentials"
The description stays as the second line under the merged title.

## Changes

### 1. `src/lib/personalizationSnapshots.ts` — holiday travel collection (the five deals shown on 6.5)
Add a `cardTitle` field to each deal with the merged display name (the existing `product` field is untouched — it also feeds the AI chat's deal references):
- travel_deal_1 (Sony): cardTitle "Noise-Canceling Headphones"
- travel_deal_2 (REI): cardTitle "Travel & Swim Essentials"
- travel_deal_3 (Tommy Bahama): cardTitle "Resort Wear"
- travel_deal_4 (GoPro): cardTitle "Waterproof Camera"
- travel_deal_5 (Priority Pass): cardTitle "Lounge Membership"

Rendered with the brand in front this yields exactly: "Sony Noise-Canceling Headphones", "REI Travel & Swim Essentials", "Tommy Bahama Resort Wear", "GoPro Waterproof Camera", "Priority Pass Lounge Membership".

### 2. `src/components/exec-demo/GeneratedOffersPhoneView.tsx` — detail view card (~lines 386–388)
Replace the two separate lines (merchant bold + product gray) with one bold line:
- Title = `deal.cardTitle` when present, otherwise `"{merchant} {product}"` (generic merge so other collections also show brand + item in one line).
- Keep the description line below it, unchanged sizes and spacing otherwise.
- Sizes stay as they are today: presentation mode 12px bold title / 10px description; /demo 13px / 11.5px. The freed vertical space from removing one line stays as breathing room — no other layout changes.

## Scope notes
- Applies to the collection detail view only (the 6.5 phone in the deck and the same view on /demo). The collection list, search results, and reward pill/CTA column are untouched.
- `dealTitle` strings used by the AI chat keep the original `product` text, so chat copy is unaffected.

## Verification
- Playwright to beat 6.5 (21 arrow presses, click body after the gate, ~3.2s wait for the auto-open) at 1540×855 and 1920×1080: all five cards show the merged bold titles with descriptions below, nothing clipped, no internal scroll.
- Build clean.
