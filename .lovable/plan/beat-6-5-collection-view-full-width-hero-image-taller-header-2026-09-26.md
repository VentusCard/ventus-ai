# Beat 6.5 collection view: full-width hero image, taller header

Fix the collection detail view inside the phone on beat 6.5 (presentation mode only; /demo untouched).

## Changes — `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

1. **Hero image full width, no borders**
   - Presentation branch currently uses `object-contain bg-slate-100` inside an `aspect-[2/1] max-h-[110px]` box, which letterboxes the beach photo with empty side bars.
   - Change to `object-cover` with `w-full h-full`, edge-to-edge (no side margins, no background fill), height ~`h-[100px]` (`[@media(max-height:900px)]:h-[88px]`) so it reads as a true full-bleed banner.

2. **Taller header with bigger text**
   - Back row: padding `pt-1 pb-0.5` → `py-1.5`, label `text-[11px]` → `text-[12px]`, chevron `w-4 h-4` → `w-[18px] h-[18px]`.
   - Title block: collection message `text-[11.5px]` → `text-[13px] font-bold`, offer count `text-[9.5px]` → `text-[10.5px]`, block padding `pt-1 pb-1` → `pt-1.5 pb-1.5`.

3. **Keep all five offers visible**
   - The header grows by roughly 30–40px; reclaim it by trimming card padding (`py-2` → `py-1.5`) and list spacing (`space-y-2` → `space-y-1.5`) if needed after measuring.
   - Verify at 1540×855, 1691×1011, and 1920×1080: image spans the full phone width with no side borders, header text is bigger, and all five offers (Sony, REI, Tommy Bahama, GoPro, Priority Pass) fit without scrolling or clipped descriptions.

## Out of scope
- /demo layout, deal data, copy, search view, and other beats — unchanged.
