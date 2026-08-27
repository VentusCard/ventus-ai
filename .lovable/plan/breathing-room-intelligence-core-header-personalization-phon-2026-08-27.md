# Breathing room: Intelligence Core header + personalization phone panels

Two related density problems, both fixed in presentation only.

## 1. Customer Intelligence Core — top section is cramped

Inside the dark `#141432` panel, the logo + "Customer Intelligence Core" title row sits directly on top of the "Signals · what we detect" eyebrow with no separation, and the panel padding (`p-4`) is tighter than the light columns around it (`p-5`). The result reads as a squeezed header block.

Changes to the Core panel head:

- Panel padding `p-4` → `p-5` so it matches the sources and destinations columns.
- Title row: add a bottom margin and a hairline divider (`border-b border-white/10`, `pb-3 mb-3.5`) so the header is clearly its own band.
- Move the meta to the right of the title row to match the other two columns' header grammar: `5 families · 233 signals` in mono 11.5px `text-slate-400`, right-aligned. This also fills the empty right half of the row.
- Title from 14px to 15px semibold; logo from `h-4` to `h-[18px]` so the lockup carries the header.
- Signals eyebrow gets `mb-3` and the signal card stack `gap-2` → `gap-2.5`.

Net effect: the header reads as a titled panel, and the signal stack starts lower with even rhythm.

## 2. Personalization tabs — phone mockups waste their column

All three tabs (Deals / Product / Relationship) share `CustomerMockupPanel`. Today the workspace is a 3-column grid `1fr / 1fr / 1.2fr` at `calc(100vh-140px)`, and the phone is capped at `max-w-[400px]` inside the widest column. On a 1440–1920px screen the phone floats in the middle of a much wider card with large dead margins on both sides, while the left two cards (Customer Selection, Key features) are narrower than their content wants.

### Column rebalance

Grid becomes `0.9fr / 1.05fr / 1.35fr`:
- Customer Selection slightly narrower (chips and pills already fit).
- Key features / unit economics slightly wider (its metric rows currently wrap).
- Personalized surface widest, so the phone can actually grow.

### Let the phone fill its card

- Raise the phone cap from `max-w-[400px]` to `max-w-[460px]` and let it scale with height: the wrapper keeps `h-full` but the width becomes `min(100%, calc((100vh - 260px) * 0.5))` so the device keeps its aspect ratio and grows on tall screens instead of leaving a fixed 400px column.
- Reduce the surface card body padding `p-3` → `p-2.5` and header `py-2.5` → `py-2`, returning ~14px of vertical space to the device.
- Same treatment applies to the disabled/blurred empty state so the placeholder matches the live size.

### Card size audit across the three sections

| Card | Issue today | Change |
| --- | --- | --- |
| Customer Selection | header block (icon row + search + chips) eats ~110px before signals | tighten to `py-2.5`, drop the `mb-2` under the title row to `mb-1.5` |
| Key features | metric rows wrap at current width | gains width from the grid rebalance; no internal change |
| Personalized surface | phone under-sized, padding heavy | wider column, larger cap, tighter padding |

All three cards keep identical border, radius, and header treatment (`px-4 py-2.5`, `bg-slate-50/60`, `border-b border-slate-200`) so the row reads as one workspace.

## Technical notes

- `src/components/tepilot/insights/CapabilitiesView.tsx` — Core panel padding, header row divider/meta/sizing, signals eyebrow spacing.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx` — grid template, card header paddings, phone wrapper width/cap for both the live and empty states.
- No data, generation, signal, or click-behavior changes. Strict light theme outside the Core panel; no `dark:` utilities.

## Verification

Playwright screenshots at 1440px and 1920px: `/bankdemo` → System (Core header breathes, columns aligned) and each of the three personalization tabs with a customer selected (phone visibly larger, no clipping, no page scroll). Build log clean.
