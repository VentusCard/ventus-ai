# Plan: Phone Mockup Balance Audit — 3 Personalization Tabs

## Problem
At ~90% presentation zoom, the shared phone mockup is unbalanced across the three
personalization tabs in /bankdemo:

- **Personalized Deals (rewards):** the collection carousel card is too small
  (60px image strip, `min-h-[124px]` card, 8–11px text) — deal content reads tiny
  next to the other two surfaces.
- **Personalized Product (membership view):** the product card fills the entire
  phone body (`flex-1` + full-height slider), making the single offer card feel
  oversized and stretched, with big empty bands between rows.
- **Personalized Relationship (AI chat):** acceptable, but should be checked for
  consistent header/spacing scale with the other two.

All three render inside `ExecDemoPhoneView` (compact frame, `zoom: 1.1`) inside
`CustomerMockupPanel.tsx`.

## Changes

### 1. Deals — `src/components/exec-demo/GeneratedOffersPhoneView.tsx` (main view)
- Collection carousel card: image strip `h-[60px]` → `h-[110px]`; card
  `min-h-[124px]` → `min-h-[190px]`.
- Collection message text 10px → 12px; merchant pills 8px → 10px with more padding.
- "Curated for" header 11px → 12.5px; carousel dots/arrows slightly larger
  (5px → 6px buttons, 1.5px → 2px dots).
- Welcome bar, Top Pick, Expiring Soon: bump key text ~1–1.5px steps
  (12/11/10 → 13/12/11) so the hierarchy survives 90% zoom.
- Deal detail view: merchant 12px → 13px, product 11px → 12px, message
  10.5px → 11.5px, reward/CTA pills 9px → 10.5px; hero image 90px → 110px.

### 2. Product — `src/components/exec-demo/ProductCardsPhoneView.tsx` (compact mode)
- Stop stretching the card to full phone height: in compact mode cap the card
  (max height ~85%) and center it vertically instead of `h-full` filling.
- Reduce inner padding `p-4` → `p-3.5`, row gap 2.5 → 2, and trim
  `min-h-[330px]` in `RelationshipPhoneView.tsx` to `min-h-[280px]` so the
  snapshot row above keeps visible presence.
- Keep type sizes (they already step down via `nameSizeClass`/`ctaSizeClass`);
  the fix is proportion, not smaller text.

### 3. Relationship — `src/components/demo/ConsumerAIChatView.tsx` (audit only)
- Verify header, quick-action chips, and bubbles hold up at 90%; bump the
  smallest (sub-10px) text to 10px minimum if found.

## Verification
- Playwright at 90% page zoom on /bankdemo: screenshot all three tabs with a
  customer selected; confirm deal cards are legible, product card no longer
  fills the full phone, and nothing overflows or clips.
- `tsc` typecheck + build.
