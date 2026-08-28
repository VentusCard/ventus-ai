# Fix ticker text descenders clipped in Customer Intelligence Core

## Diagnosis (confirmed)
In `src/components/tepilot/insights/CapabilitiesView.tsx`, the rolling ticker row (`renderRow`, ~line 622-636) sets `leading-none` on the row container. That 1.0 line-height is inherited by the inner `truncate` spans (`text-[14px]` label, `text-[13px]` evidence). `truncate` applies `overflow: hidden`, and with a 14px line box around a 14px font, descenders (g, y, p, j) get clipped at the bottom of each span. The recent font-size increase made the clipping visible.

## Changes (CapabilitiesView.tsx only)
1. Row container (line 623): replace `leading-none` with `leading-normal` so the line box has room for descenders.
2. Add `leading-normal` explicitly to the three text spans (`example.to`, arrow, `example.ev`) so `truncate`'s overflow clip no longer cuts descenders.
3. Bump the ticker window and row height from `h-10` (40px) to `h-11` (44px) on lines 623 and 669 for extra breathing room, keeping the roll animation aligned (both rows share the same fixed height, so the translate math is unchanged).

## Verify
- Screenshot `/bankdemo` system tab via Playwright; confirm descenders (e.g. "g", "y") in ticker text render fully and the rolling animation still lands cleanly.
